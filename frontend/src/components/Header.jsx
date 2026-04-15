
import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, Phone, MapPin, ChevronDown, User, LogOut, Package, Store, Menu, X, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import logoImg from '../assets/logo_7.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories');
        const data = await res.json();
        setCategories(data.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/product?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'TRANG CHỦ', path: '/home' },
    { name: 'SẢN PHẨM', path: '/product', hasDropdown: true },
    { name: 'TIN TỨC', path: '/blog' },
    { name: 'GIỚI THIỆU', path: '/about' },
    { name: 'LIÊN HỆ', path: '/contact' },
  ];

  return (
    <>
      {/* Premium Top Bar */}
      <div className="bg-green-950 text-white py-2.5 px-6 hidden lg:block border-b border-white/10 relative z-[60]">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between font-bold text-[11px] tracking-[0.15em] uppercase">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 hover:text-green-400 transition-colors cursor-default">
              <Phone className="w-3.5 h-3.5 text-green-400" />
              <span>Hotline: 0868 839 655</span>
            </div>
            <div className="flex items-center gap-2 hover:text-green-400 transition-colors cursor-default">
              <MapPin className="w-3.5 h-3.5 text-green-400" />
              <span>91 Tam Khương, Đống Đa, Hà Nội</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 border-r border-white/20 pr-8">
               <span className="text-white">Kết nối với chúng tôi:</span>
               <div className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-white/10 hover:bg-green-400/20 hover:text-green-400 transition-all flex items-center justify-center cursor-pointer">f</div>
                  <div className="w-5 h-5 rounded bg-white/10 hover:bg-green-400/20 hover:text-green-400 transition-all flex items-center justify-center cursor-pointer">z</div>
               </div>
            </div>
            <button onClick={() => navigate('/distributor')} className="text-green-400 hover:text-green-300 flex items-center gap-2 group transition-all">
                Tuyển đại lý <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Main Header */}
      <header className={`sticky top-0 w-full transition-all duration-500 z-50 ${
        scrolled ? 'bg-[#0f4a2b]/95 backdrop-blur-xl shadow-2xl py-3' : 'bg-[#155e3a] py-6'
      }`}>
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 flex items-center justify-between">
          
          {/* Mobile Menu Trigger */}
          <div className="lg:hidden">
            <Sheet>
               <SheetTrigger asChild>
                 <Button variant="ghost" size="icon" className="rounded-2xl text-white hover:bg-white/20 hover:text-white">
                    <Menu className="w-6 h-6" />
                 </Button>
               </SheetTrigger>
               <SheetContent side="left" className="w-[300px] rounded-r-[3rem] p-0 border-none">
                  <SheetHeader className="p-8 bg-slate-50 border-b">
                     <SheetTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                           <Store className="w-6 h-6 text-white" />
                        </div>
                        BẾP SẠCH
                     </SheetTitle>
                  </SheetHeader>
                  <div className="p-6 space-y-4">
                     {navLinks.map(link => (
                        <button 
                           key={link.path}
                           onClick={() => { navigate(link.path); }}
                           className="w-full text-left p-4 rounded-2xl hover:bg-primary/5 hover:text-primary font-black text-sm uppercase tracking-widest transition-all flex items-center justify-between group"
                        >
                           {link.name}
                           <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </button>
                     ))}
                  </div>
               </SheetContent>
            </Sheet>
          </div>

          {/* Logo Section */}
          <div className="flex items-center gap-4 cursor-pointer group shrink-0" onClick={() => navigate('/home')}>
             <div className="relative">
                <div className="absolute -inset-2 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                <img src={logoImg} alt="Logo" className="h-12 w-auto object-contain relative z-10 transition-transform duration-500 group-hover:scale-110" />
             </div>
             <div className="hidden sm:flex flex-col">
                <span className="text-xl font-black text-white leading-none tracking-tight">BEPSACHVIET</span>
                <span className="text-[9px] font-black text-green-200 uppercase tracking-[0.2em] mt-1">Hương vị quê hương</span>
             </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 bg-black/10 p-1.5 rounded-[2rem] border border-white/10 relative">
             {navLinks.map(link => {
               const isActive = location.pathname.startsWith(link.path) || (link.path === '/home' && location.pathname === '/');
               return (
               <div key={link.path} className="relative">
                  <button
                    onClick={() => navigate(link.path)}
                    onMouseEnter={() => link.hasDropdown && setShowProductMenu(true)}
                    className={`px-6 py-2.5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                      isActive ? 'bg-white text-[#155e3a] shadow-xl' : 'text-white hover:text-white hover:bg-white/20'
                    }`}
                  >
                    {link.name}
                    {link.hasDropdown && <ChevronDown className={`w-4 h-4 transition-transform ${showProductMenu ? 'rotate-180' : ''}`} />}
                  </button>
                  
                  {link.hasDropdown && showProductMenu && (
                     <div 
                        onMouseEnter={() => setShowProductMenu(true)}
                        onMouseLeave={() => setShowProductMenu(false)}
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-4 duration-300 z-[100]"
                      >
                        <div className="grid gap-2">
                           {categories.map(cat => (
                             <button
                               key={cat.id}
                               onClick={() => { navigate(`/product?category=${cat.id}`); setShowProductMenu(false); }}
                               className="w-full text-left p-4 rounded-xl hover:bg-primary/5 text-slate-900 hover:text-primary transition-all font-bold text-sm flex items-center justify-between group"
                             >
                               {cat.name}
                               <div className="w-2 h-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform"></div>
                             </button>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
               );
             })}
          </nav>

          {/* Actions Section */}
          <div className="flex items-center gap-3 lg:gap-6">
            {/* Search - Desktop */}
            <div className="hidden xl:flex items-center relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
               <Input 
                 placeholder="Tìm món ngon..." 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSearch()}
                 className="w-48 xl:w-64 h-12 rounded-2xl border-none bg-white text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-white/50 font-bold text-sm shadow-inner pl-11 focus:w-80 transition-all duration-500 relative" 
               />
            </div>

            <div className="flex items-center gap-2">
               <Button 
                 onClick={() => navigate('/cart')} 
                 variant="ghost" 
                 size="icon" 
                 className="h-12 w-12 rounded-2xl bg-white shadow-xl text-primary hover:bg-slate-50 relative group hover:scale-110 active:scale-95 transition-all"
               >
                 <ShoppingBag className="w-5 h-5 group-hover:animate-bounce-slow" />
                 {cartItemCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">{cartItemCount}</span>
                 )}
               </Button>
               
               <Separator orientation="vertical" className="h-10 mx-1 hidden lg:block bg-white/20" />

               {!user ? (
                 <Button onClick={() => navigate('/auth/login')} variant="outline" className="h-12 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest px-6 shadow-sm transition-all">
                    Đăng nhập
                 </Button>
               ) : (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <div className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-all">
                          <Avatar className="w-12 h-12 border-2 border-white/20 shadow-xl group-hover:border-white transition-all bg-white/10">
                             <AvatarImage src={user.avatar} />
                             <AvatarFallback className="bg-white text-primary font-black">{(user.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="hidden xl:flex flex-col text-left">
                             <span className="text-xs font-black text-white leading-none">{user.name}</span>
                             <span className="text-[10px] font-bold text-green-200 uppercase mt-1">Khách hàng</span>
                          </div>
                       </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-68 rounded-[2.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 bg-white z-[100]">
                       <DropdownMenuItem onClick={() => navigate('/account')} className="rounded-xl p-4 cursor-pointer font-bold gap-3 text-slate-700 focus:bg-[#155e3a]/5 focus:text-[#155e3a]">
                          <User className="w-5 h-5" /> Thông tin cá nhân
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => navigate('/account/orders')} className="rounded-xl p-4 cursor-pointer font-bold gap-3 text-slate-700 focus:bg-[#155e3a]/5 focus:text-[#155e3a]">
                          <Package className="w-5 h-5" /> Lịch sử đơn hàng
                       </DropdownMenuItem>
                       <DropdownMenuSeparator className="my-2 bg-slate-50" />
                       <DropdownMenuItem onClick={logout} className="rounded-xl p-4 cursor-pointer font-bold gap-3 text-red-600 focus:bg-red-50 focus:text-red-600">
                          <LogOut className="w-5 h-5" /> Đăng xuất
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
               )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}