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
import SwapCard from './components/ui/crypto-swap-card';
import { AnimatedNavFramer } from './components/ui/navigation-menu';

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
  <div className={cn("relative flex items-center justify-center font-black italic tracking-tighter cursor-default", className)}>
    <span style={{ fontSize: size }} className="text-black leading-none drop-shadow-sm select-none">L</span>
    <span style={{ fontSize: size }} className="text-black leading-none -ml-[0.1em] drop-shadow-sm select-none">D</span>
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
const PointsPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 max-w-5xl mx-auto px-4">
    <div className="text-center mb-12">
      <p className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-4">Your Contribution</p>
      <h1 className="text-7xl font-bold tracking-tighter text-white mb-4">
        24,580.00
      </h1>
      <p className="text-brand-text-muted text-lg font-medium">Total FN-Points Earned</p>
    </div>

    <Card className="p-8 mb-12 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-brand-surface-2">
        <div className="h-full bg-brand-teal w-3/4 shadow-[0_0_12px_rgba(79,209,197,0.5)]" />
      </div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">Tier 3: LiteForge Knight</h3>
          <p className="text-xs text-brand-text-muted">420 points away from Tier 4</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-brand-teal">Rank #1,204</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: 'Swap Multiplier', val: '1.2x', status: 'Active' },
          { label: 'Pool Bonus', val: '1.05x', status: 'Active' },
          { label: 'Voting Power', val: '250 VP', status: 'Ready' },
          { label: 'Gas Rebate', val: '5%', status: 'Tier 4' },
        ].map((stat, i) => (
          <div key={i} className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.status === 'Active' ? 'text-white' : 'text-brand-text-primary'}`}>{stat.val}</p>
          </div>
        ))}
      </div>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { title: 'Trade to Earn', desc: 'Every $1 swapped earns 1 point', action: 'Go to Swap', id: 'swap' },
        { title: 'Liquidity Bonus', desc: 'Hold LP tokens for point streaks', action: 'Go to Pool', id: 'pool' },
        { title: 'Forge Tokens', desc: 'Deploying contracts gives 500 bonus points', action: 'Deploy Now', id: 'deploy-token' },
      ].map((card, i) => (
        <Card key={i} className="p-6 flex flex-col items-start hover:border-brand-teal/30 transition-all group">
          <h4 className="font-bold mb-2">{card.title}</h4>
          <p className="text-xs text-brand-text-muted mb-6 leading-relaxed">{card.desc}</p>
          <button className="mt-auto text-xs font-bold text-brand-teal flex items-center gap-1 group-hover:gap-2 transition-all">
            {card.action} <ArrowLeftRight size={14} />
          </button>
        </Card>
      ))}
    </div>
  </motion.div>
);

// --- Page: Check-in ---
const CheckinPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 max-w-xl mx-auto px-4">
    <Card className="p-8 text-center transition-all">
      <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto mb-6">
        <CalendarCheck size={32} />
      </div>
      <h1 className="text-3xl font-bold mb-2">Daily Forge</h1>
      <p className="text-brand-text-muted mb-8 text-sm">Check in 7 days in a row to forge the Genesis Crate.</p>
      
      <div className="flex justify-center gap-3 mb-10">
        {[1, 2, 3, 4, 5, 6, 7].map(day => (
          <div key={day} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
              day < 4 ? 'bg-white border-white text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 
              day === 4 ? 'border-white animate-pulse text-white' : 
              'border-brand-border text-brand-text-muted'
            }`}>
              {day < 4 ? <ListChecks size={18} /> : <span className="text-xs font-bold">{day}</span>}
            </div>
            <span className="text-[10px] font-bold text-brand-text-muted">D{day}</span>
          </div>
        ))}
      </div>

      <div className="bg-brand-surface-2 p-6 rounded-xl border border-brand-border mb-8 text-left space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-brand-text-muted">Current Streak</span>
          <span className="font-bold text-white">3 Days</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-brand-text-muted">Next Reward</span>
          <span className="font-bold text-white">+50 FN-Points</span>
        </div>
      </div>

      <button className="w-full py-4 bg-white text-black rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
        Forge Day 4
      </button>
    </Card>
  </motion.div>
);

