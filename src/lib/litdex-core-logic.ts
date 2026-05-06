/**
 * litdex-core-logic.ts
 * ----------------------------------------------------------------------------
 * Single-file export of all CORE LOGIC for the LitDeX dApp:
 *   - Chain config (LitVM 4441) & viem chain definition
 *   - All contract addresses + ABIs
 *   - Wagmi/RainbowKit config
 *   - Swap logic (LiteSwap V2 / OmniFun routers)
 *   - Pool/liquidity logic (add / remove)
 *   - Deploy token logic (LitDeXDeployer + legacy TokenFactory)
 *   - Points system (PointsSystemV5) read & record helpers
 *   - Daily check-in (DailyCheckinV2)
 *   - NFT (LitDeXNFT) mint + claim
 *   - Game API (https://game.test-hub.xyz)
 *   - Quest API + Faucet API (https://api.test-hub.xyz)
 *   - All TypeScript types/interfaces
 *
 * Dependencies (already in this project):
 *   ethers v6, viem, wagmi, @rainbow-me/rainbowkit
 *
 * Drop this file into another project as-is and import what you need.
 * ----------------------------------------------------------------------------
 */

import { BrowserProvider, Contract, JsonRpcProvider, parseEther, formatEther } from "ethers";
import { defineChain, parseAbi } from "viem";
import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

/* =====================================================================
 * SECTION 1 — CHAIN / NETWORK CONSTANTS
 * ===================================================================== */
export const RPC_URL = "https://liteforge.rpc.caldera.xyz/http";
export const EXPLORER_URL = "https://liteforge.explorer.caldera.xyz";
export const LITVM_CHAIN_ID = 4441;

export const litvmChain = defineChain({
  id: LITVM_CHAIN_ID,
  name: "LitVM LiteForge",
  nativeCurrency: { name: "zkLTC", symbol: "zkLTC", decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: { name: "LiteForge", url: EXPLORER_URL },
  },
  testnet: true,
});

/** Shared read-only provider (use this for all view calls). */
export const readProvider = new JsonRpcProvider(RPC_URL);

/* =====================================================================
 * SECTION 2 — CONTRACT ADDRESSES
 * ===================================================================== */

// ── AMM ─────────────────────────────────────────────────────────────────
export const NATIVE_SENTINEL = "NATIVE";
export const LITESWAP_FACTORY = "0xb923f1481384386D447C51051907F8CadAFF5f3E";
export const LITESWAP_ROUTER  = "0xFa1f665C6ee5167f78454d85bc56D263D5da4576";
export const OMNIFUN_ROUTER   = "0xe351c47c3b96844F46e9808a7D5bBa8101BfFB57";
export const DEFAULT_FACTORY  = LITESWAP_FACTORY;
export const DEFAULT_ROUTER   = LITESWAP_ROUTER;
export const WZKLTC_ADDR      = "0x60A84eBC3483fEFB251B76Aea5B8458026Ef4bea";

// ── Token Factories ─────────────────────────────────────────────────────
/** Newer deployer used for points-earning token deploys (5 pts each). */
export const LITDEX_DEPLOYER_ADDRESS = "0x953124243647F043b6D7Eb924e2a89179cBb78da";
/** Legacy/general token factory (full feature set: mintable/burnable/pausable). */
export const TOKEN_FACTORY_ADDRESS   = "0xafb82a10118544E22596F5eF335B648ea1eBbE7a";
/** Multi-type contract factory (ERC20 / NFT / Staking / Vesting). */
export const LITVM_FACTORY_ADDRESS   = "0xdd56517bFfDf6915918DbEDf1124b5F21D26f684";

// ── Points / Check-in / NFT ─────────────────────────────────────────────
export const POINTS_SYSTEM_ADDRESS  = "0x5Ca1ce5fe101694cb233007F2516ff52450b505B";
export const DAILY_CHECKIN_ADDRESS  = "0xBFcdf8b8bb7e779E382c65ca171fa1ee603E9BEa";
export const LITDEX_NFT_ADDRESS     = "0x63C40F0F6A7D4AcE71f6Ccaf1BB588De9701b251";

// ── Reward / utility tokens ─────────────────────────────────────────────
export const LDEX_TOKEN_ADDRESS = "0xBAaba603e6298fbb76325a6B0d47Cd57154ca641";
export const USDC_TOKEN_ADDRESS = "0x60DD65bAd8a73Dfd8DF029C4e3b372d575B03BC2";

// ── Misc constants ──────────────────────────────────────────────────────
export const POINTS_OWNER_ADDRESS = "0x3BC6348E1E569E97Bd8247b093475A4aC22B9fD4";
export const DAILY_POINTS_CAP = 100;
export const SWAP_DEADLINE_SEC = 1200; // 20 min
/** Display-only base count added to on-chain totalDeployed(). */
export const DEPLOY_COUNT_BASE = 596;

/* =====================================================================
 * SECTION 3 — CONTRACT ABIs
 * ===================================================================== */

// ── Router (LiteSwap V2 — uses ZKLTC names; OmniFun also accepts ETH names) ──
export const ROUTER_ABI = [
  "function WZKLTC() view returns (address)",
  "function WETH() view returns (address)",
  "function factory() view returns (address)",
  "function getAmountsOut(uint amountIn, address[] path) view returns (uint[] amounts)",

  // Swaps — ZKLTC variant
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] amounts)",
  "function swapExactZKLTCForTokens(uint amountOutMin, address[] path, address to, uint deadline) payable returns (uint[] amounts)",
  "function swapExactTokensForZKLTC(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] amounts)",
  // Swaps — ETH variant (OmniFun)
  "function swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline) payable returns (uint[] amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] amounts)",

  // Liquidity
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB, uint liquidity)",
  "function addLiquidityZKLTC(address token, uint amountTokenDesired, uint amountTokenMin, uint amountZKLTCMin, address to, uint deadline) payable returns (uint amountToken, uint amountZKLTC, uint liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB)",
  "function removeLiquidityZKLTC(address token, uint liquidity, uint amountTokenMin, uint amountZKLTCMin, address to, uint deadline) returns (uint amountToken, uint amountZKLTC)",
] as const;

export const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) view returns (address pair)",
  "function allPairsLength() view returns (uint)",
] as const;

export const PAIR_ABI = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
] as const;

export const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
] as const;

export const WZKLTC_ABI = [
  "function deposit() payable",
  "function withdraw(uint256 wad)",
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address guy, uint256 wad) returns (bool)",
  "function allowance(address src, address guy) view returns (uint256)",
] as const;

