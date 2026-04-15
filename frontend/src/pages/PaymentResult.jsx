import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Package, CreditCard, Calendar, ShoppingBag, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  const success = searchParams.get('success') === 'true';
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const amount = searchParams.get('amount');
  const transactionNo = searchParams.get('transactionNo');
  const paymentMethod = searchParams.get('paymentMethod') || 'VNPAY';
  const message = searchParams.get('message') || (success ? 'Thanh toán thành công' : 'Thanh toán thất bại');

  // Xử lý cập nhật payment status khi thanh toán thành công (chỉ cho VNPay)
  useEffect(() => {
    if (success && orderId && paymentMethod === 'VNPAY') {
      const updatePaymentStatus = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/payments/update-payment-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: orderId,
              paymentStatus: 'paid',
              transactionNo: transactionNo || '',
            }),
          });

          const result = await response.json();
          console.log('Payment status update result:', result);
          
          if (!result.success) {
            console.error('Failed to update payment status:', result.message);
          }
        } catch (error) {
          console.error('Error updating payment status:', error);
        } finally {
          setIsProcessing(false);
        }
      };

      updatePaymentStatus();
    } else {
      setIsProcessing(false);
    }
  }, [success, orderId, transactionNo, paymentMethod]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
             <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-slate-50">
                <RefreshCw className="w-10 h-10 text-primary animate-spin" />
             </div>
          </div>
          <div className="space-y-2">
             <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Đang xác nhận...</h1>
             <p className="text-sm font-bold text-slate-400 px-10 leading-relaxed uppercase tracking-widest">Chúng tôi đang xử lý giao dịch của bạn với hệ thống thanh toán.</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="text-center space-y-4">
              <div className="relative inline-block mb-4">
                 <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl"></div>
                 <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <CheckCircle className="w-10 h-10 text-primary" />
                 </div>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
                 {paymentMethod === 'COD' ? 'Đặt hàng thành công' : 'Thanh toán thành công'}
              </h1>
              <p className="text-sm font-bold text-slate-400 px-6 leading-relaxed uppercase tracking-wide">
                 Giao dịch đã được ghi nhận. Cảm ơn bạn đã tin tưởng Bếp Sạch Việt.
              </p>
           </div>

           <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-10 space-y-8">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Mã đơn hàng</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tighter">#{orderNumber || orderId?.slice(-6).toUpperCase()}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Tổng tiền</p>
                       <p className="text-lg font-black text-primary">{(Number(amount)).toLocaleString('vi-VN')} ₫</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Phương thức</p>
                       <Badge variant="secondary" className="rounded-lg font-black text-[10px] uppercase">{paymentMethod}</Badge>
                    </div>
                 </div>

                 {transactionNo && (
                    <div className="pt-4 space-y-1">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Mã giao dịch</p>
                       <p className="text-sm font-bold text-slate-500 break-all bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">{transactionNo}</p>
                    </div>
                 )}
              </CardContent>
              <CardFooter className="p-10 bg-slate-50/50 border-t">
                 <Button onClick={() => navigate('/account/orders')} className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                    QUẢN LÝ ĐƠN HÀNG
                 </Button>
              </CardFooter>
           </Card>

           <Button variant="ghost" onClick={() => navigate('/')} className="w-full h-14 rounded-2xl font-black text-xs text-slate-400 hover:text-primary gap-2">
              <ShoppingBag className="w-4 h-4" /> TIẾP TỤC MUA SẮM
           </Button>
        </div>
      </div>
    );
  }

  // Failed State
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="text-center space-y-4">
            <div className="relative inline-block mb-4">
               <div className="absolute -inset-4 bg-destructive/10 rounded-full blur-2xl"></div>
               <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-slate-50">
                  <XCircle className="w-12 h-12 text-destructive" />
               </div>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">Thanh toán thất bại</h1>
            <p className="text-sm font-bold text-slate-400 px-10 leading-relaxed uppercase tracking-widest">{message}</p>
         </div>

         <div className="space-y-4">
            <Button 
              size="lg"
              className="w-full h-16 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 bg-slate-900 hover:bg-slate-800"
              onClick={async () => {
                try {
                  const userData = localStorage.getItem('user');
                  const userId = userData ? JSON.parse(userData).id : null;
                  if (!userId || !orderId) {
                    alert('Thông tin không hợp lệ, vui lòng thử lại sau.');
                    return;
                  }
                  const response = await fetch('http://localhost:5000/api/cart/restore-from-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userId, orderId: orderId }),
                  });
                  const result = await response.json();
                  if (result.success) navigate('/checkout');
                  else alert('Lỗi: ' + result.message);
                } catch (error) {
                  alert('Lỗi kết nối hệ thống.');
                }
              }}
            >
              THỬ LẠI THANH TOÁN
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="w-full h-16 rounded-[2rem] font-black text-xs uppercase tracking-widest border-2 border-slate-100 hover:bg-slate-50"
              onClick={() => navigate('/account/orders')}
            >
              XEM ĐƠN HÀNG CỦA TÔI
            </Button>
         </div>
         
         <div className="text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
               <AlertCircle className="w-3 h-3 text-destructive" /> Cần hỗ trợ? Hotline: 0868 839 655
            </p>
         </div>
      </div>
    </div>
  );
}
