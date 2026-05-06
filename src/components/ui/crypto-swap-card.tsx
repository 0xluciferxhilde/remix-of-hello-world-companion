import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type Coin = {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number | null
  market_cap_rank: number | null
}

const LOCAL_COINS: Coin[] = [
  {
    id: "zkltc",
    symbol: "zkLTC",
    name: "Native LiteForge",
    image: "https://cryptologos.cc/logos/litecoin-ltc-logo.png?v=040",
    current_price: 85.42,
    price_change_percentage_24h: 2.45,
    market_cap_rank: 1,
  },
  {
    id: "pepe",
    symbol: "PEPE",
    name: "Pepe",
    image: "https://cryptologos.cc/logos/pepe-pepe-logo.png?v=040",
    current_price: 0.00001245,
    price_change_percentage_24h: 12.50,
    market_cap_rank: 2,
  },
  {
    id: "zkpepe",
    symbol: "zkPEPE",
    name: "zkPepe",
    image: "https://cryptologos.cc/logos/pepe-pepe-logo.png?v=040",
    current_price: 0.00000812,
    price_change_percentage_24h: -1.20,
    market_cap_rank: 3,
  },
  {
    id: "lester",
    symbol: "LESTER",
    name: "Lester",
    image: "https://raw.githubusercontent.com/lucide-react/lucide/main/icons/dog.svg",
    current_price: 0.154,
    price_change_percentage_24h: 5.67,
    market_cap_rank: 4,
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=040",
    current_price: 1.00,
    price_change_percentage_24h: 0.01,
    market_cap_rank: 5,
  },
  {
    id: "usdt",
    symbol: "USDT",
    name: "Tether",
    image: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=040",
    current_price: 1.00,
    price_change_percentage_24h: -0.02,
    market_cap_rank: 6,
  },
]

export type SwapCardProps = {
  defaultFromId?: string
  defaultToId?: string
  className?: string
  mode?: "swap" | "pool"
}

