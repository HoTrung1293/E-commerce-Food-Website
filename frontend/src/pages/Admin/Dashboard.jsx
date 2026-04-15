
import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Truck,
  Star,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

function formatCurrency(v) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
}

export default function Dashboard() {
  const [counts, setCounts] = useState({ users: 0, products: 0, orders: 0 });
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState(null);

  useEffect(() => {
    async function loadCounts() {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [uRes, pRes, oRes] = await Promise.all([
          fetch('/api/users/getAllUsers', { headers }).then(r => r.json()),
          fetch('/api/products/getAllProducts', { headers }).then(r => r.json()),
          fetch('/api/orders/getAllOrder', { headers }).then(r => r.json())
        ]);
        setCounts({
          users: Array.isArray(uRes.data) ? uRes.data.length : 0,
          products: Array.isArray(pRes.data) ? pRes.data.length : 0,
          orders: Array.isArray(oRes.data) ? oRes.data.length : 0
        });
      } catch (err) {
        console.error(err);
      }
    }
    loadCounts();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadReports() {
      setLoadingReports(true);
      setReportsError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [pRes, bRes, sRes] = await Promise.all([
          fetch('/api/reports/top-products?limit=3', { headers }).then(r => r.json()),
          fetch('/api/reports/top-buyers?limit=5', { headers }).then(r => r.json()),
          fetch('/api/reports/revenue-summary', { headers }).then(r => r.json())
        ]);
        if (!mounted) return;
        if (!pRes?.success) throw new Error(pRes?.message || 'Lỗi top-products');
        if (!bRes?.success) throw new Error(bRes?.message || 'Lỗi top-buyers');
        if (!sRes?.success) throw new Error(sRes?.message || 'Lỗi revenue-summary');

        setTopProducts(pRes.data || []);
        setTopBuyers(bRes.data || []);
        setSummary(sRes.data || {});
      } catch (err) {
        console.error('Load reports error', err);
        if (mounted) setReportsError(err.message || String(err));
      } finally {
        if (mounted) setLoadingReports(false);
      }
    }
    loadReports();
    return () => { mounted = false; };
  }, []);

  const stats = [
    { 
      label: 'Tổng doanh thu', 
      value: summary ? formatCurrency(summary.total_revenue) : '0 ₫', 
      icon: DollarSign, 
      color: 'bg-[#155e3a]', 
      trend: '+12%', 
      up: true 
    },
    { 
      label: 'Tổng đơn hàng', 
      value: summary?.total_orders || 0, 
      icon: ShoppingBag, 
      color: 'bg-emerald-600', 
      trend: '+8%', 
      up: true 
    },
    { 
      label: 'Tổng khách hàng', 
      value: summary?.total_customers || 0, 
      icon: Users, 
      color: 'bg-emerald-700', 
      trend: '+24%', 
      up: true 
    },
    { 
      label: 'Sản phẩm đã bán', 
      value: summary?.total_items || 0, 
      icon: TrendingUp, 
      color: 'bg-emerald-800', 
      trend: '+15%', 
      up: true 
    },
    { 
      label: 'Tổng người dùng', 
      value: counts.users, 
      icon: Users, 
      color: 'bg-[#0a2e1f]', 
      trend: '+2%', 
      up: true 
    },
    { 
      label: 'Tổng sản phẩm', 
      value: counts.products, 
      icon: Package, 
      color: 'bg-[#0f4a2b]', 
      trend: '0%', 
      up: true 
    },
  ];

  // Sidebar collapsed state management to sync with AdminSidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(localStorage.getItem('admin.sidebar.collapsed') === '1');

  useEffect(() => {
    const handleStorageChange = () => {
      setIsSidebarCollapsed(localStorage.getItem('admin.sidebar.collapsed') === '1');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div 
      className="admin-root min-h-screen bg-slate-50/50"
      style={{ 
        display: 'grid', 
        gridTemplateColumns: isSidebarCollapsed ? '80px 1fr' : '280px 1fr',
        transition: 'grid-template-columns 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
      }}
    >
      <AdminSidebar onToggle={(val) => setIsSidebarCollapsed(val)} />
      <main className="admin-main flex flex-col min-w-0 overflow-hidden">
        <AdminHeader title="Tổng quan" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="p-8 space-y-8 max-w-[1600px] mx-auto w-full"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {stats.map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300 bg-white">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center shadow-lg shadow-[#155e3a]/20 text-white group-hover:scale-110 transition-transform`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      {s.trend !== '0%' && (
                        <Badge className={`rounded-full border-none font-black text-[10px] ${s.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                           {s.up ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                           {s.trend}
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</h4>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter">{s.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            {/* Main Stats Area */}
            <div className="xl:col-span-8 space-y-10">
               {/* Analysis Row */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white p-8 group overflow-hidden relative">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#155e3a]/5 rounded-full -mr-16 -mt-16 group-hover:bg-[#155e3a]/10 transition-colors"></div>
                     <div className="flex items-center gap-4 mb-8 text-[#155e3a]">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center font-black shadow-inner">
                           <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Giá trị trung bình đơn</h3>
                        </div>
                     </div>
                     <div className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
                        {summary && summary.total_orders > 0 
                          ? formatCurrency(summary.total_revenue / summary.total_orders)
                          : '0 ₫'
                        }
                     </div>
                     <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden mb-2">
                        <motion.div 
                          className="h-full bg-[#155e3a]" 
                          initial={{ width: 0 }} 
                          animate={{ width: '75%' }} 
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                     </div>
                     <p className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-tight">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        Tăng 12% so với tháng trước
                     </p>
                  </Card>

                  <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white p-8 group overflow-hidden relative">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#155e3a]/5 rounded-full -mr-16 -mt-16 group-hover:bg-[#155e3a]/10 transition-colors"></div>
                     <div className="flex items-center gap-4 mb-8 text-[#155e3a]">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center font-black shadow-inner">
                           <Package className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Sản phẩm / đơn hàng</h3>
                        </div>
                     </div>
                     <div className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
                        {summary && summary.total_orders > 0 
                          ? (summary.total_items / summary.total_orders).toFixed(2)
                          : '0'
                        }
                     </div>
                     <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden mb-2">
                        <motion.div 
                          className="h-full bg-emerald-600" 
                          initial={{ width: 0 }} 
                          animate={{ width: '45%' }} 
                          transition={{ duration: 1, delay: 0.6 }}
                        />
                     </div>
                     <p className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-tight">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        Tăng 5% so với tháng trước
                     </p>
                  </Card>
               </div>

               {/* Top Products Table */}
               <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#0a2e1f] text-white flex items-center justify-center shadow-lg shadow-[#0a2e1f]/20">
                           <Star className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">Sản phẩm bán chạy nhất</h3>
                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-2 px-1 flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                             Top 3 doanh thu tháng
                           </p>
                        </div>
                     </div>
                     <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-[#155e3a] gap-2 hover:bg-[#155e3a]/5">Xem tất cả <ChevronRight className="w-4 h-4" /></Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left bg-slate-50/50">
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạng</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doanh thu</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Đã bán</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tăng trưởng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.length === 0 ? (
                          <tr><td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-extrabold uppercase tracking-widest text-xs">Không có dữ liệu báo cáo</td></tr>
                        ) : (
                          topProducts.map((p, idx) => (
                            <tr key={p.product_id} className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors group">
                              <td className="px-8 py-6 font-black text-slate-400">#0{idx + 1}</td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                                    {p.avatar ? (
                                      <img src={p.avatar} alt={p.product_name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-xl font-black">?</div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-black text-slate-900 group-hover:text-[#155e3a] transition-colors text-sm leading-none mb-2">{p.product_name}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {p.product_id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 font-black text-[#155e3a] text-sm">{formatCurrency(p.revenue)}</td>
                              <td className="px-8 py-6 text-center font-black text-slate-900 text-lg tracking-tighter">{p.total_sold}</td>
                              <td className="px-8 py-6 text-right">
                                 <Badge className="bg-emerald-500 text-white border-none rounded-lg px-2 py-1 text-[9px] font-black">+42%</Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
               </Card>
            </div>

            {/* Sidebar Stats Area */}
            <div className="xl:col-span-4 space-y-10">
               {/* Conversion Circle Card */}
               <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white p-10 flex flex-col items-center">
                  <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-10 text-center w-full flex items-center justify-center gap-3">
                     <Users className="w-4 h-4 text-[#155e3a]" />
                     Tỉ lệ chuyển đổi
                  </h3>
                  
                  <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
                      <svg width="200" height="200" viewBox="0 0 120 120" className="transform -rotate-90 w-full h-full drop-shadow-2xl">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(21, 94, 58, 0.05)" strokeWidth="12" />
                        {counts.users > 0 && (
                          (() => {
                            const conversionRate = ((summary?.total_customers || 0) / counts.users) * 100;
                            const circumference = 2 * Math.PI * 50;
                            const strokeDashoffset = circumference - (conversionRate / 100) * circumference;
                            return (
                              <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke="#155e3a"
                                strokeWidth="12"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out shadow-lg"
                              />
                            );
                          })()
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-4 shadow-inner border border-slate-50">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                           {counts.users > 0 ? ((summary?.total_customers || 0) / counts.users * 100).toFixed(1) : '0'}%
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest whitespace-nowrap">KHÁCH HÀNG</span>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 w-full border-t border-slate-50 pt-8">
                     <div className="text-center space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Khách mới</span>
                        <span className="text-xl font-black text-[#155e3a] tracking-tight">{summary?.total_customers || 0}</span>
                     </div>
                     <div className="text-center space-y-1 border-l border-slate-50">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Mục tiêu</span>
                        <span className="text-xl font-black text-slate-900 tracking-tight">{(counts.users * 0.15).toFixed(0)}</span>
                     </div>
                  </div>
               </Card>

               {/* Top Buyers Area - Updated to Dark Green */}
               <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-[#0a2e1f] p-8 text-white relative overflow-hidden group/buyers">
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mb-32 -mr-32 group-hover/buyers:bg-emerald-500/20 transition-all duration-500"></div>
                  
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 backdrop-blur-md border border-white/5 shadow-xl">
                        <Truck className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-lg font-black tracking-tighter leading-none uppercase">TOP TIÊU DÙNG</h3>
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Khách hàng thân thiết</p>
                     </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                     {topBuyers.length === 0 ? (
                        <div className="text-center py-10 text-emerald-900/50 font-black text-[10px] uppercase tracking-widest">Không có dữ liệu khách hàng</div>
                     ) : (
                        topBuyers.slice(0, 5).map((u, idx) => (
                           <div key={u.user_id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.03] hover:bg-white/[0.08] hover:border-white/10 transition-all cursor-default group/item">
                              <div className="w-10 h-10 rounded-xl bg-[#082419] flex items-center justify-center font-black text-emerald-600 text-sm border border-emerald-900/30 shadow-xl group-hover/item:text-emerald-400 transition-colors">
                                 {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="font-black text-sm truncate uppercase tracking-tight text-white/90">{u.name || 'Người dùng'}</div>
                                 <div className="text-[10px] font-black text-emerald-600 flex items-center gap-2 uppercase tracking-widest">
                                    <Clock className="w-3 h-3 text-emerald-500/50" />
                                    {u.orders_count} ĐƠN HÀNG
                                 </div>
                              </div>
                              <div className="text-right">
                                 <div className="text-sm font-black text-emerald-400 tracking-tighter">{formatCurrency(u.total_spent)}</div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-10 rounded-2xl h-14 bg-white/5 border-white/10 text-white hover:bg-white hover:text-[#0a2e1f] border-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                     DANH SÁCH KHÁCH HÀNG
                  </Button>
               </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}