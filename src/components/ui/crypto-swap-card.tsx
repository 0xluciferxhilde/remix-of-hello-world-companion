import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAccount, useBalance } from "wagmi"
import { parseEther, formatEther, Contract } from "ethers"
import { 
  SWAP_TOKENS, 
  NATIVE_SENTINEL, 
  quoteSwap, 
  swap, 
  pickRouter, 
  ROUTERS, 
  resolveWrappedNative, 
  buildSwapPath, 
  approveToken,
  ERC20_ABI,
  isNativeAddr,
  errMsg,
  loadPair,
  addLiquidity,
  removeLiquidity,
  DEFAULT_ROUTER
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

  const coinMap = React.useMemo(() => {
    const map = new Map<string, Coin>()
    data.forEach((c) => map.set(c.address, c))
    return map
  }, [data])

  const fromCoin = fromAddr ? coinMap.get(fromAddr) : undefined
  const toCoin = toAddr ? coinMap.get(toAddr) : undefined

  // Quote logic
  React.useEffect(() => {
    const fetchQuote = async () => {
      if (!fromAmount || isNaN(Number(fromAmount)) || Number(fromAmount) <= 0 || !fromAddr || !toAddr || fromAddr === toAddr) {
        setToAmount("0");
        return;
      }
      if (mode === "pool") return; 

      setIsLoadingQuote(true);
      try {
        const rKey = pickRouter(fromAddr, toAddr);
        const rAddr = ROUTERS[rKey].address;
        const wrapped = await resolveWrappedNative(rAddr);
        const path = buildSwapPath(fromAddr, toAddr, wrapped);
        const amountInWei = parseEther(fromAmount);
        const outWei = await quoteSwap(rAddr, amountInWei, path);
        setToAmount(formatEther(outWei));
      } catch (err) {
        console.error("Quote error:", err);
        setToAmount("0");
      } finally {
        setIsLoadingQuote(false);
      }
    };

    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, fromAddr, toAddr, mode]);

  function swapSides() {
    setFromAddr(toAddr)
    setToAddr(fromAddr)
  }

  const handleAction = async () => {
    if (!isConnected || !walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }
    setIsSwapping(true);
    try {
      if (mode === "swap") {
        const rKey = pickRouter(fromAddr, toAddr);
        const rAddr = ROUTERS[rKey].address;
        const amountInWei = parseEther(fromAmount);
        const wrapped = await resolveWrappedNative(rAddr);
        const path = buildSwapPath(fromAddr, toAddr, wrapped);
        
        if (!isNativeAddr(fromAddr)) {
          await approveToken(fromAddr, rAddr, amountInWei);
        }

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
        alert(`Swap Success! Tx: ${hash}`);
      } else {
        if (subMode === "add") {
          const hash = await addLiquidity({
            tokenAAddr: fromAddr,
            tokenBAddr: toAddr,
            amountAWei: parseEther(fromAmount),
            amountBWei: parseEther(toAmount),
            recipient: walletAddress
          });
          alert(`Liquidity Added! Tx: ${hash}`);
        } else {
          alert("Please use the 'Active Liquidity' cards to remove specific pairs.");
        }
      }
    } catch (err: any) {
      alert(`Error: ${errMsg(err)}`);
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

      <motion.button
        type="button"
        disabled={!isConnected || isSwapping || parseFloat(fromAmount) <= 0}
        className={[
          "w-full rounded-xl px-4 py-4 text-sm font-bold uppercase tracking-widest transition-all",
          "bg-white text-black hover:opacity-90",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white shadow-[0_0_24px_rgba(255,255,255,0.1)]",
        ].join(" ")}
        whileTap={{ scale: 0.98 }}
        onClick={handleAction}
      >
        {!isConnected 
          ? "Connect Wallet" 
          : isSwapping 
            ? "Processing..." 
            : mode === "pool" 
              ? (subMode === "add" ? "Add Liquidity" : "Remove Liquidity") 
              : "Swap Now"}
      </motion.button>

      <footer className="flex items-center justify-between text-[9px] text-brand-text-muted font-bold uppercase tracking-[0.2em]">
        <span>Powered by LitDeX</span>
        <span>Real-time quotes</span>
      </footer>
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
  const selected = coins.find((c) => c.address === selectedId) ?? coins[0]

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

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
    <div className="relative">
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
        {selected?.symbol === "zkLTC" || selected?.symbol === "LDEX" ? (
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
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className={[
              "absolute z-[100] mt-2 w-[min(82vw,22rem)] sm:w-[22rem]",
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
                const isLD = c.symbol === "zkLTC" || c.symbol === "LDEX"

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
