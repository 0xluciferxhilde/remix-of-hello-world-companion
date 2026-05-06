import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAccount, useBalance } from "wagmi"
import { parseEther, formatEther, Contract } from "ethers"
import { 
  SWAP_TOKENS, 
  NATIVE_SENTINEL, 
  getSwapQuote, 
  swap, 
  pickRouter, 
  ROUTERS, 
  resolveWrappedNative, 
  buildSwapPath, 
  approveToken,
  getAllowance,
  litvmChain,
  ERC20_ABI,
  isNativeAddr,
  errMsg,
  loadPair,
  addLiquidity,
  removeLiquidity,
  DEFAULT_ROUTER,
  getUserLPPositions,
  LPPosition,
  readProvider
} from "@/lib/litdex-core-logic"

type Coin = {
  address: string
  symbol: string
  image?: string
}

const LOCAL_COINS = SWAP_TOKENS;

export type SwapCardProps = {
  defaultFromId?: string
  defaultToId?: string
  className?: string
  mode?: "swap" | "pool"
}

export default function SwapCard({
  defaultFromId = NATIVE_SENTINEL,
  defaultToId = "0xFC43ABE529CDC61B7F0aa2e677451AFd83d2B304",
  className = "",
  mode = "swap",
}: SwapCardProps) {
  const { address: walletAddress, isConnected } = useAccount();
  const data = LOCAL_COINS;

  const [fromAddr, setFromAddr] = React.useState<string>(defaultFromId)
  const [toAddr, setToAddr] = React.useState<string>(defaultToId)
  const [fromAmount, setFromAmount] = React.useState<string>("1")
  const [toAmount, setToAmount] = React.useState<string>("0")
  const [isLoadingQuote, setIsLoadingQuote] = React.useState(false)
  const [isSwapping, setIsSwapping] = React.useState(false)
  const [subMode, setSubMode] = React.useState<"add" | "remove">("add")
  const [activeRouter, setActiveRouter] = React.useState<string>("")
  const [activeRouterKey, setActiveRouterKey] = React.useState<any>("liteswap")
  const [activePath, setActivePath] = React.useState<string[]>([])
  const [lpPositions, setLpPositions] = React.useState<LPPosition[]>([])
  const [loadingPositions, setLoadingPositions] = React.useState(false)
  const [poolShare, setPoolShare] = React.useState<string>("0")
  const [selectedLp, setSelectedLp] = React.useState<LPPosition | null>(null)
  const [removePercent, setRemovePercent] = React.useState<number>(100)
  const [needsApprovalFrom, setNeedsApprovalFrom] = React.useState(false)
  const [needsApprovalTo, setNeedsApprovalTo] = React.useState(false)
  const [isApproving, setIsApproving] = React.useState(false)
  const [txHash, setTxHash] = React.useState<string | null>(null)
  const [txStatus, setTxStatus] = React.useState<"success" | "failed" | null>(null)

  const checkAllowances = React.useCallback(async () => {
    if (!walletAddress || !fromAddr || (!toAddr && subMode !== "remove")) return;

    try {
      const routerAddr = mode === "swap" ? ROUTERS[activeRouterKey]?.address : DEFAULT_ROUTER;
      if (!routerAddr) return;

      const [allowFrom, allowTo] = await Promise.all([
        subMode === "remove" && selectedLp 
          ? getAllowance(selectedLp.pairAddress, walletAddress, routerAddr)
          : getAllowance(fromAddr, walletAddress, routerAddr),
        mode === "pool" && subMode === "add" ? getAllowance(toAddr, walletAddress, routerAddr) : Promise.resolve(parseEther("1000000000"))
      ]);

      const amountInWei = mode === "pool" && subMode === "remove" && selectedLp
        ? (selectedLp.lpBalance * BigInt(Math.floor(removePercent))) / 100n
        : parseEther(fromAmount || "0");
      const amountOutWei = parseEther(toAmount || "0");

      setNeedsApprovalFrom(
        (mode === "pool" && subMode === "remove" && selectedLp) 
          ? allowFrom < amountInWei 
          : (!isNativeAddr(fromAddr) && allowFrom < amountInWei)
      );
      setNeedsApprovalTo(mode === "pool" && subMode === "add" && !isNativeAddr(toAddr) && allowTo < amountOutWei);
    } catch (err) {
      console.error("Allowance check error:", err);
    }
  }, [walletAddress, fromAddr, toAddr, fromAmount, toAmount, mode, subMode, activeRouterKey]);

  React.useEffect(() => {
    checkAllowances();
  }, [checkAllowances]);

  React.useEffect(() => {
    setTxStatus(null);
    setTxHash(null);
  }, [fromAddr, toAddr, fromAmount, toAmount, mode, subMode]);

  const coinMap = React.useMemo(() => {
    const map = new Map<string, Coin>()
    data.forEach((c) => map.set(c.address, c))
    return map
  }, [data])

  const fetchPositions = React.useCallback(async () => {
    if (!walletAddress) return;
    setLoadingPositions(true);
    try {
      const p = await getUserLPPositions(walletAddress);
      setLpPositions(p);
    } catch (err) {
      console.error("Fetch positions error:", err);
    } finally {
      setLoadingPositions(false);
    }
  }, [walletAddress]);

  React.useEffect(() => {
    if (isConnected && walletAddress) {
      fetchPositions();
    }
  }, [isConnected, walletAddress, fetchPositions]);

  // Pool ratio / Share logic
  React.useEffect(() => {
    const updatePoolState = async () => {
      if (mode !== "pool" || subMode !== "add") return;
      if (!fromAddr || !toAddr || fromAddr === toAddr || !fromAmount || isNaN(Number(fromAmount)) || Number(fromAmount) <= 0) {
        setPoolShare("0");
        return;
      }

      try {
        const state = await loadPair(fromAddr, toAddr, walletAddress || undefined);
        if (state.pairAddress && state.totalSupply > 0n) {
          // Token0 vs Token1 reserves
          const r0 = state.reserves[0];
          const r1 = state.reserves[1];
          
          const resolvedFrom = isNativeAddr(fromAddr) ? "0x60A84eBC3483fEFB251B76Aea5B8458026Ef4bea" : fromAddr; // WZKLTC_ADDR
          const fromIsToken0 = resolvedFrom.toLowerCase() === state.token0.toLowerCase();
          
          // amountB = amountA * reserveB / reserveA
          const amtA = parseEther(fromAmount);
          let amtB = 0n;
          if (fromIsToken0) {
            amtB = (amtA * r1) / r0;
          } else {
            amtB = (amtA * r0) / r1;
          }
          setToAmount(formatEther(amtB));

          // Est. Share: (amtA / (rA + amtA)) * 100
          const shareBps = (amtA * 10000n) / (fromIsToken0 ? r0 + amtA : r1 + amtA);
          setPoolShare((Number(shareBps) / 100).toFixed(2));
        } else {
          setPoolShare("100"); // Initial provider
        }
      } catch (err) {
        console.error("Pool ratio error:", err);
      }
    };

    updatePoolState();
  }, [fromAmount, fromAddr, toAddr, mode, subMode, walletAddress]);

  // Quote logic
  React.useEffect(() => {
    const fetchQuote = async () => {
      if (mode === "pool") return; 
      if (!fromAmount || isNaN(Number(fromAmount)) || Number(fromAmount) <= 0 || !fromAddr || !toAddr || fromAddr === toAddr) {
        setToAmount("0");
        return;
      }

      setIsLoadingQuote(true);
      try {
        const { amountOut, router, routerKey, path } = await getSwapQuote(
          fromAddr === NATIVE_SENTINEL ? "NATIVE" : fromAddr,
          toAddr === NATIVE_SENTINEL ? "NATIVE" : toAddr,
          fromAmount
        );
        setToAmount(amountOut);
        setActiveRouter(router);
        setActiveRouterKey(routerKey);
        setActivePath(path);
      } catch (err) {
        console.error("Quote error:", err);
        setToAmount("0");
        setActiveRouter("Error");
      } finally {
        setIsLoadingQuote(false);
      }
    };

    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, fromAddr, toAddr, mode]);

  const [rotation, setRotation] = React.useState(0)

  function swapSides() {
    setFromAddr(toAddr)
    setToAddr(fromAddr)
    setRotation(r => r + 360)
  }

  const handleApprove = async (side: "from" | "to") => {
    if (!isConnected || !walletAddress) return;
    const addr = side === "from" ? fromAddr : toAddr;
    const amount = side === "from" ? fromAmount : toAmount;
    const routerAddr = mode === "swap" ? ROUTERS[activeRouterKey]?.address : DEFAULT_ROUTER;

    setIsApproving(true);
    setTxStatus(null);
    setTxHash(null);
    try {
      const hash = await approveToken(addr, routerAddr, parseEther(amount));
      setTxHash(hash);
      setTxStatus("success");
      await checkAllowances();
    } catch (err) {
      console.error("Approval error:", err);
      setTxStatus("failed");
    } finally {
      setIsApproving(false);
    }
  }

  const handleAction = async () => {
    if (!isConnected || !walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }
    setIsSwapping(true);
    setTxStatus(null);
    setTxHash(null);
    try {
      if (mode === "swap") {
        const rKey = activeRouterKey;
        const rAddr = ROUTERS[rKey].address;
        const amountInWei = parseEther(fromAmount);
        const path = activePath;
        
        const hash = await swap({
          routerKey: rKey,
          routerAddr: rAddr,
          tokenInAddr: fromAddr,
          tokenOutAddr: toAddr,
          amountInWei,
          amountOutMinWei: 0n, 
          recipient: walletAddress,
          path
        });
        setTxHash(hash);
        setTxStatus("success");
      } else {
        if (subMode === "add") {
          const rAddr = DEFAULT_ROUTER;
          const amtA = parseEther(fromAmount);
          const amtB = parseEther(toAmount);

          const hash = await addLiquidity({
            tokenAAddr: fromAddr,
            tokenBAddr: toAddr,
            amountAWei: amtA,
            amountBWei: amtB,
            recipient: walletAddress
          });
          setTxHash(hash);
          setTxStatus("success");
          fetchPositions();
        } else {
          if (!selectedLp) {
            alert("Please select a liquidity position first.");
            return;
          }
          const rAddr = DEFAULT_ROUTER;
          const lpToRemove = (selectedLp.lpBalance * BigInt(Math.floor(removePercent))) / 100n;
          
          const hash = await removeLiquidity({
            tokenAAddr: selectedLp.token0,
            tokenBAddr: selectedLp.token1,
            lpWei: lpToRemove,
            recipient: walletAddress
          });
          setTxHash(hash);
          setTxStatus("success");
          fetchPositions();
        }
      }
    } catch (err: any) {
      console.error("Action error:", err);
      setTxStatus("failed");
    } finally {
      setIsSwapping(false);
    }
  }

  const formatTokenDisplay = (n: string | number) => {
    const val = typeof n === "string" ? parseFloat(n) : n;
    return val.toLocaleString(undefined, { maximumFractionDigits: 6 });
  }

  return (
    <motion.section
      role="region"
      aria-label="Crypto swap"
      className={[
        "w-full max-w-md sm:max-w-lg",
        "rounded-lg border border-brand-border bg-brand-surface text-brand-text-primary",
        "shadow-sm p-4 sm:p-6 md:p-8",
        "flex flex-col gap-4 sm:gap-6",
        className,
      ].join(" ")}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-pretty text-lg sm:text-xl font-semibold">
            {mode === "pool" ? (subMode === "add" ? "Add Pool" : "Remove Pool") : "Swap"}
          </h2>
          <p className="text-sm text-brand-text-muted">
            {mode === "pool" 
              ? (subMode === "add" ? "Provide liquidity and earn fees" : "Withdraw your liquidity and rewards")
              : `Trading on ${ROUTERS[pickRouter(fromAddr, toAddr)].label}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {mode === "pool" && (
            <div className="flex bg-brand-surface-2 rounded-lg p-1 border border-brand-border mr-2">
              <button
                onClick={() => setSubMode("add")}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                  subMode === "add" ? "bg-white text-black" : "text-brand-text-muted hover:text-white"
                )}
              >
                Add
              </button>
              <button
                onClick={() => setSubMode("remove")}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                  subMode === "remove" ? "bg-white text-black" : "text-brand-text-muted hover:text-white"
                )}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </header>

      {mode === "pool" && subMode === "remove" ? (
        <div className="flex flex-col gap-4">
          <label className="text-xs uppercase font-bold text-brand-text-muted tracking-widest">
            Select Position to Remove
          </label>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar">
            {lpPositions.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-white/5 rounded-xl text-center bg-black/20">
                 <p className="text-[10px] text-brand-text-muted uppercase font-bold tracking-widest">No positions found</p>
              </div>
            ) : (
              lpPositions.map((pos) => {
                const t0 = coinMap.get(pos.token0);
                const t1 = coinMap.get(pos.token1);
                const isSelected = selectedLp?.pairAddress === pos.pairAddress;
                return (
                  <button
                    key={pos.pairAddress}
                    onClick={() => setSelectedLp(pos)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                      isSelected ? "bg-white/10 border-white/20" : "bg-black/20 border-white/5 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-xs">{t0?.symbol || "???"} / {t1?.symbol || "???"}</span>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] font-bold text-white">{(Number(pos.share)/100).toFixed(2)}% SHARE</div>
                       <div className="text-[9px] text-brand-text-muted font-mono">{formatTokenDisplay(formatEther(pos.lpBalance))} LP</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          
          {selectedLp && (
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-brand-text-muted uppercase">Amount to Remove</span>
                  <span className="text-lg font-bold">{removePercent}%</span>
               </div>
               <input 
                type="range" 
                min="1" max="100" 
                value={removePercent} 
                onChange={(e) => setRemovePercent(parseInt(e.target.value))}
                className="w-full accent-white"
               />
               <div className="flex justify-between text-[9px] font-bold text-brand-text-muted uppercase tracking-widest">
                  <button onClick={() => setRemovePercent(25)}>25%</button>
                  <button onClick={() => setRemovePercent(50)}>50%</button>
                  <button onClick={() => setRemovePercent(75)}>75%</button>
                  <button onClick={() => setRemovePercent(100)}>100%</button>
               </div>
            </div>
          )}
        </div>
      ) : (
        <>
      {/* From */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 items-end">
        <div className="flex flex-col gap-2">
          <label htmlFor="from-amount" className="text-xs uppercase font-bold text-brand-text-muted tracking-widest">
            {mode === "pool" ? "Token A Amount" : "You pay"}
          </label>
          <div
            className={[
              "flex items-center gap-3 rounded-md border border-brand-border bg-brand-bg px-3 py-2.5",
              "focus-within:ring-1 focus-within:ring-white",
            ].join(" ")}
          >
            <TokenSelector
              coins={data}
              selectedId={fromAddr}
              onSelect={(addr) => {
                if (addr === toAddr) setToAddr(fromAddr)
                setFromAddr(addr)
              }}
              side="from"
            />
            <input
              id="from-amount"
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0.00"
              className="flex-1 min-w-0 bg-transparent outline-none text-right text-lg sm:text-xl placeholder:text-brand-text-muted font-mono"
              value={fromAmount}
              onChange={(e) => {
                const v = e.target.value.replace(",", ".")
                if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setFromAmount(v)
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <motion.button
          type="button"
          onClick={swapSides}
          className={[
            "rounded-full border border-brand-border bg-brand-surface-2 hover:bg-white/10 px-4 py-2 text-xs font-bold uppercase",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white",
          ].join(" ")}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          whileTap={{ scale: 0.96 }}
        >
          {mode === "swap" ? "⇅ Swap" : "⇅"}
        </motion.button>
      </div>

      {/* To */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 items-end">
        <div className="flex flex-col gap-2">
          <label htmlFor="to-amount" className="text-xs uppercase font-bold text-brand-text-muted tracking-widest">
            {mode === "pool" ? "Token B Amount" : "You receive"}
          </label>
          <div
            className={[
              "flex items-center gap-3 rounded-md border border-brand-border bg-brand-bg px-3 py-2.5",
              "focus-within:ring-1 focus-within:ring-white",
            ].join(" ")}
          >
            <TokenSelector
              coins={data}
              selectedId={toAddr}
              onSelect={(addr) => {
                if (addr === fromAddr) setFromAddr(toAddr)
                setToAddr(addr)
              }}
              side="to"
            />
            {mode === "pool" ? (
               <input
               id="to-amount"
               inputMode="decimal"
               pattern="^[0-9]*[.,]?[0-9]*$"
               placeholder="0.00"
               className="flex-1 min-w-0 bg-transparent outline-none text-right text-lg sm:text-xl placeholder:text-brand-text-muted font-mono"
               value={toAmount}
               onChange={(e) => {
                 const v = e.target.value.replace(",", ".")
                 if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setToAmount(v)
               }}
             />
            ) : (
              <output
                id="to-amount"
                className={cn(
                  "flex-1 min-w-0 text-right text-lg sm:text-xl font-mono overflow-hidden truncate",
                  isLoadingQuote && "animate-pulse opacity-50"
                )}
              >
                {isLoadingQuote ? "..." : formatTokenDisplay(toAmount)}
              </output>
            )}
          </div>
        </div>
      </div>
      </>
      )}

      {mode === "pool" && subMode === "add" && (
        <div className="flex items-center justify-between px-1">
           <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Pool Share</span>
           <span className="text-xs font-bold text-white">{poolShare}%</span>
        </div>
      )}

          {txStatus && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest text-center",
            txStatus === "success" 
              ? "bg-white/5 border-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
              : "bg-white/5 border-red-900/30 text-red-400/80"
          )}
        >
          {txStatus === "success" ? "Transaction Success" : "Transaction Failed"}
          {txHash && (
            <a 
              href={`${litvmChain.blockExplorers.default.url}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="block mt-1 underline opacity-50 hover:opacity-100 transition-opacity"
            >
              View on Explorer
            </a>
          )}
        </motion.div>
      )}

      <motion.button
        type="button"
        disabled={!isConnected || isSwapping || isApproving || (mode === "swap" && parseFloat(fromAmount) <= 0)}
        className={[
          "w-full rounded-xl px-4 py-4 text-sm font-bold uppercase tracking-widest transition-all",
          "bg-white text-black hover:opacity-90",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white shadow-[0_0_24px_rgba(255,255,255,0.1)]",
        ].join(" ")}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (needsApprovalFrom) handleApprove("from");
          else if (needsApprovalTo) handleApprove("to");
          else handleAction();
        }}
      >
        {!isConnected 
          ? "Connect Wallet" 
          : isSwapping || isApproving
            ? "Processing..." 
            : needsApprovalFrom 
              ? `Approve ${subMode === "remove" ? "LP" : coinMap.get(fromAddr)?.symbol}` 
              : needsApprovalTo 
                ? `Approve ${coinMap.get(toAddr)?.symbol}` 
                : mode === "pool" 
                  ? (subMode === "add" ? "Confirm Add Liquidity" : "Confirm Remove Liquidity") 
                  : "Confirm Swap"}
      </motion.button>

      <footer className="flex items-center justify-between text-[9px] text-brand-text-muted font-bold uppercase tracking-[0.2em]">
        <div className="flex flex-col gap-1">
          <span>Powered by LitDeX</span>
          {activeRouter && mode === "swap" && (
            <span className="text-white opacity-60">Routed via {activeRouter}</span>
          )}
        </div>
        <span>Real-time quotes</span>
      </footer>

      {mode === "pool" && lpPositions.length > 0 && (
         <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex justify-between items-center mb-4">
             <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Select Position</h3>
               <button onClick={fetchPositions} className="text-[8px] font-bold text-brand-text-muted hover:text-white uppercase tracking-widest">Refresh</button>
            </div>
            <div className="space-y-2">
               {lpPositions.map(pos => {
                   const t0 = coinMap.get(pos.token0);
                   const t1 = coinMap.get(pos.token1);
                   return (
                       <div key={pos.pairAddress} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-xl">
                          <div className="flex items-center gap-2">
                             <span className="font-bold text-[10px] text-white underline decoration-white/20 underline-offset-4">{t0?.symbol} / {t1?.symbol}</span>
                          </div>
                          <div className="text-right">
                             <div className="text-[9px] font-bold text-white">{(Number(pos.share)/100).toFixed(2)}% SHARE</div>
                             <div className="text-[8px] text-brand-text-muted">{formatTokenDisplay(formatEther(pos.lpBalance))} LP</div>
                          </div>
                       </div>
                   )
               })}
            </div>
         </div>
      )}

    </motion.section>
  )
}

