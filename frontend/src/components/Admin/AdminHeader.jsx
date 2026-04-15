
import React, { useState } from 'react';
import { Search, Plus, RefreshCw, Bell, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

export default function AdminHeader({ title, children, onSearch, onCreate }) {
  const [q, setQ] = useState('');

  function doSearch() {
    if (typeof onSearch === 'function') onSearch(q && q.trim() ? q.trim() : '');
  }

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 sticky top-0 z-40 shadow-sm transition-all duration-300">
      <div className="flex flex-col text-center sm:text-left">
        <h2 className="text-3xl font-black text-slate-900 tracking-[-0.05em] leading-none uppercase">{title}</h2>
        <p className="text-[10px] font-black text-[#155e3a] uppercase tracking-[0.2em] mt-2 flex items-center gap-2 justify-center sm:justify-start">
           <span className="w-1.5 h-1.5 rounded-full bg-[#155e3a] animate-pulse"></span>
           Trang quản trị hệ thống
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 w-full sm:w-auto">
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#155e3a] transition-colors" />
          <Input
            placeholder="Tìm kiếm nhanh..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') doSearch(); }}
            className="pl-11 h-12 rounded-2xl border-none bg-slate-50 focus-visible:ring-[#155e3a]/20 font-bold text-sm shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-2xl border-slate-100 bg-white hover:bg-[#155e3a]/5 hover:text-[#155e3a] transition-all shadow-sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
             <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-100 bg-white hover:bg-[#155e3a]/5 hover:text-[#155e3a] transition-all shadow-sm">
                <Bell className="w-4 h-4" />
             </Button>
             <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-emerald-500 border-2 border-white text-[9px] font-black text-white">2</Badge>
          </motion.div>

          <Separator orientation="vertical" className="h-10 mx-1 hidden md:block" />

          {typeof onCreate === 'function' && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                  onClick={() => onCreate()}
                  className="h-12 px-8 bg-[#155e3a] text-white rounded-2xl font-black shadow-xl shadow-[#155e3a]/30 hover:bg-[#0f4a2b] transition-all border-none flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span className="tracking-widest text-[11px]">TẠO MỚI</span>
              </Button>
            </motion.div>
          )}

          <motion.div 
            whileHover={{ scale: 1.05, borderColor: '#155e3a' }}
            className="w-12 h-12 rounded-2xl bg-[#0a2e1f] flex items-center justify-center shadow-lg cursor-pointer transition-all group overflow-hidden border-2 border-transparent"
          >
             <User className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </motion.div>
        </div>
      </div>

      {children}
    </header>
  );
}