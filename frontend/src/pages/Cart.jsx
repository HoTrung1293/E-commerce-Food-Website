import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, RefreshCcw, Tag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function CartPage() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { getUserId, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart data
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth/login');
      return;
    }
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      console.log('👤 Fetching cart for userId:', userId);
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`http://localhost:5000/api/cart/viewCart/${userId}`);
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart');
      }
      
      if (data.success) {
        // Xử lý trường hợp cart null hoặc chưa có items
        if (data.data && data.data.items) {
          setCartItems(data.data.items);
        } else {
          setCartItems([]);
        }
        // Cập nhật cart count trong context
        refreshCart();
      } else {
        throw new Error(data.message || 'Failed to fetch cart');
      }
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching cart:', err);
      setError(err.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) return;

    try {
      const response = await fetch(`http://localhost:5000/api/cart/updateItem/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      // Refresh cart
      await fetchCart();
      refreshCart(); // Update cart count in header
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Không thể cập nhật số lượng');
    }
  };

  // Remove item
  const removeItem = async (cartItemId) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/cart/removeItem/${cartItemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      // Refresh cart
      await fetchCart();
      refreshCart(); // Update cart count in header
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Không thể xóa sản phẩm');
    }
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.price || item.product_price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 0 ? 30000 : 0; // Phí ship cố định
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm flex items-center gap-2">
          <Button 
            variant="link" 
            className="p-0 h-auto text-muted-foreground hover:text-primary"
            onClick={() => navigate('/homePage')}
          >
            TRANG CHỦ
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-primary">GIỎ HÀNG</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3 tracking-tight">
            <ShoppingCart className="w-8 h-8 text-primary" />
            Giỏ Hàng Của Bạn
            {cartItems.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-lg px-3">
                {cartItems.length}
              </Badge>
            )}
          </h1>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {cartItems.length === 0 ? (
          <Card className="max-w-2xl mx-auto border-dashed border-2 bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-12 h-12 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold mb-3">Giỏ hàng đang trống</CardTitle>
              <p className="text-muted-foreground mb-8 text-lg max-w-sm">
                Có vẻ như bạn chưa chọn được món ngon nào. Hãy khám phá thực đơn của chúng tôi ngay nhé!
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/product')}
                className="px-10 rounded-full font-bold shadow-lg"
              >
                Tiếp tục mua sắm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items Area */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-primary text-primary-foreground font-bold text-sm tracking-wider uppercase">
                  <div className="col-span-6">Sản phẩm</div>
                  <div className="col-span-2 text-center">Giá</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-2 text-right">Tổng</div>
                </div>

                <div className="divide-y divide-gray-100 bg-white">
                  {cartItems.map((item) => (
                    <div key={item.cart_item_id} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center transition-colors hover:bg-gray-50/50">
                      {/* Product Mobile View Header */}
                      <div className="md:hidden flex justify-between items-start">
                         <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                <img 
                                  src={item.product_avatar || 'https://placehold.co/100'} 
                                  className="w-full h-full object-cover"
                                  alt={item.product_name}
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug">{item.product_name}</h3>
                                {item.variant_name && <p className="text-xs text-muted-foreground mt-1">{item.variant_name}</p>}
                                <p className="text-primary font-bold mt-2">{(item.price || item.product_price || 0).toLocaleString('vi-VN')} ₫</p>
                            </div>
                         </div>
                         <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeItem(item.cart_item_id)}>
                            <Trash2 className="w-5 h-5" />
                         </Button>
                      </div>

                      {/* Desktop Product Info */}
                      <div className="col-span-6 hidden md:flex items-center gap-6">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeItem(item.cart_item_id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                        <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                          <img 
                            src={item.product_avatar || 'https://placehold.co/100'} 
                            alt={item.product_name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/product/${item.product_id}`)}>
                            {item.product_name}
                          </h3>
                          {item.variant_name && (
                            <Badge variant="outline" className="w-fit text-[10px] py-0 px-2 uppercase tracking-tighter text-muted-foreground">
                              {item.variant_name}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Price (Desktop) */}
                      <div className="col-span-2 hidden md:block text-center">
                        <span className="font-bold text-foreground">
                          {(item.price || item.product_price || 0).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>

                      {/* Quantity selector */}
                      <div className="col-span-2 flex justify-center md:block">
                        <div className="flex items-center justify-center bg-gray-100 rounded-full p-1 w-fit mx-auto border border-gray-200">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-white"
                            onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </Button>
                          <span className="w-10 text-center font-extrabold text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-white"
                            onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </Button>
                        </div>
                      </div>

                      {/* Desktop Total Price */}
                      <div className="col-span-2 hidden md:block text-right">
                        <span className="text-xl font-black text-primary">
                          {((item.price || item.product_price || 0) * (item.quantity || 0)).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/product')}
                  className="rounded-full px-8 py-6 h-auto font-bold border-2 hover:bg-primary/5 hover:text-primary hover:border-primary transition-all group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                  TIẾP TỤC MUA HÀNG
                </Button>
                <Button
                  variant="secondary"
                  onClick={fetchCart}
                  className="rounded-full px-8 py-6 h-auto font-bold bg-gray-200 hover:bg-gray-300 h-auto"
                >
                  <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  CẬP NHẬT GIỎ HÀNG
                </Button>
              </div>
            </div>

            {/* Sidebar Summary Area */}
            <div className="space-y-6">
              <Card className="border-none shadow-2xl shadow-green-900/10 overflow-hidden sticky top-28">
                <div className="bg-primary px-6 py-5">
                  <h2 className="text-xl font-bold text-primary-foreground m-0 flex items-center justify-between">
                    Tổng đơn hàng
                    <div className="h-1 w-12 bg-orange-500 rounded-full"></div>
                  </h2>
                </div>
                
                <CardContent className="p-8 pt-10">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">Tạm tính</span>
                      <span className="font-bold text-lg text-foreground">
                        {subtotal.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-4 border-y border-dashed border-gray-200">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground font-medium">Vận chuyển</span>
                        <span className="text-[11px] text-green-600 font-bold uppercase tracking-widest mt-1">Đồng giá toàn lãnh thổ</span>
                      </div>
                      <span className="font-bold text-lg text-foreground">
                        {shipping.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-2xl font-black pt-4">
                      <span className="text-foreground">Tổng cộng</span>
                      <span className="text-primary drop-shadow-[0_2px_4px_rgba(34,197,94,0.15)]">
                        {total.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  </div>

                  <div className="mt-10 space-y-4">
                    <Button
                      size="lg"
                      onClick={() => navigate('/checkout')}
                      className="w-full rounded-2xl py-8 h-auto font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all bg-gradient-to-br from-primary to-green-700 border-none"
                    >
                      THANH TOÁN NGAY
                    </Button>
                    
                    <div className="p-5 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 group focus-within:border-primary transition-colors">
                      <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-700">
                         <Tag className="w-4 h-4 text-primary" />
                         MÃ ƯU ĐÃI
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập mã giảm giá..."
                          className="bg-white border-none shadow-sm focus-visible:ring-primary rounded-xl"
                        />
                        <Button variant="outline" className="rounded-xl font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white shrink-0">
                          ÁP DỤNG
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-gray-50/80 p-6 flex flex-col items-center gap-3 border-t">
                  <div className="flex gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                     <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                     <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium text-center leading-relaxed">
                    Đảm bảo an toàn thanh toán 100% qua cổng VNPay/MoMo. 
                    <br/>Vận chuyển nhanh chóng từ 2-4 ngày làm việc.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>

  );
}