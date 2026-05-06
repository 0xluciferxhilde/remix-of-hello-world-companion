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
  Eye,
  Copy,
  Download,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAccount, useChainId, useSwitchChain, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther, parseEther, formatUnits, parseUnits } from 'ethers';
import SwapCard from './components/ui/crypto-swap-card';
import { AnimatedNavFramer } from './components/ui/navigation-menu';
import { litvmChain, errMsg, LITDEX_DEPLOYER_ADDRESS, readTotalDeployed, deployTokenLitDeX, shortAddr, readDeployments, readDeployFee, readLegacyDeployFee, deployTokenLegacy, getLegacyTokenInfo, getLegacyTokensByCreator, getLegacyTotalDeployedDisplay, readPoints, readCheckinInfo, readCurrentDay, checkinToday } from './lib/litdex-core-logic';

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
          <h2 className="text-xl font-bold text-white italic">Active Liquidity</h2>
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
const PointsPage = ({ setPage }: { setPage: (p: PageID) => void }) => {
  const { address, isConnected } = useAccount();
  const [pointsData, setPointsData] = useState<{ total: bigint; daily: bigint } | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [previousPage, setPreviousPage] = useState<PageID>('swap');

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;
      setLoading(true);
      try {
        const p = await readPoints(address);
        setPointsData({ total: BigInt(p.total), daily: BigInt(p.daily) });
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

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // IST is UTC+5:30. Reset at 00:00 IST = 18:30 UTC.
      const nextReset = new Date(now);
      nextReset.setUTCHours(18, 30, 0, 0);
      if (now.getTime() >= nextReset.getTime()) {
        nextReset.setUTCDate(nextReset.getUTCDate() + 1);
      }
      
      const diff = nextReset.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalPoints = pointsData ? Number(pointsData.total) : 0;
  const dailyDeploy = pointsData ? Number(pointsData.daily) : 0;
  const deployCap = 100;
  const progress = (dailyDeploy / deployCap) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto py-12 px-6">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Trophy size={14} />
          </div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-[0.3em] text-white">Points Dashboard</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-white/40 animate-pulse" />
              <span className="text-[10px] text-brand-text-muted font-medium uppercase tracking-widest">Network Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Card */}
      <Card className="p-10 mb-12 bg-black/60 border-white/10 backdrop-blur-3xl relative overflow-hidden group shadow-[0_0_80px_rgba(0,0,0,0.5)] border-2">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />
        
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest rounded border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                Accumulated Points
              </span>
            </div>
            <div className="text-8xl font-black text-white tracking-tighter leading-none select-none filter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {loading ? (
                <span className="opacity-10">0000</span>
              ) : (
                <motion.span
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 20 }}
                >
                  {totalPoints.toLocaleString()}
                </motion.span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
             <div className="px-6 py-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-all backdrop-blur-md">
                <div className="text-[9px] font-bold text-brand-text-muted uppercase tracking-[0.2em] mb-2 flex items-center justify-between">
                  Daily Quota
                  <Rocket size={10} className="text-white/40" />
                </div>
                <div className="font-bold text-white text-xl tracking-tight">
                  {dailyDeploy} <span className="text-xs text-white/20 font-medium">/ 100</span>
                </div>
             </div>
             <div className="px-6 py-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-all backdrop-blur-md">
                <div className="text-[9px] font-bold text-brand-text-muted uppercase tracking-[0.2em] mb-2 flex items-center justify-between">
                  Incentive
                  <CalendarCheck size={10} className="text-white/40" />
                </div>
                <div className="font-bold text-white text-xl tracking-tight">
                  +10 <span className="text-xs text-white/20 font-medium">/ 24h</span>
                </div>
             </div>
          </div>
        </div>

        {/* Progress System */}
        <div className="mt-16 space-y-6 relative z-10">
           <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-1">Network Deployment Quota</div>
                <div className="text-[9px] text-brand-text-muted uppercase tracking-[0.2em] font-medium">Reset protocol active in {timeLeft}</div>
              </div>
           </div>
           <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-white/10 via-white/40 to-white/10 relative group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-shadow"
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
              </motion.div>
           </div>
           <div className="flex items-center gap-5">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                <p className="text-[10px] text-brand-text-muted font-mono uppercase tracking-[0.2em]">
                  Active: {dailyDeploy}/100 Units
                </p>
             </div>
           </div>
        </div>
      </Card>


      {/* How to Earn Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-xl">
                <Trophy size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-white tracking-tight italic">Protocol Missions</h2>
                <p className="text-[10px] text-brand-text-muted uppercase font-bold tracking-[0.3em] mt-1">Complete tasks to increase network yield</p>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Check-in Card */}
           <Card 
            onClick={() => setPage('checkin')}
            className="p-8 bg-black/40 border-white/5 hover:border-white/20 transition-all group flex flex-col justify-between h-56 cursor-pointer relative overflow-hidden backdrop-blur-xl"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-white/5 transition-colors" />
              
              <div className="flex gap-6 relative z-10">
                 <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white shadow-xl group-hover:border-white/30 transition-all">
                    <CalendarCheck size={28} />
                 </div>
                 <div className="pt-2">
                    <h4 className="text-lg font-bold text-white tracking-tight">Daily Check-in</h4>
                    <p className="text-[11px] text-brand-text-muted mt-2 leading-relaxed font-medium">Verify your network presence daily to receive a base incentive.</p>
                 </div>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                    +10 PTS
                  </div>
                  <span className="text-[9px] text-brand-text-muted uppercase font-bold tracking-widest">Daily Limit: 1/1</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-[0.2em] transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                   Initialize <ArrowRight size={14} />
                </div>
              </div>
           </Card>

           {/* Deploy Card */}
           <Card 
            onClick={() => setPage('deploy')}
            className="p-8 bg-black/40 border-white/5 hover:border-white/20 transition-all group flex flex-col justify-between h-56 cursor-pointer relative overflow-hidden backdrop-blur-xl"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-white/5 transition-colors" />
              
              <div className="flex gap-6 relative z-10">
                 <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white shadow-xl group-hover:border-white/30 transition-all">
                    <Rocket size={28} />
                 </div>
                 <div className="pt-2">
                    <h4 className="text-lg font-bold text-white tracking-tight">Contract Deployment</h4>
                    <p className="text-[11px] text-brand-text-muted mt-2 leading-relaxed font-medium">Execute heavy network operations by launching tokens or factories.</p>
                 </div>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                    +5 PTS
                  </div>
                  <span className="text-[9px] text-brand-text-muted uppercase font-bold tracking-widest">Daily Limit: 100 PTS</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-[0.2em] transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                   Command <ArrowRight size={14} />
                </div>
              </div>
           </Card>

           {/* Social Quest Card */}
           <Card 
            onClick={() => setPage('quests')}
            className="p-8 bg-black/40 border-white/5 hover:border-white/20 transition-all group flex flex-col justify-between h-56 cursor-pointer relative overflow-hidden backdrop-blur-xl"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-white/5 transition-colors" />
              
              <div className="flex gap-6 relative z-10">
                 <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white shadow-xl group-hover:border-white/30 transition-all">
                    <Sparkles size={28} />
                 </div>
                 <div className="pt-2">
                    <h4 className="text-lg font-bold text-white tracking-tight">Social Expansion</h4>
                    <p className="text-[11px] text-brand-text-muted mt-2 leading-relaxed font-medium">Propagate protocol awareness through community engagement.</p>
                 </div>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                    VAR PTS
                  </div>
                  <span className="text-[9px] text-brand-text-muted uppercase font-bold tracking-widest">Quest Based</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-[0.2em] transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                   Engage <ArrowRight size={14} />
                </div>
              </div>
           </Card>

           {/* On-chain Msg Card */}
           <Card 
            onClick={() => setPage('messenger')}
            className="p-8 bg-black/40 border-white/5 hover:border-white/20 transition-all group flex flex-col justify-between h-56 cursor-pointer relative overflow-hidden backdrop-blur-xl"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-white/5 transition-colors" />
              
              <div className="flex gap-6 relative z-10">
                 <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white shadow-xl group-hover:border-white/30 transition-all">
                    <MessageSquare size={28} />
                 </div>
                 <div className="pt-2">
                    <h4 className="text-lg font-bold text-white tracking-tight">On-chain Communication</h4>
                    <p className="text-[11px] text-brand-text-muted mt-2 leading-relaxed font-medium">Transmit peer-to-peer data directly within the protocol.</p>
                 </div>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                    +2 PTS
                  </div>
                  <span className="text-[9px] text-brand-text-muted uppercase font-bold tracking-widest">Daily Limit: 20 PTS</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-[0.2em] transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                   Transmit <ArrowRight size={14} />
                </div>
              </div>
           </Card>
        </div>
      </div>
    </motion.div>
  );
};

