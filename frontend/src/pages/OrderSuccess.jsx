import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, MapPin, CreditCard, Phone, Mail, ShoppingBag, ChevronRight, Sparkles, Clock, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshCart } = useCart();

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/orderDetail/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrderDetails(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
    // Làm mới giỏ hàng để cập nhật số đếm
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Success Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="relative inline-block">
             <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
             <div className="relative bg-white p-6 rounded-full shadow-2xl">
                <CheckCircle className="w-20 h-20 text-primary" />
             </div>
          </div>
          <div className="space-y-2">
             <Badge className="bg-primary/10 text-primary border-none font-black text-xs uppercase tracking-[0.2em] px-6 py-2 rounded-full mb-4">Hoàn tất thanh toán</Badge>
             <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">Đặt hàng thành công!</h1>
             <p className="text-lg font-bold text-slate-400 max-w-lg mx-auto leading-relaxed">Tuyệt vời! Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình chuẩn bị.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-8 space-y-10">
            {/* Order Summary Card */}
            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="p-10 border-b flex flex-row items-center justify-between bg-slate-50/50">
                 <div className="space-y-1">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mã đơn hàng</CardTitle>
                    <p className="text-3xl font-black text-primary tracking-tighter">#{orderId?.slice(-6).toUpperCase() || 'N/A'}</p>
                 </div>
                 <Badge className="bg-slate-900 text-white rounded-xl py-2 px-4 font-bold">CHỜ XÁC NHẬN</Badge>
              </CardHeader>
              <CardContent className="p-10">
                {loading ? (
                  <div className="flex flex-col items-center py-10 gap-4">
                     <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-primary"></div>
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang khởi tạo...</p>
                  </div>
                ) : orderDetails ? (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                       <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <MapPin className="w-3.5 h-3.5 text-primary" /> Địa chỉ giao
                          </div>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl">{orderDetails.shipping_address}</p>
                       </div>
                       <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <CreditCard className="w-3.5 h-3.5 text-primary" /> Thanh toán
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                             <span className="text-xs font-black text-slate-800 uppercase">{orderDetails.payment_method || 'COD'}</span>
                             <Badge variant="outline" className="rounded-lg font-black text-[10px] border-orange-200 text-orange-600">CHƯA TRẢ</Badge>
                          </div>
                       </div>
                    </div>

                    <Separator className="opacity-50" />

                    <div className="space-y-6">
                       <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                          <Package className="w-4 h-4 text-primary" /> Chi tiết sản phẩm
                       </div>
                       <div className="space-y-4">
                          {orderDetails.items?.map((item, index) => (
                             <div key={index} className="flex items-center gap-4 group">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex-shrink-0">
                                   <img src={item.product_avatar || '/placeholder-food.png'} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                   <h4 className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{item.product_name}</h4>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">x{item.quantity} • {item.variant_name}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-sm font-black text-slate-900">{(item.subtotal).toLocaleString('vi-VN')} ₫</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-4">
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Không tìm thấy thông tin chi tiết</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-10 bg-slate-50/50 border-t flex items-center justify-between">
                 <span className="text-lg font-black text-slate-900 uppercase tracking-tight">Tổng thanh toán</span>
                 <span className="text-3xl font-black text-primary tracking-tighter">{(orderDetails?.total_price || 0).toLocaleString('vi-VN')} ₫</span>
              </CardFooter>
            </Card>

            {/* Support Message */}
            <Card className="border-none shadow-sm rounded-[2.5rem] p-8 text-center bg-white">
                <p className="text-[11px] font-black text-slate-400 uppercase leading-relaxed tracking-widest">Cần hỗ trợ ngay? Gọi hotline <span className="text-primary">1900 123 456</span> hoặc email <span className="text-primary">support@bepsachviet.com</span></p>
            </Card>
          </div>

          <div className="md:col-span-4 space-y-10">
            {/* Steps Section */}
            <div className="space-y-6">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4">Quy trình tiếp theo</h3>
               <div className="space-y-4">
                  {[
                    { icon: <CheckCircle className="w-5 h-5" />, title: 'Xác nhận đơn', desc: 'Trong 24h làm việc' },
                    { icon: <Truck className="w-5 h-5" />, title: 'Đóng gói', desc: 'Đảm bảo vệ sinh an toàn' },
                    { icon: <Sparkles className="w-5 h-5" />, title: 'Vận chuyển', desc: 'Từ 1-3 ngày toàn quốc' }
                  ].map((step, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-gray-200/40 rounded-[2rem] bg-white p-6 relative overflow-hidden group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                             {step.icon}
                          </div>
                          <div>
                             <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{step.title}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">{step.desc}</p>
                          </div>
                       </div>
                       <div className="absolute -right-4 -bottom-4 text-4xl font-black text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">0{i+1}</div>
                    </Card>
                  ))}
               </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-10 space-y-6">
               <Button size="lg" onClick={() => navigate('/')} className="w-full h-16 rounded-2xl font-black text-md shadow-2xl shadow-primary/20 gap-3 group">
                  <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" /> TIẾP TỤC MUA SẮM
               </Button>
               {orderId && (
                 <Button variant="outline" size="lg" onClick={() => navigate(`/orders/${orderId}`)} className="w-full h-16 rounded-2xl font-black text-md border-2 border-slate-200 hover:bg-slate-50 transition-all gap-3">
                    XEM CHI TIẾT ĐƠN <ChevronRight className="w-5 h-5" />
                 </Button>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