// --- Page: NFTs ---
const NFTsPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 container mx-auto px-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-white">
          <Sparkles size={24} /> Genesis Metadata Rewards
        </h2>
        <p className="text-brand-text-muted text-sm max-w-md leading-relaxed">
          Holders of Genesis NFTs receive daily claimable LIT rewards, governance voting power, and exclusive access to the LitDeX Forge-Pad.
        </p>
      </div>
      <button className="whitespace-nowrap px-8 py-3 bg-white text-black rounded-xl font-bold shadow-[0_0_24px_rgba(255,255,255,0.1)] hover:scale-[1.02] transition-all uppercase text-xs tracking-widest">
        Claim Daily Rewards
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { name: 'LitDeX Origin #01', status: 'Owned', type: 'Mythic', color: 'text-white' },
        { name: 'LitDeX Origin #42', status: 'Claimable', type: 'Rare', color: 'text-amber-500' },
        { name: 'LitDeX Origin #128', status: 'Claimed', type: 'Legacy', color: 'text-gray-500' },
        { name: 'LitDeX Origin #201', status: 'Claimed', type: 'Common', color: 'text-brand-text-muted' },
      ].map((nft, i) => (
        <Card key={i} className="overflow-hidden group hover:border-white/30 transition-all">
          <div className="aspect-square bg-brand-surface-2 relative flex items-center justify-center">
            <div className={`w-32 h-32 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center shadow-xl group-hover:rotate-3 transition-transform duration-500`}>
                <Layers size={48} className={nft.color} />
            </div>
            <div className={`absolute top-4 right-4 px-2 py-1 rounded-md bg-brand-bg/80 backdrop-blur-md border border-brand-border text-[9px] font-bold uppercase tracking-widest ${nft.color}`}>
              {nft.type}
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-bold mb-1">{nft.name}</h3>
            <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-4">Genesis Collection</p>
            <div className="flex items-center justify-between">
               <span className={`text-xs font-bold ${nft.status === 'Claimable' ? 'text-white' : 'text-brand-text-muted'}`}>
                {nft.status}
               </span>
               <button className="text-brand-text-muted hover:text-brand-text-primary transition-colors">
                <ExternalLink size={14} />
               </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </motion.div>
);

// --- Page: Deploy (Unified) ---
const DeployPage = () => {
  const [selectedType, setSelectedType] = useState('erc20');

  const types = [
    { id: 'erc20', name: 'ERC20 Token', icon: Coins },
    { id: 'nft', name: 'NFT (ERC721)', icon: ImageIcon },
    { id: 'staking', name: 'Staking', icon: Lock },
    { id: 'vesting', name: 'Vesting', icon: Clock },
    { id: 'factory', name: 'Token Factory', icon: Hammer },
  ];

  const renderDeployForm = () => {
    switch (selectedType) {
      case 'erc20': return <ERC20Form />;
      case 'nft': return <NFTForm />;
      case 'staking': return <StakingForm />;
      case 'vesting': return <VestingForm />;
      case 'factory': return <TokenFactoryForm />;
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
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Refresh</button>
        </div>
        <div className="p-8 border-2 border-dashed border-white/5 rounded-2xl text-center">
            <p className="text-brand-text-muted font-mono text-xs">Connect a wallet to see your deployments.</p>
        </div>
      </Card>
    </motion.div>
  );
};

// --- Sub-Form Components ---

const FormContainer = ({ title, subtitle, icon: Icon, children, deployFee = "0.05", actionLabel = "Deploy" }: any) => (
  <Card className="p-8 bg-black/40 border-white/5 backdrop-blur-3xl shadow-2xl overflow-hidden relative group">
    {/* Subtle gradient background */}
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
       <button className="flex items-center justify-center gap-2 py-4 bg-white text-black rounded-xl font-bold text-sm hover:opacity-90 transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.1)]">
         <Rocket size={16} /> {actionLabel} ({deployFee} zkLTC)
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
        className="w-full bg-transparent outline-none text-white font-medium placeholder:text-white/20" 
      />
    </div>
    {helper && <p className="text-[10px] text-brand-text-muted italic">{helper}</p>}
  </div>
);

const ToggleField = ({ label, desc }: any) => (
  <div className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-white/10 transition-all">
    <div>
      <h4 className="font-bold text-sm text-white">{label}</h4>
      <p className="text-[10px] text-brand-text-muted mt-0.5">{desc}</p>
    </div>
    <button className="w-12 h-6 rounded-full bg-brand-teal/20 border border-brand-teal/30 p-1 flex items-center justify-end">
      <div className="w-4 h-4 rounded-full bg-brand-teal shadow-[0_0_8px_rgba(79,209,197,0.8)]" />
    </button>
  </div>
);

const ERC20Form = () => (
  <FormContainer 
    title="ERC20 Token" 
    subtitle="// Standard fungible token with optional mint, burn, pause." 
    icon={Coins}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField label="Token Name" placeholder="e.g. PepeCoin" helper="Max 50 characters — appears in wallets" />
      <InputField label="Token Symbol" placeholder="e.g. PEPE" helper="e.g. PEPE — appears on DEXes" />
      <InputField label="Total Supply" placeholder="1000000" helper="Whole units — decimals applied automatically" />
      <InputField label="Decimals" placeholder="18" helper="18 decimals is standard for most tokens" />
    </div>
    
    <div className="pt-6 border-t border-white/5">
      <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-[0.2em] mb-4 text-center">Features</p>
      <div className="space-y-3">
        <ToggleField label="Mintable" desc="Owner can create additional tokens after launch" />
        <ToggleField label="Burnable" desc="Token holders can permanently destroy their tokens" />
        <ToggleField label="Pausable" desc="Owner can pause all token transfers in an emergency" />
      </div>
    </div>
  </FormContainer>
);

const NFTForm = () => (
  <FormContainer 
    title="NFT (ERC721)" 
    subtitle="// ERC721 collection with mint price, max supply, public mint toggle." 
    icon={ImageIcon}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField label="Collection Name" placeholder="e.g. LitVM Punks" />
      <InputField label="Symbol" placeholder="e.g. LVMP" />
      <InputField label="Max Supply" placeholder="10000" helper="Maximum NFTs that can ever exist" />
      <InputField label="Mint Price (zkLTC)" placeholder="0.05" helper="Price per NFT mint" />
    </div>
    <div className="md:col-span-2">
      <InputField label="Base URI" placeholder="https://api.yourproject.xyz/meta/" helper="Metadata folder — token URIs become {baseURI}{tokenId}.json" />
    </div>
  </FormContainer>
);

const StakingForm = () => (
  <FormContainer 
    title="Staking" 
    subtitle="// Single-asset staking pool with daily reward rate and lock period." 
    icon={Lock}
  >
    <InputField label="Staking Token Address" placeholder="0x... ERC20 to stake" />
    <InputField label="Reward Token Address" placeholder="0x... (blank = same as stake)" helper="Leave blank to use same token as reward" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField label="Annual Reward Rate (%)" placeholder="12" helper="Converted to per-day rate × 1e18 on-chain" />
      <InputField label="Lock Period (days)" placeholder="30" helper="Minimum staking duration" />
    </div>
    <InputField label="Pool Label" placeholder="e.g. PEPE Staking Pool" helper="Stored on-chain as the contract's display name" />
  </FormContainer>
);

const VestingForm = () => (
  <FormContainer 
    title="Vesting" 
    subtitle="// Cliff + linear vesting for team / investor / advisor allocations." 
    icon={Clock}
  >
    <InputField label="Token Address" placeholder="0x... token to vest" />
    <InputField label="Vesting Label" placeholder="e.g. Team Vesting" />
    <InputField label="Beneficiary Address" placeholder="0x..." />
    <InputField label="Total Amount (wei)" placeholder="e.g. 1000000000000000000000000" helper="Raw amount including decimals" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField label="Cliff Period (days)" placeholder="90" helper="No tokens released before cliff ends" />
      <InputField label="Vesting Duration (days after cliff)" placeholder="365" />
    </div>
    <div className="pt-6 border-t border-white/5">
       <ToggleField label="Revocable by owner" desc="Owner can cancel and reclaim unvested tokens" />
    </div>
  </FormContainer>
);

const TokenFactoryForm = () => (
  <FormContainer 
    title="Token Factory" 
    subtitle="// Deploy your own ERC20 factory with custom fee, whitelist, and token tracking." 
    icon={Hammer}
    actionLabel="Generate & Download"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField label="Factory Contract Name" placeholder="LitVMTokenFactory" helper="Name of the factory contract itself" />
      <InputField label="Owner Address" placeholder="0x... (blank = deployer)" helper="Leave blank to use deployer address" />
    </div>
    <InputField label="Deploy Fee (zkLTC)" placeholder="0.05" helper="Fee charged to users who deploy tokens via your factory" />
    
    <div className="pt-6 border-t border-white/5">
      <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-[0.2em] mb-4 text-center">Default Token Features</p>
      <div className="space-y-3">
        <ToggleField label="Mintable" desc="Deployed tokens will support minting by owner" />
        <ToggleField label="Burnable" desc="Deployed tokens will support burning by holders" />
        <ToggleField label="Pausable" desc="Deployed tokens can be paused by owner" />
      </div>
    </div>

    <div className="pt-6 border-t border-white/5">
      <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-[0.2em] mb-4 text-center">Factory Options</p>
      <div className="space-y-3">
        <ToggleField label="Custom Decimals" desc="Allow deployers to set custom decimal places (0-18)" />
        <ToggleField label="Track Tokens" desc="Factory keeps a registry of all deployed token addresses" />
        <ToggleField label="Whitelist" desc="Only whitelisted addresses can deploy tokens via this factory" />
      </div>
    </div>

    <div className="p-5 bg-brand-teal/5 border border-brand-teal/10 rounded-2xl">
      <p className="text-[10px] text-brand-teal leading-relaxed font-medium">
        <Info size={12} className="inline mr-1 mb-0.5" /> Token Factory generates a <span className="font-bold underline">source-only</span> template. Use <span className="font-bold underline">Preview Source</span> to download the Solidity file, then deploy via Remix or Hardhat.
      </p>
    </div>
  </FormContainer>
);

// --- Page: Quests ---
const QuestsPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 max-w-4xl mx-auto px-4">
    <h1 className="text-3xl font-bold mb-8">Social Quests</h1>
    <div className="space-y-4">
      {[
        { title: 'Verify LiteForge on X', xp: '+100', desc: 'Follow the official account and verify your handle.', icon: '𝕏' },
        { title: 'Discord Vanguard', xp: '+250', desc: 'Join our server and claim the "Lifer" role.', icon: 'D' },
        { title: 'Ecosystem Evangelist', xp: '+500', desc: 'Invite 3 friends to deploy their first token.', icon: '👥' },
        { title: 'Governance Participant', xp: '+150', desc: 'Vote on any active LiteForge DAO proposal.', icon: '⚖️' },
      ].map((q, i) => (
        <Card key={i} className="p-4 flex items-center justify-between hover:bg-brand-teal/[0.02] transition-all">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-brand-surface-2 flex items-center justify-center text-xl grayscale opacity-50">{q.icon}</div>
             <div>
                <h3 className="font-bold text-sm">{q.title}</h3>
                <p className="text-xs text-brand-text-muted">{q.desc}</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-bold text-brand-teal bg-brand-teal/10 px-3 py-1.5 rounded-full">{q.xp} pts</span>
             <button className="px-4 py-2 bg-brand-surface border border-brand-border text-xs font-bold rounded-lg hover:border-brand-teal transition-all">Verify</button>
          </div>
        </Card>
      ))}
    </div>
  </motion.div>
);

// --- Page: Games ---
const GamesPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 max-w-6xl mx-auto px-4">
    <Card className="p-10 mb-12 flex flex-col md:flex-row items-center justify-between gap-12 bg-brand-surface md:text-left text-center border-white/5">
      <div className="flex-1">
        <h1 className="text-4xl font-bold mb-4 tracking-tighter text-white">GAMING FUEL (GF)</h1>
        <p className="text-brand-text-muted mb-8 max-w-md">Every game on LitDeX consumes GF. Claim your daily allowance to climb the leaderboard.</p>
        <div className="space-y-3 mb-8">
           <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Refill Progress</span>
              <span className="text-xs font-mono">1.4 GF / hr</span>
           </div>
           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="w-[45%] h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
           </div>
           <p className="text-[9px] text-brand-text-muted italic">Total LitDeX GF used this week: 1.2M units</p>
        </div>
        <button className="px-10 py-3 bg-white text-black rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
          Claim 24h Allocation <Plus size={16} />
        </button>
      </div>
      <div className="w-64 h-64 rounded-full border border-white/5 flex items-center justify-center relative bg-white/5 shadow-inner">
         <Gamepad2 size={80} className="text-white/40" />
      </div>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card className="overflow-hidden group h-[400px] flex flex-col">
        <div className="h-48 bg-brand-surface-2 flex items-center justify-center text-brand-teal">
          <Gamepad2 size={60} />
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="font-bold text-xl mb-2">Retro-Forge Runner</h3>
          <p className="text-xs text-brand-text-muted mb-6">Dodge gas spikes and collect LIT in this endless runner. Earn 0.1 LIT per 1000m.</p>
          <button className="mt-auto w-full py-3 border border-brand-border rounded-xl font-bold text-sm group-hover:border-brand-teal group-hover:bg-brand-teal group-hover:text-brand-bg transition-all">
            Play (50 GF)
          </button>
        </div>
      </Card>
      
      {[1, 2].map(i => (
        <Card key={i} className="overflow-hidden h-[400px] relative grayscale opacity-40">
           <div className="h-48 bg-brand-surface-2 border-b border-brand-border flex items-center justify-center">
              <span className="text-4xl">🔒</span>
           </div>
           <div className="p-6">
              <h3 className="font-bold text-xl mb-2">Coming Soon</h3>
              <p className="text-xs text-brand-text-muted">A new gaming experience is being forged in the LiteForge labs.</p>
           </div>
           <div className="absolute inset-x-8 bottom-8">
             <div className="p-4 bg-brand-surface-2 rounded-xl border border-brand-border text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-teal mb-2">Locked to Knight Tier</p>
                <div className="h-1 bg-brand-bg rounded-full">
                  <div className="h-full bg-brand-teal w-1/3" />
                </div>
             </div>
           </div>
        </Card>
      ))}
    </div>
  </motion.div>
);

