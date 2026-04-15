import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSidebar(props) {
  const onToggle = props.onToggle;
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('admin.sidebar.collapsed') === '1';
    setCollapsed(saved);
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('admin.sidebar.collapsed', next ? '1' : '0');
    if (typeof onToggle === 'function') onToggle(next);
  }

  function handleLogout() {
    if (!window.confirm('Bạn có chắc muốn đăng xuất không?')) return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('admin.')) localStorage.removeItem(k);
    });
    navigate('/auth/login');
  }

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan', end: true },
    { to: '/admin/products', icon: Package, label: 'Sản phẩm' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Đơn hàng', badge: 'Mới' },
    { to: '/admin/users', icon: Users, label: 'Người dùng' },
    { to: '/admin/blogs', icon: FileText, label: 'Bài viết' },
    { to: '/admin/reports', icon: BarChart3, label: 'Báo cáo' },
    { to: '/admin/contact', icon: MessageSquare, label: 'Liên hệ' },
  ];

  return (
    <TooltipProvider>
      <aside 
        className={`h-screen sticky top-0 bg-[#0a2e1f] text-slate-300 transition-all duration-500 ease-[0.22, 1, 0.36, 1] flex flex-col z-50 border-r border-white/5 shadow-2xl ${
          collapsed ? 'w-20' : 'w-[280px]'
        }`}
      >
        {/* Brand */}
        <div className="p-6 flex items-center gap-4 overflow-hidden whitespace-nowrap border-b border-white/5 bg-[#082419]">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-10 h-10 rounded-xl bg-[#155e3a] flex items-center justify-center shrink-0 shadow-lg shadow-[#155e3a]/40 border border-white/10"
          >
            <Store className="w-5 h-5 text-white" />
          </motion.div>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-black text-white text-xl leading-none tracking-[-0.04em]">BEPSACHVIET</span>
              <span className="text-[9px] font-black text-emerald-400/60 uppercase tracking-[0.3em] mt-2 italic">EXCELLENCE ADMIN</span>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {navItems.map((item, idx) => (
            <Tooltip key={item.to} delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={(state) => `
                    flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 group relative
                    ${state.isActive 
                      ? 'bg-[#155e3a] text-white shadow-xl shadow-[#155e3a]/30 font-bold border border-white/10' 
                      : 'hover:bg-white/5 hover:text-emerald-400'
                    }
                  `}
                >
                  {(state) => (
                    <>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`shrink-0 ${state.isActive ? 'text-white' : 'group-hover:text-emerald-400'}`}
                      >
                        <item.icon className="w-5 h-5" />
                      </motion.div>
                      
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-sm tracking-tight flex-1 font-bold"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {!collapsed && item.badge && (
                        <Badge className="bg-emerald-400 text-[#0a2e1f] border-none text-[9px] px-1.5 h-4 font-black rounded-full ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                      
                       {state.isActive && (
                          <motion.div 
                            layoutId="active-indicator"
                            className={`absolute left-0 top-0 bottom-0 my-auto w-1 h-6 bg-emerald-400 rounded-r-full shadow-[0_0_15px_#34d399] ${collapsed ? 'hidden' : ''}`}
                          />
                       )}
                    </>
                  )}
                </NavLink>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-[#082419] border border-white/10 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-xl">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-4 bg-[#082419]/50 backdrop-blur-sm">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300 group"
              >
                <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
                {!collapsed && <span className="text-sm font-black tracking-tight">Đăng xuất</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-rose-600 border-none text-white font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-xl">
                Đăng xuất
              </TooltipContent>
            )}
          </Tooltip>

          <Separator className="bg-white/5" />

          <div className="flex items-center justify-between gap-2 overflow-hidden">
            {!collapsed && (
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest whitespace-nowrap">v1.0.0 EMERALD</span>
               </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className={`h-10 w-10 rounded-xl hover:bg-white/10 text-emerald-600 transition-all ${collapsed ? 'mx-auto' : ''}`}
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}