// ── LitDeX Deployer (points-earning, no fee) ────────────────────────────
export const LITDEX_DEPLOYER_ABI = [
  "function deployToken(string _name, string _symbol, uint256 _supply) payable returns (address)",
  "function totalDeployed() view returns (uint256)",
  "event TokenDeployed(address indexed deployer, address indexed token, string symbol)",
] as const;

// ── Legacy TokenFactory (full ERC20 features) ───────────────────────────
export const TOKEN_FACTORY_ABI = [
  "function deployFee() view returns (uint256)",
  "function deployToken(string name_, string symbol_, uint8 decimals_, uint256 totalSupply_, bool mintable_, bool burnable_, bool pausable_) payable returns (address)",
  "function getAllTokens() view returns (address[])",
  "function getTokensByCreator(address creator_) view returns (address[])",
  "function getTokenInfo(address tokenAddr_) view returns (tuple(address contractAddress, address creator, string name, string symbol, uint256 totalSupply, uint8 decimals, bool mintable, bool burnable, bool pausable, uint256 deployedAt))",
  "function getTotalDeployed() view returns (uint256)",
  "event TokenDeployed(address indexed contractAddress, address indexed creator, string name, string symbol, uint256 totalSupply, uint8 decimals, bool mintable, bool burnable, bool pausable)",
] as const;

export const CUSTOM_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function owner() view returns (address)",
  "function isMintable() view returns (bool)",
  "function isBurnable() view returns (bool)",
  "function isPausable() view returns (bool)",
  "function paused() view returns (bool)",
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function pause()",
  "function unpause()",
  "function transfer(address to, uint256 amount) returns (bool)",
] as const;

// ── Multi-contract factory (ERC20 / NFT / Staking / Vesting) ───────────
export enum FactoryContractType { ERC20 = 0, NFT = 1, STAKING = 2, VESTING = 3 }
export const LITVM_FACTORY_ABI = parseAbi([
  "function deployFee() view returns (uint256)",
  "function deployERC20(string name_, string symbol_, uint8 decimals_, uint256 totalSupply_, bool mintable_, bool burnable_, bool pausable_) payable returns (address)",
  "function deployNFT(string name_, string symbol_, string baseURI_, uint256 maxSupply_, uint256 mintPrice_, bool publicMint_) payable returns (address)",
  "function deployStaking(address stakingToken_, address rewardToken_, uint256 rewardRatePerDay_, uint256 lockPeriodDays_, string label_) payable returns (address)",
  "function deployVesting(address token_, address beneficiary_, uint256 totalAmount_, uint256 cliffDays_, uint256 durationDays_, bool revocable_, string label_) payable returns (address)",
  "function getAllContracts() view returns (address[])",
  "function getContractsByCreator(address creator_) view returns (address[])",
  "function getContractInfo(address addr_) view returns ((address contractAddress, address creator, uint8 contractType, string label, uint256 deployedAt))",
  "function getTotalDeployed() view returns (uint256)",
  "event ContractDeployed(address indexed contractAddress, address indexed creator, uint8 contractType, string label, uint256 deployedAt)",
]);

// ── Points System V5 ────────────────────────────────────────────────────
export const POINTS_SYSTEM_ABI = [
  { inputs: [], name: "recordSwap", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "recordLP", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "recordDeploy", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "referrer", type: "address" }], name: "registerReferral", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "claimReferralPoints", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getPoints", outputs: [{ name: "total", type: "uint256" }, { name: "daily", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getPendingReferralPoints", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getReferrals", outputs: [{ name: "", type: "address[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "address" }], name: "users", outputs: [
    { name: "totalPoints", type: "uint256" },
    { name: "dailyPoints", type: "uint256" },
    { name: "lastDayReset", type: "uint256" },
    { name: "referrer", type: "address" },
    { name: "pendingReferralPoints", type: "uint256" },
  ], stateMutability: "view", type: "function" },
] as const;

// ── Daily Check-in V2 ──────────────────────────────────────────────────
export const DAILY_CHECKIN_ABI = [
  { inputs: [], name: "checkin", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getCheckinInfo", outputs: [
    { name: "streak", type: "uint256" },
    { name: "lastDay", type: "uint256" },
    { name: "totalCheckins", type: "uint256" },
    { name: "nextLDEX", type: "uint256" },
  ], stateMutability: "view", type: "function" },
  { inputs: [], name: "getCurrentDay", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
] as const;

// ── LitDeX NFT (3 tiers) ───────────────────────────────────────────────
export const LITDEX_NFT_ABI = [
  { inputs: [{ name: "nftType", type: "uint8" }], name: "mintNFT", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "claimRewards", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "", type: "uint8" }], name: "totalMinted", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getPendingRewards", outputs: [
    { name: "zkltc", type: "uint256" },
    { name: "usdc", type: "uint256" },
    { name: "ldex", type: "uint256" },
  ], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getUserNFTs", outputs: [{
    components: [
      { name: "nftType", type: "uint8" },
      { name: "lastClaimDay", type: "uint256" },
    ],
    name: "", type: "tuple[]",
  }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "userPoints", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
] as const;

/* =====================================================================
 * SECTION 4 — TOKEN LISTS / ROUTING
 * ===================================================================== */
export type Token = { address: string; symbol: string; image?: string };
export type RouterKey = "liteswap" | "omnifun";

export const ROUTERS: Record<RouterKey, { address: string; label: string; factory?: string }> = {
  liteswap: { address: LITESWAP_ROUTER, label: "LiteSwap V2", factory: LITESWAP_FACTORY },
  omnifun:  { address: OMNIFUN_ROUTER,  label: "OmniFun" },
};