// --- Page: Check-in ---
const CheckinPage = () => {
  const { address, isConnected } = useAccount();
  const [info, setInfo] = useState<any>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [successMsg, setSuccessMsg] = useState<{ ldex: string, pts: number, zkLTC?: string, hash?: string } | null>(null);
  const [checkinError, setCheckinError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [i, d] = await Promise.all([
        readCheckinInfo(address),
        readCurrentDay()
      ]);
      setInfo({
        streak: Number(i.streak),
        lastDay: Number(i.lastDay),
        totalCheckins: Number(i.totalCheckins),
        nextLDEX: i.nextLDEX
      });
      setCurrentDay(Number(d));
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
    if (!address || checkingIn) return;
    setCheckingIn(true);
    setSuccessMsg(null);
    setCheckinError(null);
    try {
      const hash = await checkinToday();
      alert("Txn check-in successful check txn hash");
      const newInfo = await readCheckinInfo(address);
      
      const ldexVal = formatEther(newInfo.nextLDEX);
      
      let zkLTCBonus = "";
      const now = new Date();
      // IST is UTC+5.5. So 18:30 UTC is 00:00 IST.
      // JS Date getUTCDay() for 18:30+ UTC might be different.
      // Let's use IST day.
      const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      if (istDate.getUTCDay() === 0) { // Sunday
        const dayOfMonth = istDate.getUTCDate();
        const week = Math.ceil(dayOfMonth / 7);
        if (week === 1) zkLTCBonus = "0.001";
        else if (week === 2) zkLTCBonus = "0.05";
        else if (week === 3) zkLTCBonus = "0.01";
        else if (week === 4) zkLTCBonus = "0.1";
      }

      setSuccessMsg({ 
        ldex: ldexVal, 
        pts: 10,
        zkLTC: zkLTCBonus || undefined,
        hash
      });
      
      setInfo({
        streak: Number(newInfo.streak),
        lastDay: Number(newInfo.lastDay),
        totalCheckins: Number(newInfo.totalCheckins),
        nextLDEX: newInfo.nextLDEX
      });
    } catch (err: any) {
      console.error(err);
      const msg = err.message || err.toString() || "";
      if (msg.toLowerCase().includes("rejected") || msg.toLowerCase().includes("user denied")) {
        setCheckinError("User Rejected");
      } else {
        setCheckinError(errMsg(err));
      }
    } finally {
      setCheckingIn(false);
    }
  };

  const isTodayChecked = info && info.lastDay === currentDay;
  const streak = info ? info.streak : 0;
  
  // Calculate Sunday bonus info for display
  let nextSundayBonus = "";
  const now = new Date();
  const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  if (istDate.getUTCDay() === 0) { // It is Sunday
    const dayOfMonth = istDate.getUTCDate();
    const week = Math.ceil(dayOfMonth / 7);
    if (week === 1) nextSundayBonus = "0.001 zkLTC";
    else if (week === 2) nextSundayBonus = "0.05 zkLTC";
    else if (week === 3) nextSundayBonus = "0.01 zkLTC";
    else if (week === 4) nextSundayBonus = "0.1 zkLTC";
  }

  // Calendar logic
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIST = istDate.getUTCDay(); // 0 is Sunday, 1 is Monday
  const todayIdx = todayIST === 0 ? 6 : todayIST - 1; 

  const calendar = weekDays.map((name, idx) => {
    const isToday = idx === todayIdx;
    const isPast = idx < todayIdx;
    
    let status: 'checked' | 'missed' | 'pending' | 'future' = 'future';
    
    if (isToday) {
      status = isTodayChecked ? 'checked' : 'pending';
    } else if (isPast) {
      const daysAgo = todayIdx - idx;
      if (isTodayChecked) {
        status = daysAgo < streak ? 'checked' : 'missed';
      } else {
        // Today not checked, so streak was broken if daysAgo > streak
        status = daysAgo <= streak && streak > 0 ? 'checked' : 'missed';
      }
    }

    return { name, isToday, status };
  });

  return (
    <div className="max-w-xl mx-auto py-4 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-black text-white tracking-tighter mb-2 italic uppercase leading-none">Daily Forge</h1>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-4 bg-white/20" />
          <p className="text-white/40 font-bold tracking-[0.3em] uppercase text-[7px]">Protocol Authentication & Yield Mission</p>
          <div className="h-px w-4 bg-white/20" />
        </div>
      </motion.div>

      <div className="relative max-w-xl mx-auto">
        {/* Next Reward Badge */}
        {!isTodayChecked && info && (
          <div className="absolute lg:-right-6 lg:top-0 lg:translate-x-full -top-20 right-0 z-20 w-44">
            <div className="px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col items-start backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_white]" />
                <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em]">Next Reward</span>
              </div>
              <div className="text-2xl font-black text-white tracking-tighter leading-none">
                {Number(formatEther(info.nextLDEX)).toFixed(0)} <span className="text-[10px] text-white/70 font-bold uppercase ml-1.5 tracking-tighter">LDEX</span>
              </div>
              {nextSundayBonus && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 w-full">
                  <Sparkles size={10} className="text-white/20" />
                  <span className="text-[7px] font-bold text-white/40 uppercase tracking-[0.1em]">Sunday Multiplier Active</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Card className="bg-black/60 border-white/10 p-5 relative overflow-hidden backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)] border-2">

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 mb-6 relative z-10">
          {calendar.map((day, i) => (
            <div key={i} className="space-y-1.5">
              <div className="text-[7px] font-black text-white/20 uppercase tracking-[0.1em] text-center">{day.name}</div>
              <motion.div
                animate={day.isToday && day.status === 'pending' ? {
                  borderColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.1)'],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  "aspect-[4/5] rounded-md border flex flex-col items-center justify-center relative transition-all duration-500",
                  day.status === 'checked' && "bg-white/10 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]",
                  day.status === 'missed' && "bg-white/[0.02] border-white/5 text-white/10",
                  day.status === 'pending' && "bg-white/[0.05] border-white/20 text-white/50",
                  day.status === 'future' && "bg-white/[0.01] border-white/5 text-white/5"
                )}
              >
                {day.status === 'checked' ? (
                  <ListChecks size={14} className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                ) : day.status === 'missed' ? (
                  <X size={12} className="opacity-20" />
                ) : (
                  <span className="text-[8px] font-mono opacity-20">{i + 1}</span>
                )}
                
                {day.isToday && (
                  <div className="absolute -top-0.5 -right-0.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white] animate-pulse" />
                  </div>
                )}
              </motion.div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-5 relative z-10">
          <div className="text-center">
            <AnimatePresence>
              {checkinError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-2"
                >
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] animate-pulse">
                    {checkinError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="text-5xl font-black text-white tracking-tighter leading-none select-none filter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {loading ? "..." : streak}
            </div>
            <div className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em] mt-1 ml-1">Day Streak Active</div>
          </div>

          <motion.button
            whileHover={!isTodayChecked && !checkingIn ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,1)' } : {}}
            whileTap={!isTodayChecked && !checkingIn ? { scale: 0.98 } : {}}
            disabled={isTodayChecked || checkingIn || !isConnected}
            onClick={handleCheckin}
            className={cn(
              "w-full max-w-xs py-3 rounded-lg font-black text-[10px] uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-2 border-2",
              isTodayChecked 
                ? "bg-white/5 border-white/10 text-white/20 cursor-default" 
                : "bg-white/90 text-black border-white shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
            )}
          >
            {checkingIn ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-1.5 border-black/20 border-t-black rounded-full animate-spin" />
                Auth...
              </div>
            ) : isTodayChecked ? (
              <>Confirmed <ListChecks size={12} /></>
            ) : (
              <>Confirm Check-in <ArrowRight size={12} /></>
            )}
          </motion.button>
        </div>

        {/* Footer info inside the card */}
        <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-40">
           <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Trophy size={12} />
              </div>
              <p className="text-[7px] uppercase font-bold tracking-widest leading-tight">
                Yield Mission: +10 Pts (Fixed) & scaling LDEX yield per streak day.
              </p>
           </div>
           <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Sparkles size={12} />
              </div>
              <p className="text-[7px] uppercase font-bold tracking-widest leading-tight">
                Elite Bonus: Guaranteed Sunday zkLTC. Points are separate from daily cap.
              </p>
           </div>
        </div>
      </Card>
      </div>

      {/* Floating Success Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 right-10 z-50 bg-white text-black p-8 rounded-3xl shadow-[0_30px_100px_rgba(255,255,255,0.2)] max-w-sm border-4 border-black/5"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center">
                <Trophy size={24} />
              </div>
              <div>
                <div className="font-black uppercase tracking-tighter text-lg">Mission Success</div>
                <div className="text-[9px] font-bold uppercase tracking-widest opacity-40">Protocol Verification Complete</div>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-black/5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="opacity-40 uppercase tracking-widest">Base Points</span>
                <span>+{successMsg.pts} PTS</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="opacity-40 uppercase tracking-widest">Incentive Yield</span>
                <span>+{Number(successMsg.ldex).toLocaleString()} LDEX</span>
              </div>
              {successMsg.zkLTC && (
                <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                  <span className="opacity-40 uppercase tracking-widest">Sunday Bonus</span>
                  <span>+{successMsg.zkLTC} zkLTC 🎁</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const [totalDeployed, setTotalDeployed] = useState<number | null>(null);

  const types = [
    { id: 'erc20', name: 'ERC20 Token', icon: Coins },
    { id: 'nft', name: 'NFT (ERC721)', icon: ImageIcon },
    { id: 'staking', name: 'Staking', icon: Lock },
    { id: 'vesting', name: 'Vesting', icon: Clock },
    { id: 'factory', name: 'Token Factory', icon: Hammer },
  ];

  const fetchData = async () => {
    try {
      const count = await readTotalDeployed();
      setTotalDeployed(count);
    } catch (err) {
      console.error("Failed to read total deployed", err);
    }
  };

  const fetchHistory = async () => {
    if (!address) return;
    setLoadingHistory(true);
    try {
      const data = await readDeployments(address);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (isConnected && address) {
      fetchHistory();
    }
  }, [isConnected, address]);

  const renderDeployForm = () => {
    switch (selectedType) {
      case 'erc20': return <ERC20Form onDeployed={() => { fetchHistory(); fetchData(); }} />;
      case 'nft': return <NFTForm onDeployed={fetchHistory} />;
      case 'staking': return <StakingForm onDeployed={fetchHistory} />;
      case 'vesting': return <VestingForm onDeployed={fetchHistory} />;
      case 'factory': return <TokenFactoryForm onDeployed={fetchHistory} />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-12 px-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <Card className="p-6 bg-white/[0.03] border-white/10 backdrop-blur-xl">
          <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-[0.2em] mb-2">Total Deployed</p>
          <h3 className="text-4xl font-black text-white italic tracking-tighter">
            {totalDeployed ?? "..."}
          </h3>
        </Card>
        <Card className="p-6 bg-white/[0.03] border-white/10 backdrop-blur-xl">
          <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-[0.2em] mb-2">Deployer</p>
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs text-white opacity-80">{shortAddr(LITDEX_DEPLOYER_ADDRESS)}</h3>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(LITDEX_DEPLOYER_ADDRESS);
                alert("Copied!");
              }}
              className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10"
            >
              <Layers size={14} className="text-white/60" />
            </button>
          </div>
        </Card>
      </div>

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
            className="pb-24"
          >
            {renderDeployForm()}
          </motion.div>
        </AnimatePresence>

            <Card className="p-8 bg-black/40 border-white/5 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-white/10 rounded-lg text-white">
                    <Layers size={18} />
                 </div>
                 <div>
                    <h3 className="font-bold text-white italic">Deployed Contracts</h3>
                    <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-bold">Manage your projects</p>
                 </div>
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
                     <p className="text-xs font-bold text-white uppercase">{h.label || "Contract"}</p>
                     <p className="text-[10px] text-brand-text-muted font-mono">{shortAddr(h.contractAddress)}</p>
                   </div>
                   <a href={`${litvmChain.blockExplorers.default.url}/address/${h.contractAddress}`} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-all">
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

const FormContainer = ({ title, subtitle, icon: Icon, children, deployFee = "0.05", actionLabel = "Deploy", onAction = () => {}, loading = false, onPreviewSource }: any) => (
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
       {onPreviewSource && (
         <button 
          onClick={onPreviewSource}
          className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-all uppercase tracking-widest"
         >
           <Eye size={16} /> Preview Source
         </button>
       )}
       <button 
        onClick={onAction}
        disabled={loading}
        className={cn(
          "flex items-center justify-center gap-2 py-4 bg-white text-black rounded-xl font-bold text-sm hover:opacity-90 transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-50",
          !onPreviewSource && "md:col-span-2"
        )}
       >
         <Rocket size={16} /> {loading ? "Deploying..." : actionLabel.includes('(') ? actionLabel : `${actionLabel || "Deploy"} (${deployFee} zkLTC)`}
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
  const { address } = useAccount();
  const [step, setStep] = useState<'basics' | 'features' | 'review'>('basics');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('1000000');
  const [decimals, setDecimals] = useState('18');
  const [mintable, setMintable] = useState(true);
  const [burnable, setBurnable] = useState(true);
  const [pausable, setPausable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<"success" | "failed" | null>(null);

  const handleDeploy = async () => {
    if (!name || !symbol || !supply) return alert("Fill all fields");
    if (!address) return alert("Connect wallet first");

    setLoading(true);
    setTxStatus(null);
    setTxHash(null);
    try {
      const result = await deployTokenLitDeX({
        name,
        symbol,
        totalSupply: supply
      });

      setTxHash(result.txHash);
      setTxStatus("success");

      // Points API Integration
      try {
        await fetch("https://api.test-hub.xyz/quest/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: address,
            questId: "deploy_" + result.txHash.slice(0, 10).toLowerCase()
          })
        });
      } catch (e) {
        console.warn("Points API failed", e);
      }

      onDeployed?.();
    } catch (err) {
      console.error("Deploy error:", err);
      setTxStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'basics':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Token Basics</h2>
              <p className="text-sm text-brand-text-muted">Define the core parameters of your token.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField 
                label="Token Name" 
                placeholder="My Awesome Token" 
                helper="Max 50 characters — appears in wallets"
                value={name} 
                onChange={setName} 
              />
              <InputField 
                label="Token Symbol" 
                placeholder="MAT" 
                helper="e.g. MAT — appears on DEXes"
                value={symbol} 
                onChange={setSymbol} 
              />
              <InputField 
                label="Total Supply" 
                placeholder="1000000" 
                helper="1,000,000 tokens"
                value={supply} 
                onChange={setSupply} 
              />
              <InputField 
                label="Decimals" 
                placeholder="18" 
                helper="18 decimals is standard for most tokens"
                value={decimals} 
                onChange={setDecimals} 
              />
            </div>
            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setStep('features')}
                className="flex items-center gap-2 px-8 py-4 bg-brand-surface-2 border border-white/5 rounded-xl text-white font-bold hover:bg-white/10 transition-all uppercase text-xs tracking-widest"
              >
                Next <ArrowLeftRight size={14} className="rotate-180" />
              </button>
            </div>
          </div>
        );
      case 'features':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Token Features</h2>
              <p className="text-sm text-brand-text-muted">Configure optional capabilities for your token.</p>
            </div>
            <div className="space-y-4">
              <ToggleField 
                label="Mintable" 
                desc="Owner can create additional tokens after launch" 
                active={mintable}
                onToggle={() => setMintable(!mintable)}
              />
              <ToggleField 
                label="Burnable" 
                desc="Token holders can permanently destroy their tokens" 
                active={burnable}
                onToggle={() => setBurnable(!burnable)}
              />
              <ToggleField 
                label="Pausable" 
                desc="Owner can pause all token transfers in an emergency" 
                active={pausable}
                onToggle={() => setPausable(!pausable)}
              />
            </div>
            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep('basics')}
                className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-brand-text-muted font-bold hover:bg-white/10 transition-all uppercase text-xs tracking-widest"
              >
                <ArrowLeftRight size={14} /> Back
              </button>
              <button 
                onClick={() => setStep('review')}
                className="flex items-center gap-2 px-8 py-4 bg-brand-surface-2 border border-white/5 rounded-xl text-white font-bold hover:bg-white/10 transition-all uppercase text-xs tracking-widest"
              >
                Next <ArrowLeftRight size={14} className="rotate-180" />
              </button>
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Review & Deploy</h2>
              <p className="text-sm text-brand-text-muted">Confirm your token configuration before deploying.</p>
            </div>
            
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden text-sm">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-brand-text-muted font-bold uppercase text-[10px] tracking-widest">Token Name</span>
                <span className="text-white font-bold">{name || "Unnamed"}</span>
              </div>
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-brand-text-muted font-bold uppercase text-[10px] tracking-widest">Symbol</span>
                <span className="text-white font-bold">{symbol || "NONE"}</span>
              </div>
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-brand-text-muted font-bold uppercase text-[10px] tracking-widest">Total Supply</span>
                <span className="text-white font-bold">{supply ? parseInt(supply).toLocaleString() : "0"}</span>
              </div>
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-brand-text-muted font-bold uppercase text-[10px] tracking-widest">Decimals</span>
                <span className="text-white font-bold">{decimals}</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-brand-text-muted font-bold uppercase text-[10px] tracking-widest">Features</span>
                <div className="flex gap-2">
                  {mintable && <span className="text-[8px] font-bold px-2 py-0.5 bg-white/10 text-white rounded uppercase">Mintable</span>}
                  {burnable && <span className="text-[8px] font-bold px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded uppercase">Burnable</span>}
                  {pausable && <span className="text-[8px] font-bold px-2 py-0.5 bg-white/10 text-white rounded uppercase">Pausable</span>}
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Points Reward</p>
                <h4 className="text-2xl font-black text-white mt-1">+5 points</h4>
              </div>
              <Coins className="text-white opacity-20" size={32} />
            </div>

            {txStatus && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest text-center",
                  txStatus === "success" 
                    ? "bg-white/5 border-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
                    : "bg-white/5 border-red-900/30 text-red-400/80"
                )}
              >
                {txStatus === "success" ? "Token Deployed Successfully" : "Deployment Failed"}
                {txHash && (
                  <a 
                    href={`${litvmChain.blockExplorers.default.url}/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block mt-1 underline opacity-50 hover:opacity-100 transition-opacity"
                  >
                    View Transaction on Explorer
                  </a>
                )}
              </motion.div>
            )}

            <button 
              onClick={handleDeploy}
              disabled={loading}
              className="w-full py-5 bg-white text-black rounded-2xl font-bold text-base hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Rocket size={20} /> {loading ? "Deploying..." : "Deploy Token"}
            </button>

            <div className="text-center space-y-2">
              <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">0.05 zkLTC fee per deploy</p>
              <div className="flex items-center justify-center gap-2 text-white/50">
                <Sparkles size={12} />
                <span className="text-[9px] font-bold uppercase tracking-widest">+5 points earned automatically (10/100 today)</span>
              </div>
              <p className="text-[9px] text-brand-text-muted italic opacity-60">
                Deploys via LitDeXDeployer • points credited automatically by relayer.
              </p>
            </div>

            <div className="flex justify-start">
              <button 
                onClick={() => setStep('features')}
                className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-brand-text-muted font-bold hover:bg-white/10 transition-all uppercase text-xs tracking-widest"
              >
                <ArrowLeftRight size={14} /> Back
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2 p-8 bg-black/40 border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col">
        {/* Progress Header */}
        <div className="flex items-center gap-4 mb-12">
          {[
            { id: 'basics', label: 'Token Basics', step: 1 },
            { id: 'features', label: 'Features', step: 2 },
            { id: 'review', label: 'Review & Deploy', step: 3 }
          ].map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border",
                  step === s.id 
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                    : i < ['basics', 'features', 'review'].indexOf(step)
                      ? "bg-brand-surface-2 border-white/20 text-white"
                      : "bg-white/5 border-white/10 text-brand-text-muted"
                )}>
                  {i < ['basics', 'features', 'review'].indexOf(step) ? <ListChecks size={14} /> : s.step}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-colors",
                  step === s.id ? "text-white" : "text-brand-text-muted"
                )}>{s.label}</span>
              </div>
              {i < 2 && <div className="w-12 h-[1px] bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1">
          {renderStep()}
        </div>
      </Card>

      {/* Live Preview Sidebar */}
      <Card className="p-8 bg-black/40 border-white/5 backdrop-blur-3xl shadow-2xl h-fit sticky top-24">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Live Preview</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-brand-teal/20 border-2 border-brand-teal/30 flex items-center justify-center text-brand-teal shadow-[0_0_40px_rgba(79,209,197,0.15)] mb-6 group relative overflow-hidden">
             <div className="absolute inset-0 bg-brand-teal animate-pulse opacity-10" />
             <span className="text-4xl font-black italic select-none">
               {symbol ? symbol[0].toUpperCase() : "?"}
             </span>
          </div>
          
          <h3 className="text-2xl font-black text-white italic tracking-tighter mb-1 select-none">
            {name || "Token Name"}
          </h3>
          <p className="text-xs font-bold text-brand-teal uppercase tracking-[0.3em] select-none">
            {symbol || "SYMBOL"}
          </p>

          <div className="w-full h-[1px] bg-white/5 my-8" />

          <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Total Supply</span>
              <span className="text-xs font-mono text-white select-none">
                {supply ? parseInt(supply).toLocaleString() : "0"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Decimals</span>
              <span className="text-xs font-mono text-white select-none">{decimals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Standard</span>
              <span className="text-xs font-mono text-white select-none">ERC-20</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-8 w-full">
            <span className={cn("text-[8px] font-bold px-2 py-1 rounded border transition-all uppercase tracking-widest", mintable ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/5 text-white/10")}>Mintable</span>
            <span className={cn("text-[8px] font-bold px-2 py-1 rounded border transition-all uppercase tracking-widest", burnable ? "bg-brand-teal/10 border-brand-teal/20 text-brand-teal" : "bg-white/5 border-white/5 text-white/10")}>Burnable</span>
            <span className={cn("text-[8px] font-bold px-2 py-1 rounded border transition-all uppercase tracking-widest", pausable ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/5 text-white/10")}>Pausable</span>
          </div>

          <div className="mt-12 w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-white/40" />
             <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Deploying to <span className="text-white">LitVM Testnet</span></span>
          </div>
        </div>
      </Card>
    </div>
  );
};

const NFTForm = ({ onDeployed }: any) => {
  const { address } = useAccount();
  const [step, setStep] = useState<'basics' | 'features' | 'review'>('basics');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [maxSupply, setMaxSupply] = useState('10000');
  const [mintPrice, setMintPrice] = useState('0.05');
  const [maxPerWallet, setMaxPerWallet] = useState('5');
  const [baseURI, setBaseURI] = useState('https://api.example.xyz/meta/');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<"success" | "failed" | null>(null);
  const [showSource, setShowSource] = useState(false);

  const generateSource = () => {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ================================================================
 *  ${name || "Unnamed"} (${symbol || "NFT"}) | Max: ${maxSupply || "0"} | Price: ${mintPrice || "0"} zkLTC
 *  LitVM LiteForge  |  Chain 4441  |  https://api.republicstats.xyz/litvm/rpc
 * ================================================================
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = ${maxSupply || "0"};
    uint256 public mintPrice = ${parseFloat(mintPrice || "0")} ether;
    uint256 public maxPerWallet = ${maxPerWallet || "0"};
    uint256 private _total;
    bool public saleActive;
    mapping(address => uint256) public minted;
    string private _base;

    constructor() ERC721("${name || "Unnamed"}", "${symbol || "NFT"}") Ownable(msg.sender) {
        _base = "${baseURI || "https://api.example.xyz/meta/"}";
    }

    function mint(uint256 qty) external payable {
        require(saleActive, "Sale off");
        require(_total + qty <= MAX_SUPPLY, "Exceeds supply");
        require(minted[msg.sender] + qty <= maxPerWallet, "Wallet limit");
        require(msg.value >= mintPrice * qty, "Not enough zkLTC");
        minted[msg.sender] += qty;
        for (uint256 i = 0; i < qty; i++) { 
          _total++; 
          _safeMint(msg.sender, _total); 
        }
    }

    function ownerMint(address to, uint256 qty) external onlyOwner {
        require(_total + qty <= MAX_SUPPLY, "Exceeds supply");
        for (uint256 i = 0; i < qty; i++) { 
          _total++; 
          _safeMint(to, _total); 
        }
    }

    function totalSupply() public view returns (uint256) { return _total; }
    function setSaleActive(bool val) external onlyOwner { saleActive = val; }
    function setMintPrice(uint256 p) external onlyOwner { mintPrice = p; }
    function setBaseURI(string calldata uri_) external onlyOwner { _base = uri_; }

    function tokenURI(uint256 id) public view override returns (string memory) {
        require(_ownerOf(id) != address(0), "Nonexistent");
        return string(abi.encodePacked(_base, id.toString(), ".json"));
    }

    function withdraw() external onlyOwner {
        (bool ok,) = owner().call{value: address(this).balance}("");
        require(ok, "Withdraw fail");
    }
}`;
  };

  const handleDeploy = async () => {
    if (!name || !symbol || !maxSupply) return alert("Fill all fields");
    if (!address) return alert("Connect wallet first");

    setLoading(true);
    setTxStatus(null);
    setTxHash(null);
    try {
      const { deployNFTLitDeX } = await import('./lib/litdex-core-logic');
      const result = await deployNFTLitDeX({
        name,
        symbol,
        maxSupply: parseInt(maxSupply),
        mintPrice: parseEther(mintPrice),
        baseURI
      });

      setTxHash(result.txHash);
      setTxStatus("success");
      onDeployed?.();
    } catch (err) {
      console.error("Deploy error:", err);
      setTxStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'basics':
        return (
          <div className="space-y-6 text-left">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Collection Basics</h2>
              <p className="text-sm text-brand-text-muted">Define the identity of your NFT collection.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField 
                label="Collection Name" 
                placeholder="e.g. LitVM Punks" 
                helper="Max 32 characters"
                value={name} 
                onChange={setName} 
              />
              <InputField 
                label="Symbol" 
                placeholder="e.g. LVRP" 
                helper="Short identifier (3-5 chars)"
                value={symbol} 
                onChange={setSymbol} 
              />
              <InputField 
                label="Max Supply" 
                placeholder="10000" 
                helper="Maximum NFTs that can ever exist"
                value={maxSupply} 
                onChange={setMaxSupply} 
              />
              <InputField 
                label="Mint Price (zkLTC)" 
                placeholder="0.05" 
                helper="Price per NFT mint"
                value={mintPrice} 
                onChange={setMintPrice} 
              />
            </div>
            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setStep('features')}
                className="flex items-center gap-2 px-8 py-4 bg-brand-surface-2 border border-white/5 rounded-xl text-white font-bold hover:bg-white/10 transition-all uppercase text-xs tracking-widest"
              >
                Next <ArrowLeftRight size={14} className="rotate-180" />
              </button>
            </div>
          </div>
        );
      case 'features':
        return (
          <div className="space-y-6 text-left">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Advanced Settings</h2>
              <p className="text-sm text-brand-text-muted">Configure metadata and minting limits.</p>
            </div>
            <div className="space-y-6">
              <InputField 
                label="Base URI" 
                placeholder="https://api.example.xyz/meta/" 
                helper="Metadata folder — token URls become {baseURI}{tokenId}.json"
                value={baseURI} 
                onChange={setBaseURI} 
              />
              <InputField 
                label="Max Per Wallet" 
                placeholder="5" 
                helper="Anti-whale limit per address"
                value={maxPerWallet} 
                onChange={setMaxPerWallet} 
              />
            </div>
            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep('basics')}
                className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-brand-text-muted font-bold hover:bg-white/10 transition-all uppercase text-xs tracking-widest"
              >
                <ArrowLeftRight size={14} /> Back
              </button>
              <button 
                onClick={() => setStep('review')}
                className="flex items-center gap-2 px-8 py-4 bg-brand-surface-2 border border-white/5 rounded-xl text-white font-bold hover:bg-white/10 transition-all uppercase text-xs tracking-widest"
              >
                Next <ArrowLeftRight size={14} className="rotate-180" />
              </button>
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="space-y-6 text-left">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Review & Deploy</h2>
              <p className="text-sm text-brand-text-muted">Confirm your NFT configuration before deploying.</p>
            </div>
            
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden text-sm">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-brand-text-muted font-bold uppercase text-[10px] tracking-widest">Collection</span>
                <span className="text-white font-bold">{name || "Unnamed"}</span>
              </div>
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-brand-text-muted font-bold uppercase text-[10px] tracking-widest">Symbol</span>
                <span className="text-white font-bold">{symbol || "NONE"}</span>
              </div>
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-brand-text-muted font-bold uppercase text-[10px] tracking-widest">Max Supply</span>
                <span className="text-white font-bold">{maxSupply ? parseInt(maxSupply).toLocaleString() : "0"}</span>
              </div>
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-brand-text-muted font-bold uppercase text-[10px] tracking-widest">Mint Price</span>
                <span className="text-white font-bold">{mintPrice} zkLTC</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-brand-text-muted font-bold uppercase text-[10px] tracking-widest">Features</span>
                <div className="flex gap-2">
                  <span className="text-[8px] font-bold px-2 py-0.5 bg-white/10 text-white rounded uppercase">Mintable</span>
                  <span className="text-[8px] font-bold px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded uppercase">Burnable</span>
                </div>
              </div>
            </div>

            {txStatus && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest text-center",
                  txStatus === "success" 
                    ? "bg-white/5 border-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
                    : "bg-white/5 border-white/5 text-red-500/60"
                )}
              >
                {txStatus === "success" ? "NFT Collection Deployed" : "Process Interrupted"}
                {txHash && (
                  <a 
                    href={`${litvmChain.blockExplorers.default.url}/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block mt-1 underline opacity-50 hover:opacity-100 transition-opacity"
                  >
                    View Transaction on Explorer
                  </a>
                )}
              </motion.div>
            )}

            <button 
              onClick={handleDeploy}
              disabled={loading}
              className="w-full py-5 bg-white text-black rounded-2xl font-bold text-base hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Rocket size={20} /> {loading ? "Deploying..." : "Deploy Collection"}
            </button>

            <div className="flex justify-start">
              <button 
                onClick={() => setStep('features')}
                className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-brand-text-muted font-bold hover:bg-white/10 transition-all uppercase text-xs tracking-widest"
              >
                <ArrowLeftRight size={14} /> Back
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 bg-black/40 border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col">
          {/* Progress Header */}
          <div className="flex items-center gap-4 mb-12">
            {[
              { id: 'basics', label: 'Basics', step: 1 },
              { id: 'features', label: 'Advanced', step: 2 },
              { id: 'review', label: 'Review', step: 3 }
            ].map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border",
                    step === s.id 
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                      : i < ['basics', 'features', 'review'].indexOf(step)
                        ? "bg-brand-surface-2 border-white/20 text-white"
                        : "bg-white/5 border-white/10 text-brand-text-muted"
                  )}>
                    {i < ['basics', 'features', 'review'].indexOf(step) ? <ListChecks size={14} /> : s.step}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest transition-colors",
                    step === s.id ? "text-white" : "text-brand-text-muted"
                  )}>{s.label}</span>
                </div>
                {i < 2 && <div className="w-12 h-[1px] bg-white/10" />}
              </React.Fragment>
            ))}
          </div>

          <div className="flex-1">
            {renderStep()}
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
             <button 
               onClick={() => setShowSource(!showSource)}
               className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-brand-text-muted font-bold hover:bg-white/10 transition-all uppercase text-[10px] tracking-widest"
             >
               <Eye size={14} /> {showSource ? "Hide Source" : "Preview Source"}
             </button>
          </div>
        </Card>

        {/* Live Preview Sidebar */}
        <Card className="p-8 bg-black/40 border-white/5 backdrop-blur-3xl shadow-2xl h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Live Preview</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-brand-teal/20 border-2 border-brand-teal/30 flex items-center justify-center text-brand-teal shadow-[0_0_40px_rgba(79,209,197,0.15)] mb-6 group relative overflow-hidden">
              <div className="absolute inset-0 bg-brand-teal animate-pulse opacity-10" />
              <span className="text-4xl font-black italic select-none">
                {symbol ? symbol[0].toUpperCase() : "?"}
              </span>
            </div>
            
            <h3 className="text-2xl font-black text-white italic tracking-tighter mb-1 select-none text-center">
              {name || "Collection Name"}
            </h3>
            <p className="text-xs font-bold text-brand-teal uppercase tracking-[0.3em] select-none">
              {symbol || "SYMBOL"}
            </p>

            <div className="w-full h-[1px] bg-white/5 my-8" />

            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Max Supply</span>
                <span className="text-xs font-mono text-white select-none">
                  {maxSupply ? parseInt(maxSupply).toLocaleString() : "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Mint Price</span>
                <span className="text-xs font-mono text-white select-none">{mintPrice} zkLTC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Standard</span>
                <span className="text-xs font-mono text-white select-none">ERC-721</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-8 w-full">
              <span className="text-[8px] font-bold px-2 py-1 rounded border bg-white/10 border-white/20 text-white uppercase tracking-widest">Mintable</span>
              <span className="text-[8px] font-bold px-2 py-1 rounded border bg-brand-teal/10 border-brand-teal/20 text-brand-teal uppercase tracking-widest">Burnable</span>
            </div>

            <div className="mt-12 w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Deploying to <span className="text-white">LitVM Testnet</span></span>
            </div>
          </div>
        </Card>
      </div>

      <AnimatePresence>
        {showSource && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-black border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-bold text-white uppercase tracking-widest">MNFT.sol</span>
                   <span className="text-[10px] px-2 py-0.5 bg-white/5 text-brand-text-muted rounded flex items-center gap-1 uppercase font-bold tracking-widest">
                     <Sparkles size={10} /> Source preview
                   </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generateSource());
                      alert("Source copied!");
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-brand-text-muted hover:text-white transition-all uppercase tracking-widest"
                  >
                    <Copy size={12} /> Copy
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-brand-text-muted hover:text-white transition-all uppercase tracking-widest">
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>
              <div className="relative">
                <pre className="p-6 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] font-mono whitespace-pre text-white/70 overflow-x-auto leading-relaxed max-h-[500px]">
                  <code>{generateSource()}</code>
                </pre>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-[9px] text-brand-text-muted italic opacity-60">
                 <Info size={10} />
                 <span>Reference source — your actual deployment uses the audited on-chain factory at {shortAddr(LITDEX_DEPLOYER_ADDRESS)}.</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StakingForm = ({ onDeployed }: any) => {
  const [stakingToken, setStakingToken] = useState('');
  const [rewardToken, setRewardToken] = useState('');
  const [rewardRate, setRewardRate] = useState('12');
  const [lockPeriod, setLockPeriod] = useState('30');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [fee, setFee] = useState<string>('0.05');
  const [txInfo, setTxInfo] = useState<{ hash: string; address?: string } | null>(null);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    readDeployFee().then(f => setFee(formatEther(f))).catch(console.warn);
  }, []);

  const generateSource = () => {
    const bps = Math.floor(parseFloat(rewardRate || "0") * 100);
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ================================================================
 *  ${label || "ldex"} | APR: ${rewardRate || "0"}% | Lock: ${lockPeriod || "0"} days
 *  LitVM LiteForge  |  Chain 4441  |  https://api.republicstats.xyz/litvm/rpc
 * ================================================================
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract ldex is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable STAKE_TOKEN;
    IERC20 public immutable REWARD_TOKEN;
    uint256 public constant LOCK = ${lockPeriod || "0"} days;
    uint256 public constant MIN  = 1 ether;
    uint256 public rewardBps     = ${bps};

    struct Info { uint256 amount; uint256 start; uint256 lastClaim; uint256 pending; }
    mapping(address => Info) public stakes;
    uint256 public totalStaked;

    event Staked(address indexed u, uint256 amt);
    event Unstaked(address indexed u, uint256 amt);
    event Claimed(address indexed u, uint256 amt);

    constructor(address _stake, address _reward) Ownable(msg.sender) {
        STAKE_TOKEN  = IERC20(_stake);
        REWARD_TOKEN = IERC20(_reward);
    }

    function pending(address u) public view returns (uint256) {
        Info memory s = stakes[u];
        if (s.amount == 0) return s.pending;
        uint256 e = block.timestamp - s.lastClaim;
        return s.pending + (s.amount * rewardBps * e) / (10000 * 365 days);
    }

    function stake(uint256 amt) external nonReentrant whenNotPaused {
        require(amt >= MIN, "Below min");
        Info storage s = stakes[msg.sender];
        if (s.amount > 0) s.pending = pending(msg.sender);
        STAKE_TOKEN.safeTransferFrom(msg.sender, address(this), amt);
        s.amount += amt;
        s.start = s.start == 0 ? block.timestamp : s.start;
        s.lastClaim = block.timestamp;
        totalStaked += amt;
        emit Staked(msg.sender, amt);
    }

    function claim() external nonReentrant whenNotPaused {
        Info storage s = stakes[msg.sender];
        uint256 r = pending(msg.sender);
        require(r > 0, "No rewards");
        s.pending = 0;
        s.lastClaim = block.timestamp;
        REWARD_TOKEN.safeTransfer(msg.sender, r);
        emit Claimed(msg.sender, r);
    }

    function unstake(uint256 amt) external nonReentrant {
        Info storage s = stakes[msg.sender];
        require(s.amount >= amt, "Insufficient");
        require(block.timestamp >= s.start + LOCK, "Locked");
        s.pending = pending(msg.sender);
        s.amount -= amt;
        s.lastClaim = block.timestamp;
        totalStaked -= amt;
        STAKE_TOKEN.safeTransfer(msg.sender, amt);
        emit Unstaked(msg.sender, amt);
    }

    function emergencyWithdraw() external nonReentrant {
        Info storage s = stakes[msg.sender];
        require(s.amount > 0, "Nothing");
        uint256 a = s.amount;
        s.amount = 0;
        s.pending = 0;
        totalStaked -= a;
        STAKE_TOKEN.safeTransfer(msg.sender, a);
    }

    function setRate(uint256 bps) external onlyOwner { rewardBps = bps; }
    function depositRewards(uint256 amt) external onlyOwner {
        REWARD_TOKEN.safeTransferFrom(msg.sender, address(this), amt);
    }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}`;
  };

  const handleDeploy = async () => {
    if (!stakingToken) return alert("Staking token required");
    setLoading(true);
    setTxInfo(null);
    try {
      const { deployStaking } = await import('./lib/litdex-core-logic');
      const dailyRateWei = parseEther((parseFloat(rewardRate) / 365).toString());
      
      const res = await deployStaking(
        stakingToken,
        rewardToken || stakingToken,
        dailyRateWei,
        BigInt(lockPeriod),
        label || "Staking Pool"
      );
      setTxInfo({ hash: res.txHash, address: res.contractAddress });
      onDeployed?.();
    } catch (err) {
      alert(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormContainer 
        title="Staking" 
        subtitle="// Single-asset staking pool with daily reward rate and lock period." 
        icon={Lock} 
        onAction={handleDeploy} 
        loading={loading}
        deployFee={fee}
        actionLabel="Deploy"
        onPreviewSource={() => setShowSource(!showSource)}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Staking Token Address *" 
              placeholder="0x... ERC20 to stake" 
              value={stakingToken} 
              onChange={setStakingToken} 
            />
            <InputField 
              label="Reward Token Address" 
              placeholder="0x... (blank = same as stake)" 
              helper="Leave blank to use same token as reward"
              value={rewardToken} 
              onChange={setRewardToken} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Annual Reward Rate (%)" 
              placeholder="12" 
              helper="Converted to per-day rate x 1e18 on-chain"
              value={rewardRate} 
              onChange={setRewardRate} 
            />
            <InputField 
              label="Lock Period (days)" 
              placeholder="30" 
              helper="Minimum staking duration"
              value={lockPeriod} 
              onChange={setLockPeriod} 
            />
          </div>
          <InputField 
            label="Pool Label" 
            placeholder="e.g. PEPE Staking Pool" 
            helper="Stored on-chain as the contract's display name"
            value={label} 
            onChange={setLabel} 
          />
        </div>

        {txInfo && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-brand-teal/10 border border-brand-teal/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center text-brand-teal"
          >
            Pool Deployed Successfully
            <div className="mt-2 flex flex-col gap-1">
              {txInfo.address && <div className="text-white opacity-60">Address: {shortAddr(txInfo.address)}</div>}
              <a 
                href={`${litvmChain.blockExplorers.default.url}/tx/${txInfo.hash}`}
                target="_blank"
                rel="noreferrer"
                className="underline block mt-1"
              >
                View on Explorer
              </a>
            </div>
          </motion.div>
        )}
      </FormContainer>

      <AnimatePresence>
        {showSource && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-black border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-bold text-white uppercase tracking-widest">Staking.sol</span>
                   <span className="text-[10px] px-2 py-0.5 bg-white/5 text-brand-text-muted rounded flex items-center gap-1 uppercase font-bold tracking-widest">
                     <Sparkles size={10} /> Source preview
                   </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generateSource());
                      alert("Source copied!");
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-brand-text-muted hover:text-white transition-all uppercase tracking-widest"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
              </div>
              <div className="relative">
                <pre className="p-6 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] font-mono whitespace-pre text-white/70 overflow-x-auto leading-relaxed max-h-[500px]">
                  <code>{generateSource()}</code>
                </pre>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VestingForm = ({ onDeployed }: any) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [amount, setAmount] = useState('');
  const [cliffDays, setCliffDays] = useState('90');
  const [vestingDays, setVestingDays] = useState('365');
  const [label, setLabel] = useState('');
  const [revocable, setRevocable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fee, setFee] = useState<string>('0.05');
  const [txInfo, setTxInfo] = useState<{ hash: string; address?: string } | null>(null);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    readDeployFee().then(f => setFee(formatEther(f))).catch(console.warn);
  }, []);

  const generateSource = () => {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ================================================================
 *  ${label || "TokenVesting"} | Cliff: ${cliffDays}d | Duration: ${vestingDays}d
 *  LitVM LiteForge  |  Chain 4441  |  https://api.republicstats.xyz/litvm/rpc
 * ================================================================
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ${label.replace(/\s+/g, '') || "TokenVesting"} is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    IERC20 public immutable TOKEN;
    uint256 public constant CLIFF    = ${cliffDays} days;
    uint256 public constant DURATION = ${vestingDays} days;

    address public beneficiary;
    uint256 public totalAmt;
    uint256 public released;
    uint256 public start;
    bool public revoked;
    event Released(address indexed ben, uint256 amt);

    constructor() Ownable(msg.sender) {
        TOKEN = IERC20(${tokenAddress || "0x0000000000000000000000000000000000000000"});
    }

    function setBeneficiary(address addr) external onlyOwner {
        require(beneficiary == address(0), "Already set");
        beneficiary = addr;
        start = block.timestamp;
    }
    function setTotal(uint256 amt) external onlyOwner { require(released == 0, "Started"); totalAmt = amt; }

    function vested() public view returns (uint256) {
        if (start == 0) return 0;
        if (revoked) return released;
        if (block.timestamp < start + CLIFF) return 0;
        uint256 e = block.timestamp - (start + CLIFF);
        return e >= DURATION ? totalAmt : (totalAmt * e) / DURATION;
    }

    function release() external nonReentrant {
        require(msg.sender == beneficiary || msg.sender == owner(), "Unauth");
        uint256 r = vested() - released;
        require(r > 0, "Nothing");
        released += r;
        TOKEN.safeTransfer(beneficiary, r);
        emit Released(beneficiary, r);
    }

    function revoke() external onlyOwner {
        require(!revoked, "Done");
        uint256 r = totalAmt - vested();
        revoked = true;
        if (r > 0) TOKEN.safeTransfer(owner(), r);
    }
}`;
  };

  const handleDeploy = async () => {
    if (!tokenAddress || !beneficiary || !amount) return alert("Required fields missing");
    setLoading(true);
    setTxInfo(null);
    try {
      const { deployVesting } = await import('./lib/litdex-core-logic');
      const res = await deployVesting(
        tokenAddress,
        beneficiary,
        parseEther(amount),
        BigInt(cliffDays),
        BigInt(vestingDays),
        revocable,
        label || "Token Vesting"
      );
      setTxInfo({ hash: res.txHash, address: res.contractAddress });
      onDeployed?.();
    } catch (err) {
      alert(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormContainer 
        title="Vesting" 
        subtitle="// Cliff + linear vesting for team / investor / advisor allocations." 
        icon={Clock} 
        onAction={handleDeploy} 
        loading={loading}
        deployFee={fee}
        actionLabel="Deploy"
        onPreviewSource={() => setShowSource(!showSource)}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Token Address *" 
              placeholder="0x... token to vest" 
              value={tokenAddress} 
              onChange={setTokenAddress} 
            />
            <InputField 
              label="Vesting Label" 
              placeholder="e.g. Team Vesting" 
              value={label} 
              onChange={setLabel} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Beneficiary Address *" 
              placeholder="0x..." 
              value={beneficiary} 
              onChange={setBeneficiary} 
            />
            <InputField 
              label="Total Amount (whole units) *" 
              placeholder="e.g. 1000" 
              helper="Total supply to be vested"
              value={amount} 
              onChange={setAmount} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Cliff Period (days)" 
              placeholder="90" 
              helper="No tokens released before cliff ends"
              value={cliffDays} 
              onChange={setCliffDays} 
            />
            <InputField 
              label="Vesting Duration (days after cliff)" 
              placeholder="365" 
              value={vestingDays} 
              onChange={setVestingDays} 
            />
          </div>

          <ToggleField 
            label="Revocable by owner"
            desc="Owner can cancel and reclaim unvested tokens"
            active={revocable}
            onToggle={setRevocable}
          />
        </div>

        {txInfo && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-brand-teal/10 border border-brand-teal/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center text-brand-teal"
          >
            Vesting Deployed Successfully
            <div className="mt-2 flex flex-col gap-1">
              {txInfo.address && <div className="text-white opacity-60">Address: {shortAddr(txInfo.address)}</div>}
              <a 
                href={`${litvmChain.blockExplorers.default.url}/tx/${txInfo.hash}`}
                target="_blank"
                rel="noreferrer"
                className="underline block mt-1"
              >
                View on Explorer
              </a>
            </div>
          </motion.div>
        )}
      </FormContainer>

      <AnimatePresence>
        {showSource && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-black border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-bold text-white uppercase tracking-widest">Vesting.sol</span>
                   <span className="text-[10px] px-2 py-0.5 bg-white/5 text-brand-text-muted rounded flex items-center gap-1 uppercase font-bold tracking-widest">
                     <Sparkles size={10} /> Source preview
                   </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generateSource());
                      alert("Source copied!");
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-brand-text-muted hover:text-white transition-all uppercase tracking-widest"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
              </div>
              <div className="relative">
                <pre className="p-6 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] font-mono whitespace-pre text-white/70 overflow-x-auto leading-relaxed max-h-[500px]">
                  <code>{generateSource()}</code>
                </pre>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TokenFactoryForm = ({ onDeployed }: any) => {
  const { address } = useAccount();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState('18');
  const [supply, setSupply] = useState('');
  const [mintable, setMintable] = useState(true);
  const [burnable, setBurnable] = useState(true);
  const [pausable, setPausable] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [fee, setFee] = useState<string>('0.05');
  const [txInfo, setTxInfo] = useState<{ hash: string; address?: string } | null>(null);
  const [showSource, setShowSource] = useState(false);
  
  const [deployedTokens, setDeployedTokens] = useState<any[]>([]);
  const [totalDeployed, setTotalDeployed] = useState<number>(596);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    if (!address) return;
    setLoadingHistory(true);
    try {
      const tokens = await getLegacyTokensByCreator(address);
      const details = await Promise.all(tokens.map(t => getLegacyTokenInfo(t)));
      // Tuple: contractAddress, creator, name, symbol, totalSupply, decimals, mintable, burnable, pausable, deployedAt
      setDeployedTokens(details.map(d => ({
        address: d[0],
        name: d[2],
        symbol: d[3],
        supply: d[4],
        decimals: d[5],
        mintable: d[6],
        burnable: d[7],
        pausable: d[8]
      })));
      setTotalDeployed(await getLegacyTotalDeployedDisplay());
    } catch (err) {
      console.warn("Failed to fetch history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    readLegacyDeployFee().then(f => setFee(formatEther(f))).catch(console.warn);
    fetchHistory();
  }, [address]);

  const generateSource = () => {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// ================================================================
//  LitVMTokenFactory | Fee: ${fee} zkLTC per token deploy
//  LitVM LiteForge  |  Chain 4441  |  https://api.republicstats.xyz/litvm/rpc
// ================================================================
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FactoryToken is ERC20, Ownable {
    uint8 private _d;
    bool public mintable;
    bool public burnable;
    bool public pausable;
    bool private _paused;

    constructor(string memory n, string memory s, uint8 d, uint256 supply, bool m, bool b, bool p, address creator) ERC20(n, s) Ownable(creator) {
        _d = d;
        mintable = m;
        burnable = b;
        pausable = p;
        _mint(creator, supply);
    }

    function decimals() public view override returns (uint8) { return _d; }
    function mint(address to, uint256 amt) external onlyOwner { require(mintable, "Disabled"); _mint(to, amt); }
    function burn(uint256 amt) external { require(burnable, "Disabled"); _burn(msg.sender, amt); }
    function pause() external onlyOwner { require(pausable, "Disabled"); _paused = true; }
    function unpause() external onlyOwner { require(pausable, "Disabled"); _paused = false; }
    function _update(address from, address to, uint256 v) internal override { require(!_paused, "Paused"); super._update(from, to, v); }
}

contract LitVMTokenFactory is Ownable {
    uint256 public fee = ${fee} ether;
    address[] public all;
    mapping(address => address[]) public byCreator;
    event Deployed(address indexed token, address indexed creator, string name, string symbol);

    constructor() Ownable(msg.sender) {}

    function deploy(string calldata name, string calldata symbol, uint8 decimals, uint256 supply, bool mintable, bool burnable, bool pausable) external payable returns (address) {
        require(msg.value >= fee, "Fee low");
        require(bytes(name).length > 0 && bytes(symbol).length > 0, "Name required");
        require(supply > 0, "Supply > 0");
        (bool ok,) = owner().call{value: msg.value}("");
        require(ok, "Fee transfer fail");
        FactoryToken t = new FactoryToken(name, symbol, decimals, supply, mintable, burnable, pausable, msg.sender);
        address a = address(t);
        all.push(a);
        byCreator[msg.sender].push(a);
        emit Deployed(a, msg.sender, name, symbol);
        return a;
    }

    function setFee(uint256 f_) external onlyOwner { fee = f_; }
    function getAll() external view returns (address[] memory) { return all; }
    function getByCreator(address c) external view returns (address[] memory) { return byCreator[c]; }
    function withdraw() external onlyOwner {
        (bool ok,) = owner().call{value: address(this).balance}("");
        require(ok, "Withdraw fail");
    }
    receive() external payable {}
}`;
  };

  const handleDeploy = async () => {
    if (!name || !symbol || !supply) return alert("Required fields missing");
    setLoading(true);
    setTxInfo(null);
    try {
      const { deployTokenLegacy } = await import('./lib/litdex-core-logic');
      const res = await deployTokenLegacy({
        name,
        symbol,
        decimals: parseInt(decimals),
        totalSupply: parseUnits(supply, parseInt(decimals)),
        mintable,
        burnable,
        pausable
      });
      setTxInfo({ hash: res.txHash, address: res.tokenAddress });
      onDeployed?.();
      fetchHistory();
    } catch (err) {
      alert(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <FormContainer 
        title="Token Factory" 
        subtitle="// Deploy your own ERC20 factory with custom fee, whitelist, and token tracking." 
        icon={Hammer} 
        onAction={handleDeploy} 
        loading={loading}
        deployFee={fee}
        actionLabel="Deploy"
        onPreviewSource={() => setShowSource(!showSource)}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Token Name *" placeholder="e.g. My Token" value={name} onChange={setName} />
            <InputField label="Token Symbol *" placeholder="e.g. MTK" value={symbol} onChange={setSymbol} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Decimals" placeholder="18" value={decimals} onChange={setDecimals} />
            <InputField label="Total Supply *" placeholder="e.g. 1000000" value={supply} onChange={setSupply} />
          </div>
          
          <div className="pt-4 border-t border-white/5 space-y-4">
            <ToggleField label="Mintable" desc="Allow owner to create new tokens" active={mintable} onToggle={setMintable} />
            <ToggleField label="Burnable" desc="Allow holders to destroy their tokens" active={burnable} onToggle={setBurnable} />
            <ToggleField label="Pausable" desc="Allow owner to stop transfers" active={pausable} onToggle={setPausable} />
          </div>
        </div>

        {txInfo && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center"
          >
            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Token Deployed Successfully</div>
            {txInfo.address && <div className="text-white font-mono text-xs mb-2">{shortAddr(txInfo.address)}</div>}
            <a href={`${litvmChain.blockExplorers.default.url}/tx/${txInfo.hash}`} target="_blank" rel="noreferrer" className="text-[10px] text-white/40 underline uppercase font-bold tracking-widest hover:text-white transition-all">View on Explorer</a>
          </motion.div>
        )}
      </FormContainer>

      <AnimatePresence>
        {showSource && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-black border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-bold text-white uppercase tracking-widest">TokenFactory.sol</span>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(generateSource()); alert("Copied!"); }} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-brand-text-muted hover:text-white uppercase tracking-widest transition-all">
                  <Copy size={12} /> Copy
                </button>
              </div>
              <pre className="p-6 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] font-mono whitespace-pre text-white/70 overflow-x-auto leading-relaxed max-h-[400px]">
                <code>{generateSource()}</code>
              </pre>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">My Deployed Tokens</h3>
            <p className="text-xs text-brand-text-muted mt-1 uppercase font-bold tracking-widest">List of tokens you launched via this factory</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{totalDeployed}</div>
            <div className="text-[10px] text-brand-text-muted uppercase font-bold tracking-widest">Total Global Launch</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loadingHistory ? (
            <div className="p-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest animate-pulse transition-all">Loading history...</p>
            </div>
          ) : deployedTokens.length === 0 ? (
            <div className="p-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">No tokens deployed yet</p>
            </div>
          ) : deployedTokens.map((t, i) => (
            <Card key={i} className="p-5 flex items-center justify-between group hover:border-white/10 transition-all bg-white/[0.01]">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl font-bold text-white border border-white/5 group-hover:scale-110 transition-all uppercase tracking-tighter">
                  {t.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{t.name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-white/5 text-brand-text-muted rounded font-mono uppercase tracking-widest font-bold">{t.symbol}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 font-mono text-[10px] text-brand-text-muted">
                    <span>Supply: {formatUnits(t.supply, t.decimals)}</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>{shortAddr(t.address)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {t.mintable && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Mintable" />}
                {t.burnable && <span className="w-2 h-2 rounded-full bg-orange-500" title="Burnable" />}
                {t.pausable && <span className="w-2 h-2 rounded-full bg-blue-500" title="Pausable" />}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
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
  const [activeTab, setActiveTab] = useState<'send' | 'inbox'>('send');
  const [inboxTab, setInboxTab] = useState<'received' | 'sent'>('received');
  const [msgType, setMsgType] = useState<'public' | 'direct'>('public');
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState({ sent: 0, received: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const fetchStats = async () => {
    if (!address) return;
    try {
      const { getMessengerStats } = await import('./lib/litdex-core-logic');
      const s = await getMessengerStats(address);
      setStats(s);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { getSentMessages, getReceivedMessages } = await import('./lib/litdex-core-logic');
      const data = inboxTab === 'sent' 
        ? await getSentMessages(address) 
        : await getReceivedMessages(address);
      setMessages(data);
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchStats();
      if (activeTab === 'inbox') fetchMessages();
    }
  }, [isConnected, address, activeTab, inboxTab]);

  const handleSend = async () => {
    if (!content) return;
    setSending(true);
    try {
      const { sendMessage } = await import('./lib/litdex-core-logic');
      const target = msgType === 'public' ? 'public' : recipient;
      const txHash = await sendMessage(target, content);
      
      // Success flow
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      setContent('');
      if (msgType === 'direct') setRecipient('');
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 max-w-5xl mx-auto px-4 h-full flex flex-col">
      {/* Header & Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-black/40 border border-white/5 p-6 rounded-3xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <MessageSquare size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Messenger</h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">LitVM On-Chain Protocol</p>
          </div>
        </div>

        <div className="flex items-center gap-6 px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Sent</span>
            <span className="text-lg font-black text-white">{stats.sent}</span>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Received</span>
            <span className="text-lg font-black text-white">{stats.received}</span>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Global On-Chain</span>
            <span className="text-lg font-black text-white">{stats.total}</span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 mb-6 p-1.5 bg-black/40 border border-white/5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('send')}
          className={cn(
            "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
            activeTab === 'send' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
          )}
        >
          Send
        </button>
        <button 
          onClick={() => setActiveTab('inbox')}
          className={cn(
            "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
            activeTab === 'inbox' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
          )}
        >
          Inbox
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'send' ? (
            <motion.div 
              key="send-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <Card className="p-10 bg-black/60 border-white/10 backdrop-blur-3xl h-full flex flex-col relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                 
                 <div className="flex items-center justify-between mb-10 relative z-10">
                   <div>
                     <h3 className="text-xl font-black text-white tracking-tight uppercase">Transmit</h3>
                     <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Daily Cap: 10 Messages (20 Points)</p>
                   </div>
                   
                   <div className="flex p-1 bg-white/10 rounded-xl border border-white/10 relative z-20">
                     <button 
                       type="button"
                       id="msg-type-public"
                       onClick={(e) => { e.stopPropagation(); setMsgType('public'); }}
                       className={cn(
                         "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                         msgType === 'public' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white/60"
                       )}
                     >
                       Public
                     </button>
                     <button 
                       type="button"
                       id="msg-type-direct"
                       onClick={(e) => { e.stopPropagation(); setMsgType('direct'); }}
                       className={cn(
                         "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                         msgType === 'direct' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white/60"
                       )}
                     >
                       Direct
                     </button>
                   </div>
                 </div>

                 <div className="space-y-8 flex-1 max-w-2xl relative z-10">
                    {msgType === 'direct' && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Recipient Address</label>
                        <input 
                          id="messenger-recipient"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value.trim())}
                          placeholder="0x... (Recipient Wallet)" 
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-sm text-white focus:border-white/30 outline-none transition-all placeholder:text-white/10"
                        />
                      </motion.div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Message Content</label>
                        <span className={cn(
                          "text-[9px] font-mono",
                          content.length > 1000 ? "text-red-500" : "text-white/20"
                        )}>
                          {content.length}/1000
                        </span>
                      </div>
                      <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value.slice(0, 1000))}
                        rows={8}
                        placeholder={msgType === 'public' ? "Broadcast your thoughts to the world..." : "Secure message to recipient..."}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-sm text-white focus:border-white/30 outline-none resize-none transition-all placeholder:text-white/10"
                      />
                    </div>
                 </div>

                 <div className="mt-10 flex items-center gap-6">
                    <button 
                      onClick={handleSend}
                      disabled={!isConnected || sending || !content || (msgType === 'direct' && !recipient)}
                      className="px-12 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] flex items-center gap-3"
                    >
                      {sending ? "TRANSMITTING..." : "AUTHORIZE TRANSMISSION"}
                    </button>
                    {!isConnected && (
                      <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Connect wallet to send</p>
                    )}
                 </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              key="inbox-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col"
            >
              <Card className="bg-black/60 border-white/10 backdrop-blur-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex gap-4 p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
                    <button 
                      onClick={() => setInboxTab('received')}
                      className={cn(
                        "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                        inboxTab === 'received' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
                      )}
                    >
                      Received
                    </button>
                    <button 
                      onClick={() => setInboxTab('sent')}
                      className={cn(
                        "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                        inboxTab === 'sent' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
                      )}
                    >
                      Sent
                    </button>
                  </div>

                  <button 
                    onClick={fetchMessages}
                    disabled={loading}
                    className="p-3 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all disabled:opacity-30"
                  >
                    <RefreshCw size={18} className={cn(loading && "animate-spin")} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
                  {!isConnected ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <Lock size={48} className="mb-6" />
                      <p className="text-xs font-black uppercase tracking-[0.3em]">Protocol Encrypted</p>
                    </div>
                  ) : loading ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Syncing Feed...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <div className="p-8 bg-white/5 rounded-full mb-6">
                        <MessageSquare size={48} />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.3em]">No Messages Recorded</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                       {messages.map((m, i) => (
                         <motion.div 
                           key={i}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           className="flex flex-col gap-2"
                         >
                           <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative group hover:bg-white/[0.08] transition-all">
                              <p className="text-sm font-medium text-white/90 leading-relaxed mb-6">{m.content}</p>
                              
                              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                   <p className="text-[10px] font-mono text-white/30">
                                      {inboxTab === 'sent' ? `To: ${m.recipient}` : `From: ${m.sender}`}
                                   </p>
                                </div>
                                <div className="flex items-center gap-4">
                                  {m.isPublic && (
                                    <span className="text-[8px] font-black text-white/20 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase tracking-widest">Public</span>
                                  )}
                                  <p className="text-[9px] font-black text-white/20 uppercase tracking-tighter">
                                    {new Date(m.timestamp * 1000).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                  </p>
                                </div>
                              </div>
                           </div>
                         </motion.div>
                       ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bonus Points Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_50px_rgba(255,255,255,0.3)] flex items-center gap-3"
          >
            <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-[10px]">P</div>
            +2 Points Earned
          </motion.div>
        )}
      </AnimatePresence>
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

const WalletBalanceDisplay = () => {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ 
    address,
  });

  if (!isConnected || !balanceData) {
    return <div className="px-4 py-1.5 text-[10px] font-bold text-white tracking-widest uppercase border-r border-white/10 mr-1 opacity-50">0.00 zkLTC</div>;
  }

  const formatted = parseFloat(formatEther(balanceData.value)).toLocaleString(undefined, { 
    minimumFractionDigits: 1,
    maximumFractionDigits: 4 
  });

  return (
    <div className="px-3 py-1 text-[11px] font-black text-black tracking-widest uppercase border-r border-black/5 mr-1 flex items-center h-full">
      {formatted} {balanceData.symbol}
    </div>
  );
};

export default function App() {
  const [activePage, setActivePage] = useState<PageID>('swap');
  const [previousPage, setPreviousPage] = useState<PageID>('swap');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Helper to handle page changes while tracking history for the check-in overlay
  const handlePageChange = (p: PageID) => {
    if (p === 'checkin') {
      if (activePage !== 'checkin') setPreviousPage(activePage);
    }
    setActivePage(p);
  };

  // Close dropdown on click outside logic simplified for React
  useEffect(() => {
    const handleScroll = () => setActiveDropdown(null);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderPage = (page: PageID) => {
    switch (page) {
      case 'swap': return <SwapPage />;
      case 'pool': return <PoolPage />;
      case 'deploy': return <DeployPage />;
      case 'points': return <PointsPage setPage={setActivePage} />;
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
            <div className="pointer-events-auto flex items-center gap-3">
              <button 
                onClick={() => handlePageChange(activePage === 'checkin' ? previousPage : 'checkin')}
                className={cn(
                  "relative w-16 h-16 flex items-center justify-center rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 hover:bg-black/60 transition-all backdrop-blur-3xl shadow-2xl group",
                  activePage === 'checkin' ? "text-white border-white/20 bg-black/60" : "text-white/60"
                )}
              >
                <CalendarCheck size={24} className={cn("transition-colors", activePage === 'checkin' ? "text-white" : "group-hover:text-white")} />
              </button>
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
                <div className={cn("flex items-center gap-1 bg-white rounded-full p-1 h-10 shadow-[0_0_40px_rgba(255,255,255,0.2)]", !connected && "bg-transparent shadow-none p-0")}>
                  {connected && <WalletBalanceDisplay />}
                  <button
                    onClick={connected ? openAccountModal : openConnectModal}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-[9px] font-black uppercase tracking-[0.2em] h-full",
                      connected 
                        ? "bg-black/5 text-black hover:bg-black/10" 
                        : "bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                    )}
                  >
                    {connected ? (
                       <>
                         <span className="opacity-80">{account.displayName}</span>
                         <ChevronDown size={14} className="opacity-40" />
                       </>
                    ) : (
                      <><Wallet size={12} /> Connect</>
                    )}
                  </button>
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>

        <AnimatedNavFramer 
          onPageChange={(page) => handlePageChange(page as PageID)} 
          activePage={activePage === 'checkin' ? previousPage : activePage}
        />

        {/* Main Content */}
        <main className={cn(
          "container mx-auto px-6 pt-24 pb-12 flex-1 transition-all duration-500",
          activePage === 'checkin' && "blur-xl scale-[0.98] opacity-30 pointer-events-none"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage === 'checkin' ? previousPage : activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {renderPage(activePage === 'checkin' ? previousPage : activePage)}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Check-in Overlay */}
        <AnimatePresence>
          {activePage === 'checkin' && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => handlePageChange(previousPage)}
                className="absolute inset-0 bg-black/20"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative z-10 w-full max-w-xl"
              >
                <CheckinPage />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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

