import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, ShoppingBag, Clock, CheckCircle, XCircle, Truck, ArrowLeft, MapPin, CreditCard, FileText, User, Calendar, ReceiptText, ChevronLeft, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';


export default function OrderDetail() {
  const { orderId } = useParams();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId || !token) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/orders/orderDetail/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setOrder(data.data);
        } else {
          setError(data.message || 'Không thể tải thông tin đơn hàng');
        }
      } catch (err) {
        console.error('Error fetching order detail:', err);
        setError('Có lỗi xảy ra khi tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, token]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipping: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      canceled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      canceled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-5 h-5" />,
      confirmed: <CheckCircle className="w-5 h-5" />,
      shipping: <Truck className="w-5 h-5" />,
      delivered: <CheckCircle className="w-5 h-5" />,
      canceled: <XCircle className="w-5 h-5" />
    };
    return icons[status] || <Package className="w-5 h-5" />;
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }

    try {
      setIsCanceling(true);
      const response = await fetch(`http://localhost:5000/api/orders/cancelOrder/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: cancelReason
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Đơn hàng đã được hủy thành công');
        setShowCancelModal(false);
        setCancelReason('');
        // Reload order detail
        const detailResponse = await fetch(`http://localhost:5000/api/orders/orderDetail/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const detailData = await detailResponse.json();
        if (detailResponse.ok && detailData.success) {
          setOrder(detailData.data);
        }
      } else {
        alert(data.message || 'Không thể hủy đơn hàng');
      }
    } catch (err) {
      console.error('Error canceling order:', err);
      alert('Có lỗi xảy ra khi hủy đơn hàng');
    } finally {
      setIsCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy đơn hàng'}</p>
          <button
            onClick={() => navigate('/account/orders')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Navigation Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="link" onClick={() => navigate('/account/orders')} className="h-auto p-0 text-muted-foreground hover:text-primary gap-2">
                <ChevronLeft className="w-4 h-4" /> Danh sách đơn hàng
            </Button>
            <div className="flex items-center gap-3">
               <Badge className={`h-8 rounded-full border-none font-black text-xs uppercase tracking-tighter ${getStatusColor(order.status).replace('100', '10').replace('800', '700')}`}>
                  {getStatusIcon(order.status)}
                  {getStatusText(order.status)}
               </Badge>
            </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mb-12">
           <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-4">
                 <ReceiptText className="w-10 h-10 text-primary" />
                 Đơn hàng #{order.order_number || order.id.slice(-6).toUpperCase()}
              </h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Calendar className="w-4 h-4" /> Đặt ngày {formatDateTime(order.created_at)}
              </p>
           </div>
           
           <div className="flex gap-4">
              <Button variant="outline" className="h-12 px-6 rounded-xl border-2 font-black shadow-sm">IN HÓA ĐƠN</Button>
              {order.status === 'delivered' && <Button className="h-12 px-6 rounded-xl font-black shadow-lg shadow-primary/20">MUA LẠI</Button>}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Status Flow Section */}
            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
               <CardContent className="p-10 flex items-center justify-between">
                  <div className="flex flex-col items-center gap-3 group">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${['pending', 'confirmed', 'shipping', 'delivered'].includes(order.status) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-300'}`}>
                        <Clock className="w-6 h-6" />
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase">Chờ xử lý</span>
                  </div>
                  <div className={`h-[2px] flex-1 mx-2 rounded-full ${['confirmed', 'shipping', 'delivered'].includes(order.status) ? 'bg-primary' : 'bg-slate-100'}`}></div>
                  <div className="flex flex-col items-center gap-3">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${['confirmed', 'shipping', 'delivered'].includes(order.status) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-300'}`}>
                        <CheckCircle className="w-6 h-6" />
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase">Xác nhận</span>
                  </div>
                  <div className={`h-[2px] flex-1 mx-2 rounded-full ${['shipping', 'delivered'].includes(order.status) ? 'bg-primary' : 'bg-slate-100'}`}></div>
                  <div className="flex flex-col items-center gap-3">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${['shipping', 'delivered'].includes(order.status) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-300'}`}>
                        <Truck className="w-6 h-6" />
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase">Đang giao</span>
                  </div>
                  <div className={`h-[2px] flex-1 mx-2 rounded-full ${['delivered'].includes(order.status) ? 'bg-primary' : 'bg-slate-100'}`}></div>
                  <div className="flex flex-col items-center gap-3">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${order.status === 'delivered' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-300'}`}>
                        <Package className="w-6 h-6" />
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase">Đã nhận</span>
                  </div>
               </CardContent>
            </Card>

            {/* Product List */}
            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
               <CardHeader className="p-10 border-b flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-black text-slate-900 uppercase">Sản phẩm đã đặt</CardTitle>
                  <Badge variant="secondary" className="rounded-lg font-black">{order.order_items?.length || 0} món</Badge>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                     {order.order_items?.map((item, index) => (
                       <div key={index} className="p-10 flex items-center gap-6 hover:bg-slate-50/50 transition-colors">
                          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                             <img
                               src={item.product_avatar || '/placeholder.png'}
                               alt={item.product_name}
                               className="w-full h-full object-cover"
                             />
                          </div>
                          <div className="flex-1 space-y-1">
                             <h4 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">{item.product_name}</h4>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.variant_name} • {item.unit}</p>
                             <p className="text-sm font-black text-slate-400">Số lượng: <span className="text-slate-900">{item.quantity}</span></p>
                          </div>
                          <div className="text-right">
                             <p className="text-xl font-black text-primary tracking-tighter leading-none">{formatPrice(item.price * item.quantity)}</p>
                             <p className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-tighter">Giá lẻ: {formatPrice(item.price)}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </CardContent>
               <CardFooter className="p-10 bg-slate-50/50 border-t flex items-center justify-between text-slate-900">
                  <span className="text-lg font-black">Tổng giá trị sản phẩm</span>
                  <span className="text-3xl font-black tracking-tighter text-primary">{formatPrice(order.total_price)}</span>
               </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* Customer & Shipping Detail */}
            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
               <CardHeader className="p-10 border-b bg-slate-50">
                  <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-3">
                     <User className="w-5 h-5 text-primary" />
                     Khách hàng
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-10 space-y-8">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Họ tên nhận hàng</p>
                     <p className="font-black text-slate-800 text-lg">{order.customer_name}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Số điện thoại</p>
                     <p className="font-black text-slate-800 text-lg">{order.customer_phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Email liên hệ</p>
                     <p className="font-bold text-slate-600 truncate">{order.customer_email}</p>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Địa chỉ nhận hàng</h4>
                     </div>
                     <p className="text-sm font-bold text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{order.shipping_address}</p>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Thanh toán</h4>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-xs font-black text-slate-600 uppercase">{order.payment_method || 'N/A'}</span>
                        <Badge variant="outline" className={`rounded-lg font-black text-[10px] ${order.payment_status === 'paid' ? 'border-green-200 text-green-600 bg-green-50' : 'border-orange-200 text-orange-600 bg-orange-50'}`}>
                           {order.payment_status === 'paid' ? 'ĐÃ TRẢ' : 'COD'}
                        </Badge>
                     </div>
                  </div>
                  
                  {order.note && (
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <FileText className="w-5 h-5 text-primary" />
                           <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Ghi chú từ bạn</h4>
                        </div>
                        <p className="text-sm font-bold italic text-slate-400 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">"{order.note}"</p>
                     </div>
                  )}
               </CardContent>
            </Card>

            {/* Cancel Action */}
            {order.status === 'pending' && (
               <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                  <DialogTrigger asChild>
                     <Button variant="destructive" className="w-full h-16 rounded-[2rem] font-black text-lg shadow-2xl shadow-destructive/20 gap-3 group">
                        <Trash2 className="w-5 h-5 group-hover:animate-bounce" /> HỦY ĐƠN HÀNG
                     </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
                     <DialogHeader className="p-10 bg-destructive/5 border-b border-destructive/10">
                        <DialogTitle className="text-2xl font-black text-destructive flex items-center gap-3 uppercase">
                           <Trash2 className="w-7 h-7" /> Xác nhận huỷ đơn
                        </DialogTitle>
                        <DialogDescription className="text-sm font-bold text-slate-400 uppercase tracking-widest pt-2">Hành động này không thể hoàn tác</DialogDescription>
                     </DialogHeader>
                     <div className="p-10 space-y-6">
                        <p className="text-slate-600 font-bold">Bạn có chắc chắn muốn hủy đơn hàng này? Hãy cho chúng tôi biết lý do để cải thiện dịch vụ.</p>
                        <div className="space-y-3">
                           <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lý do hủy đơn</Label>
                           <Textarea
                             value={cancelReason}
                             onChange={(e) => setCancelReason(e.target.value)}
                             placeholder="VD: Thay đổi phương thức thanh toán, Đặt nhầm sản phẩm..."
                             className="rounded-2xl border-2 border-slate-100 min-h-32 p-5 font-bold focus-visible:ring-destructive/20"
                           />
                        </div>
                     </div>
                     <DialogFooter className="p-10 bg-slate-50 border-t flex-row gap-4">
                        <DialogClose asChild>
                           <Button variant="ghost" className="rounded-xl font-black flex-1 h-12">ĐÓNG</Button>
                        </DialogClose>
                        <Button 
                          variant="destructive" 
                          className="rounded-xl font-black flex-1 h-12 shadow-xl shadow-destructive/20"
                          onClick={handleCancelOrder}
                          disabled={isCanceling}
                        >
                          {isCanceling ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN HỦY'}
                        </Button>
                     </DialogFooter>
                  </DialogContent>
               </Dialog>
            )}
            
            <Card className="border-none shadow-sm rounded-[2.5rem] p-8 text-center bg-slate-50/50">
               <p className="text-[11px] font-black text-slate-300 uppercase leading-relaxed">Nếu cần bất kỳ hỗ trợ nào về đơn hàng này, vui lòng liên hệ hotline <span className="text-primary">1900 123 456</span></p>
            </Card>
          </div>
        </div>
      </div>
    </div>

  );
}