export const POPULAR_TOKENS: Token[] = [
  { 
    address: "0xFC43ABE529CDC61B7F0aa2e677451AFd83d2B304", 
    symbol: "USDC", 
    image: "/logos/usdc.jpg" 
  },
  { 
    address: "0x6858790e164a8761a711BAD1178220C5AebcF7eC", 
    symbol: "PEPE", 
    image: "/logos/pepe.jpg" 
  },
  { 
    address: "0xa38c318a0B755154b25f28cAD7b2312747B073C6", 
    symbol: "USDT", 
    image: "/logos/usdt.jpg" 
  },
  { 
    address: "0xFC73cdB75F37B0da829c4e54511f410D525B76b2", 
    symbol: "Lester", 
    image: "/logos/lester.jpg" 
  },
  { 
    address: "0x68Bf11e64cfD939fE1761012862FBFE47048118e", 
    symbol: "WETH", 
    image: "/logos/weth.jpg" 
  },
  { 
    address: "0xcFe6BE457D366329CCdeE7fBC48aBf1d6FFeB9C0", 
    symbol: "WBTC", 
    image: "/logos/wbtc.jpg" 
  },
  { 
    address: "0xBAaba603e6298fbb76325a6B0d47Cd57154ca641", 
    symbol: "LDEX", 
    image: "" // Handled specially
  },
  { 
    address: "0x314522DD1B3f74Dd1DdE03E5B5a628C28134b25d", 
    symbol: "zkPEPE", 
    image: "/logos/zkpepe.jpg" 
  },
  { 
    address: "0xaf9F497007342Dd025Ff696964A736Ec9584c3dd", 
    symbol: "zkETH", 
    image: "/logos/zketh.jpg" 
  },
  { 
    address: "0xF425553A84e579BE353a6180F7d53d8101bfb3E4", 
    symbol: "LDTOAD", 
    image: "/logos/litoad.jpg" 
  },
  { 
    address: "0x60DD65bAd8a73Dfd8DF029C4e3b372d575B03BC2", 
    symbol: "USDC.t", 
    image: "/logos/usdc.jpg" 
  },
  { 
    address: "0xd8C4e6dBe48472d6C563eB1cc330207d020D4c8f", 
    symbol: "YURI", 
    image: "/logos/yuri.jpg" 
  },
  { 
    address: "0x05149f41AFE7ca712D6A42390e8047E0f2887284", 
    symbol: "CHAWLEE", 
    image: "/logos/chawlee.jpg" 
  },
];

export const SWAP_TOKENS: Token[] = [
  { address: NATIVE_SENTINEL, symbol: "zkLTC", image: "/logos/zkltc.jpg" },
  ...POPULAR_TOKENS,
];

const LITESWAP_TOKENS = new Set<string>([
  "0xFC43ABE529CDC61B7F0aa2e677451AFd83d2B304",
  "0x314522DD1B3f74Dd1DdE03E5B5a628C28134b25d",
  "0xaf9F497007342Dd025Ff696964A736Ec9584c3dd",
  "0xBAaba603e6298fbb76325a6B0d47Cd57154ca641",
  "0xF425553A84e579BE353a6180F7d53d8101bfb3E4",
  "0x60DD65bAd8a73Dfd8DF029C4e3b372d575B03BC2",
  "0xa38c318a0B755154b25f28cAD7b2312747B073C6",
  "0x68Bf11e64cfD939fE1761012862FBFE47048118e",
  "0xcFe6BE457D366329CCdeE7fBC48aBf1d6FFeB9C0",
  "0xd8C4e6dBe48472d6C563eB1cc330207d020D4c8f",
  "0x05149f41AFE7ca712D6A42390e8047E0f2887284",
].map((a) => a.toLowerCase()));
const OMNIFUN_TOKENS = new Set<string>([
  "0xFC73cdB75F37B0da829c4e54511f410D525B76b2",
  "0x6858790e164a8761a711BAD1178220C5AebcF7eC",
].map((a) => a.toLowerCase()));

/** Pick the appropriate router for a token pair. */
export function pickRouter(tokenInAddr?: string, tokenOutAddr?: string): RouterKey {
  const a = (tokenInAddr || "").toLowerCase();
  const b = (tokenOutAddr || "").toLowerCase();
  if (LITESWAP_TOKENS.has(a) || LITESWAP_TOKENS.has(b)) return "liteswap";
  if (OMNIFUN_TOKENS.has(a) || OMNIFUN_TOKENS.has(b)) return "omnifun";
  return "liteswap";
}

/* =====================================================================
 * SECTION 5 — UTILITY HELPERS
 * ===================================================================== */
export function isNativeAddr(a?: string) {
  return !a || a === NATIVE_SENTINEL || a === "0x0000000000000000000000000000000000000000";
}
export function shortAddr(a?: string) {
  if (!a) return "—";
  return a.slice(0, 6) + "…" + a.slice(-4);
}
export function errMsg(e: unknown): string {
  const x = e as { shortMessage?: string; reason?: string; message?: string };
  return x?.shortMessage ?? x?.reason ?? x?.message ?? String(e).slice(0, 200);
}

/** Build a swap path, substituting WZKLTC for native sentinels. */
export function buildSwapPath(
  tokenInAddr: string,
  tokenOutAddr: string,
  wrappedNative: string,
): string[] {
  const inA  = isNativeAddr(tokenInAddr)  ? wrappedNative : tokenInAddr;
  const outA = isNativeAddr(tokenOutAddr) ? wrappedNative : tokenOutAddr;
  return [inA, outA];
}

async function getSigner() {
  const eth = (window as unknown as { ethereum?: unknown }).ethereum;
  if (!eth) throw new Error("No wallet detected");
  const provider = new BrowserProvider(eth as never);
  // Ensure correct chain
  try {
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== LITVM_CHAIN_ID) {
      await (eth as { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> }).request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + LITVM_CHAIN_ID.toString(16) }],
      }).catch(() => undefined);
    }
  } catch { /* ignore */ }
  return provider.getSigner();
}

async function getSignerContract(addr: string, abi: readonly unknown[]) {
  const signer = await getSigner();
  return new Contract(addr, abi as never, signer);
}

/* =====================================================================
 * SECTION 6 — WAGMI / RAINBOWKIT CONFIG
 * ===================================================================== */
export const wagmiConfig = getDefaultConfig({
  appName: "LitVM Explorer",
  projectId: "litvm-explorer-public",
  chains: [litvmChain],
  transports: {
    [litvmChain.id]: http(RPC_URL),
  },
  ssr: false,
});

/* =====================================================================
 * SECTION 7 — SWAP LOGIC
 * Core flow:
 *   1. resolve wrapped-native via router.WZKLTC() / WETH() (fallback WZKLTC_ADDR)
 *   2. quote: router.getAmountsOut(inWei, path)
 *   3. approve token (skip if native)
 *   4. call swapExact{...}For{...} variant matching the pair direction
 * ===================================================================== */

/** Resolve wrapped-native address from router (WZKLTC then WETH then fallback). */
export async function resolveWrappedNative(routerAddr: string): Promise<string> {
  const r = new Contract(routerAddr, ROUTER_ABI, readProvider);
  try { return String(await r.WZKLTC()); } catch { /* try WETH */ }
  try { return String(await r.WETH()); } catch { /* fallback */ }
  return WZKLTC_ADDR;
}

/** Quote `amountIn` (wei) for swap path. Returns final output amount (wei). */
export async function quoteSwap(
  routerAddr: string,
  amountInWei: bigint,
  path: string[],
): Promise<bigint> {
  const router = new Contract(routerAddr, ROUTER_ABI, readProvider);
  const amounts = (await router.getAmountsOut(amountInWei, path)) as bigint[];
  return amounts[amounts.length - 1];
}

