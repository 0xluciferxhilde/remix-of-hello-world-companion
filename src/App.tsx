/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Droplets, 
  Rocket, 
  Hammer, 
  Trophy, 
  CalendarCheck, 
  Sparkles, 
  MessageSquare, 
  ListChecks, 
  Gamepad2, 
  ChevronDown, 
  Search, 
  Bell, 
  Wallet, 
  ExternalLink,
  Settings,
  ArrowDown,
  Info,
  Layers,
  Menu,
  X,
  Plus,
  Coins,
  Image as ImageIcon,
  Lock,
  Clock,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAccount, useChainId, useSwitchChain, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther, parseEther } from 'ethers';
import SwapCard from './components/ui/crypto-swap-card';
import { AnimatedNavFramer } from './components/ui/navigation-menu';
import { litvmChain, errMsg } from './lib/litdex-core-logic';

// --- Types ---
type PageID = 'swap' | 'pool' | 'deploy' | 'points' | 'checkin' | 'nfts' | 'messenger' | 'quests' | 'games' | 'faucet';

interface NavItemProps {
  icon: any;
  title: string;
  desc: string;
  badge?: string;
  onClick: () => void;
}

// --- Components ---

const LogoLD = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <div className={cn("relative flex items-center justify-center font-black italic tracking-tighter cursor-default filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]", className)}>
    <span style={{ fontSize: size }} className="text-black leading-none select-none">L</span>
    <span style={{ fontSize: size }} className="text-black leading-none -ml-[0.1em] select-none">D</span>
  </div>
);

const NavItem = ({ icon: Icon, title, desc, badge, onClick }: NavItemProps) => (
  <button 
    onClick={onClick}
    className="flex items-start gap-4 p-3 rounded-xl border border-transparent hover:border-brand-border hover:bg-white/5 transition-all group text-left w-full"
  >
    <div className="w-10 h-10 rounded-lg bg-brand-surface-2 flex items-center justify-center text-white group-hover:bg-white/10 transition-colors">
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-brand-text-primary text-sm">{title}</span>
        {badge && (
          <span className="text-[10px] font-bold bg-white/10 text-white px-1.5 py-0.5 rounded-full uppercase">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-brand-text-muted mt-0.5 leading-relaxed">{desc}</p>
    </div>
  </button>
);

const Card = ({ children, className = "", ...props }: any) => (
  <div className={`bg-brand-surface border border-brand-border rounded-[12px] ${className}`} {...props}>
    {children}
  </div>
);

/// --- Page: Swap ---
const SwapPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="flex flex-col items-center justify-center min-h-[80vh] px-4 w-full py-12"
    >
      <SwapCard className="teal-glow-hover transition-all duration-500" />
    </motion.div>
  );
};

// --- Page: Pool ---
const PoolPage = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }} 
    animate={{ opacity: 1, scale: 1 }} 
    className="flex flex-col items-center justify-center min-h-[80vh] px-4 w-full py-12"
  >
    <SwapCard mode="pool" className="teal-glow-hover transition-all duration-500" />
    
    <div className="w-full max-w-[480px] mt-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Active Liquidity</h2>
          <p className="text-[10px] text-brand-text-muted uppercase tracking-widest mt-1">Your Positions</p>
        </div>
      </div>
      <div className="p-8 border-2 border-dashed border-white/5 rounded-2xl text-center bg-black/20 backdrop-blur-sm">
          <p className="text-brand-text-muted font-mono text-xs">Connect a wallet to see your active pools.</p>
      </div>
    </div>
  </motion.div>
);

