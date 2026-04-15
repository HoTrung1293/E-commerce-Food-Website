
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, MessageCircle, Send, Globe, ChevronRight, Store, ShieldCheck, Truck, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Footer() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="relative bg-[#155e3a] text-white mt-20 pt-20 pb-10 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full -mt-40 pointer-events-none"></div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand & About */}
          <div className="lg:col-span-4 space-y-10">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => handleNavigate('/home')}>
              <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                 <Store className="w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tight leading-none">BEPSACHVIET</span>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] mt-1">Hương vị quê hương</span>
              </div>
            </div>
            
            <p className="text-lg font-medium leading-relaxed text-white">
              Tinh hoa ẩm thực Việt. Chúng tôi cam kết mang đến những đặc sản vùng miền <span className="text-white underline underline-offset-8 decoration-white/30">sạch, an toàn và tươi ngon nhất</span> cho gia đình bạn.
            </p>

            <div className="space-y-6">
               <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-white flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                     <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Cửa hàng trung tâm</p>
                    <p className="text-sm font-bold text-white">91 Tam Khương, Đống Đa, Hà Nội</p>
                  </div>
               </div>
               
               <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-white flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                     <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Đường dây nóng 24/7</p>
                    <p className="text-sm font-bold text-white">0868 839 655 | 0963 538 357</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-10">
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] relative inline-block">
               Khám phá
               <div className="absolute -bottom-2 left-0 w-8 h-1 bg-primary rounded-full"></div>
            </h4>
            <ul className="space-y-4">
               {['Sản phẩm', 'Tin tức', 'Giới thiệu', 'Tuyển đại lý', 'Liên hệ'].map(item => (
                 <li key={item} className="flex items-center group cursor-pointer" onClick={() => handleNavigate(`/${item === 'Trang chủ' ? 'home' : item === 'Sản phẩm' ? 'product' : item === 'Tin tức' ? 'blog' : item === 'Giới thiệu' ? 'about' : item === 'Tuyển đại lý' ? 'distributor' : 'contact'}`)}>
                    <ChevronRight className="w-4 h-4 text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    <span className="text-sm font-bold hover:text-white transition-colors group-hover:pl-1">{item}</span>
                 </li>
               ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-3 space-y-10">
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] relative inline-block">
               Danh mục hot
               <div className="absolute -bottom-2 left-0 w-8 h-1 bg-primary rounded-full"></div>
            </h4>
            <div className="flex flex-wrap gap-3">
               {categories.slice(0, 8).map(cat => (
                 <Badge 
                    key={cat.id} 
                    variant="outline" 
                    className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer px-4 py-2 font-bold text-xs"
                    onClick={() => handleNavigate(`/product?category=${cat.id}`)}
                  >
                   {cat.name}
                 </Badge>
               ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3 space-y-10">
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] relative inline-block">
               Bản tin
               <div className="absolute -bottom-2 left-0 w-8 h-1 bg-primary rounded-full"></div>
            </h4>
            <p className="text-sm font-medium leading-relaxed">Đăng ký nhận thông tin khuyến mãi và các món ngon mới nhất mỗi tuần.</p>
            
            <div className="flex bg-white/5 rounded-[1.5rem] p-1.5 border border-white/10 focus-within:border-primary/50 transition-all group">
               <input 
                 type="email" 
                 placeholder="Email của bạn..." 
                 className="bg-transparent border-none outline-none pl-4 flex-1 text-sm font-bold text-white placeholder:text-white/40" 
               />
               <Button size="icon" className="rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  <Send className="w-4 h-4" />
               </Button>
            </div>

            <div className="flex gap-4">
              {[
                { icon: Facebook, color: 'hover:bg-blue-600', label: 'Facebook' },
                { icon: MessageCircle, color: 'hover:bg-green-500', label: 'Zalo' },
                { icon: Globe, color: 'hover:bg-primary', label: 'Website' }
              ].map((social, i) => (
                <TooltipProvider key={i}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:text-white transition-all ring-1 ring-white/5 ${social.color} hover:ring-0 active:scale-90 shadow-xl`}>
                        <social.icon className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-none font-bold text-white">{social.label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            {[
              { icon: ShieldCheck, title: 'Cam kết sạch', sub: '100% VietGAP/Organic' },
              { icon: Truck, title: 'Ship siêu tốc', sub: 'Nội thành trong 2h' },
              { icon: LikeIcon, title: 'Hương vị thật', sub: 'Không chất bảo quản' }, // Wait, Lucide icon name? Using LikeIcon is wrong
              { icon: LifeBuoy, title: 'Hỗ trợ tận tâm', sub: 'Đổi trả nếu không hài lòng' }
            ].map((feature, i) => {
               const Icon = feature.icon;
               return (
                  <div key={i} className="flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/[0.07] transition-all group">
                     <div className="w-12 h-12 rounded-2xl bg-primary/10 text-white flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                        <Icon className="w-6 h-6" />
                     </div>
                     <p className="text-sm font-black text-white uppercase tracking-widest">{feature.title}</p>
                     <p className="text-xs font-medium text-white mt-2">{feature.sub}</p>
                  </div>
               );
            })}
        </div>

        <Separator className="bg-white/5 mb-10" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
           <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-10">
              <p className="text-xs font-bold tracking-widest uppercase">
                © 2025 <span className="text-white font-black">BEPSACHVIET</span> . TOÀN QUYÊN BẢO LƯU.
              </p>
              <div className="flex gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
                 <a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a>
                 <a href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a>
              </div>
           </div>
           
           <div className="flex gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-5" alt="PayPal" />
           </div>
        </div>
      </div>

      {/* Modern Floating Contact Buttons */}
      <div className="fixed left-8 bottom-8 flex flex-col gap-5 z-[60]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" className="w-16 h-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-600/30 border-4 border-slate-950 animate-bounce-slow">
                <MessageCircle className="w-8 h-8 text-white fill-current" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-bold bg-indigo-600 text-white border-none">Chat Zalo</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" className="w-16 h-16 rounded-[2rem] bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 border-4 border-slate-950">
                <Phone className="w-8 h-8 text-white fill-current" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-bold bg-primary text-white border-none">0868 839 655</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </footer>
  );
}

// Since LikeIcon was not imported, let's just use CheckCircle2 or similar
function LikeIcon(props) {
    return <ShieldCheck {...props} />
}