/** Approve `tokenAddr` for `spender` (returns tx hash). */
export async function approveToken(
  tokenAddr: string,
  spender: string,
  amountWei: bigint,
): Promise<string> {
  const c = await getSignerContract(tokenAddr, ERC20_ABI);
  const tx = await c.approve(spender, amountWei);
  await tx.wait();
  return tx.hash as string;
}

/**
 * Execute a swap. Caller passes wei-denominated amounts.
 * Returns the receipt's tx hash.
 */
export async function swap(opts: {
  routerKey: RouterKey;
  routerAddr: string;
  tokenInAddr: string;       // NATIVE_SENTINEL for native
  tokenOutAddr: string;      // NATIVE_SENTINEL for native
  amountInWei: bigint;
  amountOutMinWei: bigint;
  recipient: string;
  path: string[];            // already resolved (use buildSwapPath)
  deadlineSec?: number;      // default = SWAP_DEADLINE_SEC from now
}): Promise<string> {
  const router = await getSignerContract(opts.routerAddr, ROUTER_ABI);
  const deadline = Math.floor(Date.now() / 1000) + (opts.deadlineSec ?? SWAP_DEADLINE_SEC);

  const isOmni = opts.routerKey === "omnifun";
  const fnNativeIn  = isOmni ? "swapExactETHForTokens"  : "swapExactZKLTCForTokens";
  const fnNativeOut = isOmni ? "swapExactTokensForETH"  : "swapExactTokensForZKLTC";

  let tx;
  if (isNativeAddr(opts.tokenInAddr)) {
    tx = await router[fnNativeIn](opts.amountOutMinWei, opts.path, opts.recipient, deadline, { value: opts.amountInWei });
  } else if (isNativeAddr(opts.tokenOutAddr)) {
    tx = await router[fnNativeOut](opts.amountInWei, opts.amountOutMinWei, opts.path, opts.recipient, deadline);
  } else {
    tx = await router.swapExactTokensForTokens(opts.amountInWei, opts.amountOutMinWei, opts.path, opts.recipient, deadline);
  }
  const receipt = await tx.wait();
  return (receipt?.hash ?? tx.hash) as string;
}

/* =====================================================================
 * SECTION 8 — POOL / LIQUIDITY LOGIC
 * ===================================================================== */
export type PairState = {
  pairAddress: string;       // "" if not yet deployed
  token0: string;
  reserves: [bigint, bigint];
  totalSupply: bigint;
  userBalance: bigint;
  userAllowance: bigint;     // for router (LP token allowance)
};

/** Resolve and read full state for a pair. */
export async function loadPair(
  tokenAAddr: string,
  tokenBAddr: string,
  walletAddr?: string,
): Promise<PairState> {
  const a0 = isNativeAddr(tokenAAddr) ? WZKLTC_ADDR : tokenAAddr;
  const b0 = isNativeAddr(tokenBAddr) ? WZKLTC_ADDR : tokenBAddr;
  const f = new Contract(DEFAULT_FACTORY, FACTORY_ABI, readProvider);
  const p = String(await f.getPair(a0, b0));
  if (p === "0x0000000000000000000000000000000000000000") {
    return { pairAddress: "", token0: "", reserves: [0n, 0n], totalSupply: 0n, userBalance: 0n, userAllowance: 0n };
  }
  const pair = new Contract(p, PAIR_ABI, readProvider);
  const [t0, reserves, ts, bal, allow] = await Promise.all([
    pair.token0() as Promise<string>,
    pair.getReserves() as Promise<[bigint, bigint, number]>,
    pair.totalSupply() as Promise<bigint>,
    walletAddr ? (pair.balanceOf(walletAddr) as Promise<bigint>) : Promise.resolve(0n),
    walletAddr ? (pair.allowance(walletAddr, DEFAULT_ROUTER) as Promise<bigint>) : Promise.resolve(0n),
  ]);
  return {
    pairAddress: p,
    token0: t0,
    reserves: [reserves[0], reserves[1]],
    totalSupply: ts,
    userBalance: bal,
    userAllowance: allow,
  };
}

/** Add liquidity. Pass wei amounts. */
export async function addLiquidity(opts: {
  tokenAAddr: string;
  tokenBAddr: string;
  amountAWei: bigint;
  amountBWei: bigint;
  recipient: string;
  slippageBps?: bigint;     // default 1000 (10%) — used to compute amountMin
  deadlineSec?: number;
}): Promise<string> {
  const router = await getSignerContract(DEFAULT_ROUTER, ROUTER_ABI);
  const deadline = Math.floor(Date.now() / 1000) + (opts.deadlineSec ?? SWAP_DEADLINE_SEC);

  let tx;
  if (isNativeAddr(opts.tokenAAddr) && !isNativeAddr(opts.tokenBAddr)) {
    tx = await router.addLiquidityZKLTC(opts.tokenBAddr, opts.amountBWei, 0n, 0n, opts.recipient, deadline, { value: opts.amountAWei });
  } else if (isNativeAddr(opts.tokenBAddr) && !isNativeAddr(opts.tokenAAddr)) {
    tx = await router.addLiquidityZKLTC(opts.tokenAAddr, opts.amountAWei, 0n, 0n, opts.recipient, deadline, { value: opts.amountBWei });
  } else if (!isNativeAddr(opts.tokenAAddr) && !isNativeAddr(opts.tokenBAddr)) {
    tx = await router.addLiquidity(opts.tokenAAddr, opts.tokenBAddr, opts.amountAWei, opts.amountBWei, 0n, 0n, opts.recipient, deadline);
  } else {
    throw new Error("Cannot add zkLTC + zkLTC");
  }
  const receipt = await tx.wait();
  return (receipt?.hash ?? tx.hash) as string;
}

/** Remove liquidity. `lpWei` is the LP-token amount to burn. */
export async function removeLiquidity(opts: {
  tokenAAddr: string;
  tokenBAddr: string;
  lpWei: bigint;
  recipient: string;
  deadlineSec?: number;
}): Promise<string> {
  const router = await getSignerContract(DEFAULT_ROUTER, ROUTER_ABI);
  const deadline = Math.floor(Date.now() / 1000) + (opts.deadlineSec ?? SWAP_DEADLINE_SEC);
  let tx;
  if (isNativeAddr(opts.tokenAAddr) && !isNativeAddr(opts.tokenBAddr)) {
    tx = await router.removeLiquidityZKLTC(opts.tokenBAddr, opts.lpWei, 0, 0, opts.recipient, deadline);
  } else if (isNativeAddr(opts.tokenBAddr) && !isNativeAddr(opts.tokenAAddr)) {
    tx = await router.removeLiquidityZKLTC(opts.tokenAAddr, opts.lpWei, 0, 0, opts.recipient, deadline);
  } else {
    tx = await router.removeLiquidity(opts.tokenAAddr, opts.tokenBAddr, opts.lpWei, 0, 0, opts.recipient, deadline);
  }
  const receipt = await tx.wait();
  return (receipt?.hash ?? tx.hash) as string;
}

