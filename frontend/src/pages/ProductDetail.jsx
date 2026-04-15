import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import AddToCartModal from '../components/AddToCartModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, ShoppingCart, Share2, Heart, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Package, Truck, ShieldCheck, History, Box, Info, MessageCircle, Minus, Plus, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, getUserId } = useAuth();
  const [searchParams] = useSearchParams();

  const { refreshCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  // Tabs & Review form state
  const [activeTab, setActiveTab] = useState('description');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [canReview, setCanReview] = useState(false);

  // Helper: compute star count (default 4 if no reviews)
  const getStarCount = (p) => {
    const rc = p?.review_count ?? 0;
    const ar = p?.avg_rating ?? 0;
    if (!rc) return 4;
    const val = Math.round(ar);
    return val > 0 ? val : 4;
  };

  // Helper: render stars only (no counts), size class customizable
  const renderStars = (count, size = 'text-sm') => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`${size} ${i < count ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
      ))}
    </div>
  );

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/products/detailProduct/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product detail');
        }
        const data = await response.json();
        setProduct(data.data);
        setMainImage(data.data?.avatar);
        
        // Chọn variant đầu tiên có stock > 0, nếu không có thì chọn variant đầu tiên
        if (data.data?.variants && data.data.variants.length > 0) {
          const availableVariant = data.data.variants.find(v => v.stock > 0);
          setSelectedVariant(availableVariant || data.data.variants[0]);
        }

        // Fetch related products from same category
        if (data.data?.category_id) {
          try {
            const relatedResponse = await fetch(
              `http://localhost:5000/api/products/productByType/${data.data.category_id}`
            );
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              setRelatedProducts(relatedData.data ? relatedData.data.filter(p => p.id !== productId).slice(0, 3) : []);
            }
          } catch (err) {
            console.error('Error fetching related products:', err);
          }
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching product detail:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
    }, []);

    // Handle tab from query string
    useEffect(() => {
      const t = searchParams.get('tab');
      if (t === 'reviews') setActiveTab('reviews');
    }, [searchParams]);

    // Fetch reviews for product
    const fetchReviews = async (pid) => {
      try {
        const res = await fetch(`http://localhost:5000/api/reviews/product/${pid}`);
        if (res.ok) {
          const data = await res.json();
          const list = (data && data.data && Array.isArray(data.data.reviews)) ? data.data.reviews : [];
          setProduct((prev) => (prev ? { ...prev, reviews: list } : prev));
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    useEffect(() => {
      if (productId) {
        fetchReviews(productId);
      }
    }, [productId]);


  // Check if current user can review this product
  useEffect(() => {
    const check = async () => {
      if (!productId || !isAuthenticated() || !token) {
        setCanReview(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/reviews/canReview/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCanReview(Boolean(data?.data?.canReview));
        } else {
          setCanReview(false);
        }
      } catch {
        setCanReview(false);
      }
    };
    check();
  }, [productId, token, isAuthenticated]);

  const handleAddToCart = async () => {

    // Kiểm tra đăng nhập
    if (!isAuthenticated()) {
      const confirmLogin = window.confirm('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Đăng nhập ngay?');
      if (confirmLogin) {
        navigate('/auth/login');
      }
      return;
    }

    // Kiểm tra variant
    if (!selectedVariant) {
      alert('Vui lòng chọn một biến thể sản phẩm');
      return;
    }

    // Kiểm tra stock
    if (selectedVariant.stock <= 0) {
      alert('Sản phẩm này hiện đã hết hàng');
      return;
    }

    // Kiểm tra số lượng
    if (quantity <= 0) {
      alert('Số lượng phải lớn hơn 0');
      return;
    }

    // Kiểm tra số lượng không vượt quá stock
    if (quantity > selectedVariant.stock) {
      alert(`Số lượng không được vượt quá tồn kho (${selectedVariant.stock})`);
      return;
    }

    setAddingToCart(true);

    try {
      const userId = getUserId();

      const response = await fetch('http://localhost:5000/api/cart/addItem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          productVariantId: selectedVariant.id,
          quantity: quantity
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      }

      if (data.success) {
        // Refresh cart count
        refreshCart();

        // Show modal
        setShowModal(true);
      } else {
        alert(data.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      const confirmLogin = window.confirm('Bạn cần đăng nhập để gửi đánh giá. Đăng nhập ngay?');
      if (confirmLogin) navigate('/auth/login');
      return;
    }

    if (!productId) return;

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      alert('Vui lòng chọn số sao (1-5).');
      return;
    }

    const comment = reviewComment.trim();
    if (comment.length < 10) {
      alert('Bình luận tối thiểu 10 ký tự.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productId: Number(productId),
          rating: reviewRating,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Không thể gửi đánh giá');
      }
      alert('Cảm ơn bạn đã đánh giá!');
      setReviewRating(0);
      setReviewComment('');
      await fetchReviews(productId);
    } catch (err) {
      console.error('Submit review error:', err);
      alert(err.message || 'Đã xảy ra lỗi khi gửi đánh giá');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi: {error || 'Không tìm thấy sản phẩm'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const price = selectedVariant?.price_sale || 0;
  const originalPrice = selectedVariant?.price || 0;
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  // Reviews derived data (optional, if backend provides reviews later)
  const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
  const reviewCount = reviews.length;
  const avgRating = reviewCount ? parseFloat((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviewCount).toFixed(1)) : 0;
  const ratingCounts = [5,4,3,2,1].map(star => reviews.filter(r => r.rating === star).length);
  const ratingPercents = ratingCounts.map(c => reviewCount ? Math.round((c * 100) / reviewCount) : 0);


  // Format time for each review (vi-VN)
  const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Button variant="link" onClick={() => navigate('/')} className="h-auto p-0 text-muted-foreground hover:text-[#155e3a]">
              TRANG CHỦ
            </Button>
            <span className="text-muted-foreground">/</span>
            <Button variant="link" onClick={() => navigate('/products')} className="h-auto p-0 text-muted-foreground hover:text-[#155e3a]">
              SẢN PHẨM
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold text-foreground line-clamp-1 max-w-[200px] sm:max-w-md uppercase tracking-widest text-[10px]">{product.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </Button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 py-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Product Images */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="overflow-hidden border-none shadow-2xl shadow-gray-200/50 bg-white group">
              <div className="aspect-square relative flex items-center justify-center overflow-hidden">
                {mainImage ? (
                  <img 
                    src={mainImage} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                ) : (
                  <Package className="w-24 h-24 text-muted-foreground/20" />
                )}
                
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10 transition-opacity group-hover:bg-black/70">
                    <Badge variant="destructive" className="text-xl px-6 py-2 rounded-full font-black animate-pulse">
                      HẾT HÀNG
                    </Badge>
                  </div>
                )}
                
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                   <Button size="icon" variant="secondary" className="rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                      <Heart className="w-5 h-5" />
                   </Button>
                   <Button size="icon" variant="secondary" className="rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                      <Share2 className="w-5 h-5" />
                   </Button>
                </div>
              </div>
            </Card>

            {/* Thumbnail Gallery */}
            <ScrollArea className="w-full pb-4">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className={`p-0 w-24 h-24 rounded-2xl shrink-0 overflow-hidden border-2 transition-all duration-300 ${
                    selectedImageIndex === 0 ? 'bordertext-[#155e3a] ring-4 ringtext-[#155e3a]/20 scale-95' : 'hover:bordertext-[#155e3a]/50 grayscale hover:grayscale-0'
                  }`}
                  onClick={() => {
                    setMainImage(product.avatar);
                    setSelectedImageIndex(0);
                  }}
                >
                  <img src={product.avatar || 'https://placehold.co/100'} alt="thumb-0" className="w-full h-full object-cover" />
                </Button>

                {product.images && (() => {
                  try {
                    const imageArray = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                    return Array.isArray(imageArray) && imageArray.map((img, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className={`p-0 w-24 h-24 rounded-2xl shrink-0 overflow-hidden border-2 transition-all duration-300 ${
                          selectedImageIndex === idx + 1 ? 'bordertext-[#155e3a] ring-4 ringtext-[#155e3a]/20 scale-95' : 'hover:bordertext-[#155e3a]/50 grayscale hover:grayscale-0'
                        }`}
                        onClick={() => {
                          setMainImage(img);
                          setSelectedImageIndex(idx + 1);
                        }}
                      >
                        <img src={img} alt={`thumb-${idx+1}`} className="w-full h-full object-cover" />
                      </Button>
                    ));
                  } catch { return null; }
                })()} 
              </div>
            </ScrollArea>
          </div>

          {/* Center: Product Info & Buy Actions */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-8 h-full">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-[#155e3a]/10 text-[#155e3a] border-none text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Đặc sản chọn lọc</Badge>
                  {isOutOfStock ? (
                    <Badge variant="destructive" className="rounded-full gap-1.5 px-4"><XCircle className="w-3 h-3"/> Hết hàng</Badge>
                  ) : (
                    <Badge className="bg-[#155e3a] text-white hover:bg-[#0f4a2b] rounded-full gap-1.5 px-4 border-none shadow-sm"><CheckCircle2 className="w-3 h-3"/> Còn hàng</Badge>
                  )}
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.1] sm:leading-tight">{product.name}</h1>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1.5 rounded-xl">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < getStarCount(product) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-sm font-black text-yellow-700">{avgRating || '4.8'}</span>
                  </div>
                  <Separator orientation="vertical" className="h-5" />
                  <span className="text-sm text-slate-400 font-medium">{reviewCount} lượt đánh giá</span>
                  <Separator orientation="vertical" className="h-5" />
                  <span className="text-sm text-slate-400 font-medium">99+ đã bán</span>
                </div>
              </div>

              <div className="flex items-baseline gap-5 bg-slate-50 p-8 rounded-[2rem] border border-slate-100/50">
                <span className="text-[2.5rem] font-black text-[#155e3a] leading-none tracking-tighter">
                  {price.toLocaleString('vi-VN')} ₫
                </span>
                {originalPrice > price && (
                  <span className="text-xl text-slate-400 line-through font-bold decoration-2">
                    {originalPrice.toLocaleString('vi-VN')} ₫
                  </span>
                )}
                {originalPrice > price && (
                  <Badge className="bg-orange-500 text-white border-none rounded-lg px-2 h-7 font-black ml-2 animate-bounce-slow">
                    -{Math.round((1 - price/originalPrice) * 100)}%
                  </Badge>
                )}
              </div>

              {/* Variant Picker */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                   <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                      LỰA CHỌN PHIÊN BẢN
                   </h4>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {product.variants.map((variant) => {
                        const out = variant.stock <= 0;
                        const active = selectedVariant?.id === variant.id;
                        return (
                          <Button
                            key={variant.id}
                            variant="outline"
                            disabled={out}
                            onClick={() => setSelectedVariant(variant)}
                            className={`h-auto flex flex-col items-start gap-1 p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                              active ? 'text-[#155e3a] text-[#155e3a]/5 text-[#155e3a]' : 'border-slate-100 hover:text-[#155e3a]/50 bg-white'
                            }`}
                          >
                             <span className="font-bold text-sm block">{variant.name}</span>
                             <span className={`text-[11px] font-black tracking-tighter ${active ? 'text-[#155e3a]' : 'text-orange-500'}`}>
                                {variant.price_sale.toLocaleString('vi-VN')} ₫
                             </span>
                             {active && (
                                <div className="absolute top-1 right-1 text-[#155e3a] text-white rounded-full p-0.5 shadow-lg animate-in zoom-in">
                                   <CheckCircle2 className="w-3 h-3" />
                                </div>
                             )}
                          </Button>
                        );
                      })}
                   </div>
                   {selectedVariant && (
                      <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 px-1 uppercase tracking-tight">
                         <Box className="w-3 h-3" />
                         Tồn kho còn lại: <span className={selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'}>{selectedVariant.stock}</span> {selectedVariant.unit}
                      </p>
                   )}
                </div>
              )}

              {/* Quantity & Buy */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 mt-auto">
                <div className="flex items-center bg-slate-100 rounded-2xl p-1.5 border border-slate-200/50 w-full sm:w-auto self-stretch sm:self-auto shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl hover:bg-white text-slate-600"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-14 text-center text-lg font-black text-slate-900 leading-none">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl hover:bg-white text-slate-600"
                    onClick={() => {
                      if (selectedVariant && quantity < selectedVariant.stock) setQuantity(quantity + 1);
                    }}
                    disabled={isOutOfStock || (selectedVariant && quantity >= selectedVariant.stock)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addingToCart || isOutOfStock}
                  className="flex-1 rounded-2xl h-14 font-black text-lg gap-2 shadow-2xl shadow-[#155e3a]/40 hover:scale-[1.05] active:scale-95 transition-all w-full sm:w-auto bg-[#155e3a] text-white hover:bg-[#0f4a2b]"
                >
                  {addingToCart ? 'Đang thêm...' : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-1" />
                      THÊM VÀO GIỎ HÀNG
                    </>
                  )}
                </Button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-8 border-t border-slate-100">
                {[
                  { icon: Truck, label: 'Giao hỏa tốc', sub: 'Nội thành HN' },
                  { icon: ShieldCheck, label: 'Cam kết sạch', sub: 'Chứng nhận 100%' },
                  { icon: History, label: 'Đổi trả 24h', sub: 'Hỗ trợ tận tâm' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center group cursor-default">
                    <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center mb-3 group-hover:bg-[#155e3a] transition-all duration-300 border border-slate-100 group-hover:border-[#155e3a]">
                      <item.icon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[11px] font-black text-slate-800 mb-0.5">{item.label}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Product Details & Reviews Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 mt-20"
      >
        <Tabs defaultValue="description" orientation="vertical" className="w-full">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Left Sidebar: Tabs Triggers */}
            <div className="w-full lg:w-80 shrink-0">
               <TabsList className="bg-white p-2 rounded-[2.5rem] flex flex-col items-stretch gap-2 h-auto shadow-2xl shadow-slate-200/50 border border-slate-100/50">
                 <TabsTrigger value="description" className="rounded-2xl px-6 h-14 font-black text-sm justify-start gap-4 transition-all data-[state=active]:bg-[#155e3a]/5 data-[state=active]:text-[#155e3a] data-[state=active]:shadow-none hover:bg-slate-50 border-2 border-transparent data-[state=active]:border-[#155e3a]/20">
                   <div className="w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                   </div>
                   MÔ TẢ SẢN PHẨM
                 </TabsTrigger>
                 <TabsTrigger value="reviews" className="rounded-2xl px-6 h-14 font-black text-sm justify-start gap-4 transition-all data-[state=active]:bg-[#155e3a]/5 data-[state=active]:text-[#155e3a] data-[state=active]:shadow-none hover:bg-slate-50 border-2 border-transparent data-[state=active]:border-[#155e3a]/20">
                   <div className="w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4" />
                   </div>
                   ĐÁNH GIÁ ({reviewCount})
                 </TabsTrigger>
                 <TabsTrigger value="policy" className="rounded-2xl px-6 h-14 font-black text-sm justify-start gap-4 transition-all data-[state=active]:bg-[#155e3a]/5 data-[state=active]:text-[#155e3a] data-[state=active]:shadow-none hover:bg-slate-50 border-2 border-transparent data-[state=active]:border-[#155e3a]/20">
                   <div className="w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                   </div>
                   CHÍNH SÁCH VẬN CHUYỂN
                 </TabsTrigger>
               </TabsList>

               <div className="mt-8 p-8 bg-gradient-to-br from-[#155e3a] to-green-900 rounded-[2.5rem] text-white shadow-2xl shadow-[#155e3a]/20 relative overflow-hidden group hidden lg:block">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-all"></div>
                  <p className="text-sm font-medium italic relative z-10 leading-relaxed opacity-90">
                    "Bếp Sạch Việt luôn nỗ lực mang đến chất lượng tuyệt đối cho từng bữa ăn của gia đình bạn."
                  </p>
                  <div className="mt-4 flex items-center gap-2 relative z-10">
                     <div className="w-6 h-0.5 bg-white/30 rounded-full"></div>
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Sứ mệnh của chúng tôi</span>
                  </div>
               </div>
            </div>

            {/* Right Side: Content Card */}
            <Card className="flex-1 rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white min-w-0 self-stretch lg:self-auto">
              <CardContent className="p-12">
                <TabsContent value="description" className="m-0 focus-visible:ring-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                     <div className="lg:col-span-2 space-y-10">
                        <section>
                          <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                             <span className="w-8 h-8 rounded-xl text-[#155e3a]/10 flex items-center justify-center"><BookOpen className="w-4 h-4 text-[#155e3a]" /></span>
                             CHI TIẾT SẢN PHẨM
                          </h3>
                          <div 
                            className="text-slate-600 text-lg leading-relaxed markdown-content prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                          />
                        </section>
                     </div>

                     <div className="space-y-8">
                        <Card className="rounded-[2rem] border-none bg-slate-50 p-8">
                           <h4 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-3">
                              <Info className="w-4 h-4 text-[#155e3a]" />
                              Thông số kỹ thuật
                           </h4>
                           <ul className="space-y-4">
                              {[
                                { label: 'Xuất xứ', value: product.origin || 'Việt Nam' },
                                { label: 'Hạn dùng', value: product.expiry_date || 'In trên bao bì' },
                                { label: 'Đóng gói', value: selectedVariant?.unit || 'Túi/Hộp' },
                                { label: 'Bảo quản', value: 'Ngăn mát/Đông' }
                              ].map((spec, i) => (
                                <li key={i} className="flex flex-col gap-1 border-b border-slate-200 pb-3 last:border-0">
                                   <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{spec.label}</span>
                                   <span className="text-sm font-bold text-slate-800">{spec.value}</span>
                                </li>
                              ))}
                           </ul>
                        </Card>
                        
                        <div className="bg-gradient-to-br text-[#155e3a]/10 to-orange-500/5 p-8 rounded-[2rem] border text-[#155e3a]/10">
                           <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                              "Bếp Sạch Việt luôn nỗ lực mang đến chất lượng tuyệt đối cho từng bữa ăn của gia đình bạn."
                           </p>
                        </div>
                     </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="m-0 focus-visible:ring-0">
                   {/* Review content implementation... */}
                   {/* I will keep the review logic but wrap in new design */}
                   <div className="space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
                         <div className="text-center md:border-r border-slate-200">
                            <span className="text-6xl font-black text-slate-900">{avgRating ? avgRating.toFixed(1) : '0.0'}</span>
                            <div className="flex justify-center text-yellow-500 my-3">
                               {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? 'fill-current text-yellow-400' : 'text-slate-300'}`} />)}
                            </div>
                            <span className="text-sm font-bold text-slate-500">{reviewCount} lượt đánh giá khách quan</span>
                         </div>
                         
                         <div className="md:col-span-3 flex flex-col justify-center gap-4">
                            {[5,4,3,2,1].map((star, idx) => (
                               <div key={star} className="flex items-center gap-6">
                                  <span className="w-12 text-sm font-black text-slate-800">{star} Sao</span>
                                  <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                                     <div className="bg-yellow-400 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${ratingPercents[idx]}%` }} />
                                  </div>
                                  <span className="w-24 text-xs font-bold text-slate-400">{ratingPercents[idx]}% ({ratingCounts[idx]})</span>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="flex flex-col lg:flex-row gap-16">
                         <div className="flex-1 space-y-10">
                            <h3 className="text-2xl font-black text-slate-900">Chia sẻ từ khách hàng</h3>
                            {reviewCount === 0 ? (
                               <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                  <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                  <p className="text-slate-400 font-bold">Chưa có đánh giá nào cho sản phẩm này.</p>
                               </div>
                            ) : (
                               <div className="space-y-6">
                                  {reviews.map((rv, i) => (
                                    <Card key={i} className="p-8 rounded-[2rem] border-none bg-slate-50/80 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                       <div className="flex justify-between items-start mb-4">
                                          <div className="flex items-center gap-4">
                                             <div className="w-12 h-12 rounded-2xl text-[#155e3a]/10 flex items-center justify-center font-black text-[#155e3a] text-xl">
                                                {(rv.user_name || rv.name || 'U').charAt(0).toUpperCase()}
                                             </div>
                                             <div>
                                                <h5 className="font-black text-slate-900 leading-none mb-1.5">{rv.user_name || rv.name || 'Người dùng'}</h5>
                                                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{formatDateTime(rv.created_at)}</span>
                                             </div>
                                          </div>
                                          <div className="flex text-yellow-400">
                                             {[...Array(5)].map((_, j) => <Star key={j} className={`w-3 h-3 sm:w-4 sm:h-4 ${j < (rv.rating || 0) ? 'fill-current' : 'text-slate-200'}`} />)}
                                          </div>
                                       </div>
                                       <Separator className="bg-slate-200/50 mb-5" />
                                       <p className="text-slate-600 text-base leading-relaxed font-medium italic group-hover:text-slate-800 transition-colors">"{rv.comment}"</p>
                                    </Card>
                                  ))}
                               </div>
                            )}
                         </div>

                         <div className="lg:w-1/3 space-y-8">
                            <div className="p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                               <div className="absolute top-0 right-0 w-32 h-32 text-[#155e3a]/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:text-[#155e3a]/20 transition-all duration-500"></div>
                               <h4 className="text-xl font-black mb-4 relative z-10">Đánh giá sản phẩm</h4>
                               <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium relative z-10">
                                  Chia sẻ trải nghiệm của bạn để giúp cộng đồng bếp chọn được món ngon nhất.
                               </p>
                               
                               {!canReview ? (
                                  <div className="bg-white/10 p-5 rounded-2xl text-[13px] font-bold text-slate-200 border border-white/10 backdrop-blur-md">
                                     <Info className="w-4 h-4 mb-2 text-[#155e3a]" />
                                     Vui lòng đăng nhập và mua hàng để thực hiện đánh giá.
                                  </div>
                               ) : (
                                  <form onSubmit={handleSubmitReview} className="space-y-6 relative z-10">
                                     <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Mức độ hài lòng</label>
                                        <div className="flex gap-2">
                                           {[1,2,3,4,5].map((s) => (
                                              <Button 
                                                 key={s} 
                                                 type="button" 
                                                 variant="ghost" 
                                                 size="icon" 
                                                 onClick={() => setReviewRating(s)}
                                                 className={`w-10 h-10 rounded-xl transition-all ${reviewRating >= s ? 'bg-yellow-400 text-slate-900 scale-110 shadow-lg shadow-yellow-400/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                                              >
                                                 <Star className={`w-5 h-5 ${reviewRating >= s ? 'fill-current' : ''}`} />
                                              </Button>
                                           ))}
                                        </div>
                                     </div>
                                     <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Bình luận của bạn</label>
                                        <textarea 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[#155e3a] focus:ring-4 focus:ring-[#155e3a]/10 transition-all min-h-[120px]"
                                            placeholder="Hãy mô tả chi tiết vị ngon nhé..."
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                         />
                                      </div>
                                      <Button className="w-full h-14 rounded-2xl font-black text-[#155e3a] bg-white hover:bg-slate-50 shadow-xl shadow-[#155e3a]/20 hover:scale-[1.02] active:scale-95 transition-all">
                                         GỬI ĐÁNH GIÁ
                                      </Button>
                                  </form>
                               )}
                            </div>
                         </div>
                      </div>
                   </div>
                </TabsContent>

                <TabsContent value="policy" className="m-0 focus-visible:ring-0">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      {/* Cột 1: Vận chuyển hỏa tốc */}
                      <div className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-xl transition-all duration-300">
                         <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform">
                            <Truck className="w-8 h-8 text-blue-600" />
                         </div>
                         <h4 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">VẬN CHUYỂN HỎA TỐC</h4>
                         <p className="text-slate-600 font-medium leading-relaxed text-sm italic">Giao hàng cực nhanh trong 2h-4h tại nội thành Hà Nội. Đảm bảo thực phẩm luôn giữ được độ tươi ngon nhất.</p>
                      </div>

                      {/* Cột 2: Kiểm tra hàng */}
                      <div className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-xl transition-all duration-300">
                         <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-6 shadow-lg shadow-green-500/10 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                         </div>
                         <h4 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">KIỂM TRA HÀNG THOẢI MÁI</h4>
                         <p className="text-slate-600 font-medium leading-relaxed text-sm italic">Bạn hoàn toàn có thể kiểm tra chất lượng sản phẩm trước khi thanh toán. Không ưng ý có thể trả lại ngay tại chỗ.</p>
                      </div>

                      {/* Cột 3: Bảng phí vận chuyển */}
                      <Card className="rounded-[2rem] border border-slate-200 bg-white p-8 relative overflow-hidden group shadow-lg shadow-slate-200/50">
                         <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#155e3a]/5 rounded-full blur-3xl group-hover:bg-[#155e3a]/10 transition-colors"></div>
                         <h4 className="text-xl font-black mb-8 relative z-10 flex items-center gap-2 text-slate-900 uppercase tracking-tighter">
                            <span className="w-1.5 h-6 bg-[#155e3a] rounded-full"></span>
                            BẢNG PHÍ GIAO HÀNG
                         </h4>
                         <ul className="space-y-5 relative z-10">
                           <li className="flex justify-between items-center pb-4 border-b border-slate-50">
                              <span className="text-slate-500 font-bold text-sm tracking-tight">Dưới 5km:</span>
                              <span className="font-black text-[#155e3a] text-lg bg-[#155e3a]/10 px-3 py-1 rounded-lg">FREESHIP</span>
                           </li>
                           <li className="flex justify-between items-center pb-4 border-b border-slate-50">
                              <span className="text-slate-500 font-bold text-sm tracking-tight">Từ 5km - 10km:</span>
                              <span className="font-black text-slate-900 text-lg whitespace-nowrap">20.000 ₫</span>
                           </li>
                           <li className="flex justify-between items-center">
                              <span className="text-slate-500 font-bold text-sm tracking-tight">Đơn trên 500k:</span>
                              <span className="font-black text-[#155e3a] text-lg bg-[#155e3a]/10 px-3 py-1 rounded-lg">FREESHIP</span>
                           </li>
                         </ul>
                      </Card>
                   </div>
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </motion.div>


      {/* Related Products Section */}
      <div className="bg-white border-t py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">SẢN PHẨM TƯƠNG TỰ</h2>
              <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">Có thể bạn cũng sẽ thích những món này</p>
            </div>
            <Button variant="outline" className="rounded-full border-2 font-bold px-8" onClick={() => navigate('/products')}>XEM TẤT CẢ</Button>
          </div>
          
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.slice(0, 4).map(prod => {
                const prodPrice = prod.variants && prod.variants.length > 0
                  ? prod.variants[0].price_sale
                  : 0;
                return (
                  <Card
                    key={prod.id}
                    onClick={() => navigate(`/product/${prod.id}`)}
                    className="group cursor-pointer border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="aspect-square bg-slate-100 relative overflow-hidden">
                      {prod.avatar ? (
                        <img
                          src={prod.avatar}
                          alt={prod.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                      )}
                      
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                         <Button size="icon" variant="secondary" className="rounded-xl shadow-xl">
                            <ShoppingCart className="w-4 h-4 text-[#155e3a]" />
                         </Button>
                      </div>
                    </div>

                    <CardContent className="p-6 text-center space-y-3">
                      <h4 className="font-black text-slate-800 line-clamp-1 group-hover:text-white transition-colors uppercase tracking-tight">
                        {prod.name}
                      </h4>

                      <div className="flex justify-center text-yellow-500">
                         {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < getStarCount(prod) ? 'fill-current' : 'text-slate-200'}`} />)}
                      </div>

                      <div className="text-xl font-black text-[#155e3a]">
                        {prodPrice.toLocaleString('vi-VN')} ₫
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">Không có sản phẩm tương tự</p>
            </div>
          )}
        </div>
      </div>


      {/* Add to Cart Modal */}
      {showModal && (
        <AddToCartModal
          product={product}
          quantity={quantity}
          price={price}
          image={mainImage}
          variantName={selectedVariant?.name}
          onClose={() => setShowModal(false)}
          onViewCart={() => {
            setShowModal(false);
            navigate('/cart');
          }}
          onCheckout={() => {
            setShowModal(false);
            navigate('/checkout');
          }}
        />
      )}
      
      <style>{`
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
          font-weight: 900;
          margin: 2.5rem 0 1.25rem 0;
          color: #0f172a;
          line-height: 1.2;
        }
        .markdown-content h1 { font-size: 2.25rem; border-bottom: 6px solid #22c55e; padding-bottom: 12px; width: fit-content; }
        .markdown-content h2 { font-size: 1.875rem; }
        .markdown-content h3 { font-size: 1.5rem; }
        .markdown-content p { margin: 1.25rem 0; line-height: 1.8; color: #475569; font-weight: 500; }
        .markdown-content strong { font-weight: 900; color: #1e293b; }
        .markdown-content ul, .markdown-content ol { padding-left: 1.5rem; margin: 1.5rem 0; }
        .markdown-content li { margin: 0.75rem 0; color: #475569; font-weight: 500; }
        .markdown-content li::marker { color: #22c55e; font-weight: 900; }
        .markdown-content img { border-radius: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.05); margin: 2rem 0; border: 8px solid #f8fafc; }
        .markdown-content blockquote { border-left: 6px solid #22c55e; padding: 1.5rem 2rem; background: #f8fafc; border-radius: 0 1.5rem 1.5rem 0; font-style: italic; color: #64748b; margin: 2rem 0; }
      `}</style>
    </div>
  );
}

