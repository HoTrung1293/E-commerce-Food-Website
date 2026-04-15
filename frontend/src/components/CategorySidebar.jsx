
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutGrid, ChevronRight, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CategorySidebar({ categories, loading, selectedCategory, onCategorySelect }) {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId) => {
    navigate(`/product?category=${categoryId}`);
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  return (
    <div className="h-fit">
      <Card className="border border-green-100/50 shadow-2xl shadow-green-900/5 rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="bg-green-50/50 border-b border-green-100/50 p-8">
          <CardTitle className="text-slate-800 text-lg font-black flex items-center gap-3 tracking-tight uppercase">
            <div className="w-10 h-10 rounded-xl bg-[#155e3a] flex items-center justify-center shadow-lg shadow-[#155e3a]/20">
               <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            Danh mục
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 bg-white">
          {loading ? (
            <div className="space-y-4 p-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full rounded-2xl" />)}
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              <div className="flex flex-col gap-2 p-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 text-left relative ${
                      selectedCategory === cat.id
                        ? 'bg-[#155e3a] text-white shadow-xl shadow-[#155e3a]/20'
                        : 'hover:bg-green-50 hover:shadow-md text-slate-600 hover:text-[#155e3a]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 group-hover:bg-[#155e3a]/10 text-slate-400 group-hover:text-[#155e3a]'
                       }`}>
                          <Hash className="w-4 h-4" />
                       </div>
                       <span className={`text-sm font-black uppercase tracking-tight ${selectedCategory === cat.id ? 'text-white' : 'text-slate-700'}`}>
                          {cat.name}
                       </span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-all ${
                       selectedCategory === cat.id ? 'text-white translate-x-0 opacity-100' : 'text-slate-300 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <div className="p-8 bg-green-50/50 border-t border-green-100/50">
           <div className="flex flex-col gap-4">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Ưu đãi hôm nay</p>
              <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#155e3a] to-emerald-600 shadow-xl shadow-[#155e3a]/30 group cursor-pointer hover:scale-105 transition-transform duration-300">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                 <p className="text-white font-black text-lg leading-tight relative z-10">FREESHIP<br/>BÁN KÍNH 5KM</p>
                 <Badge className="mt-4 bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-[#155e3a] border-none font-black text-[10px] transition-colors shadow-none w-max relative z-10">TÌM HIỂU THÊM</Badge>
              </div>
           </div>
        </div>
      </Card>
    </div>
  );
}
