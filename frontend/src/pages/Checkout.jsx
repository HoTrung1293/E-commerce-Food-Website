import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, CreditCard, FileText, ChevronLeft, ShieldCheck, Truck, Package, Phone, Mail, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, getUserId } = useAuth();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    paymentMethod: 'COD',
    note: '',
    createAccount: false,
  });

  // Kiểm tra đăng nhập khi vào trang
  useEffect(() => {
    if (!isAuthenticated()) {
      alert('Vui lòng đăng nhập để thanh toán');
      navigate('/auth/login');
      return;
    }
    fetchCheckoutInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCheckoutInfo = async () => {
    try {
      setLoading(true);
      
      const userId = getUserId();
      if (!userId) {
        navigate('/auth/login');
        return;
      }

      // First get cart
      const cartResponse = await fetch(`http://localhost:5000/api/cart/viewCart/${userId}`);
      if (!cartResponse.ok) {
        throw new Error('Không thể tải giỏ hàng');
      }
      const cartData = await cartResponse.json();
      
      if (!cartData.success || !cartData.data || cartData.data.items.length === 0) {
        alert('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
        navigate('/cart');
        return;
      }

      const currentCartId = cartData.data.cart_id;
      setCartId(currentCartId);

      // Then get checkout info
      const checkoutResponse = await fetch(`http://localhost:5000/api/orders/checkout/${currentCartId}`);
      if (!checkoutResponse.ok) {
        throw new Error('Không thể tải thông tin thanh toán');
      }
      const checkoutInfo = await checkoutResponse.json();
      
      if (checkoutInfo.success) {
        setCheckoutData(checkoutInfo.data);
      } else {
        throw new Error(checkoutInfo.message || 'Không thể tải thông tin thanh toán');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching checkout info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.address || 
        !formData.city || !formData.phone || !formData.email) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Email không hợp lệ');
      return;
    }

    // Validate phone (Vietnam phone number)
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      alert('Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)');
      return;
    }

    if (!cartId) {
      alert('Không tìm thấy giỏ hàng');
      return;
    }

    try {
      setSubmitting(true);

      const userId = getUserId();
      const shippingAddress = `${formData.address}, ${formData.city}`;
      
      // Nếu thanh toán VNPay, gọi endpoint verify-and-create-order
      if (formData.paymentMethod === 'VNPAY') {
        const paymentResponse = await fetch('http://localhost:5000/api/payments/verify-and-create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            cartId: cartId,
            shippingAddress: shippingAddress,
            note: formData.note,
            amount: checkoutData.total_price,
          }),
        });

        const paymentResult = await paymentResponse.json();

        if (!paymentResponse.ok) {
          throw new Error(paymentResult.message || 'Không thể tạo liên kết thanh toán');
        }

        if (paymentResult.success && paymentResult.data.paymentUrl) {
          // Xóa giỏ hàng trong context
          clearCart();
          // Redirect đến trang thanh toán VNPay
          window.location.href = paymentResult.data.paymentUrl;
        } else {
          throw new Error('Không thể tạo liên kết thanh toán');
        }
      } else {
        // Thanh toán COD - tạo đơn hàng trực tiếp
        const response = await fetch('http://localhost:5000/api/orders/createOrder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            cartId: cartId,
            shippingAddress: shippingAddress,
            paymentMethod: formData.paymentMethod,
            note: formData.note,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Không thể tạo đơn hàng');
        }

        if (result.success) {
          const orderId = result.data.order_id;
          const orderNumber = result.data.order_number;
          const amount = result.data.total_price;
          // Xóa giỏ hàng trong context
          clearCart();
          // Chuyển đến trang kết quả thanh toán
          navigate(`/payment/result?success=true&orderId=${orderId}&orderNumber=${orderNumber}&amount=${amount}&paymentMethod=COD`);
        } else {
          throw new Error(result.message || 'Không thể tạo đơn hàng');
        }
      }
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Không thể đặt hàng: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error || !checkoutData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Không thể tải thông tin thanh toán'}
        </div>
        <button
          onClick={() => navigate('/cart')}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Quay lại giỏ hàng
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm">
          <Button variant="link" onClick={() => navigate('/')} className="h-auto p-0 text-muted-foreground hover:text-primary">
            TRANG CHỦ
          </Button>
          <span className="text-muted-foreground">/</span>
          <Button variant="link" onClick={() => navigate('/cart')} className="h-auto p-0 text-muted-foreground hover:text-primary">
            GIỎ HÀNG
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-primary">THANH TOÁN</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-10">
           <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-10 h-10 text-primary" />
              Thanh Toán
           </h1>
           <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                 <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</div>
                 <span>Giỏ hàng</span>
              </div>
              <div className="h-[2px] w-12 bg-primary/20"></div>
              <div className="flex items-center gap-2 text-primary font-bold">
                 <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</div>
                 <span>Thanh toán</span>
              </div>
              <div className="h-[2px] w-12 bg-primary/20"></div>
              <div className="flex items-center gap-2 text-slate-300 font-bold">
                 <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs">3</div>
                 <span>Hoàn tất</span>
              </div>
           </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column - Billing Details */}
            <div className="lg:col-span-8 space-y-8">
              <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-slate-50 border-b p-8">
                  <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-primary" />
                    Địa Chỉ Giao Hàng
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-8 sm:p-12 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="firstName" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tên <span className="text-destructive">*</span></Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="rounded-2xl h-14 bg-slate-50 border-none shadow-inner focus-visible:ring-primary/20 transition-all font-bold px-6"
                        required
                        placeholder="VD: Bình"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="lastName" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Họ & Tên đệm <span className="text-destructive">*</span></Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="rounded-2xl h-14 bg-slate-50 border-none shadow-inner focus-visible:ring-primary/20 transition-all font-bold px-6"
                        required
                        placeholder="VD: Nguyễn Văn"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại <span className="text-destructive">*</span></Label>
                      <div className="relative">
                         <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <Input
                           id="phone"
                           type="tel"
                           name="phone"
                           value={formData.phone}
                           onChange={handleInputChange}
                           className="rounded-2xl h-14 bg-slate-50 border-none shadow-inner focus-visible:ring-primary/20 transition-all font-bold pl-14 px-6"
                           required
                           placeholder="0987 654 321"
                         />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email <span className="text-destructive">*</span></Label>
                      <div className="relative">
                         <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <Input
                           id="email"
                           type="email"
                           name="email"
                           value={formData.email}
                           onChange={handleInputChange}
                           className="rounded-2xl h-14 bg-slate-50 border-none shadow-inner focus-visible:ring-primary/20 transition-all font-bold pl-14 px-6"
                           required
                           placeholder="example@mail.com"
                         />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Địa chỉ chi tiết <span className="text-destructive">*</span></Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="rounded-2xl h-14 bg-slate-50 border-none shadow-inner focus-visible:ring-primary/20 transition-all font-bold px-6"
                      required
                      placeholder="Số nhà, tên đường, phường/xã..."
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Quận / Huyện / Thành phố <span className="text-destructive">*</span></Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="rounded-2xl h-14 bg-slate-50 border-none shadow-inner focus-visible:ring-primary/20 transition-all font-bold px-6"
                      required
                      placeholder="VD: Quận Đống Đa, Hà Nội"
                    />
                  </div>

                  <div className="flex items-center space-x-3 p-2">
                    <Checkbox
                      id="createAccount"
                      name="createAccount"
                      checked={formData.createAccount}
                      onCheckedChange={(checked) => setFormData(p => ({...p, createAccount: !!checked}))}
                      className="rounded-lg w-6 h-6 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="createAccount" className="text-sm font-bold text-slate-600 cursor-pointer">
                      Tạo tài khoản mới cho lần mua sau?
                    </Label>
                  </div>
                </CardContent>

                <Separator className="bg-slate-100" />

                <CardContent className="p-8 sm:p-12 space-y-6 bg-slate-50/30">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    Ghi Chú Đơn Hàng
                  </h3>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="VD: Giao hàng vào giờ hành chính, gọi trước khi đến..."
                    className="w-full bg-white border-none shadow-inner rounded-3xl p-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-2xl shadow-green-900/10 rounded-[2.5rem] overflow-hidden sticky top-32 bg-white">
                <CardHeader className="bg-primary p-8">
                  <CardTitle className="text-xl font-black text-white m-0 flex items-center justify-between uppercase tracking-wider">
                    Đơn hàng của bạn
                    <Badge variant="secondary" className="bg-white/20 text-white border-none rounded-lg px-2 text-xs">
                       {checkoutData.items.length} món
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <ScrollArea className="max-h-[300px] pr-4">
                       <div className="space-y-5">
                          {checkoutData.items.map((item) => (
                            <div key={item.cart_item_id} className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <p className="text-sm font-black text-slate-800 leading-tight">{item.product_name}</p>
                                <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Số lượng: {item.quantity}</p>
                              </div>
                              <span className="font-black text-slate-900 text-sm whitespace-nowrap">
                                {((item.price_sale || item.price || 0) * item.quantity).toLocaleString('vi-VN')} ₫
                              </span>
                            </div>
                          ))}
                       </div>
                    </ScrollArea>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                      <span>Tạm tính</span>
                      <span className="text-slate-900">
                        {checkoutData.subtotal.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                      <div className="flex flex-col">
                         <span>Vận chuyển</span>
                         <span className="text-[10px] text-primary uppercase">Đồng giá toàn lãnh thổ</span>
                      </div>
                      <span className="text-slate-900">
                        {checkoutData.shipping_fee.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>

                    {checkoutData.tax && checkoutData.tax > 0 && (
                      <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                        <span>Thuế (VAT 10%)</span>
                        <span className="text-slate-900">
                          {checkoutData.tax.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t-2 border-dashed border-slate-100 flex items-center justify-between">
                    <span className="text-lg font-black text-slate-900">Tổng cộng</span>
                    <div className="text-right">
                       <p className="text-3xl font-black text-primary leading-none tracking-tighter">
                          {checkoutData.total_price.toLocaleString('vi-VN')} ₫
                       </p>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      Phương thức thanh toán
                    </h3>
                    
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(val) => setFormData(p => ({...p, paymentMethod: val}))}
                      className="gap-3"
                    >
                      <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`} onClick={() => setFormData(p => ({...p, paymentMethod: 'COD'}))}>
                        <div className="flex items-center gap-3">
                           <RadioGroupItem value="COD" id="cod" className="border-2 text-primary" />
                           <Label htmlFor="cod" className="font-bold text-slate-700 cursor-pointer">Tiền mặt (COD)</Label>
                        </div>
                        <Truck className={`w-5 h-5 ${formData.paymentMethod === 'COD' ? 'text-primary' : 'text-slate-300'}`} />
                      </div>

                      <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.paymentMethod === 'VNPAY' ? 'border-primary bg-primary/5' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`} onClick={() => setFormData(p => ({...p, paymentMethod: 'VNPAY'}))}>
                        <div className="flex items-center gap-3">
                           <RadioGroupItem value="VNPAY" id="vnpay" className="border-2 text-primary" />
                           <Label htmlFor="vnpay" className="font-bold text-slate-700 cursor-pointer">VNPAY (QR Code)</Label>
                        </div>
                        <img src="https://vnpay.vn/wp-content/uploads/2020/07/Logo-VNPAYQR-update.png" className="h-4 grayscale hover:grayscale-0 transition-all" alt="VNPay" />
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting}
                      className="w-full h-16 rounded-2xl font-black text-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all bg-gradient-to-br from-primary to-green-700 border-none"
                    >
                      {submitting ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG NGAY'}
                    </Button>
                  </div>
                </CardContent>

                <CardFooter className="bg-slate-50 p-6 flex flex-col items-center gap-4 text-center">
                   <div className="flex gap-4 opacity-50 grayscale">
                      <ShieldCheck className="w-5 h-5" />
                      <Package className="w-5 h-5" />
                      <Truck className="w-5 h-5" />
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 leading-relaxed max-w-xs">
                      Bằng việc đặt hàng, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Bếp Sạch Việt.
                   </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>

  );
}