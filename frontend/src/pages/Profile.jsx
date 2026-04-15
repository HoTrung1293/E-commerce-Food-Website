import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Calendar, Edit2, Save, X, Lock, Key, ShoppingBag, ArrowRight, ShieldCheck, CreditCard, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';


export default function Profile() {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // State cho đổi mật khẩu
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // State cho thống kê đơn hàng
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    shipping: 0,
    delivered: 0
  });



  // Lấy thông tin user từ API
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user?.id || !token) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          setUserInfo(data.data);
          setFormData({
            name: data.data.name || '',
            email: data.data.email || '',
            phone: data.data.phone || ''
          });
        } else {
          setError(data.message || 'Không thể tải thông tin người dùng');
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError('Có lỗi xảy ra khi tải thông tin');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user?.id, token]);

  // Lấy thống kê đơn hàng
  useEffect(() => {
    const fetchOrderStats = async () => {
      if (!user?.id || !token) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/orders/myOrders/${user.id}?page=1&limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          const allOrders = data.data || [];
          
          // Tính toán thống kê
          const stats = {
            total: allOrders.length,
            pending: allOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
            shipping: allOrders.filter(o => o.status === 'shipping').length,
            delivered: allOrders.filter(o => o.status === 'delivered').length
          };
          setOrderStats(stats);
        }
      } catch (err) {
        console.error('Error fetching order stats:', err);
      }
    };

    fetchOrderStats();
  }, [user?.id, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form về dữ liệu gốc
    if (userInfo) {
      setFormData({
        name: userInfo.name || '',
        email: userInfo.email || '',
        phone: userInfo.phone || ''
      });
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserInfo(data.data);
        setIsEditing(false);
        alert('Cập nhật thông tin thành công!');
      } else {
        alert(data.message || 'Không thể cập nhật thông tin');
      }
    } catch (err) {
      console.error('Error updating user info:', err);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordSuccess('Đổi mật khẩu thành công!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setIsChangingPassword(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(data.message || 'Không thể đổi mật khẩu');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError('Có lỗi xảy ra khi đổi mật khẩu');
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-10 flex flex-col items-center text-center">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-slate-50 shadow-xl group-hover:shadow-primary/20 transition-all duration-500">
                    <AvatarFallback className="bg-primary text-white text-4xl font-black">
                      {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button size="icon" className="absolute bottom-0 right-0 rounded-full border-4 border-white shadow-lg">
                     <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <h2 className="mt-6 text-2xl font-black text-slate-900 leading-none">{userInfo?.name || 'Người dùng'}</h2>
                <p className="mt-2 text-xs font-black text-slate-400 uppercase tracking-widest">Khách hàng đặc biệt</p>
                
                <div className="grid grid-cols-3 w-full gap-4 mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100/50">
                   <div className="flex flex-col items-center">
                      <span className="text-xl font-black text-primary">{orderStats.total}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Đơn hàng</span>
                   </div>
                   <Separator orientation="vertical" className="h-10" />
                   <div className="flex flex-col items-center">
                      <span className="text-xl font-black text-green-600">{orderStats.delivered}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Xong</span>
                   </div>
                   <Separator orientation="vertical" className="h-10" />
                   <div className="flex flex-col items-center">
                      <span className="text-xl font-black text-orange-500">{orderStats.pending}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Đang xử</span>
                   </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-0 border-t flex flex-col">
                 <Button variant="ghost" className="w-full h-16 rounded-none justify-between px-10 font-bold hover:bg-slate-50 group" onClick={() => navigate('/account/orders')}>
                    <span className="flex items-center gap-3"><ShoppingBag className="w-5 h-5 text-slate-400 group-hover:text-primary" /> Lịch sử mua hàng</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                 </Button>
                 <Button variant="ghost" className="w-full h-16 rounded-none justify-between px-10 font-bold hover:bg-red-50 text-red-600 group">
                    <span className="flex items-center gap-3"><LogOut className="w-5 h-5 text-red-300 group-hover:text-red-500" /> Đăng xuất</span>
                 </Button>
              </CardFooter>
            </Card>
            
            <div className="p-8 bg-primary rounded-[2.5rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
               <h4 className="text-lg font-black mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Thành viên Gold
               </h4>
               <p className="text-xs font-medium text-white/70 leading-relaxed mb-6">Bạn đang được hưởng ưu đãi giảm giá 5% cho tất cả đơn hàng tại Bếp Sạch Việt.</p>
               <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white hover:text-primary rounded-xl font-bold">XEM QUYỀN LỢI</Button>
            </div>
          </div>

          {/* Main Content Areas */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="bg-white p-2 rounded-2xl shadow-sm border mb-8 h-16 gap-2">
                <TabsTrigger value="info" className="rounded-xl flex-1 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Thông tin tài khoản</TabsTrigger>
                <TabsTrigger value="security" className="rounded-xl flex-1 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Bảo mật & Mật khẩu</TabsTrigger>
                <TabsTrigger value="payment" className="rounded-xl flex-1 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Ví & Thanh toán</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="p-10 border-b flex flex-row items-center justify-between">
                    <div>
                       <CardTitle className="text-2xl font-black text-slate-900">Chi Tiết Hồ Sơ</CardTitle>
                       <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-tighter">Cập nhật thông tin thực tế để nhận hàng nhanh hơn</p>
                    </div>
                    {!isEditing && (
                      <Button onClick={handleEdit} className="rounded-xl font-black gap-2 shadow-lg shadow-primary/10">
                        <Edit2 className="w-4 h-4" /> CHỈNH SỬA
                      </Button>
                    )}
                  </CardHeader>

                  <CardContent className="p-10 sm:p-14 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</Label>
                        {!isEditing ? (
                          <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-transparent">
                             <User className="w-5 h-5 text-primary" />
                             <span className="font-black text-slate-700">{userInfo?.name || 'Chưa cập nhật'}</span>
                          </div>
                        ) : (
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="h-14 rounded-2xl bg-white border-2 border-slate-100 shadow-sm font-bold focus-visible:ring-primary/20 px-6"
                          />
                        )}
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Địa chỉ Email</Label>
                        <div className={`flex items-center gap-4 p-5 rounded-2xl border ${isEditing ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed' : 'bg-slate-50 border-transparent'}`}>
                          <Mail className="w-5 h-5 text-primary" />
                          <span className="font-black text-slate-700">{userInfo?.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</Label>
                        {!isEditing ? (
                          <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-transparent">
                             <Phone className="w-5 h-5 text-primary" />
                             <span className="font-black text-slate-700">{userInfo?.phone || 'Chưa cập nhật'}</span>
                          </div>
                        ) : (
                          <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="h-14 rounded-2xl bg-white border-2 border-slate-100 shadow-sm font-bold focus-visible:ring-primary/20 px-6"
                          />
                        )}
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tham gia ngày</Label>
                        <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-transparent">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span className="font-black text-slate-700">{formatDate(userInfo?.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-4 pt-6 border-t border-slate-50">
                        <Button onClick={handleSave} className="flex-1 h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                          LƯU THAY ĐỔI
                        </Button>
                        <Button variant="outline" onClick={handleCancel} className="flex-1 h-14 rounded-2xl font-black text-lg border-2">
                          HỦY BỎ
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                  <CardHeader className="p-10 border-b">
                     <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Lock className="w-6 h-6 text-primary" />
                        Đổi Mật Khẩu
                     </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-10 sm:p-14 space-y-8">
                     {passwordError && (
                        <div className="bg-destructive/10 text-destructive p-5 rounded-2xl text-sm font-black flex items-center gap-3 border border-destructive/20">
                           <X className="w-5 h-5" /> {passwordError}
                        </div>
                     )}
                     
                     {passwordSuccess && (
                        <div className="bg-green-100 text-green-700 p-5 rounded-2xl text-sm font-black flex items-center gap-3 border border-green-200">
                           <Save className="w-5 h-5" /> {passwordSuccess}
                        </div>
                     )}

                     {!isChangingPassword ? (
                       <div className="bg-slate-50 rounded-[2rem] p-10 border border-slate-100/50 text-center">
                          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                             <Key className="w-10 h-10 text-primary" />
                          </div>
                          <h4 className="text-xl font-black text-slate-900 mb-2">Thông tin đăng nhập</h4>
                          <p className="text-sm font-bold text-slate-400 mb-8 max-w-sm mx-auto">Bạn nên thay đổi mật khẩu định kỳ 6 tháng một lần để đảm bảo an toàn tối đa cho tài khoản.</p>
                          <Button onClick={() => setIsChangingPassword(true)} className="h-14 px-12 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">BẮT ĐẦU THAY ĐỔI</Button>
                       </div>
                     ) : (
                       <form onSubmit={handleChangePassword} className="space-y-6">
                         <div className="space-y-3">
                           <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</Label>
                           <Input
                             type="password"
                             name="currentPassword"
                             value={passwordData.currentPassword}
                             onChange={handlePasswordChange}
                             className="h-14 rounded-2xl bg-white border-2 border-slate-100 px-6 font-bold focus-visible:ring-primary/20 shadow-sm"
                             placeholder="••••••••"
                           />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</Label>
                              <Input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="h-14 rounded-2xl bg-white border-2 border-slate-100 px-6 font-bold focus-visible:ring-primary/20 shadow-sm"
                                placeholder="Tối thiểu 6 ký tự"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu</Label>
                              <Input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="h-14 rounded-2xl bg-white border-2 border-slate-100 px-6 font-bold focus-visible:ring-primary/20 shadow-sm"
                                placeholder="••••••••"
                              />
                            </div>
                         </div>

                         <div className="flex gap-4 pt-6">
                           <Button type="submit" className="flex-1 h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">LƯU MẬT KHẨU MỚI</Button>
                           <Button type="button" variant="outline" onClick={handleCancelPasswordChange} className="h-16 px-8 rounded-2xl font-black text-lg border-2">HỦY BỎ</Button>
                         </div>
                       </form>
                     )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="payment" className="m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                   <CardHeader className="p-10 border-b">
                      <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                         <CreditCard className="w-6 h-6 text-primary" />
                         Phương Thức Thanh Toán
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="p-10 text-center py-24">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-slate-200">
                         <CreditCard className="w-10 h-10 text-slate-300" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 mb-2">Chưa có phương thức nào</h4>
                      <p className="text-sm font-bold text-slate-400 mb-10 max-w-sm mx-auto">Vui lòng thêm thẻ ngân hàng hoặc ví điện tử để thanh toán nhanh hơn.</p>
                      <Button className="h-14 px-12 rounded-2xl font-black text-lg shadow-xl">+ THÊM PHƯƠNG THỨC</Button>
                   </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