// --- Page: Messenger ---
const MessengerPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 max-w-2xl mx-auto px-4">
    <Card className="p-8 text-center">
      <MessageSquare size={48} className="mx-auto mb-6 text-brand-text-muted" />
      <h1 className="text-3xl font-bold mb-4">Messenger</h1>
      <p className="text-brand-text-muted mb-8">Secure, on-chain messaging for LiteForge. Connect your wallet to view your messages.</p>
      <button className="px-8 py-3 bg-brand-teal text-brand-bg rounded-xl font-bold hover:opacity-90 transition-all">
        Connect Wallet
      </button>
    </Card>
  </motion.div>
);

// --- Page: Faucet ---
const FaucetPage = () => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto py-8 md:py-12 px-4 text-center">
    <div className="mb-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tighter">Faucet</h1>
      <p className="text-brand-text-muted text-base md:text-lg">Get 1,000 wzkLTC to test the protocol.</p>
    </div>

    <div className="bg-brand-surface border border-brand-border p-3.5 rounded-xl mb-5 flex items-center justify-between mx-auto max-w-md text-left">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
           <LogoLD size={12} className="opacity-80" />
        </div>
        <span className="text-brand-text-muted font-medium text-xs">Your wzkLTC balance</span>
      </div>
      <span className="font-bold text-xs">0 wzkLTC</span>
    </div>

    <Card className="max-w-md mx-auto py-8 px-6 flex flex-col items-center border border-white/5 bg-black/20">
      <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
         <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
           <LogoLD size={20} />
         </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-4xl font-bold tabular-nums mb-1 tracking-tight">1,000</h2>
        <p className="text-brand-text-muted font-medium text-[10px] uppercase tracking-[0.2em] opacity-50">wzkLTC per claim</p>
      </div>

      <button className="w-full py-3.5 bg-white text-black rounded-xl font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
        Claim 1,000 wzkLTC
      </button>
    </Card>
  </motion.div>
);

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
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-500">
            <LogoLD size={22} />
          </div>
          <div className="absolute -inset-1 bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <div className="flex flex-col -gap-1">
          <span className="text-lg sm:text-xl font-black tracking-tighter text-white leading-none">LitDeX</span>
          <span className="hidden sm:block text-[8px] font-bold tracking-[0.4em] text-white/40 uppercase leading-none mt-1">Ecosystem</span>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col">
        {/* Floating Tools Overlay - Handles sticking and stopping at footer */}
        <div className="absolute inset-0 pointer-events-none z-50">
          <div className="sticky top-[calc(100vh-96px)] flex justify-between items-end px-8 pointer-events-auto">
            {/* Bottom Left Tools */}
            <div className="hidden lg:flex items-center gap-3">
              <button 
                onClick={() => setActivePage('faucet')}
                className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 hover:bg-black/60 transition-all text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-xl shadow-2xl"
              >
                <Droplets size={14} className="group-hover:text-white transition-colors" />
                Faucet
              </button>
            </div>

            {/* Bottom Right Tools */}
            <div>
              <button className="relative w-14 h-14 flex items-center justify-center rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 hover:bg-black/60 transition-all text-white/60 backdrop-blur-xl shadow-2xl group">
                <Bell size={20} className="group-hover:text-white transition-colors" />
                <div className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full ring-4 ring-brand-bg shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Top Right Tools (Kept Fixed/Top for now as it doesn't collide with footer) */}
        <div className="fixed top-8 right-8 z-50 hidden lg:flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 active:scale-95 transition-all text-[9px] font-bold uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(255,255,255,0.15)]">
            <Wallet size={14} />
            Connect
          </button>
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

