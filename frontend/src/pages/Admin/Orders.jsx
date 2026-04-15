
import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';
import ShipmentModal from './ShipmentModal';
import { 
  ShoppingBag, 
  User, 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Info, 
  Search,
  ChevronRight,
  MoreVertical,
  Package,
  Calendar,
  Eye,
  Settings2,
  Printer,
  Receipt,
  Navigation
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

function formatCurrency(v) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
}

function formatDate(dt) {
  if (!dt) return '-';
  try {
    return new Date(dt).toLocaleString('vi-VN', {
       year: 'numeric', month: '2-digit', day: '2-digit',
       hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return String(dt);
  }
}

// OrderStatusBadge helper
const OrderStatusBadge = ({ status }) => {
  const st = String(status || '').toLowerCase();
  switch (st) {
    case 'pending': return <Badge className="bg-orange-100 text-orange-700 border-none px-3 font-black uppercase tracking-widest rounded-xl h-8 text-[9px] shadow-sm">Chờ xử lý</Badge>;
    case 'confirmed': return <Badge className="bg-sky-100 text-sky-700 border-none px-3 font-black uppercase tracking-widest rounded-xl h-8 text-[9px] shadow-sm">Đã xác nhận</Badge>;
    case 'shipping': return <Badge className="bg-indigo-100 text-indigo-700 border-none px-3 font-black uppercase tracking-widest rounded-xl h-8 text-[9px] shadow-sm">Đang giao</Badge>;
    case 'delivered': return <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 font-black uppercase tracking-widest rounded-xl h-8 text-[9px] shadow-sm">Hoàn tất</Badge>;
    case 'canceled': return <Badge className="bg-rose-100 text-rose-700 border-none px-3 font-black uppercase tracking-widest rounded-xl h-8 text-[9px] shadow-sm">Đã hủy</Badge>;
    default: return <Badge className="bg-slate-100 text-slate-600 border-none px-3 font-black uppercase tracking-widest rounded-xl h-8 text-[9px] shadow-sm">{status}</Badge>;
  }
};

const PaymentStatusBadge = ({ status }) => {
  const st = String(status || '').toLowerCase();
  switch (st) {
    case 'unpaid': return <Badge className="bg-slate-100 text-slate-500 border-none px-3 font-black uppercase tracking-widest rounded-lg h-6 text-[8px] shadow-sm">Chờ thanh toán</Badge>;
    case 'paid': return <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 font-black uppercase tracking-widest rounded-lg h-6 text-[8px] shadow-sm">Đã thanh toán</Badge>;
    case 'refunded': return <Badge className="bg-rose-100 text-rose-700 border-none px-3 font-black uppercase tracking-widest rounded-lg h-6 text-[8px] shadow-sm">Đã hoàn tiền</Badge>;
    default: return <Badge className="bg-slate-100 text-slate-500 border-none px-3 font-black uppercase tracking-widest rounded-lg h-6 text-[8px] shadow-sm">{status}</Badge>;
  }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [shipmentModalOrder, setShipmentModalOrder] = useState(null);
  const [pendingShipmentOrder, setPendingShipmentOrder] = useState(null);
  const token = localStorage.getItem('token');

  const orderStatusOptions = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'shipping', label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'canceled', label: 'Đã hủy' }
  ];
  const paymentStatusOptions = [
    { value: 'unpaid', label: 'Chưa thanh toán' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'refunded', label: 'Hoàn tiền' }
  ];

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/getAllOrder', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) {
        setOrders([]);
      } else {
        const normalized = (j.data || []).map(o => ({
          id: o.id,
          customer_name: o.customer_name ?? o.user_name ?? o.username ?? (o.user && o.user.name) ?? '-',
          total_price: o.total_price ?? o.total ?? o.totalPrice ?? 0,
          status: (o.status ?? o.order_status ?? '').toString(),
          payment_status: (o.payment_status ?? o.paymentStatus ?? '').toString(),
          shipping_address: o.shipping_address ?? '-',
          updated_at: o.updated_at ?? o.updatedAt ?? o.updated ?? null,
          raw: o
        }));
        setOrders(normalized);
      }
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [token]);

  async function fetchOrderDetail(orderId) {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/orders/orderDetail/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const j = await res.json().catch(() => null);
      if (res.ok && j && j.success) {
        setSelectedOrder(j.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSearch(query) {
    if (!query) { fetchOrders(); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/orders/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ query })
      });
      const j = await res.json().catch(() => null);
      if (res.ok && j && j.success) {
        const dataArr = Array.isArray(j.data) ? j.data : [j.data];
        const normalized = dataArr.map(order => ({
          id: order.id,
          customer_name: order.customer_name ?? order.user_name ?? '-',
          total_price: order.total_price ?? 0,
          status: (order.status ?? '').toString(),
          payment_status: (order.payment_status ?? '').toString(),
          shipping_address: order.shipping_address ?? '-',
          updated_at: order.updated_at ?? null,
          raw: order
        }));
        setOrders(normalized);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrder(orderId, { status, payment_status }) {
    if (!token) return;

    if (status === 'shipping' || status === 'delivered') {
      setShipmentModalOrder(orderId);
      setPendingShipmentOrder({ status });
      setShowShipmentModal(true);
      return;
    }

    const body = {};
    if (typeof status !== 'undefined') body.status = status;
    if (typeof payment_status !== 'undefined') body.payment_status = payment_status;

    try {
      const res = await fetch(`/api/orders/updateOrder/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.message || 'Update failed');
      
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, ...(status ? { status } : {}), ...(payment_status ? { payment_status } : {}), updated_at: (j.data && j.data.updated_at) || new Date().toISOString() } : o)));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({
          ...prev,
          status: status || prev.status,
          payment_status: payment_status || prev.payment_status,
          updated_at: (j.data && j.data.updated_at) || new Date().toISOString()
        }));
      }
    } catch (e) {
      alert('Cập nhật thất bại: ' + e.message);
    }
  }

  const handleShipmentSave = async () => {
    if (shipmentModalOrder && pendingShipmentOrder?.status) {
      const body = { status: pendingShipmentOrder.status };
      try {
        const res = await fetch(`/api/orders/updateOrder/${shipmentModalOrder}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
        const j = await res.json().catch(() => null);
        if (res.ok) {
          setOrders(prev => prev.map(o => o.id === shipmentModalOrder ? { ...o, status: body.status, updated_at: (j.data && j.data.updated_at) || new Date().toISOString() } : o));
          if (selectedOrder && selectedOrder.id === shipmentModalOrder) {
            setSelectedOrder(prev => ({ ...prev, status: body.status, updated_at: (j.data && j.data.updated_at) || new Date().toISOString() }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    setShowShipmentModal(false);
    setShipmentModalOrder(null);
    setPendingShipmentOrder(null);
  };

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
        <AdminHeader title="Vận hành đơn hàng" onSearch={handleSearch}/>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="p-8"
        >
           <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="text-left bg-slate-50/50">
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20 text-center">Mã Đơn</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-72">Khách hàng / Giao tới</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tổng giá trị</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tiến độ giao</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thanh toán</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Lệnh</th>
                      </tr>
                   </thead>
                   <motion.tbody
                    variants={{
                      animate: { transition: { staggerChildren: 0.05 } }
                    }}
                    initial="initial"
                    animate="animate"
                   >
                      {loading ? (
                         <tr><td colSpan="6" className="px-8 py-20 text-center text-[#155e3a] font-black uppercase tracking-widest text-xs animate-pulse">Đang nạp dữ liệu...</td></tr>
                      ) : orders.length === 0 ? (
                         <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Phân hệ này hiện đang trống</td></tr>
                      ) : (
                         orders.map((o) => (
                           <motion.tr 
                             variants={{
                               initial: { opacity: 0, y: 10 },
                               animate: { opacity: 1, y: 0 }
                             }}
                             key={o.id} 
                             className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors group"
                           >
                             <td className="px-8 py-6 text-center">
                                <span className="font-black text-slate-400 text-xs tracking-tighter">#{o.id}</span>
                             </td>
                             <td className="px-8 py-6">
                                <div className="space-y-2 min-w-0">
                                   <div className="font-black text-slate-900 group-hover:text-[#155e3a] transition-colors text-sm truncate uppercase tracking-tight leading-none">{o.customer_name}</div>
                                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                      <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                      <span className="truncate" title={o.shipping_address}>{o.shipping_address}</span>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <span className="text-sm font-black text-slate-900 tracking-tight">{formatCurrency(o.total_price)}</span>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <Select value={o.status} onValueChange={v => updateOrder(o.id, { status: v })}>
                                   <SelectTrigger className="mx-auto bg-transparent border-none shadow-none focus:ring-0 w-auto h-auto p-0 hover:scale-105 transition-transform active:scale-95">
                                      <OrderStatusBadge status={o.status} />
                                   </SelectTrigger>
                                   <SelectContent className="rounded-[1.5rem] shadow-2xl border-none p-2 min-w-[180px]">
                                      {orderStatusOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value} className="rounded-xl font-black uppercase tracking-widest text-[9px] py-3 cursor-pointer">
                                           {opt.label}
                                        </SelectItem>
                                      ))}
                                   </SelectContent>
                                </Select>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <Select value={o.payment_status} onValueChange={v => updateOrder(o.id, { payment_status: v })}>
                                   <SelectTrigger className="mx-auto bg-transparent border-none shadow-none focus:ring-0 w-auto h-auto p-0 hover:scale-105 transition-transform active:scale-95">
                                      <PaymentStatusBadge status={o.payment_status} />
                                   </SelectTrigger>
                                   <SelectContent className="rounded-[1.5rem] shadow-2xl border-none p-2 min-w-[180px]">
                                      {paymentStatusOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value} className="rounded-xl font-black uppercase tracking-widest text-[9px] py-3 cursor-pointer">
                                           {opt.label}
                                        </SelectItem>
                                      ))}
                                   </SelectContent>
                                </Select>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-[#155e3a]/10 hover:text-[#155e3a] transition-all">
                                         <MoreVertical className="w-5 h-5" />
                                      </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end" className="w-60 rounded-[1.5rem] p-2 shadow-2xl border-none ring-1 ring-slate-100">
                                      <DropdownMenuItem onClick={() => fetchOrderDetail(o.id)} className="rounded-xl flex items-center gap-3 p-3 font-black text-[11px] uppercase tracking-widest cursor-pointer hover:bg-[#155e3a]/5 hover:text-[#155e3a]">
                                         <Eye className="w-4 h-4" /> Truy xuất chi tiết
                                      </DropdownMenuItem>
                                      {(o.status === 'shipping' || o.status === 'delivered') && (
                                        <DropdownMenuItem onClick={() => { setShipmentModalOrder(o.id); setShowShipmentModal(true); }} className="rounded-xl flex items-center gap-3 p-3 font-black text-[11px] uppercase tracking-widest cursor-pointer hover:bg-emerald-50 text-emerald-700">
                                           <Truck className="w-4 h-4" /> Quản lý giao vận
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 font-black text-[10px] uppercase tracking-widest cursor-default text-slate-400">
                                         <Calendar className="w-4 h-4 opacity-50" /> Log: {formatDate(o.updated_at)}
                                      </DropdownMenuItem>
                                   </DropdownMenuContent>
                                </DropdownMenu>
                             </td>
                           </motion.tr>
                         ))
                      )}
                   </motion.tbody>
                </table>
             </div>
           </Card>
        </motion.div>

        {/* Order Detail Modal */}
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 overflow-hidden border-none rounded-[4rem] shadow-2xl">
            <DialogHeader className="p-8 border-b bg-[#0a2e1f] text-white">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#155e3a] text-white flex items-center justify-center font-black shadow-xl shadow-[#155e3a]/40 border border-white/10">
                     <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black tracking-tighter uppercase">
                      Hồ sơ lệnh vận #00{selectedOrder?.id}
                    </DialogTitle>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5" />
                       Phiên bản cập nhật: {formatDate(selectedOrder?.updated_at)}
                    </p>
                  </div>
               </div>
            </DialogHeader>

            <ScrollArea className="flex-1 p-10 bg-slate-50/50">
              <div className="space-y-12">
                 {/* Top Row: Customer & Order Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                       <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3 px-2">
                          <User className="w-4 h-4 text-[#155e3a]" /> Thông tin đối tác
                       </h4>
                       <div className="bg-white p-8 rounded-[3rem] border-4 border-white space-y-5 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                          <div className="flex flex-col relative z-10">
                             <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">Mục tiêu nhận hàng</span>
                             <span className="font-black text-slate-900 text-xl tracking-tight uppercase leading-none">{selectedOrder?.customer_name || '-'}</span>
                          </div>
                          <div className="grid grid-cols-1 gap-4 relative z-10">
                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                               <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                                  <Receipt className="w-4 h-4" />
                               </div>
                               <span className="font-black text-slate-700 text-[10px] truncate tracking-tight">{selectedOrder?.customer_email || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                               <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#155e3a] border border-emerald-100">
                                  <Clock className="w-4 h-4" />
                               </div>
                               <span className="font-black text-slate-900 text-sm tracking-tight">{selectedOrder?.customer_phone || '-'}</span>
                            </div>
                          </div>
                       </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                       <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3 px-2">
                          <Navigation className="w-4 h-4 text-[#155e3a]" /> Logistics & Chỉ dẫn
                       </h4>
                       <div className="bg-white p-8 rounded-[3rem] border-4 border-white space-y-5 shadow-2xl shadow-slate-200/50 min-h-[140px] relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#155e3a]/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                          <div className="flex flex-col relative z-10">
                             <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">Tọa độ đích</span>
                             <span className="font-black text-slate-800 text-sm leading-relaxed tracking-tight">{selectedOrder?.shipping_address || 'Địa chỉ ẩn'}</span>
                          </div>
                          <div className="flex flex-col relative z-10 pt-2 border-t border-slate-50">
                             <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-2">Thông điệp chỉ dẫn</span>
                             <span className="font-black text-emerald-600 text-[11px] italic">"{selectedOrder?.note || 'Không có ghi chú kèm theo'}"</span>
                          </div>
                       </div>
                    </motion.div>
                 </div>

                 {/* Status Row */}
                 <div className="grid grid-cols-3 gap-6">
                    {[
                       { label: 'Tiến độ', badge: <OrderStatusBadge status={selectedOrder?.status} />, icon: Settings2, color: 'text-sky-500' },
                       { label: 'Tài chính', badge: <PaymentStatusBadge status={selectedOrder?.payment_status} />, icon: CreditCard, color: 'text-emerald-500' },
                       { label: 'Giao thức', badge: <Badge variant="outline" className="border-slate-200 font-black px-4 h-8 rounded-xl uppercase tracking-widest text-[9px] bg-white shadow-sm ring-1 ring-slate-100">{selectedOrder?.payment_method || '-'}</Badge>, icon: Info, color: 'text-indigo-500' }
                    ].map((item, i) => (
                       <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * i }}
                        key={i} 
                        className="flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] gap-4 shadow-xl shadow-slate-200/40 group relative overflow-hidden border-2 border-white"
                       >
                          <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-500`}>
                             <item.icon className="w-6 h-6" />
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</span>
                          {item.badge}
                       </motion.div>
                    ))}
                 </div>

                 {/* Order Items Table */}
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3 px-2">
                        <ShoppingBag className="w-4 h-4 text-[#155e3a]" /> Danh mục vật tư bàn giao ({selectedOrder?.order_items?.length || 0})
                    </h4>
                    <div className="rounded-[3rem] border-4 border-white overflow-hidden shadow-2xl shadow-slate-200/50 bg-white">
                       <table className="w-full">
                          <thead>
                             <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Sản phẩm</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Biến thể</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Số lượng</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Tổng giá</th>
                             </tr>
                          </thead>
                          <tbody>
                             {selectedOrder?.order_items?.map((item, idx) => (
                               <tr key={idx} className="border-t border-slate-50 group/item">
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-5">
                                       <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden bg-slate-50 border-2 border-slate-100 group-hover/item:scale-105 transition-transform duration-500">
                                          <img 
                                            src={item.product_avatar || 'https://placehold.co/100'} 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => { e.target.src = 'https://placehold.co/200?text=Food'; }}
                                          />
                                       </div>
                                       <div className="flex flex-col">
                                          <span className="text-sm font-black uppercase tracking-tight leading-none mb-2 text-slate-800">{item.product_name}</span>
                                          <div className="flex items-center gap-2">
                                             <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter rounded-md h-5 border-emerald-100 text-[#155e3a] bg-emerald-50/30">ID ITEM: {item.id || idx}</Badge>
                                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic">Quy cách: {item.unit}</span>
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6 text-center">
                                    <Badge className="bg-slate-50 text-slate-600 border border-slate-200 font-black text-[9px] px-3 h-7 rounded-xl uppercase tracking-tighter">{item.variant_name || 'ORIGINAL'}</Badge>
                                 </td>
                                 <td className="px-8 py-6 text-center">
                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-900 font-black text-sm border-2 border-white shadow-sm italic">
                                       x{item.quantity}
                                    </div>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <span className="font-black text-sm text-[#155e3a] tracking-tight">{formatCurrency(item.subtotal)}</span>
                                 </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>
            </ScrollArea>

            <DialogFooter className="p-10 border-t bg-white text-slate-900 flex items-center justify-between sm:justify-between rounded-b-[4rem]">
               <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                     <Printer className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                     <span className="text-[9px] font-black text-[#155e3a] uppercase tracking-[0.3em]">Cổng toán quyết</span>
                  </div>
                  <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{formatCurrency(selectedOrder?.total_price || 0)}</span>
               </div>
               <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setSelectedOrder(null)} className="rounded-[1.5rem] h-14 px-10 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all border-none">ĐÓNG LỆNH</Button>
                  <Button className="rounded-[1.5rem] h-14 px-12 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[#155e3a]/40 bg-[#155e3a] text-white hover:bg-[#0f4a2b] border-none hover:scale-105 active:scale-95 transition-all flex gap-3">
                     <Printer className="w-4 h-4" /> IN HÓA ĐƠN
                  </Button>
               </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Shipment Modal */}
        <ShipmentModal
          orderId={shipmentModalOrder}
          isOpen={showShipmentModal}
          onClose={() => {
            setShowShipmentModal(false);
            setShipmentModalOrder(null);
          }}
          orderStatus={shipmentModalOrder ? (orders.find(o => o.id === shipmentModalOrder)?.status) : null}
          onSave={handleShipmentSave}
          token={token}
        />
      </main>
    </div>
  );
}