import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Clock, Send, Globe, MessageSquare, Map, ChevronRight } from 'lucide-react';


const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => navigate('/'), 2000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Lỗi gửi liên hệ!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b py-24 relative overflow-hidden mb-16">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full -mr-72 -mt-72 blur-3xl"></div>
        <div className="max-w-6xl mx-auto px-4 relative">
           <div className="max-w-2xl">
              <Badge className="mb-4 bg-primary/10 text-primary border-none font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full">Kết nối với chúng tôi</Badge>
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-6 uppercase leading-[0.9]">Chúng tôi luôn lắng nghe bạn</h1>
              <p className="text-xl font-bold text-slate-400 mb-8 leading-relaxed">Mọi thắc mắc về sản phẩm hoặc hợp tác phân phối, vui lòng để lại thông tin. Đội ngũ Bếp Sạch Việt sẽ phản hồi bạn trong thời gian sớm nhất.</p>
           </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Form Section */}
          <div className="lg:col-span-7">
            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="p-10 border-b">
                 <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Gửi tin nhắn trực tuyến
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                {message.text && (
                  <div className={`p-6 mb-8 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {message.type === 'success' ? <Send className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và Tên</Label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Nguyễn Văn A"
                        className="h-14 rounded-2xl bg-slate-50 border-transparent font-bold focus-visible:ring-primary/20 px-6"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Địa chỉ Email</Label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="email@vidu.com"
                        className="h-14 rounded-2xl bg-slate-50 border-transparent font-bold focus-visible:ring-primary/20 px-6"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="09xx xxx xxx"
                      className="h-14 rounded-2xl bg-slate-50 border-transparent font-bold focus-visible:ring-primary/20 px-6"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nội dung yêu cầu</Label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Mô tả chi tiết yêu cầu của bạn..."
                      className="rounded-2xl bg-slate-50 border-transparent font-bold focus-visible:ring-primary/20 p-6 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 gap-3 group"
                  >
                    {loading ? 'ĐANG GỬI...' : (
                       <>GỬI LIÊN HỆ NGAY <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info Sidebar */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white p-10 group">
               <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                  <MapPin className="w-6 h-6 text-primary group-hover:text-white" />
               </div>
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-4">Trụ sở chính</h3>
               <p className="text-sm font-bold text-slate-500 leading-relaxed">
                 Ngõ 91 Tam Khương, nhà số 2. (Số 59 ngõ 354/137 Đường Trường Chinh, P. Khương Thượng, Q. Đống đa, HN.)
               </p>
            </Card>

            <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white p-10 group">
               <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                  <Phone className="w-6 h-6 text-primary group-hover:text-white" />
               </div>
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-4">Hotline hỗ trợ</h3>
               <div className="flex flex-col gap-2">
                  <a href="tel:0868839655" className="text-2xl font-black text-primary hover:underline">0868 839 655</a>
                  <a href="tel:0963538357" className="text-2xl font-black text-primary hover:underline">0963 538 357</a>
               </div>
            </Card>

            <div className="grid grid-cols-2 gap-8">
               <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden bg-white p-8">
                  <Clock className="w-6 h-6 text-primary mb-4" />
                  <h4 className="text-sm font-black text-slate-900 uppercase mb-2">Giờ mở cửa</h4>
                  <p className="text-xs font-bold text-slate-400">9:00 - 18:00<br/>T2 - Chủ Nhật</p>
               </Card>
               <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden bg-slate-900 p-8 text-white">
                  <Globe className="w-6 h-6 text-primary mb-4" />
                  <h4 className="text-sm font-black uppercase mb-2">Mạng xã hội</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">@bepsachviet</p>
               </Card>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-20">
          <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[3.5rem] overflow-hidden bg-white p-4">
            <div className="flex items-center justify-between p-8">
               <h2 className="text-2xl font-black text-slate-900 uppercase flex items-center gap-3">
                  <Map className="w-6 h-6 text-primary" />
                  Hệ thống cửa hàng
               </h2>
               <Button variant="ghost" className="font-black text-xs uppercase tracking-widest gap-2">Xem tất cả <ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="rounded-[2.5rem] overflow-hidden h-[500px] border-8 border-slate-50">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.5655849396046!2d105.83779!3d20.982!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac6e6f0f0f0f%3A0x1234567890!2sNg%C3%B5%2091%20Tam%20Kh%C6%B0%C6%A1ng!5e0!3m2!1svi!2s!4v1234567890"
                width="100%"
                height="100%"
                className="border-none grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                allowFullScreen=""
                loading="lazy"
                title="Vị trí cửa hàng"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>

  );
};

export default Contact;
