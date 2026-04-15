import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CategorySidebar from '../components/CategorySidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Star, ShoppingCart, LayoutGrid, List, Filter, Search, ChevronRight, Package, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';


export default function ProductPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryFromUrl = searchParams.get('category_id') || searchParams.get('category');
  const searchFromUrl = searchParams.get('search');

  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl ? parseInt(categoryFromUrl) : null);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl || '');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await fetch('http://localhost:5000/api/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.data ? categoriesData.data : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products based on selected category or search query
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url;

        if (searchQuery) {
          // Fetch products by search query
          url = 'http://localhost:5000/api/products/productByName';
          const productsResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: searchQuery })
          });
          if (!productsResponse.ok) {
            throw new Error('Failed to fetch products');
          }
          const productsData = await productsResponse.json();
          setAllProducts(productsData.data ? productsData.data : []);
        } else if (selectedCategory) {
          // Fetch products by category
          url = `http://localhost:5000/api/products/productByType/${selectedCategory}`;
          const productsResponse = await fetch(url);
          if (!productsResponse.ok) {
            throw new Error('Failed to fetch products');
          }
          const productsData = await productsResponse.json();
          setAllProducts(productsData.data ? productsData.data : []);
        } else {
          // Fetch all products
          url = 'http://localhost:5000/api/products/allProducts';
          const productsResponse = await fetch(url);
          if (!productsResponse.ok) {
            throw new Error('Failed to fetch products');
          }
          const productsData = await productsResponse.json();
          setAllProducts(productsData.data ? productsData.data : []);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery]);

  // Update selected category or search query when URL changes
  useEffect(() => {
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      setSelectedCategory(null);
      setCurrentPage(1);
    } else if (categoryFromUrl) {
      setSelectedCategory(parseInt(categoryFromUrl));
      setSearchQuery('');
      setCurrentPage(1);
    } else {
      // Reset all filters when no category or search in URL
      setSelectedCategory(null);
      setSearchQuery('');
      setCurrentPage(1);
    }
  }, [categoryFromUrl, searchFromUrl]);

  // Filter and sort products
  const filteredProducts = allProducts
    .filter(product => {
      // Lấy giá từ variant đầu tiên
      const price = product.variants && product.variants.length > 0
        ? product.variants[0].price_sale
        : 0;
      const priceMatch = price >= priceRange[0] && price <= priceRange[1];

      // Lọc theo category (nếu có) - sử dụng category_id từ backend
      const categoryMatch = !selectedCategory || product.category_id === selectedCategory;

      return priceMatch && categoryMatch;
    })
    .sort((a, b) => {
      const priceA = a.variants && a.variants.length > 0 ? a.variants[0].price_sale : 0;
      const priceB = b.variants && b.variants.length > 0 ? b.variants[0].price_sale : 0;

      switch (sortBy) {
        case 'price_low_to_high':
          return priceA - priceB;
        case 'price_high_to_low':
          return priceB - priceA;
        case 'rating': {
          const ra = Number(a.avg_rating || 0);
          const rb = Number(b.avg_rating || 0);
          return rb - ra;
        }
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  // Lấy tên danh mục được chọn
  const selectedCategoryName = selectedCategory
    ? categories.find(cat => cat.id === selectedCategory)?.name
    : null;

  // Pagination
  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(e.target.value);
    if (newRange[0] <= newRange[1]) {
      setPriceRange(newRange);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* Breadcrumb Section */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Button variant="link" onClick={() => navigate('/')} className="h-auto p-0 text-muted-foreground hover:text-[#155e3a]">
              TRANG CHỦ
            </Button>
            <span className="text-muted-foreground">/</span>
            {selectedCategoryName || searchQuery ? (
              <>
                <Button variant="link" onClick={() => navigate('/product')} className="h-auto p-0 text-muted-foreground hover:text-[#155e3a]">
                  SẢN PHẨM
                </Button>
                <span className="text-muted-foreground">/</span>
                <span className="font-bold text-foreground">
                  {selectedCategoryName ? selectedCategoryName.toUpperCase() : `KẾT QUẢ: "${searchQuery}"`}
                </span>
              </>
            ) : (
              <span className="font-bold text-foreground">TẤT CẢ SẢN PHẨM</span>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
             <Package className="w-4 h-4" />
             {filteredProducts.length} Sản phẩm
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-32 h-fit">
               {/* Design Filter Card */}
               {!searchQuery && (
                 <Card className="border border-green-100/50 shadow-2xl shadow-green-900/5 rounded-[2.5rem] overflow-hidden bg-white">
                   <CardContent className="p-8 space-y-6">
                     <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                       <Filter className="w-4 h-4 text-[#155e3a]" />
                       Lọc theo giá
                     </h3>
                     <div className="space-y-6">
                       <div className="space-y-4">
                         <input
                           type="range"
                           min="0"
                           max="500000"
                           step="10000"
                           value={priceRange[1]}
                           onChange={(e) => handlePriceChange(e, 1)}
                           className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#155e3a]"
                         />
                         <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                            <span>0 ₫</span>
                            <span>500k ₫</span>
                         </div>
                       </div>
                       
                       <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100/50 text-center">
                          <span className="text-[10px] font-black text-[#155e3a] uppercase block mb-1 tracking-widest">Tầm giá hiển thị</span>
                          <span className="text-xl font-black text-[#155e3a]">
                             {priceRange[0].toLocaleString('vi-VN')} ₫ - {priceRange[1].toLocaleString('vi-VN')} ₫
                          </span>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               )}

               {/* Category Sidebar Wrap */}
               <CategorySidebar
                 categories={categories}
                 loading={loading}
                 selectedCategory={selectedCategory}
                 onCategorySelect={handleCategorySelect}
               />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header / Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
               <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="bg-white p-1 rounded-xl shadow-sm border flex items-center">
                     <Button variant="ghost" size="icon" className="w-10 h-10 rounded-lg text-[#155e3a] bg-[#155e3a]/10"><LayoutGrid className="w-5 h-5" /></Button>
                     <Button variant="ghost" size="icon" className="w-10 h-10 rounded-lg text-slate-400"><List className="w-5 h-5" /></Button>
                  </div>
                  <Separator orientation="vertical" className="h-8 hidden sm:block" />
                  <p className="text-sm font-bold text-slate-400 whitespace-nowrap">
                    Hiển thị <span className="text-slate-900">{filteredProducts.length > 0 ? startIndex + 1 : 0}</span> - <span className="text-slate-900">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> của <span className="text-slate-900">{filteredProducts.length}</span>
                  </p>
               </div>

               <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="relative group flex-1 sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Tìm món ngon..." 
                      className="rounded-2xl pl-12 h-12 bg-white border-none shadow-sm focus-visible:ring-primary/20 font-bold"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[200px] h-12 rounded-2xl border-none shadow-sm bg-white font-black text-xs uppercase tracking-widest pl-6">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="newest" className="font-bold">Mới nhất</SelectItem>
                      <SelectItem value="price_low_to_high" className="font-bold">Giá: Thấp &rarr; Cao</SelectItem>
                      <SelectItem value="price_high_to_low" className="font-bold">Giá: Cao &rarr; Thấp</SelectItem>
                      <SelectItem value="rating" className="font-bold">Đánh giá cao</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(itemsPerPage)].map((_, i) => (
                  <Card key={i} className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
                    <Skeleton className="h-64 w-full" />
                    <CardContent className="p-6 space-y-4">
                       <Skeleton className="h-6 w-3/4 rounded-lg" />
                       <Skeleton className="h-4 w-1/2 rounded-lg" />
                       <div className="flex justify-between items-center pt-2">
                          <Skeleton className="h-8 w-1/3 rounded-lg" />
                          <Skeleton className="h-10 w-10 rounded-full" />
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-10 rounded-[2.5rem] text-center font-black border-2 border-dashed border-red-200">
                Lỗi kết nối: {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-xl font-black text-slate-400">Không tìm thấy sản phẩm nào phù hợp</h3>
                <Button variant="link" className="mt-2 text-[#155e3a] font-black" onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}>Xem tất cả sản phẩm</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {displayedProducts.map(product => {
                  const price = product.variants && product.variants.length > 0
                    ? product.variants[0].price_sale
                    : 0;
                  const originalPrice = price * 1.25; // Simulating for UI
                  
                  return (
                    <Card
                      key={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:bg-[#155e3a]/10 transition-all duration-500 border-none cursor-pointer flex flex-col relative"
                    >
                      {/* Product Image */}
                      <div className="aspect-[4/5] relative overflow-hidden bg-slate-100 flex items-center justify-center">
                        <Badge className="absolute top-6 left-6 bg-[#155e3a] text-white font-black px-4 py-1.5 rounded-full z-10 shadow-lg border-none animate-in zoom-in">
                          MỚI
                        </Badge>
                        
                        <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                           <Button size="icon" variant="secondary" className="rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                           </Button>
                        </div>

                        {product.avatar ? (
                          <img
                            src={product.avatar}
                            alt={product.name}
                            className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                          />
                        ) : (
                          <span className="text-6xl grayscale opacity-20">📦</span>
                        )}
                        
                        {/* Instant Action */}
                        <div className="absolute inset-x-6 bottom-6 translate-y-20 group-hover:translate-y-0 transition-all duration-500 z-20">
                           <Button className="w-full h-14 rounded-2xl font-black text-sm shadow-2xl shadow-[#155e3a]/40 gap-2 bg-[#155e3a] text-white hover:bg-[#0f4a2b] border-none">
                              <ShoppingCart className="w-4 h-4" />
                              XEM CHI TIẾT
                           </Button>
                        </div>
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>

                      {/* Product Info */}
                      <CardContent className="p-8 flex flex-col flex-grow text-center">
                        <h4 className="font-black text-slate-800 text-lg mb-2 leading-tight line-clamp-2 group-hover:text-[#155e3a] transition-colors tracking-tight uppercase">
                           {product.name}
                        </h4>

                        <div className="flex items-center justify-center gap-2 mb-4">
                          <div className="flex text-yellow-400">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.avg_rating || 4.5) ? 'fill-current' : 'text-slate-200'}`} />
                             ))}
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">({product.review_count || 0} ĐÁNH GIÁ)</span>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col items-center">
                            <span className="text-xs text-slate-300 line-through font-bold mb-1">{originalPrice.toLocaleString('vi-VN')}₫</span>
                            <span className="text-3xl font-black text-[#155e3a] tracking-tighter">{price.toLocaleString('vi-VN')}₫</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination Section */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl h-11 w-11 border-2" 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </Button>
                  
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border">
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "ghost"}
                        onClick={() => handlePageChange(i + 1)}
                        className={`min-w-10 h-10 rounded-xl font-black text-sm transition-all ${
                          currentPage === i + 1 ? 'shadow-lg text-[#155e3a]/20' : 'text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>

                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl h-11 w-11 border-2" 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
            )}
            
            <div className="mt-24 p-12 bg-slate-900 rounded-[3rem] text-white overflow-hidden relative">
               <div className="absolute bottom-0 right-0 w-64 h-64 text-[#155e3a]/20 rounded-full blur-3xl -mb-32 -mr-32"></div>
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-center md:text-left space-y-4">
                     <h3 className="text-3xl font-black tracking-tight leading-none uppercase">ĐĂNG KÝ BẢN TIN</h3>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nhận ngay Voucher 100k cho đơn hàng đầu tiên</p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                     <Input placeholder="Email của bạn..." className="h-14 rounded-2xl bg-white/10 border-none text-white focus-visible:ring-primary/20 sm:w-80" />
                     <Button className="h-14 px-8 rounded-2xl font-black bg-[#155e3a] text-white hover:bg-[#0f4a2b]">ĐĂNG KÝ</Button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