export default function SwapCard({
  defaultFromId = "zkltc",
  defaultToId = "usdc",
  className = "",
  mode = "swap",
}: SwapCardProps) {
  // Use local data instead of fetching
  const data = LOCAL_COINS;
  const isLoading = false;
  const error = null;
  const mutate = () => {}; 

  const coinMap = React.useMemo(() => {
    const map = new Map<string, Coin>()
    data?.forEach((c) => map.set(c.id, c))
    return map
  }, [data])

  const initialFrom = coinMap.get(defaultFromId)?.id || (data?.[0]?.id ?? "")
  const initialTo =
    coinMap.get(defaultToId)?.id || (data?.find((c) => c.id !== initialFrom)?.id ?? "")

  const [fromId, setFromId] = React.useState<string>(initialFrom)
  const [toId, setToId] = React.useState<string>(initialTo)
  const [fromAmount, setFromAmount] = React.useState<string>("1")
  const [subMode, setSubMode] = React.useState<"add" | "remove">("add")

  React.useEffect(() => {
    if (!data?.length) return
    if (!coinMap.has(fromId)) setFromId(initialFrom)
    if (!coinMap.has(toId) || initialFrom === initialTo) setToId(initialTo)
  }, [data])

  const fromCoin = fromId ? coinMap.get(fromId) : undefined
  const toCoin = toId ? coinMap.get(toId) : undefined

  const parsedAmount = React.useMemo(() => {
    const n = Number(fromAmount)
    return Number.isFinite(n) && n >= 0 ? n : 0
  }, [fromAmount])

  const toAmount = React.useMemo(() => {
    if (!fromCoin || !toCoin) return 0
    if (toCoin.current_price <= 0) return 0
    return parsedAmount * (fromCoin.current_price / toCoin.current_price)
  }, [fromCoin, toCoin, parsedAmount])

  function swapSides() {
    setFromId(toId)
    setToId(fromId)
  }

  function formatFiat(n: number) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: n < 1 ? 6 : 2,
    }).format(n)
  }

  function formatToken(n: number) {
    const max = n < 1 ? 8 : 6
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: max,
    }).format(n)
  }

  const loading = isLoading && !data
  const stateError = !!error

  const Price = ({ value }: { value: number }) => (
    <div className="min-w-[80px] text-right">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={Number.isFinite(value) ? value.toFixed(6) : "na"}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="tabular-nums"
        >
          {formatFiat(value)}
        </motion.span>
      </AnimatePresence>
    </div>
  )

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
              : "Trade tokens instantly on LiteForge"}
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
          <button
            type="button"
            onClick={() => mutate()}
            className={[
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm",
              "border border-brand-border bg-brand-surface-2 hover:bg-white/5 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            ].join(" ")}
            aria-label="Refresh prices"
          >
            <span className="sr-only sm:not-sr-only text-xs uppercase font-bold tracking-widest">Refresh</span>
            ⟳
          </button>
        </div>
      </header>

      {loading && (
        <div
          className="animate-pulse rounded-md border border-brand-border bg-brand-surface-2 h-28"
          aria-busy="true"
          aria-live="polite"
        />
      )}

      {stateError && (
        <div
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-500/10 text-red-500 px-3 py-2 text-sm"
        >
          Failed to load market data. Please try again.
        </div>
      )}

      {!loading && !stateError && (
        <>
          {/* From */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label htmlFor="from-amount" className="text-xs uppercase font-bold text-brand-text-muted tracking-widest">
                {mode === "pool" ? "Deposit" : "You pay"}
              </label>
              <div
                className={[
                  "flex items-center gap-3 rounded-md border border-brand-border bg-brand-bg px-3 py-2.5",
                  "focus-within:ring-1 focus-within:ring-white",
                ].join(" ")}
              >
                <TokenSelector
                  coins={data ?? []}
                  selectedId={fromId}
                  onSelect={(id) => {
                    if (id === toId) setToId(fromId)
                    setFromId(id)
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
                  aria-label="Amount you pay"
                />
              </div>
              {fromCoin && (
                <div className="flex items-center justify-between text-[10px] text-brand-text-muted uppercase font-bold tracking-tighter">
                  <span className="flex items-center gap-1">{fromCoin.name} price</span>
                  <Price value={fromCoin.current_price} />
                </div>
              )}
            </div>
          </div>

          {/* Swap or Pool button */}
          <div className="flex items-center justify-center">
            <motion.button
              type="button"
              onClick={swapSides}
              className={[
                "rounded-full border border-brand-border bg-brand-surface-2 hover:bg-white/10 px-4 py-2 text-xs font-bold uppercase",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white",
              ].join(" ")}
              whileTap={{ scale: 0.96, rotate: mode === "swap" ? 180 : 0 }}
              aria-label={mode === "swap" ? "Swap tokens" : (subMode === "add" ? "Add liquidity" : "Remove liquidity")}
              title={mode === "swap" ? "Swap tokens" : (subMode === "add" ? "Add liquidity" : "Remove liquidity")}
            >
              {mode === "swap" ? "⇅ Swap" : (subMode === "add" ? "+ Add" : "− Remove")}
            </motion.button>
          </div>

          {/* To */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label htmlFor="to-amount" className="text-xs uppercase font-bold text-brand-text-muted tracking-widest">
                {mode === "pool" ? "Deposit" : "You receive"}
              </label>
              <div
                className={[
                  "flex items-center gap-3 rounded-md border border-brand-border bg-brand-bg px-3 py-2.5",
                  "focus-within:ring-1 focus-within:ring-white",
                ].join(" ")}
              >
                <TokenSelector
                  coins={data ?? []}
                  selectedId={toId}
                  onSelect={(id) => {
                    if (id === fromId) setFromId(toId)
                    setToId(id)
                  }}
                  side="to"
                />
                <output
                  id="to-amount"
                  className="flex-1 min-w-0 text-right text-lg sm:text-xl font-mono overflow-hidden truncate"
                  aria-live="polite"
                >
                  {toCoin ? formatToken(toAmount) : "0"}
                </output>
              </div>
              {toCoin && (
                <div className="flex items-center justify-between text-[10px] text-brand-text-muted uppercase font-bold tracking-tighter">
                  <span className="flex items-center gap-1">{toCoin.name} price</span>
                  <Price value={toCoin.current_price} />
                </div>
              )}
            </div>
          </div>

          {fromCoin && toCoin && (
            <motion.div
              className="rounded-md border border-brand-border bg-brand-surface-2 px-3 py-2 text-[10px] font-bold uppercase tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              1 {fromCoin.symbol.toUpperCase()} ≈{" "}
              {formatToken(fromCoin.current_price / toCoin.current_price)}{" "}
              {toCoin.symbol.toUpperCase()} • 24h:{" "}
              <span
                className={(fromCoin.price_change_percentage_24h ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"}
              >
                {(fromCoin.price_change_percentage_24h ?? 0).toFixed(2)}%
              </span>
            </motion.div>
          )}

          <motion.button
            type="button"
            disabled={!fromCoin || !toCoin || parsedAmount <= 0}
            className={[
              "w-full rounded-xl px-4 py-4 text-sm font-bold uppercase tracking-widest transition-all",
              "bg-white text-black hover:opacity-90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white shadow-[0_0_24px_rgba(255,255,255,0.1)]",
            ].join(" ")}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (mode === "swap") {
                alert(
                  `Simulated swap:
  ${parsedAmount} ${fromCoin?.symbol.toUpperCase()} -> ${formatToken(
                    toAmount,
                  )} ${toCoin?.symbol.toUpperCase()}`,
                )
              } else {
                alert(
                  `Simulated pool ${subMode}:
  ${subMode === "add" ? "Adding" : "Removing"} liquidity for ${fromCoin?.symbol.toUpperCase()} and ${toCoin?.symbol.toUpperCase()}`
                )
              }
            }}
          >
            {mode === "pool" ? (subMode === "add" ? "Add Liquidity Now" : "Remove Liquidity Now") : "Swap Now"}
          </motion.button>

          {/* Footer */}
          <footer className="flex items-center justify-between text-[9px] text-brand-text-muted font-bold uppercase tracking-[0.2em]">
            <span>Powered by LiteForge Dex</span>
            <span aria-label="Auto-refresh interval">Updates every 15s</span>
          </footer>
        </>
      )}
    </motion.section>
  )
}

function TokenSelector({
  coins,
  selectedId,
  onSelect,
  side,
}: {
  coins: Coin[]
  selectedId: string
  onSelect: (id: string) => void
  side: "from" | "to"
}) {
  const selected = coins.find((c) => c.id === selectedId) ?? coins[0]

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
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        (c.market_cap_rank ? String(c.market_cap_rank).includes(q) : false),
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
        onSelect(item.id)
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
      const box = el.getBoundingClientRect()
      const parent = list.getBoundingClientRect()
      if (box.top < parent.top) el.scrollIntoView({ block: "nearest" })
      else if (box.bottom > parent.bottom) el.scrollIntoView({ block: "nearest" })
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
        <img
          src={selected?.image || "/placeholder.svg"}
          alt={`${selected?.name} logo`}
          width={20}
          height={20}
          className="size-5 rounded-full border border-brand-border object-cover"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <span className="font-bold">{selected?.symbol?.toUpperCase()}</span>
        <span className="text-brand-text-muted hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest ml-1">
          {selected?.name}
        </span>
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
                const change = c.price_change_percentage_24h ?? 0
                const changeClass =
                  change > 0 ? "text-emerald-500" : change < 0 ? "text-red-500" : "text-brand-text-muted"

                return (
                  <button
                    key={c.id}
                    role="option"
                    aria-selected={c.id === selectedId}
                    data-active={active ? "true" : undefined}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => {
                      onSelect(c.id)
                      setOpen(false)
                      setQuery("")
                      buttonRef.current?.focus()
                    }}
                    className={[
                      "w-full flex items-center gap-3 rounded-lg px-2.5 py-3 text-left transition-all",
                      c.id === selectedId
                        ? "bg-white/10"
                        : active
                        ? "bg-white/5"
                        : "hover:bg-white/5",
                    ].join(" ")}
                  >
                    <img
                      src={c.image || "/placeholder.svg"}
                      alt=""
                      width={22}
                      height={22}
                      className="size-6 rounded-full border border-brand-border object-cover"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate">
                          {c.symbol.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-brand-text-muted truncate uppercase font-bold tracking-tight">
                          {c.name}
                        </span>
                        {c.market_cap_rank != null && (
                          <span className="ml-auto text-[10px] text-brand-text-muted font-mono font-bold">
                            #{c.market_cap_rank}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="text-brand-text-muted uppercase">
                          {new Intl.NumberFormat(undefined, {
                            style: "currency",
                            currency: "USD",
                          }).format(c.current_price)}
                        </span>
                        <span className={changeClass}>
                          {change > 0 ? "+" : ""}
                          {change.toFixed(2)}%
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
