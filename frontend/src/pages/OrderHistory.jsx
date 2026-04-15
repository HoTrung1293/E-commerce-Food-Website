import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, ShoppingBag, Clock, CheckCircle, XCircle, Truck, ArrowLeft, X, MapPin, CreditCard, FileText, User, Star, ChevronRight, Search, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function OrderHistory() {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [orderReviewStatus, setOrderReviewStatus] = useState(null);





  // Lấy lịch sử đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id || !token) return;

      try {
        setOrdersLoading(true);
        // Lấy tất cả đơn hàng KHÔNG lọc để tính số thứ tự đúng
        const allResponse = await fetch(`http://localhost:5000/api/orders/myOrders/${user.id}?page=1&limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const allData = await allResponse.json();

        if (allResponse.ok && allData.success) {
          const allOrdersList = allData.data || [];
          setAllOrders(allOrdersList);
          
          // Lọc theo status nếu không phải 'all'
          if (selectedStatus !== 'all') {
            const filteredOrders = allOrdersList.filter(order => order.status === selectedStatus);
            setOrders(filteredOrders);
          } else {
            setOrders(allOrdersList);
          }
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id, token, selectedStatus]);

  // Fetch per-order review status (window + per-item reviewed)
  async function fetchOrderReviewStatus(orderId) {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/order/${orderId}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return setOrderReviewStatus(null);
      const data = await res.json();
      setOrderReviewStatus(data?.data || null);
    } catch (e) {
      console.error('Error fetching order review status', e);
      setOrderReviewStatus(null);
    }
  }


  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  // Review modal helpers
  const openReviewModal = (item) => {
    setReviewingItem(item);
    setReviewRating(0);


    setReviewComment('');
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setReviewingItem(null);
    setReviewRating(0);
    setReviewComment('');
  };



  const handleSubmitReview = async () => {
    if (!isAuthenticated()) {
      navigate('/auth/login');
      return;
    }

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      alert('Vui lòng chọn số sao (1-5).');
      return;
    }



    try {
      setReviewSubmitting(true);
      const res = await fetch('http://localhost:5000/api/reviews/fromOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: reviewingItem?.order_id,
          variantId: reviewingItem.variant_id,
          rating: reviewRating,
          comment: reviewComment?.trim() || ''
        })
      });
      let data;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { message: text };
      }
      if (res.ok) {
        alert('Gửi đánh giá thành công!');
        closeReviewModal();
        if (reviewingItem?.order_id) {
          fetchOrderReviewStatus(reviewingItem.order_id);
        }
      } else {
        const msg = data?.message || `Gửi đánh giá thất bại (mã ${res.status}).`;
        alert(msg);
      }
    } catch (e) {
      console.error('Submit review error', e);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setReviewSubmitting(false);
    }
  };

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
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      shipping: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      canceled: <XCircle className="w-4 h-4" />
    };
    return icons[status] || <Package className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="link" onClick={() => navigate('/account')} className="h-auto p-0 text-muted-foreground hover:text-primary gap-2">
                <ArrowLeft className="w-4 h-4" /> Quay lại tài khoản
            </Button>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest hidden sm:block">
               {allOrders.length} Đơn hàng đã đặt
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mb-12">
           <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tighter uppercase">
                 <ShoppingBag className="w-10 h-10 text-primary" />
                 Lịch sử đơn hàng
              </h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Xem trạng thái và chi tiết các đơn hàng của bạn</p>
           </div>
           
           <div className="w-full md:w-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                placeholder="Tìm mã đơn hàng..." 
                className="h-14 w-full md:w-64 rounded-2xl bg-white border-none shadow-xl shadow-gray-200/50 pl-12 font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
              />
           </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
           {[
             { id: 'all', label: 'Tất cả Đơn', color: 'bg-slate-900', icon: <Package className="w-4 h-4" /> },
             { id: 'pending', label: 'Chờ xác nhận', color: 'bg-yellow-500', icon: <Clock className="w-4 h-4" /> },
             { id: 'confirmed', label: 'Đã xác nhận', color: 'bg-blue-500', icon: <CheckCircle className="w-4 h-4" /> },
             { id: 'shipping', label: 'Đang giao', color: 'bg-indigo-500', icon: <Truck className="w-4 h-4" /> },
             { id: 'delivered', label: 'Đã hoàn tất', color: 'bg-primary', icon: <CheckCircle className="w-4 h-4" /> },
             { id: 'canceled', label: 'Đã hủy', color: 'bg-destructive', icon: <XCircle className="w-4 h-4" /> }
           ].map((tab) => (
             <Button
               key={tab.id}
               onClick={() => setSelectedStatus(tab.id)}
               variant={selectedStatus === tab.id ? "default" : "secondary"}
               className={`h-12 rounded-2xl px-6 gap-2 font-black text-xs uppercase tracking-widest transition-all ${selectedStatus === tab.id ? 'shadow-xl shadow-primary/20' : 'bg-white border hover:bg-slate-50'}`}
             >
                {tab.icon}
                {tab.label}
             </Button>
           ))}
        </div>

        {/* Orders list */}
        {ordersLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="rounded-[2.5rem] border-none shadow-xl p-8 space-y-4 bg-white">
                <div className="flex justify-between items-center">
                   <Skeleton className="h-6 w-1/4 rounded-lg" />
                   <Skeleton className="h-6 w-32 rounded-full" />
                </div>
                <Separator />
                <div className="flex justify-between items-center pt-2">
                   <Skeleton className="h-10 w-1/3 rounded-lg" />
                   <Skeleton className="h-10 w-1/4 rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="rounded-[3rem] border-none shadow-2xl shadow-gray-200/50 p-20 text-center bg-white">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
               <Package className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Trống trải quá nhỉ?</h3>
            <p className="text-sm font-bold text-slate-400 mb-10 max-w-xs mx-auto">Bạn chưa có đơn hàng nào hoặc các đơn hàng đã lọc không tồn tại.</p>
            <Button
              onClick={() => navigate('/product')}
              className="h-14 px-10 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
            >
              TIẾP TỤC MUA SẮM
            </Button>
          </Card>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="group border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
                onClick={() => handleOrderClick(order.id)}
              >
                <CardHeader className="bg-slate-50/50 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-primary transition-colors">
                        <ShoppingBag className="w-6 h-6 text-primary group-hover:text-white" />
                     </div>
                     <div>
                        <CardTitle className="text-xl font-black text-slate-900">Đơn hàng #{order.order_number || order.id.slice(-6).toUpperCase()}</CardTitle>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDateTime(order.created_at)}</p>
                     </div>
                  </div>
                  
                  <Badge className={`h-10 rounded-2xl px-5 border-none font-black text-[10px] uppercase tracking-widest gap-2 ${getStatusColor(order.status).replace('100', '10').replace('800', '700')}`}>
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </Badge>
                </CardHeader>

                <CardContent className="p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-10">
                  <div className="flex flex-wrap items-center gap-10">
                     <div className="space-y-1 text-center sm:text-left">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Số lượng</p>
                        <p className="text-lg font-black text-slate-900">{order.total_items} món ngon</p>
                     </div>
                     <Separator orientation="vertical" className="h-10 hidden sm:block" />
                     <div className="space-y-1 text-center sm:text-left">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Thanh toán</p>
                        <Badge variant="outline" className={`rounded-xl px-3 border-2 font-black ${order.payment_status === 'paid' ? 'border-green-100 text-green-600 bg-green-50/50' : 'border-orange-100 text-orange-600 bg-orange-50/50'}`}>
                           {order.payment_status === 'paid' ? 'ĐÃ TRẢ TIỀN' : 'CHƯA TRẢ TIỀN'}
                        </Badge>
                     </div>
                  </div>

                  <div className="text-center sm:text-right space-y-1">
                     <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Thành tiền</p>
                     <p className="text-3xl font-black text-primary leading-none tracking-tighter">{formatPrice(order.total_price)}</p>
                  </div>
                  
                  <div className="hidden sm:block">
                     <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-slate-50 transition-all">
                        <ChevronRight className="w-6 h-6 text-slate-300" />
                     </Button>
                  </div>
                </CardContent>
                
                {order.status === 'delivered' && (
                  <CardFooter className="bg-slate-50/30 p-6 flex justify-end gap-4 border-t border-slate-50">
                     <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest border-2 h-10 px-6">Mua lại</Button>
                     <Button className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 shadow-lg shadow-primary/10" onClick={(e) => { e.stopPropagation(); /* Logic show items for review or redirect detail */ }}>Đánh giá</Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modern Review Dialog */}
      <Dialog open={showReviewModal} onOpenChange={(open) => !open && closeReviewModal()}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
           <DialogHeader className="p-8 bg-slate-50 border-b">
              <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                 <Star className="w-6 h-6 text-yellow-500 fill-current" />
                 Đánh Giá Món Ngon
              </DialogTitle>
           </DialogHeader>
           
           <div className="p-8 space-y-8">
              {reviewingItem && (
                 <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md">
                      <img
                        src={reviewingItem.product_avatar || '/placeholder.png'}
                        alt={reviewingItem.product_name}
                        className="w-full h-full object-cover"
                      />
                   </div>
                   <div>
                     <p className="font-black text-slate-800 leading-tight">{reviewingItem.product_name}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{reviewingItem.variant_name} • {reviewingItem.unit}</p>
                   </div>
                 </div>
              )}

              <div className="space-y-4">
                 <Label className="text-xs font-black text-slate-400 uppercase tracking-widest block text-center">Cảm nhận sản phẩm (1-5 sao)</Label>
                 <div className="flex items-center justify-center gap-3">
                   {[1,2,3,4,5].map((n) => (
                     <button
                       key={n}
                       type="button"
                       onClick={() => setReviewRating(n)}
                       className="p-1 transition-transform active:scale-90"
                     >
                       <Star
                         className={`w-10 h-10 transition-all ${reviewRating >= n ? 'text-yellow-400 drop-shadow-md fill-current scale-110' : 'text-slate-100 hover:text-slate-200'}`}
                       />
                     </button>
                   ))}
                 </div>
              </div>

              <div className="space-y-3">
                 <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Lời nhận xét</Label>
                 <Textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Hãy thành thật chia sẻ trải nghiệm của bạn về hương vị món ăn..."
                    className="rounded-2xl border-2 border-slate-100 focus-visible:ring-primary/20 font-bold p-5 resize-none h-32"
                 />
              </div>
           </div>

           <DialogFooter className="p-8 bg-slate-50 border-t gap-3 flex-row justify-end">
              <DialogClose asChild>
                 <Button variant="ghost" className="rounded-xl font-black">HỦY BỎ</Button>
              </DialogClose>
              <Button
                onClick={handleSubmitReview}
                disabled={reviewSubmitting || reviewRating < 1}
                className="rounded-xl h-12 px-8 font-black shadow-xl shadow-primary/20"
              >
                {reviewSubmitting ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
}