/* =====================================================================
 * SECTION 9 — DEPLOY TOKEN LOGIC (LitDeXDeployer)
 * Backend relayer auto-credits +5 points per deploy on PointsSystemV5.
 * Note: NO value passed — deploys run gasless of fee.
 * ===================================================================== */
export type DeployedTokenResult = {
  txHash: string;
  tokenAddress?: string;
};

/** Deploy a basic ERC-20 via LitDeXDeployer (point-earning path). */
export async function deployTokenLitDeX(opts: {
  name: string;
  symbol: string;
  /** Whole units (contract multiplies by 1e18 internally). */
  totalSupply: string | bigint;
}): Promise<DeployedTokenResult> {
  const deployer = await getSignerContract(LITDEX_DEPLOYER_ADDRESS, LITDEX_DEPLOYER_ABI);
  const tx = await deployer.deployToken(
    opts.name.trim(),
    opts.symbol.trim(),
    BigInt(opts.totalSupply),
  );
  const receipt = await tx.wait();
  let tokenAddress: string | undefined;
  try {
    for (const log of receipt?.logs ?? []) {
      try {
        const parsed = deployer.interface.parseLog(log);
        if (parsed?.name === "TokenDeployed") {
          tokenAddress = parsed.args[1] as string;
          break;
        }
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
  return { txHash: (receipt?.hash ?? tx.hash) as string, tokenAddress };
}

/** Read total deployed count (display = on-chain + DEPLOY_COUNT_BASE). */
export async function readTotalDeployed(): Promise<number> {
  const c = new Contract(LITDEX_DEPLOYER_ADDRESS, LITDEX_DEPLOYER_ABI, readProvider);
  const n = await c.totalDeployed();
  return Number(n) + DEPLOY_COUNT_BASE;
}

/** Per-token actions (mint/burn/pause/unpause). Token must be from full TokenFactory. */
export async function tokenAction(
  tokenAddr: string,
  action: "pause" | "unpause" | "burn" | "mint",
  recipient: string,
  arg?: string,
): Promise<string> {
  const token = await getSignerContract(tokenAddr, CUSTOM_TOKEN_ABI);
  let tx;
  if (action === "pause") tx = await token.pause();
  else if (action === "unpause") tx = await token.unpause();
  else if (action === "burn") {
    const decimals = (await token.decimals()) as number;
    tx = await token.burn(BigInt(arg ?? "0") * (10n ** BigInt(decimals)));
  } else {
    const decimals = (await token.decimals()) as number;
    tx = await token.mint(recipient, BigInt(arg ?? "0") * (10n ** BigInt(decimals)));
  }
  await tx.wait();
  return tx.hash as string;
}

/* =====================================================================
 * SECTION 10 — POINTS SYSTEM (PointsSystemV5)
 * recordSwap / recordLP earn 0 in V5; only deploy (5) + checkin earn points.
 * ===================================================================== */
export const POINTS_PER_ACTION: Record<"swap" | "lp" | "deploy", number> = {
  swap: 0, lp: 0, deploy: 5,
};

export type UserPointsData = {
  totalPoints: bigint;
  dailyPoints: bigint;
  lastDayReset: bigint;
  referrer: string;
  pendingReferralPoints: bigint;
};

export async function recordAction(kind: "swap" | "lp" | "deploy"): Promise<string> {
  const c = await getSignerContract(POINTS_SYSTEM_ADDRESS, POINTS_SYSTEM_ABI as never);
  const fn = kind === "swap" ? "recordSwap" : kind === "lp" ? "recordLP" : "recordDeploy";
  const tx = await c[fn]();
  await tx.wait();
  return tx.hash as string;
}
export async function autoRecord(kind: "swap" | "lp" | "deploy"): Promise<string | undefined> {
  try { return await recordAction(kind); } catch { return undefined; }
}

export async function readPoints(user: string): Promise<{ total: bigint; daily: bigint }> {
  const c = new Contract(POINTS_SYSTEM_ADDRESS, POINTS_SYSTEM_ABI as never, readProvider);
  const [total, daily] = await c.getPoints(user);
  return { total: BigInt(total), daily: BigInt(daily) };
}

export async function readUserData(user: string): Promise<UserPointsData> {
  const c = new Contract(POINTS_SYSTEM_ADDRESS, POINTS_SYSTEM_ABI as never, readProvider);
  const [totalPoints, dailyPoints, lastDayReset, referrer, pendingReferralPoints] = await c.users(user);
  return {
    totalPoints: BigInt(totalPoints),
    dailyPoints: BigInt(dailyPoints),
    lastDayReset: BigInt(lastDayReset),
    referrer: referrer as string,
    pendingReferralPoints: BigInt(pendingReferralPoints),
  };
}

export async function readPendingReferral(user: string): Promise<bigint> {
  const c = new Contract(POINTS_SYSTEM_ADDRESS, POINTS_SYSTEM_ABI as never, readProvider);
  return BigInt(await c.getPendingReferralPoints(user));
}
export async function readReferrals(user: string): Promise<string[]> {
  const c = new Contract(POINTS_SYSTEM_ADDRESS, POINTS_SYSTEM_ABI as never, readProvider);
  return (await c.getReferrals(user)) as string[];
}
export async function claimReferralPoints(): Promise<string> {
  const c = await getSignerContract(POINTS_SYSTEM_ADDRESS, POINTS_SYSTEM_ABI as never);
  const tx = await c.claimReferralPoints();
  await tx.wait();
  return tx.hash as string;
}
export async function registerReferral(referrer: string): Promise<string> {
  const c = await getSignerContract(POINTS_SYSTEM_ADDRESS, POINTS_SYSTEM_ABI as never);
  const tx = await c.registerReferral(referrer);
  await tx.wait();
  return tx.hash as string;
}

/** Auto-register a `?ref=` param once per wallet (idempotent + silent). */
export async function autoRegisterReferralIfNeeded(addr: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const sp = new URLSearchParams(window.location.search);
    const ref = sp.get("ref");
    if (!ref || ref.toLowerCase() === addr.toLowerCase()) return;
    const key = `litdex_ref_registered_${addr.toLowerCase()}`;
    if (window.localStorage.getItem(key)) return;
    await registerReferral(ref);
    window.localStorage.setItem(key, "1");
  } catch { /* silent */ }
}

export function isPointsOwner(addr?: string | null): boolean {
  return !!addr && addr.toLowerCase() === POINTS_OWNER_ADDRESS.toLowerCase();
}

/* =====================================================================
 * SECTION 11 — DAILY CHECK-IN (DailyCheckinV2)
 * ===================================================================== */
export type CheckinInfo = {
  streak: bigint;
  lastDay: bigint;
  totalCheckins: bigint;
  nextLDEX: bigint;
};

export async function checkinToday(): Promise<string> {
  const c = await getSignerContract(DAILY_CHECKIN_ADDRESS, DAILY_CHECKIN_ABI as never);
  const tx = await c.checkin();
  await tx.wait();
  return tx.hash as string;
}

export async function readCheckinInfo(user: string): Promise<CheckinInfo> {
  const c = new Contract(DAILY_CHECKIN_ADDRESS, DAILY_CHECKIN_ABI as never, readProvider);
  const [streak, lastDay, totalCheckins, nextLDEX] = await c.getCheckinInfo(user);
  return {
    streak: BigInt(streak),
    lastDay: BigInt(lastDay),
    totalCheckins: BigInt(totalCheckins),
    nextLDEX: BigInt(nextLDEX),
  };
}

export async function readCurrentDay(): Promise<bigint> {
  const c = new Contract(DAILY_CHECKIN_ADDRESS, DAILY_CHECKIN_ABI as never, readProvider);
  return BigInt(await c.getCurrentDay());
}

/* =====================================================================
 * SECTION 12 — LITDEX NFT (3 tiers)
 * ===================================================================== */
export type NftTierId = 1 | 2 | 3;
export type NFTInfo = { nftType: number; lastClaimDay: bigint };

export const NFT_MAX_SUPPLY: Record<NftTierId, number> = { 1: 9999, 2: 4999, 3: 999 };

export const NFT_TIERS = [
  { id: 1 as const, name: "LitShard", cost: 1000,  rewards: { zkltc: "0.0001", usdc: "10",  ldex: "2"  }, maxSupply: 9999 },
  { id: 2 as const, name: "LitCore",  cost: 5000,  rewards: { zkltc: "0.0005", usdc: "50",  ldex: "10" }, maxSupply: 4999 },
  { id: 3 as const, name: "LitGod",   cost: 10000, rewards: { zkltc: "0.001",  usdc: "100", ldex: "20" }, maxSupply: 999  },
];

export async function mintRewardNFT(nftType: NftTierId): Promise<string> {
  const c = await getSignerContract(LITDEX_NFT_ADDRESS, LITDEX_NFT_ABI as never);
  const tx = await c.mintNFT(nftType);
  await tx.wait();
  return tx.hash as string;
}

export async function claimNFTRewards(): Promise<string> {
  const c = await getSignerContract(LITDEX_NFT_ADDRESS, LITDEX_NFT_ABI as never);
  const tx = await c.claimRewards();
  await tx.wait();
  return tx.hash as string;
}

export async function readUserNFTs(user: string): Promise<NFTInfo[]> {
  const c = new Contract(LITDEX_NFT_ADDRESS, LITDEX_NFT_ABI as never, readProvider);
  const arr = (await c.getUserNFTs(user)) as Array<{ nftType: number | bigint; lastClaimDay: bigint }>;
  return arr.map((n) => ({ nftType: Number(n.nftType), lastClaimDay: BigInt(n.lastClaimDay) }));
}

export async function readNFTPending(user: string): Promise<{ zkltc: bigint; usdc: bigint; ldex: bigint }> {
  const c = new Contract(LITDEX_NFT_ADDRESS, LITDEX_NFT_ABI as never, readProvider);
  const [zkltc, usdc, ldex] = await c.getPendingRewards(user);
  return { zkltc: BigInt(zkltc), usdc: BigInt(usdc), ldex: BigInt(ldex) };
}

export async function readNFTUserPoints(user: string): Promise<bigint> {
  const c = new Contract(LITDEX_NFT_ADDRESS, LITDEX_NFT_ABI as never, readProvider);
  return BigInt(await c.userPoints(user));
}

export async function readNFTTotalMinted(nftType: NftTierId): Promise<number> {
  const c = new Contract(LITDEX_NFT_ADDRESS, LITDEX_NFT_ABI as never, readProvider);
  return Number(await c.totalMinted(nftType));
}

/* =====================================================================
 * SECTION 13 — GAME API  (https://game.test-hub.xyz)
 * Endpoints used:
 *   GET  /gf/:address                  → GfInfo
 *   GET  /user/:address                → UserGameBalances
 *   GET  /stats/gf                     → { totalClaimed, totalUsers }
 *   POST /gf/claim          { walletAddress }
 *   POST /claim/rewards     { walletAddress, token: "zkltc" }
 *   POST /game/coin-catch/start  { walletAddress } → { success, sessionId, gfRemaining, reason? }
 *   POST /game/coin-catch/end    { walletAddress, sessionId, bombed, caught: { zkltc, ldex, usdc } }
 *                                → { rewards: { zkltc, ldex, usdc } }
 * Game unlock requires >= 200 on-chain points (read via readPoints()).
 * ===================================================================== */
export const GAME_API = "https://game.test-hub.xyz";

export type GfInfo = { balance: number; maxGF: number; canClaim: boolean; timeLeft: number };
export type UserGameBalances = {
  zkltc_balance: number;
  ldex_balance: number;
  usdc_balance: number;
  gf_balance: number;
};
export type GameRewards = { zkltc: number; ldex: number; usdc: number };

async function jpost<T = unknown>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json().catch(() => ({} as T));
}
async function jget<T = unknown>(url: string): Promise<T> {
  const r = await fetch(url, { headers: { "Content-Type": "application/json" } });
  return r.json().catch(() => ({} as T));
}

export const gameApi = {
  getGf: (address: string) =>
    jget<Partial<GfInfo>>(`${GAME_API}/gf/${address}`).then((d) => ({
      balance: Number(d?.balance ?? 0),
      maxGF: Number(d?.maxGF ?? 20),
      canClaim: Boolean(d?.canClaim),
      timeLeft: Number(d?.timeLeft ?? 0),
    } as GfInfo)),
  getUser: (address: string) =>
    jget<Partial<UserGameBalances>>(`${GAME_API}/user/${address}`).then((d) => ({
      zkltc_balance: Number(d?.zkltc_balance ?? 0),
      ldex_balance: Number(d?.ldex_balance ?? 0),
      usdc_balance: Number(d?.usdc_balance ?? 0),
      gf_balance: Number(d?.gf_balance ?? 0),
    } as UserGameBalances)),
  getGfStats: () =>
    jget<{ totalClaimed?: number; totalUsers?: number }>(`${GAME_API}/stats/gf`).then((d) => ({
      totalClaimed: Number(d?.totalClaimed ?? 0),
      totalUsers: Number(d?.totalUsers ?? 0),
    })),
  claimGf: (walletAddress: string) =>
    jpost(`${GAME_API}/gf/claim`, { walletAddress }),
  claimReward: (walletAddress: string, token: "zkltc" | "ldex" | "usdc" = "zkltc") =>
    jpost<{ txHash?: string; tx_hash?: string; hash?: string }>(`${GAME_API}/claim/rewards`, { walletAddress, token }),
  startCoinCatch: (walletAddress: string) =>
    jpost<{ success: boolean; sessionId?: string; gfRemaining?: number; reason?: string }>(
      `${GAME_API}/game/coin-catch/start`,
      { walletAddress },
    ),
  endCoinCatch: (body: {
    walletAddress: string;
    sessionId: string;
    bombed: boolean;
    caught: GameRewards;
  }) => jpost<{ rewards?: GameRewards }>(`${GAME_API}/game/coin-catch/end`, body),
};

/* =====================================================================
 * SECTION 14 — TWITTER / SOCIAL QUEST API  (https://api.test-hub.xyz)
 * Endpoints:
 *   GET  /quest/status/:address         → { completed: string[] | Record<string, boolean> }
 *   POST /quest/complete  { wallet, questId }
 * ===================================================================== */
export const QUEST_API = "https://api.test-hub.xyz";

export type Quest = {
  id: string;
  title: string;
  url: string;
  pts: number;
  icon: "x" | "tg";
  group: "follow" | "like" | "tg";
};

export const QUESTS: Quest[] = [
  // Follows
  { id: "follow_litdex",   title: "Follow @LitDeXApp on X",        url: "https://x.com/LitDeXApp",        pts: 100, icon: "x",  group: "follow" },
  { id: "follow_litvm",    title: "Follow @LitecoinVM on X",       url: "https://x.com/LitecoinVM",       pts: 100, icon: "x",  group: "follow" },
  { id: "follow_personal", title: "Follow @cryptobhartiyax on X",  url: "https://x.com/cryptobhartiyax",  pts: 50,  icon: "x",  group: "follow" },
  // Like & RT
  { id: "like_rt_1", title: "Like & RT post #1", url: "https://x.com/LitDeXApp/status/2050573145330127087", pts: 10, icon: "x", group: "like" },
  { id: "like_rt_2", title: "Like & RT post #2", url: "https://x.com/LitDeXApp/status/2050652776951414908", pts: 10, icon: "x", group: "like" },
  { id: "like_rt_3", title: "Like & RT post #3", url: "https://x.com/LoockLite/status/2050588261152702692", pts: 10, icon: "x", group: "like" },
  { id: "like_rt_4", title: "Like & RT post #4", url: "https://x.com/LitDeXApp/status/2050586518709047591", pts: 10, icon: "x", group: "like" },
  { id: "like_rt_5", title: "Like & RT post #5", url: "https://x.com/LitDeXApp/status/2050479665979265098", pts: 10, icon: "x", group: "like" },
  { id: "like_rt_6", title: "Like & RT post #6", url: "https://x.com/LitDeXApp/status/2049925513452679259", pts: 10, icon: "x", group: "like" },
  { id: "like_rt_7", title: "Like & RT post #7", url: "https://x.com/LitDeXApp/status/2049925659766706361", pts: 10, icon: "x", group: "like" },
  { id: "like_rt_8", title: "Like & RT post #8", url: "https://x.com/LitDeXApp/status/2048850659819376794", pts: 10, icon: "x", group: "like" },
  // Telegram
  { id: "tg_group",   title: "Join LitDeX Group",   url: "https://t.me/litdex_discussion", pts: 50, icon: "tg", group: "tg" },
  { id: "tg_channel", title: "Join LitDeX Channel", url: "https://t.me/litdex_app",        pts: 50, icon: "tg", group: "tg" },
];

export const questApi = {
  getStatus: async (address: string): Promise<Record<string, boolean>> => {
    const res = await fetch(`${QUEST_API}/quest/status/${address}`);
    if (!res.ok) return {};
    const data = await res.json().catch(() => ({}));
    const map: Record<string, boolean> = {};
    QUESTS.forEach((q) => { map[q.id] = false; });
    const c = data?.completed ?? data;
    if (Array.isArray(c)) c.forEach((id: string) => { if (id in map) map[id] = true; });
    else if (c && typeof c === "object") {
      Object.keys(c).forEach((k) => { if (k in map) map[k] = !!c[k]; });
    }
    return map;
  },
  complete: (wallet: string, questId: string) =>
    jpost(`${QUEST_API}/quest/complete`, { wallet, questId }),
};

/* =====================================================================
 * SECTION 15 — FAUCET API  (https://api.test-hub.xyz)
 * Endpoints:
 *   GET  /faucet/status/:address         → FaucetStatus
 *   POST /faucet/claim   { wallet }      → { success, reason?, message? }
 *
 * Claim cooldown: 7 days. Reasons: "no_external" (need $1+ BNB/USDC on BSC),
 * "has_enough" (already topped up).
 * ===================================================================== */
export const FAUCET_API = "https://api.test-hub.xyz";
export const FAUCET_CLAIM_AMOUNT_ZKLTC = "0.001";
export const FAUCET_COOLDOWN_SEC = 7 * 24 * 60 * 60;

export type FaucetStatus = {
  canClaim: boolean;
  hasEnoughZkLTC: boolean;
  zkLTCBalance: string | number;
  nextClaimIn: number; // seconds
  faucetBalance: string | number;
};

export const faucetApi = {
  getStatus: async (address: string): Promise<FaucetStatus | null> => {
    try {
      const r = await fetch(`${FAUCET_API}/faucet/status/${address}`);
      return (await r.json()) as FaucetStatus;
    } catch { return null; }
  },
  claim: async (wallet: string): Promise<{ ok: boolean; reason?: string; message?: string; status: number }> => {
    const r = await fetch(`${FAUCET_API}/faucet/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
    });
    const j = await r.json().catch(() => ({} as { reason?: string; message?: string; success?: boolean }));
    return {
      ok: r.ok && j?.success !== false,
      reason: j?.reason,
      message: j?.message,
      status: r.status,
    };
  },
};

/* =====================================================================
 * SECTION 16 — SHARED TYPES (re-exports for convenience)
 * ===================================================================== */
export type FactoryDeployedInfo = {
  contractAddress: `0x${string}`;
  creator: `0x${string}`;
  contractType: number;
  label: string;
  deployedAt: bigint;
};

export type TokenInfo = {
  contractAddress: string;
  creator: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  decimals: number;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  deployedAt: bigint;
};

/** Get on-chain swap quote using routers. */
export async function getSwapQuote(
  tokenIn: string,   // "NATIVE" for zkLTC
  tokenOut: string,  // token address
  amountIn: string   // human readable amount e.g. "1"
): Promise<{ amountOut: string, router: string, routerKey: RouterKey, path: string[] }> {
  // Build path
  const tokenInAddr = tokenIn === "NATIVE" ? WZKLTC_ADDR : tokenIn;
  const tokenOutAddr = tokenOut === "NATIVE" ? WZKLTC_ADDR : tokenOut;
  
  if (tokenInAddr.toLowerCase() === tokenOutAddr.toLowerCase()) {
    return { amountOut: amountIn, router: "Direct", routerKey: "liteswap", path: [tokenInAddr] };
  }

  const path = [tokenInAddr, tokenOutAddr];
  const amountInWei = parseEther(amountIn || "0");
  if (amountInWei === 0n) return { amountOut: "0", router: "--", routerKey: "liteswap", path };

  // Try LiteSwap first
  try {
    const router = new Contract(LITESWAP_ROUTER, ROUTER_ABI, readProvider);
    const amounts = await router.getAmountsOut(amountInWei, path);
    return { amountOut: formatEther(amounts[amounts.length - 1]), router: "LiteSwap", routerKey: "liteswap", path };
  } catch (e) {
    // Try OmniFun router
    try {
      const router = new Contract(OMNIFUN_ROUTER, ROUTER_ABI, readProvider);
      const amounts = await router.getAmountsOut(amountInWei, path);
      return { amountOut: formatEther(amounts[amounts.length - 1]), router: "OmniFun", routerKey: "omnifun", path };
    } catch (e2) {
      // Try multi-hop via WZKLTC on LiteSwap
      try {
        const router = new Contract(LITESWAP_ROUTER, ROUTER_ABI, readProvider);
        const multiPath = [tokenInAddr, WZKLTC_ADDR, tokenOutAddr];
        const amounts = await router.getAmountsOut(amountInWei, multiPath);
        return { amountOut: formatEther(amounts[amounts.length - 1]), router: "LiteSwap (Hop)", routerKey: "liteswap", path: multiPath };
      } catch (e3) {
        throw new Error("No liquidity found for this pair");
      }
    }
  }
}

// --- Section 17: Additional Helpers for App Integration ---

/** Read all deployments for a user across factories. */
export async function readDeployments(user: string): Promise<FactoryDeployedInfo[]> {
  const factory = new Contract(LITVM_FACTORY_ADDRESS, LITVM_FACTORY_ABI, readProvider);
  try {
    const addresses = await factory.getContractsByCreator(user);
    const details = await Promise.all(addresses.map(async (addr: string) => {
      const info = await factory.getContractInfo(addr);
      return {
        contractAddress: info.contractAddress,
        creator: info.creator,
        contractType: Number(info.contractType),
        label: info.label,
        deployedAt: BigInt(info.deployedAt),
      };
    }));
    return details;
  } catch (err) {
    console.error("Error reading deployments:", err);
    return [];
  }
}

/** Deployment wrapper for ERC20. */
export async function deployERC20(name: string, symbol: string, supply: string): Promise<string> {
  const factory = await getSignerContract(LITVM_FACTORY_ADDRESS, LITVM_FACTORY_ABI);
  const fee = await factory.deployFee();
  const tx = await factory.deployERC20(name, symbol, 18, BigInt(supply) * (10n ** 18n), true, true, true, { value: fee });
  await tx.wait();
  return tx.hash;
}

/** Deployment wrapper for NFT. */
export async function deployNFT(name: string, symbol: string): Promise<string> {
  const factory = await getSignerContract(LITVM_FACTORY_ADDRESS, LITVM_FACTORY_ABI);
  const fee = await factory.deployFee();
  const tx = await factory.deployNFT(name, symbol, "ipfs://", 10000n, 0n, true, { value: fee });
  await tx.wait();
  return tx.hash;
}

/** Deployment wrapper for Staking. */
export async function deployStaking(rewardToken: string): Promise<string> {
  const factory = await getSignerContract(LITVM_FACTORY_ADDRESS, LITVM_FACTORY_ABI);
  const fee = await factory.deployFee();
  const tx = await factory.deployStaking(rewardToken, rewardToken, 100n, 30n, "Staking Pool", { value: fee });
  await tx.wait();
  return tx.hash;
}

/** Deployment wrapper for Vesting. */
export async function deployVesting(token: string): Promise<string> {
  const factory = await getSignerContract(LITVM_FACTORY_ADDRESS, LITVM_FACTORY_ABI);
  const fee = await factory.deployFee();
  // Using dummy beneficiary for demo
  const tx = await factory.deployVesting(token, "0x0000000000000000000000000000000000000000", 1000n, 90n, 365n, true, "Token Vesting", { value: fee });
  await tx.wait();
  return tx.hash;
}

/** Deployment wrapper for Token Factory (Factory of Factories). */
export async function deployFactory(): Promise<string> {
  // LitVM Factory is itself a factory.
  return "0x... (Use existing factory)";
}

/** Wrapper for Quests. */
export async function readQuests(address: string) {
  const status = await questApi.getStatus(address);
  return QUESTS.map(q => ({
    id: q.id,
    name: q.title,
    points: BigInt(q.pts),
    completed: !!status[q.id],
    type: q.group === 'tg' ? 'social' : 'social', // normalized
  }));
}

export async function verifyQuest(questId: string) {
  const eth = (window as any).ethereum;
  if (!eth?.selectedAddress) throw new Error("Wallet not connected");
  const res = await questApi.complete(eth.selectedAddress, questId);
  return res;
}

/** Wrapper for Gaming Fuel. */
export async function readGF(address: string): Promise<bigint> {
  const info = await gameApi.getGf(address);
  return BigInt(info.balance);
}

export async function claimGF() {
  const eth = (window as any).ethereum;
  if (!eth?.selectedAddress) throw new Error("Wallet not connected");
  return await gameApi.claimGf(eth.selectedAddress);
}

export async function startGame(gameId: string) {
    const eth = (window as any).ethereum;
    if (!eth?.selectedAddress) throw new Error("Wallet not connected");
    const res = await gameApi.startCoinCatch(eth.selectedAddress);
    if(!res.success) throw new Error(res.reason || "Failed to start game");
    return res;
}

/** Mock for Messenger (since no contract was provided in core logic file). */
export async function readMessages(address: string): Promise<any[]> {
  console.log("Reading messages for", address);
  return [];
}
export async function sendMessage(to: string, content: string): Promise<string> {
  console.log("Sending message to", to, content);
  return "0xmockhash";
}
