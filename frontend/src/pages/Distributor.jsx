import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Handshake, TrendingUp, Award, ChevronRight } from 'lucide-react';


const Distributor = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDistributor();
  }, []);

  const fetchDistributor = async () => {
    try {
      const response = await fetch('/api/blogs/distributor/page');
      const data = await response.json();
      if (data.success) {
        setBlog(data.data);
      }
    } catch (error) {
      console.error('Error fetching distributor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Chưa có nội dung tuyển đại lý</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Hero Header */}
      <div className="bg-slate-900 py-32 relative overflow-hidden mb-16">
        <div className="absolute inset-0 opacity-20">
           <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
           <div className="max-w-3xl space-y-6">
              <Badge className="bg-primary text-black border-none font-black text-xs uppercase tracking-widest px-6 py-2 rounded-full">Hợp Tác Phát Triển</Badge>
              <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                 {blog.title}
              </h1>
              <p className="text-xl font-bold text-slate-300 leading-relaxed">Gia nhập mạng lưới đại lý của Bếp Sạch Việt để cùng chúng tôi mang những tinh hoa ẩm thực sạch tới mọi gia đình.</p>
           </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Content Section */}
          <div className="lg:col-span-8">
            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[3rem] overflow-hidden bg-white">
               <CardContent className="p-10 md:p-20">
                  <div className="prose prose-lg max-w-none prose-p:text-slate-600 prose-p:font-bold prose-p:leading-relaxed prose-headings:font-black prose-headings:text-slate-900 prose-headings:uppercase prose-headings:tracking-tighter prose-img:rounded-[2.5rem] prose-img:shadow-2xl">
                     {blog.thumbnail_image && (
                       <img
                         src={blog.thumbnail_image}
                         alt={blog.title}
                         className="w-full rounded-[2rem] shadow-2xl object-cover mb-12 h-[450px]"
                       />
                     )}
                     <div
                        id="blog-content"
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
          </div>

          {/* Benefit Sidebar */}
          <div className="lg:col-span-4 space-y-8">
             <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: <TrendingUp className="w-8 h-8" />, title: 'Chiết Khấu Cao', desc: 'Chế độ hoa hồng hấp dẫn nhất thị trường' },
                  { icon: <Award className="w-8 h-8" />, title: 'Độc Quyền Khu Vực', desc: 'Bảo hộ quyền lợi kinh doanh theo vùng' },
                  { icon: <Handshake className="w-8 h-8" />, title: 'Hỗ Trợ Marketing', desc: 'Cung cấp tài liệu & chiến dịch quảng cáo' },
                  { icon: <Users className="w-8 h-8" />, title: 'Đào Tạo Chuyên Sâu', desc: 'Kiến thức sản phẩm & kỹ năng bán hàng' }
                ].map((item, i) => (
                  <Card key={i} className="border-none shadow-xl shadow-gray-200/40 rounded-[2rem] bg-white p-8 group hover:bg-primary transition-all duration-500">
                     <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-all">
                        <div className="text-primary group-hover:text-black transition-colors">
                           {item.icon}
                        </div>
                     </div>
                     <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2 group-hover:text-black transition-colors">{item.title}</h4>
                     <p className="text-sm font-bold text-slate-400 leading-relaxed group-hover:text-black/70 transition-colors">{item.desc}</p>
                  </Card>
                ))}
             </div>

             <Card className="border-none shadow-2xl shadow-primary/20 rounded-[2.5rem] bg-slate-900 p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10 space-y-6">
                   <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight">Yêu cầu tư vấn đại lý?</h3>
                   <p className="text-sm font-bold text-slate-400">Để lại thông tin, chuyên viên của chúng tôi sẽ gọi lại cho bạn ngay.</p>
                   <Button 
                     onClick={() => navigate('/contact')}
                     className="w-full h-14 rounded-xl font-black text-xs uppercase tracking-widest gap-2 bg-primary text-black hover:bg-primary/90"
                   >
                     ĐĂNG KÝ NGAY <ChevronRight className="w-4 h-4" />
                   </Button>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Distributor;
