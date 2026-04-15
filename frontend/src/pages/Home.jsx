
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategorySidebar from '../components/CategorySidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight, Star, ShieldCheck, Truck, UtensilsCrossed, Calendar, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsResponse = await fetch('http://localhost:5000/api/products/allProducts');
        const productsData = await productsResponse.json();
        setProducts(productsData.data ? productsData.data.slice(0, 8) : []);

        const categoriesResponse = await fetch('http://localhost:5000/api/categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.data ? categoriesData.data : []);

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-gray-50/30 min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-12 space-y-24">
        
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-3 hidden lg:block lg:sticky lg:top-32 h-fit">
            <CategorySidebar
              categories={categories}
              loading={loading}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </div>

          <div className="lg:col-span-9 space-y-10">
            <div className="relative group rounded-[3.5rem] overflow-hidden shadow-2xl shadow-green-900/10 bg-white border border-gray-100 h-[300px] md:h-[500px]">
              <img
                src="/Banner-combo-vit-1400x526.jpg"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                alt="Banner"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/20 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity"></div>
              
              <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center p-10 md:p-20 space-y-6 max-w-3xl">
                <Badge className="bg-[#155e3a] text-white font-black px-6 py-2 rounded-full w-fit animate-in slide-in-from-left-4 duration-500 uppercase tracking-widest text-xs">
                    Món ngon mỗi ngày
                </Badge>
                <div className="space-y-2 backdrop-blur-sm bg-black/10 p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
                  <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter drop-shadow-2xl animate-in slide-in-from-left-6 duration-700 uppercase">
                    Hương Vị Đặc Sản<br/>
                    <span className="text-white italic">Tinh Hoa Đất Việt</span>
                  </h2>
                </div>
                <div className="flex gap-4 pt-4 animate-in slide-in-from-bottom-4 duration-1000">
                   <Button onClick={() => navigate('/product')} size="lg" className="h-16 px-10 rounded-2xl font-black text-lg bg-[#155e3a] hover:bg-[#0f4a2b] shadow-2xl shadow-[#155e3a]/40 hover:scale-105 transition-all text-white border-none">
                      MUA NGAY
                   </Button>
                   <Button variant="outline" className="h-16 px-10 rounded-2xl font-black text-lg bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white hover:text-slate-900 transition-all">
                      GIỚI THIỆU
                   </Button>
                </div>
              </div>
            </div>

            {/* Quick Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { icon: ShieldCheck, title: 'Chuẩn VietGAP', sub: 'An toàn 100%' },
                 { icon: Truck, title: 'Giao trong 2h', sub: 'Nội thành Hà Nội' },
                 { icon: UtensilsCrossed, title: 'Hương vị cổ truyền', sub: 'Công thức độc quyền' }
               ].map((f, i) => (
                 <div key={i} className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/30 hover:shadow-[#155e3a]/5 hover:border-[#155e3a]/20 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-[#155e3a]/10 text-[#155e3a] flex items-center justify-center group-hover:bg-[#155e3a] group-hover:text-white transition-all shadow-inner">
                       <f.icon className="w-7 h-7" />
                    </div>
                    <div>
                       <p className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1.5">{f.title}</p>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{f.sub}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* INTRODUCTION & MISSION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-10 group">
                <div className="space-y-4">
                   <Badge variant="outline" className="text-[#155e3a] border-[#155e3a]/20 font-black px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px]">Về chúng tôi</Badge>
                   <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                     Lan Tỏa Những Giá Trị <br/>
                     <span className="text-[#155e3a] relative inline-block">
                        Tinh Túy Của Ẩm Thực
                        <div className="absolute -bottom-2 left-0 w-full h-3 bg-[#155e3a]/10 -rotate-1"></div>
                     </span>
                   </h3>
                </div>
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
                  Sứ mệnh của <span className="text-slate-900 font-black">BẾP SẠCH VIỆT</span> là trở thành nhịp cầu kết nối văn hóa ẩm thực giữa các vùng miền. Chúng tôi không chỉ bán thực phẩm, chúng tôi mang tới những câu chuyện văn hóa trong từng bữa ăn.
                </p>
                <div className="flex gap-10">
                   <div className="space-y-1">
                      <span className="text-4xl font-black text-slate-900">10k+</span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng tin dùng</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-4xl font-black text-slate-900">100%</span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thực phẩm sạch</p>
                   </div>
                </div>
            </div>
            
            <div className="relative">
               <div className="absolute inset-0 bg-[#155e3a]/20 rounded-[4rem] rotate-3 scale-95 blur-2xl group-hover:rotate-6 transition-transform"></div>
               <div className="relative bg-[#0a2e1f] aspect-[4/3] rounded-[4rem] overflow-hidden shadow-2xl p-12 flex flex-col justify-center gap-8 group">
                  <div className="space-y-6">
                     <h4 className="text-2xl font-black text-white italic">"Chúng tôi tin rằng bữa cơm gia đình là nơi gắn kết tình thân đẹp nhất."</h4>
                     <Separator className="bg-white/10" />
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-[#155e3a] overflow-hidden">
                           <img src="https://api.dicebear.com/7.x/initials/svg?seed=Admin" alt="Founder" />
                        </div>
                        <div>
                           <p className="text-white font-black text-sm uppercase tracking-widest">CEO - Nguyễn Văn A</p>
                           <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Founder & Food Expert</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
        </section>

        {/* PROMOTION BANNERS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
               { title: 'Tết Sum Vầy', sub: 'Giảm 20% Combo Vịt Quê', img: '/banner1.png', color: 'from-orange-500 to-red-600' },
               { title: 'Văn Phòng Order', sub: 'Freeship đơn trên 200k', img: '/banner2.png', color: 'from-[#155e3a] to-emerald-700' },
               { title: 'Quà Biếu Cao Cấp', sub: 'Hộp quà sang trọng', img: '/banner3.png', color: 'from-slate-800 to-slate-950' }
            ].map((banner, i) => (
               <div key={i} className={`relative h-64 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all`}>
                  <img src={banner.img} alt={banner.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" onError={e => e.currentTarget.style.display='none'} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${banner.color} opacity-60 group-hover:opacity-80 transition-opacity`}></div>
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-white space-y-2">
                     <h5 className="text-2xl font-black tracking-tight">{banner.title}</h5>
                     <p className="text-sm font-bold opacity-80 uppercase tracking-widest">{banner.sub}</p>
                     <Button variant="link" className="text-white p-0 h-auto font-black flex items-center gap-2 group/btn">
                        XEM NGAY <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                     </Button>
                  </div>
               </div>
            ))}
        </section>

        {/* TOP PRODUCTS */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
            <div className="space-y-3">
               <Badge className="bg-[#155e3a]/10 text-[#155e3a] border-none font-black px-4 py-1 rounded-full uppercase tracking-widest text-[9px]">Săn ngay kẻo lỡ</Badge>
               <h3 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                  KHÁM PHÁ MÓN NGON
                  <UtensilsCrossed className="w-8 h-8 text-[#155e3a]" />
               </h3>
            </div>
            <Button onClick={() => navigate('/product')} variant="link" className="font-black text-sm uppercase tracking-widest group text-slate-400 hover:text-[#155e3a] decoration-[#155e3a]">
               THẾ GIỚI SẢN PHẨM <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] rounded-[2.5rem] bg-slate-100 animate-pulse"></div>)}
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map(product => {
                const price = product.variants?.[0]?.price_sale || 0;
                return (
                  <Card
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-[#155e3a]/10 transition-all duration-500 border-none cursor-pointer flex flex-col relative"
                  >
                    <div className="aspect-[4/5] relative overflow-hidden bg-slate-50 flex items-center justify-center">
                       <Badge className="absolute top-6 left-6 bg-orange-500 text-white font-black px-3 py-1 rounded-lg z-10 border-none shadow-lg animate-pulse">HOT</Badge>
                       <img src={product.avatar} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                       <div className="absolute inset-x-6 bottom-6 translate-y-20 group-hover:translate-y-0 transition-all duration-500 z-20">
                           <Button className="w-full h-14 rounded-2xl font-black text-sm shadow-2xl shadow-[#155e3a]/40 gap-2">
                              XEM CHI TIẾT
                           </Button>
                       </div>
                    </div>
                    <CardContent className="p-8 text-center flex flex-col flex-grow">
                       <h4 className="font-black text-slate-900 text-lg mb-2 leading-tight uppercase group-hover:text-[#155e3a] transition-colors">{product.name}</h4>
                       <div className="flex items-center justify-center gap-1.5 mb-6">
                           <Star className="w-3.5 h-3.5 fill-current text-yellow-400" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">4.8 (82 ĐÁNH GIÁ)</span>
                       </div>
                       <div className="mt-auto pt-4 border-t border-slate-50">
                          <span className="text-3xl font-black text-[#155e3a] tracking-tighter">{price.toLocaleString('vi-VN')}₫</span>
                       </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* TESTIMONIALS / GUARANTEE */}
        <section className="bg-[#0a2e1f] rounded-[4rem] p-12 md:p-24 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#155e3a]/20 rounded-full blur-[100px] -mt-48 -mr-48 group-hover:bg-[#155e3a]/30 transition-all duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mb-48 -ml-48"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="space-y-10">
                  <div className="space-y-4">
                     <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black px-4 py-1 rounded-full uppercase tracking-[0.2em] text-[10px]">Thoải mái mua sắm</Badge>
                     <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1]">CAM KẾT <br/> CHẤT LƯỢNG <span className="text-emerald-400 italic">THẬT</span></h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     {[
                        { icon: CheckCircle2, title: 'An toàn 100%', sub: 'Có chứng nhận VietGAP' },
                        { icon: Truck, title: 'Giao hỏa tốc', sub: 'Nhận hàng ngay trong 2h' },
                        { icon: UtensilsCrossed, title: 'Chuẩn vị mẹ nấu', sub: 'Không chất bảo quản' },
                        { icon: Calendar, title: 'Luôn tươi mới', sub: 'Hàng nhập về mỗi ngày' }
                     ].map((item, i) => (
                        <div key={i} className="flex gap-4 group/item">
                           <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover/item:bg-[#155e3a] transition-all">
                              <item.icon className="w-5 h-5 text-white" />
                           </div>
                           <div>
                              <p className="text-lg font-black text-white">{item.title}</p>
                              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{item.sub}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="bg-white/5 rounded-[3.5rem] p-12 border border-white/10 backdrop-blur-xl relative group">
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#155e3a] rounded-3xl flex items-center justify-center shadow-2xl rotate-12 group-hover:rotate-0 transition-transform">
                     <span className="text-4xl text-white font-black italic">"</span>
                  </div>
                  <div className="space-y-8">
                     <p className="text-2xl font-black text-white leading-relaxed italic">
                        "Tôi đã mua vịt quay và khâu nhục ở đây nhiều lần. Vị ngon đúng chuẩn đặc sản Lạng Sơn, đóng gói rất chuyên nghiệp và giao hàng nhanh."
                     </p>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-200 overflow-hidden border-2 border-[#155e3a]/50">
                           <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" alt="Customer" />
                        </div>
                        <div>
                           <p className="text-white font-black text-sm uppercase tracking-widest">Chị Thu Thủy</p>
                           <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Khách hàng thân thiết</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
        </section>

      </div>
    </div>
  );
}
