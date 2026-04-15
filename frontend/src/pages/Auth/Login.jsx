import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, LogIn, ChevronLeft, ShieldCheck, Store, UtensilsCrossed } from 'lucide-react';
import logoImg from '../../assets/logo_7.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        const role = result.user.role;
        
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/home');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a2e1f] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#155e3a]/30 rounded-full blur-[140px] -mt-64 -mr-64 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] -mb-64 -ml-64"></div>

        <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3.5rem] overflow-hidden shadow-[0_25px_100px_rgba(0,0,0,0.5)] relative z-10 border border-white/10 animate-in fade-in zoom-in-95 duration-700">
            {/* Left Side: Premium Branding & Illustration */}
            <div className="hidden lg:flex flex-col justify-between p-16 bg-[#155e3a] relative overflow-hidden group">
                {/* Textures and Gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none transform -rotate-12 translate-x-20 translate-y-20">
                    <UtensilsCrossed className="w-[500px] h-[500px] text-white" />
                </div>
                
                <div className="relative z-10">
                   <Link to="/home" className="inline-flex items-center gap-3 text-white group/back mb-16 px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
                      <ChevronLeft className="w-5 h-5 group-hover/back:-translate-x-1 transition-transform" />
                      <span className="font-black text-xs uppercase tracking-[0.2em]">Trang chủ</span>
                   </Link>

                   <div className="space-y-10">
                      <div className="relative">
                         <div className="absolute -inset-4 bg-white/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                         <img src={logoImg} alt="Logo" className="h-24 w-auto object-contain relative z-10 transform group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      
                      <div className="space-y-4">
                        <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter uppercase whitespace-pre-line">
                           Hương Vị Sạch{"\n"}
                           <span className="text-emerald-300 italic">Bếp Việt Nam</span>
                        </h2>
                        <div className="w-20 h-2 bg-emerald-400/30 rounded-full"></div>
                      </div>
                      
                      <p className="text-emerald-100/70 text-lg font-medium max-w-sm leading-relaxed">
                         Nơi tinh hoa ẩm thực quê hương được gìn giữ và lan tỏa qua từng bữa cơm ngon, sạch và an toàn.
                      </p>
                   </div>
                </div>

                <div className="relative z-10 mt-auto pt-10">
                   <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-black/10 backdrop-blur-sm border border-white/5">
                      <div className="flex -space-x-4">
                         {[1,2,3,4].map(i => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-[#155e3a] bg-slate-200 overflow-hidden shadow-xl">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+42}`} alt="User" />
                            </div>
                         ))}
                         <div className="w-12 h-12 rounded-full border-4 border-[#155e3a] bg-emerald-400 flex items-center justify-center text-[#155e3a] font-black text-xs shadow-xl relative z-10">
                            +10k
                         </div>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-white font-black text-sm tracking-tight leading-none">Khách hàng yêu thích</span>
                         <span className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">Tin tưởng & Ủng hộ</span>
                      </div>
                   </div>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="p-8 md:p-20 flex flex-col justify-center bg-white">
                <div className="mb-12 text-center lg:text-left">
                    <div className="lg:hidden flex justify-center mb-10">
                       <div className="bg-[#155e3a] p-4 rounded-3xl shadow-xl">
                          <img src={logoImg} alt="Logo" className="h-16 w-auto object-contain brightness-0 invert" />
                       </div>
                    </div>
                    <span className="inline-block text-[10px] font-black text-[#155e3a] bg-[#155e3a]/5 px-4 py-1.5 rounded-full uppercase tracking-[0.25em] mb-4">Chào mừng trở lại</span>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Đăng nhập tài khoản</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 lg:justify-start justify-center">
                        Hành trình ẩm thực sạch đang chờ bạn
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    </p>
                </div>

                {error && (
                   <div className="mb-8 p-6 rounded-[2rem] bg-red-50 border border-red-100 flex items-start gap-4 text-red-600 animate-in slide-in-from-top-4 duration-500 shadow-sm">
                       <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest">Thông báo lỗi</p>
                          <p className="text-sm font-bold opacity-80">{error}</p>
                       </div>
                   </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-5">Email của bạn</label>
                        <div className="relative group/input">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-[#155e3a] transition-colors" />
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full h-16 bg-slate-50 border-none rounded-2xl pl-16 pr-6 font-bold text-slate-900 placeholder:text-slate-300 focus:ring-[6px] focus:ring-[#155e3a]/5 transition-all outline-none" 
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-5">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mật khẩu bí mật</label>
                           <Link to="/auth/forgot-password" size="sm" className="text-[10px] font-black text-[#155e3a] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Quên mật khẩu?</Link>
                        </div>
                        <div className="relative group/input">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-[#155e3a] transition-colors" />
                            <input 
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-16 bg-slate-50 border-none rounded-2xl pl-16 pr-6 font-bold text-slate-900 placeholder:text-slate-300 focus:ring-[6px] focus:ring-[#155e3a]/5 transition-all outline-none" 
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-16 bg-[#155e3a] text-white rounded-2xl font-black shadow-2xl shadow-[#155e3a]/40 hover:bg-[#0f4a2b] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-70 disabled:scale-100 group/btn"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="uppercase tracking-[0.2em] text-sm">Đăng nhập ngay</span>
                                    <LogIn className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-16 pt-8 border-t border-slate-50 text-center">
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-loose">
                      Chưa là thành viên? <br className="md:hidden" />
                      <Link to="/auth/register" className="text-[#155e3a] font-black hover:underline decoration-2 transition-all p-2 inline-block">Tham gia ngay</Link>
                   </p>
                </div>
            </div>
        </div>
    </div>
  );
}