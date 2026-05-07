import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import type { SuccessPayload } from "@/lib/feedback";

export default function SuccessCard() {
  const [data, setData] = useState<SuccessPayload | null>(null);

  useEffect(() => {
    const onSuccess = (e: any) => {
      setData(e.detail as SuccessPayload);
    };
    window.addEventListener("litdex:success", onSuccess);
    return () => window.removeEventListener("litdex:success", onSuccess);
  }, []);

  useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => setData(null), 5000);
    return () => clearTimeout(t);
  }, [data]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setData(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 8 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] w-full min-w-[320px] max-w-[420px] p-6"
            style={{ color: "#1a1a1a" }}
          >
            <button
              onClick={() => setData(null)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0">
                <Trophy size={20} className="text-[#1a1a1a]" />
              </div>
              <div className="min-w-0">
                <div className="font-black uppercase tracking-tight text-base text-[#111827] truncate">
                  {data.title}
                </div>
                {data.subtitle && (
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
                    {data.subtitle}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              {data.rows.map((row, i) => (
                <div key={i} className="flex justify-between items-center gap-4 text-xs">
                  <span className="font-bold uppercase tracking-widest text-[#6b7280]">
                    {row.label}
                  </span>
                  <span className="font-bold text-[#111827] text-right break-all">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
