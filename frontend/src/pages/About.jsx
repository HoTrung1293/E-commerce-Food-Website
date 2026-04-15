import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Utensils, Globe, ShieldCheck, Heart, Sparkles, ChevronRight, Store } from 'lucide-react';


const About = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const response = await fetch('/api/blogs/about/page');
      const data = await response.json();
      if (data.success) {
        setBlog(data.data);
      }
    } catch (error) {
      console.error('Error fetching about:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-500 font-medium">Chưa có nội dung giới thiệu</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b py-24 relative overflow-hidden mb-16">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-64 -mt-64 blur-3xl"></div>
        <div className="max-w-5xl mx-auto px-4 relative">
           <div className="text-center space-y-6">
              <Badge className="bg-primary/10 text-primary border-none font-black text-xs uppercase tracking-[0.2em] px-6 py-2 rounded-full mb-4">Câu Chuyện Thương Hiệu</Badge>
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
                 {blog.title}
              </h1>
              <div className="flex items-center justify-center gap-6 pt-4">
                 <div className="h-px w-12 bg-slate-200"></div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                   Cập nhật: {new Date(blog.updated_at).toLocaleDateString('vi-VN')}
                 </p>
                 <div className="h-px w-12 bg-slate-200"></div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 gap-16">
          {/* Main Content Card */}
          <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[3rem] overflow-hidden bg-white">
            <CardContent className="p-10 md:p-20">
               <div className="prose prose-lg max-w-none prose-p:text-slate-600 prose-p:font-bold prose-p:leading-relaxed prose-headings:font-black prose-headings:text-slate-900 prose-headings:uppercase prose-headings:tracking-tighter prose-img:rounded-[2rem] prose-img:shadow-2xl">
                  {blog.thumbnail_image && (
                    <div className="mb-16 relative group">
                       <div className="absolute -inset-4 bg-primary/5 rounded-[2.5rem] blur-xl group-hover:bg-primary/10 transition-colors"></div>
                       <img
                         src={blog.thumbnail_image}
                         alt={blog.title}
                         className="relative w-full rounded-[2rem] shadow-2xl object-cover h-[500px]"
                       />
                    </div>
                  )}
                  
                  <div
                    id="blog-content"
                    className="space-y-8"
                    dangerouslySetInnerHTML={{
                      __html: blog.content
                        ?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                        .replace(/<img[^>]*>/gi, (img) => {
                          return img.replace('<img', '<img class="max-w-full mx-auto my-12 block rounded-[2.5rem] shadow-2xl border-8 border-white"');
                        })
                    }}
                  />
               </div>
            </CardContent>
          </Card>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             {[
               { icon: <ShieldCheck className="w-8 h-8" />, title: 'An Toàn', desc: 'Kiểm định 100%' },
               { icon: <Globe className="w-8 h-8" />, title: 'Nguồn Gốc', desc: 'Đặc sản vùng miền' },
               { icon: <Heart className="w-8 h-8" />, title: 'Tận Tâm', desc: 'Phục vụ 24/7' },
               { icon: <Sparkles className="w-8 h-8" />, title: 'Chất Lượng', desc: 'Công nghệ hiện đại' }
             ].map((item, i) => (
               <Card key={i} className="border-none shadow-xl shadow-gray-200/40 rounded-[2rem] bg-white p-8 text-center group hover:bg-primary transition-all duration-500">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 group-hover:scale-110 transition-all">
                     <div className="text-primary group-hover:text-white transition-colors">
                        {item.icon}
                     </div>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">{item.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter group-hover:text-white/70 transition-colors">{item.desc}</p>
               </Card>
             ))}
          </div>

          {/* Premium CTA */}
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 p-12 md:p-24 text-center shadow-2xl">
             <div className="absolute inset-0 opacity-20">
                <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
             
             <div className="relative z-10 space-y-10 max-w-3xl mx-auto">
                <Utensils className="w-16 h-16 text-primary mx-auto" />
                <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight">Sẵn sàng trải nghiệm tinh hoa ẩm thực?</h3>
                <p className="text-lg font-bold text-slate-400">Gia nhập cộng đồng yêu bếp sạch và thưởng thức những món ngon tuyệt hảo nhất Việt Nam ngay hôm nay.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                   <Button 
                     size="lg" 
                     onClick={() => navigate('/product')}
                     className="h-16 px-12 rounded-2xl font-black text-lg gap-3 shadow-2xl shadow-primary/20 hover:scale-105 transition-transform"
                   >
                     MUA SẮM NGAY <ChevronRight className="w-5 h-5" />
                   </Button>
                   <Button 
                     variant="outline" 
                     size="lg" 
                     className="h-16 px-12 rounded-2xl font-black text-lg border-2 text-white border-white/20 hover:bg-white hover:text-slate-900 transition-all"
                   >
                     LIÊN HỆ CHÚNG TÔI
                   </Button>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        #blog-content h2 {
          font-size: 2.5rem;
          margin-top: 4rem;
          margin-bottom: 2rem;
          color: #1a1a1a;
        }
        #blog-content h3 {
          font-size: 1.75rem;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          color: #2d2d2d;
        }
        #blog-content blockquote {
          border-left: 8px solid #c0eb75;
          background: #f9fdf2;
          padding: 3rem;
          border-radius: 2rem;
          font-style: italic;
          font-weight: 800;
          color: #166534;
        }
      `}</style>
    </div>

  );
};

export default About;