// --- Page: Points ---
// --- Page: Points ---
const PointsPage = () => {
  const { address, isConnected } = useAccount();
  const [points, setPoints] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;
      setLoading(true);
      try {
        const { readPoints } = await import('./lib/litdex-core-logic');
        const p = await readPoints(address);
        setPoints(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (isConnected && address) {
      fetchData();
    }
  }, [isConnected, address]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2 tracking-tighter">Your Progress</h1>
          <p className="text-brand-text-muted text-lg">Track your LitDeX points and rewards.</p>
        </div>
        <Card className="p-8 bg-brand-surface border-brand-border min-w-[240px] text-center shadow-[0_0_50px_rgba(255,255,255,0.05)] border-white/5">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text-muted mb-2">Total Points</div>
          <div className="text-5xl font-bold tracking-tighter">{points.toString()}</div>
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-4 justify-center">
             <div className="text-center">
               <div className="text-[9px] text-brand-text-muted uppercase">Rank</div>
               <div className="font-bold">#--</div>
             </div>
             <div className="text-center">
               <div className="text-[9px] text-brand-text-muted uppercase">Multiplier</div>
               <div className="font-bold">1.0x</div>
             </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-brand-surface border-brand-border border-white/5">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Milestones</h3>
          <div className="space-y-4">
            {[100, 500, 1000, 5000].map(m => (
              <div key={m} className="flex items-center justify-between">
                <span className="text-brand-text-muted text-sm">{m} Points Reward</span>
                <span className={cn("text-xs font-bold px-2 py-1 rounded", Number(points) >= m ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-white/20")}>
                  {Number(points) >= m ? "Unlocked" : "Locked"}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 bg-brand-surface border-brand-border border-white/5">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4">User Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-brand-text-muted text-sm">Status</span>
              <span className="text-sm font-bold">{isConnected ? "Active" : "Disconnected"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-text-muted text-sm">Experience</span>
              <span className="text-sm font-bold">Lvl 1</span>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

// --- Page: Check-in ---
// --- Page: Check-in ---
const CheckinPage = () => {
  const { address, isConnected } = useAccount();
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const fetchData = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { readCheckinInfo } = await import('./lib/litdex-core-logic');
      const data = await readCheckinInfo(address);
      setInfo(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchData();
    }
  }, [isConnected, address]);

  const handleCheckin = async () => {
    if (!address) return;
    setCheckingIn(true);
    try {
      const { checkinToday } = await import('./lib/litdex-core-logic');
      await checkinToday();
      alert("Check-in successful!");
      fetchData();
    } catch (err: any) {
      alert(`Check-in failed: ${err.message || err.toString()}`);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2 tracking-tighter text-white">Daily Forge</h1>
        <p className="text-brand-text-muted text-lg">Maintain your streak and earn bonus points.</p>
      </div>

      <Card className="p-8 md:p-12 bg-brand-surface border-brand-border border-white/5 bg-black/20 shadow-2xl">
        <div className="flex justify-center gap-2 mb-8">
          {[1,2,3,4,5,6,7].map(day => (
            <div 
              key={day} 
              className={cn(
                "w-10 h-14 rounded-lg border flex flex-col items-center justify-center transition-all",
                info && info.streak >= day 
                  ? "bg-white border-white text-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                  : "bg-white/5 border-white/10 text-white/30"
              )}
            >
              <span className="text-[8px] font-bold uppercase tracking-tighter">Day</span>
              <span className="text-lg font-bold">{day}</span>
            </div>
          ))}
        </div>

        <div className="mb-8">
           <div className="text-5xl font-black mb-1">{info ? info.streak : 0}</div>
           <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-text-muted">Day Streak</div>
        </div>

        <button 
          onClick={handleCheckin}
          disabled={!isConnected || checkingIn || (info && (Date.now() / 1000 < Number(info.lastCheckin) + 86400))}
          className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checkingIn ? "Processing..." : (info && (Date.now() / 1000 < Number(info.lastCheckin) + 86400)) ? "Checked In Today" : "Check-in Now"}
        </button>

        <p className="mt-6 text-xs text-brand-text-muted">You get +10 points everyday, and +50 points bonus on Day 7.</p>
      </Card>
    </motion.div>
  );
};

// --- Page: NFTs ---
const NFTsPage = () => {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const fetchData = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { readUserNFTs } = await import('./lib/litdex-core-logic');
      const data = await readUserNFTs(address);
      setNfts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchData();
    }
  }, [isConnected, address]);

  const handleClaimRewards = async () => {
    if (!address) return;
    setClaiming(true);
    try {
      const { claimNFTRewards } = await import('./lib/litdex-core-logic');
      await claimNFTRewards();
      alert("Rewards claimed!");
    } catch (err: any) {
      alert(`Claim failed: ${err.message || err.toString()}`);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 container mx-auto px-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-white">
            <Sparkles size={24} /> Genesis Metadata Rewards
          </h2>
          <p className="text-brand-text-muted text-sm max-w-md leading-relaxed">
            Holders of Genesis NFTs receive daily claimable rewards and exclusive access.
          </p>
        </div>
        <button 
          onClick={handleClaimRewards}
          disabled={!isConnected || claiming}
          className="whitespace-nowrap px-8 py-3 bg-white text-black rounded-xl font-bold shadow-[0_0_24px_rgba(255,255,255,0.1)] hover:scale-[1.02] transition-all uppercase text-xs tracking-widest disabled:opacity-50"
        >
          {claiming ? "Claiming..." : "Claim Daily Rewards"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {nfts.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
             <p className="text-brand-text-muted font-bold text-sm uppercase tracking-widest">No NFTs found in this wallet</p>
          </div>
        ) : nfts.map((nft, i) => (
          <Card key={i} className="overflow-hidden group hover:border-white/30 transition-all">
            <div className="aspect-square bg-brand-surface-2 relative flex items-center justify-center overflow-hidden">
               <img src={nft.image} alt={nft.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
               <div className="absolute top-4 right-4 px-2 py-1 rounded-md bg-brand-bg/80 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white">
                ID #{nft.tokenId}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold mb-1">{nft.name}</h3>
              <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">{nft.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

// --- Page: Deploy (Unified) ---
const DeployPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedType, setSelectedType] = useState('erc20');
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const types = [
    { id: 'erc20', name: 'ERC20 Token', icon: Coins },
    { id: 'nft', name: 'NFT (ERC721)', icon: ImageIcon },
    { id: 'staking', name: 'Staking', icon: Lock },
    { id: 'vesting', name: 'Vesting', icon: Clock },
    { id: 'factory', name: 'Token Factory', icon: Hammer },
  ];

  const fetchHistory = async () => {
    if (!address) return;
    setLoadingHistory(true);
    try {
      const { readDeployments } = await import('./lib/litdex-core-logic');
      const data = await readDeployments(address);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchHistory();
    }
  }, [isConnected, address]);

  const renderDeployForm = () => {
    switch (selectedType) {
      case 'erc20': return <ERC20Form onDeployed={fetchHistory} />;
      case 'nft': return <NFTForm onDeployed={fetchHistory} />;
      case 'staking': return <StakingForm onDeployed={fetchHistory} />;
      case 'vesting': return <VestingForm onDeployed={fetchHistory} />;
      case 'factory': return <TokenFactoryForm onDeployed={fetchHistory} />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-12 px-4">
      {/* Sub-navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedType(t.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all font-bold text-[10px] uppercase tracking-widest",
              selectedType === t.id 
                ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]" 
                : "bg-black/20 border-white/5 text-brand-text-muted hover:border-white/10 hover:text-white"
            )}
          >
            <t.icon size={14} />
            {t.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderDeployForm()}
        </motion.div>
      </AnimatePresence>

      {/* Deployments History Card */}
      <Card className="mt-12 p-8 bg-black/40 border-white/5 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-lg text-white">
                <Layers size={18} />
             </div>
             <div>
                <h3 className="font-bold text-white">My Deployed Contracts</h3>
                <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-bold">Manage your projects</p>
             </div>
          </div>
          <button onClick={fetchHistory} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Refresh</button>
        </div>
        
        {isConnected ? (
          history.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-white/5 rounded-2xl text-center">
              <p className="text-brand-text-muted font-mono text-xs">No deployments found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((h, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                   <div>
                     <p className="text-xs font-bold text-white uppercase">{h.type}</p>
                     <p className="text-[10px] text-brand-text-muted font-mono">{h.addr.slice(0, 10)}...{h.addr.slice(-8)}</p>
                   </div>
                   <a href={`https://explorer.zkltc.com/address/${h.addr}`} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-all">
                     <ExternalLink size={14} className="text-brand-text-muted" />
                   </a>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="p-8 border-2 border-dashed border-white/5 rounded-2xl text-center">
              <p className="text-brand-text-muted font-mono text-xs">Connect a wallet to see your deployments.</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

// --- Sub-Form Components ---

const FormContainer = ({ title, subtitle, icon: Icon, children, deployFee = "0.05", actionLabel = "Deploy", onAction = () => {}, loading = false }: any) => (
  <Card className="p-8 bg-black/40 border-white/5 backdrop-blur-3xl shadow-2xl overflow-hidden relative group">
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
    <div className="flex items-start gap-5 mb-10">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-xl">
        <Icon size={28} />
      </div>
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
        <p className="text-xs font-mono text-brand-text-muted mt-1 opacity-60 italic">{subtitle}</p>
      </div>
    </div>
    <div className="space-y-6">
      {children}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
       <button className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-all uppercase tracking-widest">
         <Eye size={16} /> Preview Source
       </button>
       <button 
        onClick={onAction}
        disabled={loading}
        className="flex items-center justify-center gap-2 py-4 bg-white text-black rounded-xl font-bold text-sm hover:opacity-90 transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-50"
       >
         <Rocket size={16} /> {loading ? "Deploying..." : `${actionLabel} (${deployFee} zkLTC)`}
       </button>
    </div>
  </Card>
);

const InputField = ({ label, placeholder, helper, type = "text", value = "", onChange = () => {} }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-[0.2em]">{label} <span className="text-red-500">*</span></label>
    <div className="bg-black/30 border border-white/10 rounded-xl p-4 focus-within:border-white/30 transition-all">
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none text-white font-medium placeholder:text-white/20" 
      />
    </div>
    {helper && <p className="text-[10px] text-brand-text-muted italic">{helper}</p>}
  </div>
);

const ToggleField = ({ label, desc, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-white/10 transition-all text-left">
    <div>
      <h4 className="font-bold text-sm text-white">{label}</h4>
      <p className="text-[10px] text-brand-text-muted mt-0.5">{desc}</p>
    </div>
    <button 
      onClick={onToggle}
      className={cn(
        "w-12 h-6 rounded-full p-1 flex items-center transition-all flex-shrink-0 ml-4",
        active ? "bg-brand-teal/20 border border-brand-teal/30 justify-end" : "bg-white/5 border border-white/10 justify-start"
      )}
    >
      <div className={cn("w-4 h-4 rounded-full transition-all", active ? "bg-brand-teal shadow-[0_0_8px_rgba(79,209,197,0.8)]" : "bg-white/20")} />
    </button>
  </div>
);

const ERC20Form = ({ onDeployed }: any) => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('1000000');
  const [loading, setLoading] = useState(false);

  const handleDeploy = async () => {
    if(!name || !symbol || !supply) return alert("Fill all fields");
    setLoading(true);
    try {
      const { deployERC20 } = await import('./lib/litdex-core-logic');
      const hash = await deployERC20(name, symbol, supply);
      alert(`Success! Token deployed: ${hash}`);
      onDeployed?.();
    } catch (err) {
      alert(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer title="ERC20 Token" subtitle="// Standard fungible token." icon={Coins} onAction={handleDeploy} loading={loading}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Token Name" placeholder="e.g. PepeCoin" value={name} onChange={setName} />
        <InputField label="Token Symbol" placeholder="e.g. PEPE" value={symbol} onChange={setSymbol} />
        <InputField label="Total Supply" placeholder="1000000" value={supply} onChange={setSupply} />
      </div>
    </FormContainer>
  );
};

const NFTForm = ({ onDeployed }: any) => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeploy = async () => {
    setLoading(true);
    try {
      const { deployNFT } = await import('./lib/litdex-core-logic');
      const hash = await deployNFT(name, symbol);
      alert(`NFT Deployed: ${hash}`);
      onDeployed?.();
    } catch (err) {
      alert(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer title="NFT (ERC721)" subtitle="// Collectible digital assets." icon={ImageIcon} onAction={handleDeploy} loading={loading}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Collection Name" placeholder="e.g. Bored Lizards" value={name} onChange={setName} />
        <InputField label="Symbol" placeholder="e.g. BLIZ" value={symbol} onChange={setSymbol} />
      </div>
    </FormContainer>
  );
};

const StakingForm = ({ onDeployed }: any) => {
  const [rewardToken, setRewardToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeploy = async () => {
    setLoading(true);
    try {
      const { deployStaking } = await import('./lib/litdex-core-logic');
      const hash = await deployStaking(rewardToken);
      alert(`Staking Contract Deployed: ${hash}`);
      onDeployed?.();
    } catch (err) {
      alert(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer title="Staking" subtitle="// Reward users for holding." icon={Lock} onAction={handleDeploy} loading={loading}>
      <InputField label="Reward Token Address" placeholder="0x..." value={rewardToken} onChange={setRewardToken} />
    </FormContainer>
  );
};

const VestingForm = ({ onDeployed }: any) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeploy = async () => {
    setLoading(true);
    try {
      const { deployVesting } = await import('./lib/litdex-core-logic');
      const hash = await deployVesting(token);
      alert(`Vesting Contract Deployed: ${hash}`);
      onDeployed?.();
    } catch (err) {
      alert(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer title="Vesting" subtitle="// Linear release schedules." icon={Clock} onAction={handleDeploy} loading={loading}>
      <InputField label="Token Address" placeholder="0x..." value={token} onChange={setToken} />
    </FormContainer>
  );
};

const TokenFactoryForm = ({ onDeployed }: any) => {
  const [loading, setLoading] = useState(false);

  const handleDeploy = async () => {
    setLoading(true);
    try {
      const { deployFactory } = await import('./lib/litdex-core-logic');
      const hash = await deployFactory();
      alert(`Factory Deployed: ${hash}`);
      onDeployed?.();
    } catch (err) {
      alert(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer title="Token Factory" subtitle="// Manage multiple launches." icon={Hammer} onAction={handleDeploy} loading={loading}>
      <p className="text-sm text-brand-text-muted">Deploy a master factory to manage all your future ERC20 launches efficiently.</p>
    </FormContainer>
  );
};
// --- Page: Quests ---
const QuestsPage = () => {
  const { address, isConnected } = useAccount();
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { readQuests } = await import('./lib/litdex-core-logic');
      const data = await readQuests(address);
      setQuests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchData();
    }
  }, [isConnected, address]);

  const handleVerify = async (questId: string) => {
    try {
      const { verifyQuest } = await import('./lib/litdex-core-logic');
      await verifyQuest(questId);
      alert("Quest verified!");
      fetchData();
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8 text-white tracking-tighter">Tasks & Quests</h1>
      <div className="space-y-4">
        {quests.length === 0 ? (
          <div className="p-12 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
             <p className="text-brand-text-muted uppercase text-xs font-bold tracking-widest">Connect wallet to view quests</p>
          </div>
        ) : quests.map((q, i) => (
          <Card key={i} className="p-6 flex flex-col md:flex-row items-center justify-between hover:bg-white/[0.02] transition-all border-white/5 bg-black/20">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
               <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                 {q.type === 'social' ? '𝕏' : '✨'}
               </div>
               <div>
                  <h3 className="font-bold text-white">{q.name}</h3>
                  <p className="text-xs text-brand-text-muted">{q.points.toString()} Points Reward</p>
               </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
               <button 
                onClick={() => handleVerify(q.id)}
                disabled={q.completed}
                className={cn(
                  "flex-1 md:flex-none px-8 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                  q.completed ? "bg-white/5 text-white/20 border border-white/5" : "bg-white text-black hover:opacity-90"
                )}
               >
                 {q.completed ? "Completed" : "Verify"}
               </button>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

// --- Page: Games ---
const GamesPage = () => {
  const { address, isConnected } = useAccount();
  const [gf, setGf] = useState<bigint>(0n);
  const [claiming, setClaiming] = useState(false);

  const fetchGF = async () => {
    if (!address) return;
    try {
      const { readGF } = await import('./lib/litdex-core-logic');
      const val = await readGF(address);
      setGf(val);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchGF();
    }
  }, [isConnected, address]);

  const handleClaimGF = async () => {
    setClaiming(true);
    try {
      const { claimGF } = await import('./lib/litdex-core-logic');
      await claimGF();
      alert("Gaming Fuel claimed!");
      fetchGF();
    } catch (err) {
      alert(errMsg(err));
    } finally {
      setClaiming(false);
    }
  };

  const handleStartGame = async (gameId: string) => {
     try {
       const { startGame } = await import('./lib/litdex-core-logic');
       await startGame(gameId);
       alert("Game started! Redirecting to game engine...");
       // Here you would normally redirect to the game canvas/route
     } catch (err: any) {
       alert(err.message || "Failed to start game");
     }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 max-w-6xl mx-auto px-4">
      <Card className="p-10 mb-12 flex flex-col md:flex-row items-center justify-between gap-12 bg-black/40 text-center md:text-left border-white/5 backdrop-blur-xl group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl -mr-48 -mt-48 transition-all group-hover:bg-white/[0.03]" />
        
        <div className="flex-1 relative z-10">
          <h1 className="text-4xl font-bold mb-4 tracking-tighter text-white">GAMING FUEL (GF)</h1>
          <p className="text-brand-text-muted mb-8 max-w-md">Every game on LitDeX consumes GF. Claim your daily allowance to climb the leaderboard.</p>
          <div className="space-y-3 mb-8">
             <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Available Balance</span>
                <span className="text-xs font-mono">{gf.toString()} GF</span>
             </div>
             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Number(gf) / 5)}%` }}
                  className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]" 
                />
             </div>
          </div>
          <button 
            onClick={handleClaimGF}
            disabled={!isConnected || claiming}
            className="px-10 py-4 bg-white text-black rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.1)] disabled:opacity-50 mx-auto md:mx-0"
          >
            {claiming ? "Claiming..." : "Claim Daily GF"} <Plus size={16} />
          </button>
        </div>
        <div className="w-64 h-64 rounded-full border border-white/5 flex items-center justify-center relative bg-white/[0.02] shadow-inner group-hover:rotate-12 transition-all duration-700">
           <Gamepad2 size={100} className="text-white/20" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="overflow-hidden group h-[450px] flex flex-col bg-black/40 border-white/5 hover:border-white/20 transition-all">
          <div className="h-48 bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
            <Gamepad2 size={80} />
          </div>
          <div className="p-8 flex-1 flex flex-col">
            <h3 className="font-bold text-2xl mb-2 text-white">Retro-Forge</h3>
            <p className="text-sm text-brand-text-muted mb-8 leading-relaxed">Dodge gas spikes and collect shards in this high-speed endless runner. Earn points with every meter.</p>
            <button 
              onClick={() => handleStartGame('retro-forge')}
              className="mt-auto w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest text-brand-text-muted group-hover:bg-white group-hover:text-black group-hover:border-white transition-all shadow-xl shadow-transparent group-hover:shadow-white/5"
            >
              Play (50 GF)
            </button>
          </div>
        </Card>
        
        {[1, 2].map(i => (
          <Card key={i} className="overflow-hidden h-[450px] relative grayscale opacity-40 bg-black/40 border-white/5">
             <div className="h-48 bg-white/[0.02] border-b border-white/5 flex items-center justify-center">
                <span className="text-5xl opacity-20">🔒</span>
             </div>
             <div className="p-8">
                <h3 className="font-bold text-2xl mb-2 text-white">Coming Soon</h3>
                <p className="text-sm text-brand-text-muted">A new gaming experience is being forged in the lab.</p>
             </div>
             <div className="absolute inset-x-8 bottom-8 text-center border-t border-white/5 pt-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Locked Expansion</p>
             </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

// --- Page: Messenger ---
const MessengerPage = () => {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { readMessages } = await import('./lib/litdex-core-logic');
      const data = await readMessages(address);
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchMessages();
    }
  }, [isConnected, address]);

  const handleSend = async () => {
    if (!recipient || !content) return;
    setSending(true);
    try {
      const { sendMessage } = await import('./lib/litdex-core-logic');
      await sendMessage(recipient, content);
      alert("Message sent!");
      setContent('');
      fetchMessages();
    } catch (err) {
      alert(errMsg(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 max-w-4xl mx-auto px-4 h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Sidebar / New Message */}
        <Card className="p-6 bg-black/40 border-white/5 backdrop-blur-xl flex flex-col">
          <h3 className="font-bold text-white mb-6">New Message</h3>
          <div className="space-y-4 flex-1">
             <div className="space-y-1">
               <label className="text-[9px] font-bold text-brand-text-muted uppercase tracking-widest">Recipient Address</label>
               <input 
                 value={recipient}
                 onChange={(e) => setRecipient(e.target.value)}
                 placeholder="0x..." 
                 className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-white/30 outline-none"
               />
             </div>
             <div className="space-y-1">
               <label className="text-[9px] font-bold text-brand-text-muted uppercase tracking-widest">Message Content</label>
               <textarea 
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
                 rows={4}
                 placeholder="Type your encrypted message..." 
                 className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-white/30 outline-none resize-none"
               />
             </div>
             <button 
              onClick={handleSend}
              disabled={!isConnected || sending}
              className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
             >
               {sending ? "Sending..." : "Send Message"}
             </button>
          </div>
        </Card>

        {/* Message Feed */}
        <Card className="md:col-span-2 bg-black/40 border-white/5 backdrop-blur-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white">Inbox</h3>
            <button onClick={fetchMessages} className="text-[10px] font-bold text-brand-text-muted hover:text-white uppercase tracking-widest">Refresh</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!isConnected ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <Lock size={32} className="mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Connect wallet to view messages</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <MessageSquare size={32} className="mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
              </div>
            ) : messages.map((m, i) => (
              <div key={i} className={cn(
                "p-4 rounded-2xl max-w-[85%]",
                m.sender.toLowerCase() === address?.toLowerCase() 
                  ? "bg-white text-black ml-auto rounded-tr-none shadow-xl" 
                  : "bg-white/5 border border-white/10 text-white rounded-tl-none"
              )}>
                <p className="text-xs break-words">{m.content}</p>
                <div className="mt-2 flex items-center justify-between gap-4">
                   <p className={cn("text-[9px] font-mono opacity-50", m.sender.toLowerCase() === address?.toLowerCase() ? "text-black" : "text-white")}>
                     {m.sender.slice(0, 6)}...{m.sender.slice(-4)}
                   </p>
                   <p className={cn("text-[8px] opacity-40", m.sender.toLowerCase() === address?.toLowerCase() ? "text-black" : "text-white")}>
                     {new Date(Number(m.timestamp) * 1000).toLocaleTimeString()}
                   </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

// --- Page: Faucet ---
const FaucetPage = () => {
  const { address, isConnected } = useAccount();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const fetchStatus = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { faucetApi } = await import('./lib/litdex-core-logic');
      const s = await faucetApi.getStatus(address);
      setStatus(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchStatus();
    }
  }, [isConnected, address]);

  const handleClaim = async () => {
    if (!address) return;
    setClaiming(true);
    try {
      const { faucetApi } = await import('./lib/litdex-core-logic');
      const res = await faucetApi.claim(address);
      if (res.ok) {
        alert(res.message || "Claim successful!");
        fetchStatus();
      } else {
        alert(res.reason || res.message || "Claim failed. Check requirements.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during claiming.");
    } finally {
      setClaiming(false);
    }
  };

  const nextClaimStr = status?.nextClaimIn && status.nextClaimIn > 0 
    ? `${Math.ceil(status.nextClaimIn / 3600)}h remaining` 
    : "Available now";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto py-8 md:py-12 px-4 text-center">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tighter">Faucet</h1>
        <p className="text-brand-text-muted text-base md:text-lg">Get 0.001 zkLTC to test the protocol.</p>
      </div>

      <div className="bg-brand-surface border border-brand-border p-3.5 rounded-xl mb-5 flex items-center justify-between mx-auto max-w-md text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
             <LogoLD size={12} className="opacity-80" />
          </div>
          <span className="text-brand-text-muted font-medium text-xs">Your zkLTC balance</span>
        </div>
        <span className="font-bold text-xs">
          {status ? `${Number(status.zkLTCBalance).toLocaleString()} zkLTC` : isConnected ? "Loading..." : "0 zkLTC"}
        </span>
      </div>

      <Card className="max-w-md mx-auto py-8 px-6 flex flex-col items-center border border-white/5 bg-black/20">
        <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
             <LogoLD size={20} />
           </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-4xl font-bold tabular-nums mb-1 tracking-tight">0.001</h2>
          <p className="text-brand-text-muted font-medium text-[10px] uppercase tracking-[0.2em] opacity-50">zkLTC per claim</p>
        </div>

        <button 
          onClick={handleClaim}
          disabled={!isConnected || claiming || (status && !status.canClaim)}
          className="w-full py-3.5 bg-white text-black rounded-xl font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {claiming ? "Claiming..." : status && !status.canClaim ? nextClaimStr : "Claim 0.001 zkLTC"}
        </button>

        <div className="mt-6 text-[10px] text-brand-text-muted space-y-1">
          <p>• Requires $1+ assets on secondary chains (BSC/Base etc)</p>
          <p>• 7 day cooldown between claims</p>
        </div>
      </Card>
    </motion.div>
  );
};

// --- NAVIGATION SHELL ---

export default function App() {
  const [activePage, setActivePage] = useState<PageID>('swap');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close dropdown on click outside logic simplified for React
  useEffect(() => {
    const handleScroll = () => setActiveDropdown(null);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'swap': return <SwapPage />;
      case 'pool': return <PoolPage />;
      case 'deploy': return <DeployPage />;
      case 'points': return <PointsPage />;
      case 'checkin': return <CheckinPage />;
      case 'nfts': return <NFTsPage />;
      case 'messenger': return <MessengerPage />;
      case 'quests': return <QuestsPage />;
      case 'games': return <GamesPage />;
      case 'faucet': return <FaucetPage />;
      default: return <SwapPage />;
    }
  };

  const navGroups = {
    litdex: [
      { id: 'swap', icon: ArrowLeftRight, title: 'Swap', desc: 'Trade tokens instantly' },
      { id: 'pool', icon: Droplets, title: 'Pool', desc: 'Provide liquidity, earn fees' },
      { id: 'deploy', icon: Rocket, title: 'Deploy', desc: 'Launch tokens & contracts' },
    ],
    rewards: [
      { id: 'points', icon: Trophy, title: 'Points', desc: 'View your tier status' },
      { id: 'checkin', icon: CalendarCheck, title: 'Check In', desc: 'Daily streak rewards' },
      { id: 'nfts', icon: Sparkles, title: 'NFTs', desc: 'Exclusive LiteForge assets' },
      { id: 'messenger', icon: MessageSquare, title: 'Messenger', desc: 'On-chain communication' },
      { id: 'quests', icon: ListChecks, title: 'Social Quests', desc: 'Complete tasks to earn' },
      { id: 'games', icon: Gamepad2, title: 'Games', desc: 'Play using Gas Fuel' },
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text-primary selection:bg-brand-teal/30 flex flex-col">
      {/* Top Left Logo */}
      <div className="fixed top-8 left-8 z-50 flex items-center gap-3 group cursor-pointer" onClick={() => setActivePage('swap')}>
        <div className="relative">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-700 group-hover:rotate-6">
            <LogoLD size={26} />
          </div>
          <div className="absolute -inset-2 bg-white/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
        <div className="flex flex-col -gap-1">
          <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white leading-none italic group-hover:tracking-normal transition-all duration-700">LitDeX</span>
          <span className="hidden sm:block text-[9px] font-bold tracking-[0.6em] text-white/50 uppercase leading-none mt-1.5 transition-all group-hover:text-white">Mainnet</span>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col">
        {/* Floating Tools Layout Fix */}
        <div className="sticky top-[calc(100vh-100px)] z-40 h-0 w-full px-8 pointer-events-none flex justify-between items-end">
            {/* Bottom Left Tools */}
            <div className="hidden lg:flex items-center pointer-events-auto">
              <button 
                onClick={() => setActivePage('faucet')}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 hover:bg-black/60 transition-all text-xs font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-3xl shadow-2xl"
              >
                <Droplets size={16} className="group-hover:text-white transition-colors" />
                Faucet
              </button>
            </div>

            {/* Bottom Right Tools */}
            <div className="pointer-events-auto">
              <button className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 hover:bg-black/60 transition-all text-white/60 backdrop-blur-3xl shadow-2xl group">
                <Bell size={24} className="group-hover:text-white transition-colors" />
                <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-white rounded-full ring-4 ring-brand-bg shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
              </button>
            </div>
        </div>

        {/* Top Right Tools (Kept Fixed/Top for now as it doesn't collide with footer) */}
        <div className="fixed top-8 right-8 z-50 hidden lg:flex items-center gap-3">
          <ConnectButton.Custom>
            {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
              const connected = mounted && account && chain;
              return (
                <button
                  onClick={connected ? openAccountModal : openConnectModal}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 active:scale-95 transition-all text-[9px] font-bold uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                >
                  <Wallet size={14} />
                  {connected ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : 'Connect'}
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>

        <AnimatedNavFramer 
          onPageChange={(page) => setActivePage(page as PageID)} 
          activePage={activePage}
        />

        {/* Main Content */}
        <main className="container mx-auto px-6 pt-24 pb-12 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-brand-border py-12 relative z-50 bg-brand-bg">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-white text-sm font-bold">
              <LogoLD size={14} />
            </div>
            <span className="text-brand-text-muted text-xs font-mono">LitDeX Mainnet v1.0.4-stable</span>
          </div>
          <div className="flex gap-8 text-[10px] uppercase font-bold tracking-[0.2em] text-brand-text-muted">
            <a href="#" className="hover:text-brand-teal transition-colors">Twitter (X)</a>
            <a href="#" className="hover:text-brand-teal transition-colors">Discord</a>
            <a href="#" className="hover:text-brand-teal transition-colors">Github</a>
            <a href="#" className="hover:text-brand-teal transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

