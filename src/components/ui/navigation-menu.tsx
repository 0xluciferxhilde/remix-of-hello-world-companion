// components/animated-nav-framer.tsx
"use client";

import * as React from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Navigation, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Swap", id: "swap" },
  { name: "Pool", id: "pool" },
  { name: "Deploy", id: "deploy" },
  { name: "Points", id: "points" },
  { name: "NFTs", id: "nfts" },
  { name: "Messenger", id: "messenger" },
  { name: "Socials", id: "quests" },
  { name: "Games", id: "games" },
];

const EXPAND_SCROLL_THRESHOLD = 80;

const containerVariants = {
  expanded: {
    y: 0,
    opacity: 1,
    width: "auto",
    transition: {
      y: { type: "spring", damping: 20, stiffness: 300 },
      opacity: { duration: 0.2 },
      width: { type: "spring", damping: 25, stiffness: 300 },
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  collapsed: {
    y: 0,
    opacity: 1,
    width: "4rem",
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 400,
      when: "afterChildren",
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const logoVariants = {
  expanded: { opacity: 1, x: 0, rotate: 0, transition: { type: "spring", damping: 15 } },
  collapsed: { opacity: 0, x: -10, rotate: -90, transition: { duration: 0.2 } },
};

const itemVariants = {
  expanded: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", damping: 20 } },
  collapsed: { opacity: 0, x: -10, scale: 0.8, transition: { duration: 0.15 } },
};

const collapsedIconVariants = {
    expanded: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    collapsed: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300,
        delay: 0.15,
      }
    },
}

export function AnimatedNavFramer({ activePage, onPageChange }: { activePage: string, onPageChange: (id: any) => void }) {
  const [isExpanded, setExpanded] = React.useState(true);
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  
  const { scrollY } = useScroll();
  const lastScrollY = React.useRef(0);
  const scrollPositionOnCollapse = React.useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    
    if (isExpanded && latest > previous && latest > 150) {
      setExpanded(false);
      scrollPositionOnCollapse.current = latest; 
    } 
    else if (!isExpanded && latest < previous && (scrollPositionOnCollapse.current - latest > EXPAND_SCROLL_THRESHOLD)) {
      setExpanded(true);
    }
    
    lastScrollY.current = latest;
  });

  const handleNavClick = (e: React.MouseEvent) => {
    if (!isExpanded) {
      e.preventDefault();
      setExpanded(true);
    }
  };


  return (
    <>
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] w-auto max-w-[90vw] md:max-w-none">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={containerVariants}
        whileHover={!isExpanded ? { scale: 1.1 } : {}}
        whileTap={!isExpanded ? { scale: 0.95 } : {}}
        onClick={handleNavClick}
        className={cn(
          "flex items-center overflow-hidden rounded-full border bg-black/40 shadow-2xl backdrop-blur-xl h-14 sm:h-16 border-white/5 px-2 sm:px-4",
          !isExpanded && "cursor-pointer justify-center"
        )}
      >
        <motion.div
          variants={logoVariants}
          className="flex-shrink-0 flex items-center font-bold pl-5 pr-3 text-white"
        >
          <Navigation className="h-6 w-6" />
        </motion.div>
        
        <motion.div
          className={cn(
            "flex items-center gap-1 sm:gap-2 pr-3 overflow-x-auto no-scrollbar scroll-smooth",
            !isExpanded && "pointer-events-none overflow-hidden" 
          )}
        >
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              variants={itemVariants}
              onClick={(e) => {
                  e.stopPropagation();
                  onPageChange(item.id);
              }}
              className={cn(
                "relative text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all px-3 py-2 whitespace-nowrap rounded-lg",
                activePage === item.id ? "text-white" : "text-brand-text-muted hover:text-white"
              )}
            >
              {activePage === item.id && (
                <motion.div 
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {item.name}
            </motion.button>
          ))}
        </motion.div>
        
        <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center pointer-events-none">
          <motion.div
            variants={collapsedIconVariants}
            animate={isExpanded ? "expanded" : "collapsed"}
            className="text-white"
          >
            <Menu className="h-5 w-5" />
          </motion.div>
        </div>
      </motion.nav>
    </div>

    {/* Simple Overlay Menu (just for effect when clicking 3 lines) */}
    <AnimatePresence>
        {isMenuOpen && isExpanded && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-auto"
                onClick={() => setMenuOpen(false)}
            >
                <div className="absolute top-8 right-8">
                    <button className="text-white hover:rotate-90 transition-transform"><X size={32} /></button>
                </div>
                <div className="flex flex-col gap-8 text-center">
                    {navItems.map((item) => (
                        <button 
                            key={item.id} 
                            onClick={(e) => {
                                e.stopPropagation();
                                onPageChange(item.id);
                                setMenuOpen(false);
                            }}
                            className={cn(
                                "text-4xl font-bold tracking-tighter uppercase hover:scale-110 transition-transform",
                                activePage === item.id ? "text-white" : "text-brand-text-muted"
                            )}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}