const LogoLD = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <div className={cn("relative flex items-center justify-center font-black italic tracking-tighter cursor-default filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]", className)}>
    <span style={{ fontSize: size }} className="text-black leading-none select-none">L</span>
    <span style={{ fontSize: size }} className="text-black leading-none -ml-[0.1em] select-none">D</span>
  </div>
);

function TokenSelector({
  coins,
  selectedId,
  onSelect,
  side,
}: {
  coins: Coin[]
  selectedId: string
  onSelect: (addr: string) => void
  side: "from" | "to"
}) {
  const { address: walletAddress, isConnected } = useAccount();
  const selected = coins.find((c) => c.address === selectedId) ?? coins[0]
  const [balances, setBalances] = React.useState<Record<string, string>>({});

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    // Fetch balances when popover opens
    const fetchBalances = async () => {
      if (!isConnected || !walletAddress) return;
      const newBalances: Record<string, string> = {};
      await Promise.all(coins.map(async (coin) => {
        try {
          if (isNativeAddr(coin.address)) {
            const balance = await readProvider.getBalance(walletAddress);
            newBalances[coin.address] = parseFloat(formatEther(balance)).toLocaleString(undefined, { maximumFractionDigits: 4 });
          } else {
            const token = new Contract(coin.address, ERC20_ABI, readProvider);
            const [bal, dec] = await Promise.all([
                token.balanceOf(walletAddress),
                token.decimals()
            ]);
            newBalances[coin.address] = (Number(bal) / 10 ** Number(dec)).toLocaleString(undefined, { maximumFractionDigits: 4 });
          }
        } catch (e) {
          newBalances[coin.address] = "0";
        }
      }));
      setBalances(newBalances);
    };
    fetchBalances();

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, coins, isConnected, walletAddress])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return coins
    return coins.filter(
      (c) =>
        c.symbol.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    )
  }, [coins, query])

  React.useEffect(() => {
    if (!open) return
    setActiveIndex(0)
    const t = setTimeout(() => inputRef.current?.focus(), 10)
    return () => clearTimeout(t)
  }, [open])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)))
      scrollActiveIntoView()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
      scrollActiveIntoView()
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = filtered[activeIndex]
      if (item) {
        onSelect(item.address)
        setOpen(false)
        buttonRef.current?.focus()
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
    }
  }

  function scrollActiveIntoView() {
    const list = listRef.current
    if (!list) return
    const el = list.querySelector<HTMLButtonElement>('[data-active="true"]')
    if (el) {
      el.scrollIntoView({ block: "nearest" })
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`token-popover-${side}`}
        onClick={() => setOpen((o) => !o)}
        className={[
          "inline-flex items-center gap-2 rounded-md",
          "border border-brand-border bg-brand-surface-2 hover:bg-white/5",
          "px-2.5 py-1.5 text-xs font-bold transition-all",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white",
        ].join(" ")}
        title="Choose token"
      >
        {selected?.symbol === "LDEX" ? (
          <div className="size-5 rounded-full bg-white flex items-center justify-center">
             <LogoLD size={14} />
          </div>
        ) : (
          <img
            src={selected?.image || "/placeholder.svg"}
            alt={`${selected?.symbol} logo`}
            width={20}
            height={20}
            className="size-5 rounded-full border border-brand-border object-cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        )}
        <span className="font-bold">{selected?.symbol?.toUpperCase()}</span>
        <span aria-hidden="true" className="ml-1 text-[8px]">▼</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`token-popover-${side}`}
            role="listbox"
            aria-label="Select token"
            initial={{ opacity: 0, y: side === "to" ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: side === "to" ? -6 : 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className={[
              "absolute z-[100] w-[min(82vw,22rem)] sm:w-[22rem]",
              side === "to" ? "bottom-full mb-2" : "mt-2",
              "rounded-xl border border-brand-border bg-brand-surface text-brand-text-primary",
              "shadow-2xl overflow-hidden backdrop-blur-xl",
            ].join(" ")}
            onKeyDown={handleKeyDown}
          >
            <div className="p-3 border-b border-brand-border">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, symbol, rank…"
                className={[
                  "w-full rounded-lg bg-brand-bg px-3 py-2 text-sm outline-none font-medium",
                  "border border-brand-border focus:border-white transition-colors",
                ].join(" ")}
                aria-label="Search tokens"
              />
            </div>

            <div
              ref={listRef}
              className="max-h-72 overflow-auto p-1 custom-scrollbar"
              tabIndex={-1}
            >
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-xs text-brand-text-muted font-bold uppercase text-center">
                  No results
                </div>
              )}
              {filtered.map((c, idx) => {
                const active = idx === activeIndex
                const isLD = c.symbol === "LDEX"

                return (
                  <button
                    key={c.address}
                    role="option"
                    aria-selected={c.address === selectedId}
                    data-active={active ? "true" : undefined}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => {
                      onSelect(c.address)
                      setOpen(false)
                      setQuery("")
                      buttonRef.current?.focus()
                    }}
                    className={[
                      "w-full flex items-center gap-3 rounded-lg px-2.5 py-3 text-left transition-all",
                      c.address === selectedId
                        ? "bg-white/10"
                        : active
                        ? "bg-white/5"
                        : "hover:bg-white/5",
                    ].join(" ")}
                  >
                    {isLD ? (
                      <div className="size-6 rounded-full bg-white flex items-center justify-center shrink-0">
                         <LogoLD size={16} />
                      </div>
                    ) : (
                      <img
                        src={c.image || "/placeholder.svg"}
                        alt=""
                        width={22}
                        height={22}
                        className="size-6 rounded-full border border-brand-border object-cover shrink-0"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate">
                          {c.symbol.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-brand-text-muted truncate font-mono opacity-50">
                          {c.address.slice(0, 6)}...{c.address.slice(-4)}
                        </span>
                      </div>
                    </div>

                    {isConnected && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-[10px] font-bold text-white">
                          {balances[c.address] || "0.00"}
                        </div>
                        <div className="text-[8px] text-brand-text-muted uppercase tracking-tighter opacity-70">
                          Balance
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
