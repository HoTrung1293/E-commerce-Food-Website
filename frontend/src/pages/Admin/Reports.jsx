
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Calendar as CalendarIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Package,
  Star,
  UserCheck,
  Zap,
  Activity,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

const AdminReports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const fetchReports = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = new URLSearchParams({ start: startDate, end: endDate });
      const [sRes, mRes, pRes, bRes] = await Promise.all([
        fetch(`/api/reports/revenue-summary?${params}`, { headers }).then(r => r.json()),
        fetch(`/api/reports/revenue-by-month?${params}`, { headers }).then(r => r.json()),
        fetch(`/api/reports/top-products?limit=5&${params}`, { headers }).then(r => r.json()),
        fetch(`/api/reports/top-buyers?limit=5&${params}`, { headers }).then(r => r.json())
      ]);

      if (sRes.success) setSummary(sRes.data);
      if (mRes.success) setMonthlyData((mRes.data || []).sort((a, b) => a.month.localeCompare(b.month)));
      if (pRes.success) setTopProducts(pRes.data);
      if (bRes.success) setTopBuyers(bRes.data);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  // Sidebar sync
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(localStorage.getItem('admin.sidebar.collapsed') === '1');

  return (
    <div 
      className="admin-root min-h-screen bg-slate-50/50"
      style={{ 
        display: 'grid', 
        gridTemplateColumns: isSidebarCollapsed ? '80px 1fr' : '280px 1fr',
        transition: 'grid-template-columns 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
      }}
    >
      <AdminSidebar onToggle={setIsSidebarCollapsed} />
      <main className="admin-main flex flex-col min-w-0">
        <AdminHeader title="Phân tích & Tối ưu hóa" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="p-8 space-y-10 max-w-[1600px] mx-auto w-full"
        >
           {/* Filters */}
           <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden p-10 bg-white relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#155e3a]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="flex flex-col md:flex-row items-end gap-6 justify-between relative z-10">
                 <div className="flex flex-col md:flex-row items-end gap-6 flex-1">
                    <div className="space-y-3 flex-1 w-full md:w-auto">
                       <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-[#155e3a]" /> Tọa độ bắt đầu
                       </label>
                       <div className="relative">
                          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-2 border-white focus-visible:ring-[#155e3a]/20 font-black shadow-xl shadow-slate-200/40 text-sm" />
                       </div>
                    </div>
                    <div className="space-y-3 flex-1 w-full md:w-auto">
                       <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-[#155e3a]" /> Tọa độ kết thúc
                       </label>
                       <div className="relative">
                          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-2 border-white focus-visible:ring-[#155e3a]/20 font-black shadow-xl shadow-slate-200/40 text-sm" />
                       </div>
                    </div>
                    <Button onClick={fetchReports} disabled={loading} className="h-14 rounded-2xl px-12 font-black uppercase text-[11px] tracking-[0.2em] bg-[#155e3a] text-white hover:bg-[#0f4a2b] shadow-2xl shadow-[#155e3a]/40 group border-none w-full md:w-auto transition-all hover:scale-105 active:scale-95">
                       {loading ? 'TRUY XUẤT...' : 'QUÉT DỮ LIỆU'}
                    </Button>
                 </div>
                 <Button variant="ghost" className="h-14 rounded-2xl px-8 font-black text-[11px] uppercase tracking-[0.2em] text-[#155e3a] gap-3 transition-all hover:bg-[#155e3a]/10">
                    <Download className="w-4 h-4" /> Xuất bản báo cáo
                 </Button>
              </div>
           </Card>

           {/* Stats Summary */}
           {summary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                   { label: 'Doanh thu thuần', value: formatCurrency(summary.total_revenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%' },
                   { label: 'Mật độ đơn hàng', value: summary.total_orders, icon: ShoppingBag, color: 'text-sky-600', bg: 'bg-sky-50', trend: '+4.2%' },
                   { label: 'Mạng lưới đối tác', value: summary.total_customers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+8.1%' },
                   { label: 'Quy mô hàng hóa', value: summary.total_items, icon: Package, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+15.9%' }
                 ].map((s, i) => (
                   <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                   >
                     <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white p-10 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700 opacity-50"></div>
                        <div className="flex justify-between items-start mb-8 relative z-10">
                           <div className={`w-16 h-16 rounded-[1.5rem] ${s.bg} ${s.color} flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
                              <s.icon className="w-7 h-7" />
                           </div>
                           <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[9px] font-black h-7 px-3 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> {s.trend}
                           </Badge>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{s.label}</h4>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{s.value}</div>
                     </Card>
                   </motion.div>
                 ))}
              </div>
           )}

           <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              {/* Chart Section */}
              <div className="xl:col-span-8 flex flex-col gap-10">
                 <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[4rem] bg-white overflow-hidden p-12 flex flex-col h-full relative">
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#155e3a]/5 rounded-full blur-[100px] -mr-48 -mb-48"></div>
                    <div className="flex items-center justify-between mb-16 relative z-10">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#0a2e1f] text-[#34d399] flex items-center justify-center shadow-xl shadow-[#0a2e1f]/20">
                             <Activity className="w-6 h-6" />
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Chỉ số tăng trưởng doanh thu</h3>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-[#155e3a]" />
                                Quỹ đạo 12 chu kỳ gần nhất
                             </p>
                          </div>
                       </div>
                       <Button variant="outline" size="sm" className="rounded-xl border-slate-100 font-black text-[9px] uppercase tracking-widest h-8 px-4">THAM CHIẾU LỊCH SỬ</Button>
                    </div>

                    <div className="flex-1 flex gap-8 items-end justify-between min-h-[350px] px-6 relative z-10">
                       {monthlyData.length === 0 ? (
                          <div className="w-full flex flex-col items-center justify-center text-slate-300 gap-6 mb-24 opacity-50">
                             <BarChart3 className="w-24 h-24" strokeWidth={1} />
                             <span className="text-[11px] font-black uppercase tracking-[0.3em]">Hệ thống đang chờ lệnh quét</span>
                          </div>
                       ) : (
                          monthlyData.map((d, i) => {
                             const max = Math.max(...monthlyData.map(item => item.revenue));
                             const height = max ? (d.revenue / max) * 100 : 0;
                             return (
                               <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end max-w-[100px]">
                                  <div className="absolute bottom-full mb-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none">
                                     <div className="bg-[#0a2e1f] text-white text-[10px] font-black px-4 py-3 rounded-2xl shadow-2xl relative">
                                        {formatCurrency(d.revenue)}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#0a2e1f]"></div>
                                     </div>
                                  </div>
                                  <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 1, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                                    className="w-full rounded-[1.5rem] bg-slate-50 border-4 border-white group-hover:bg-[#155e3a] group-hover:scale-105 transition-all duration-500 shadow-2xl shadow-slate-200/50 group-hover:shadow-[#155e3a]/40 relative"
                                  >
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  </motion.div>
                                  <span className="text-[10px] font-black text-slate-400 mt-6 uppercase group-hover:text-[#155e3a] transition-colors tracking-widest">{d.month}</span>
                               </div>
                             );
                          })
                       )}
                    </div>
                 </Card>

                 {/* Top Products */}
                 <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[4rem] bg-white overflow-hidden p-12 relative h-full">
                    <div className="flex items-center gap-4 mb-12">
                       <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/10">
                          <Award className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Kiến trúc sản phẩm thịnh hành</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Phân loại theo chỉ số doanh thu thặng dư</p>
                       </div>
                    </div>

                    <div className="space-y-8">
                       {topProducts.length === 0 ? (
                         <div className="py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">DỮ LIỆU SẼ XUẤT HIỆN TẠI ĐÂY</div>
                       ) : (
                         topProducts.map((p, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="flex items-center gap-8 p-6 rounded-[2.5rem] bg-slate-50/50 border-4 border-white group hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-default"
                          >
                             <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-50 flex items-center justify-center font-black text-[#155e3a] text-xl shadow-sm group-hover:scale-110 transition-transform">
                                0{i+1}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="font-black text-slate-900 group-hover:text-[#155e3a] transition-colors text-[13px] uppercase tracking-tight mb-2 truncate">{p.product_name}</div>
                                <div className="relative h-2 bg-white rounded-full overflow-hidden shadow-inner border border-slate-50">
                                   <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${95 - i * 12}%` }}
                                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#155e3a] to-[#34d399] rounded-full"
                                   />
                                </div>
                             </div>
                             <div className="text-right">
                                <div className="text-sm font-black text-[#155e3a] tracking-tighter">{formatCurrency(p.revenue)}</div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{p.total_sold} UNITS DELIVERED</div>
                             </div>
                          </motion.div>
                         ))
                       )}
                    </div>
                 </Card>
              </div>

              {/* Sidebar Reports Area */}
              <div className="xl:col-span-4 flex flex-col gap-10">
                 {/* Top Buyers */}
                 <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[4rem] bg-[#0a2e1f] text-white p-12 relative overflow-hidden h-full flex flex-col">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#155e3a] rounded-full blur-[120px] -mr-40 -mt-40 opacity-30"></div>
                    <div className="relative z-10 flex flex-col h-full">
                       <div className="flex items-center gap-5 mb-14">
                          <div className="w-14 h-14 rounded-2xl bg-[#155e3a]/30 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[#34d399] shadow-2xl">
                             <UserCheck className="w-7 h-7" />
                          </div>
                          <div>
                             <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Bản đồ khách hàng VVIP</h3>
                             <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mt-2">Dữ liệu chi tiêu tích lũy</p>
                          </div>
                       </div>

                       <div className="space-y-6 flex-1">
                          {topBuyers.length === 0 ? (
                            <div className="py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-widest">WAITING FOR FETCH...</div>
                          ) : (
                            topBuyers.map((b, i) => (
                              <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i} 
                                className="flex items-center gap-5 p-5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] transition-all group group-hover:border-emerald-500/30"
                              >
                                 <div className="w-12 h-12 rounded-xl bg-[#0a2e1f] flex items-center justify-center font-black text-[#155e3a] group-hover:text-[#34d399] transition-colors border border-white/5 group-hover:scale-110">
                                    {i + 1}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="font-black text-xs uppercase truncate mb-1.5 tracking-tight">{b.name}</div>
                                    <div className="text-[9px] font-black text-emerald-500/40 flex items-center gap-2 uppercase tracking-widest">
                                       <ShoppingBag className="w-3 h-3" /> {b.orders_count} Lệnh đặt hàng
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-xs font-black text-[#34d399] tracking-tighter">{formatCurrency(b.total_spent)}</div>
                                 </div>
                              </motion.div>
                            ))
                          )}
                       </div>

                       <Button variant="ghost" className="w-full mt-12 rounded-[1.5rem] h-16 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white hover:text-[#0a2e1f] transition-all flex items-center gap-4 group">
                          XEM TRUY XUẤT TẤT CẢ <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                       </Button>
                    </div>
                 </Card>
              </div>
           </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminReports;

