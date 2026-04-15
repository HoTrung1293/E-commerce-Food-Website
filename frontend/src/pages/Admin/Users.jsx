
import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  UserPlus, 
  Clock,
  ExternalLink,
  Shield,
  Search,
  Verified,
  Fingerprint
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/users/getAllUsers', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const j = await res.json();
      setUsers(j.data || []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query) {
    if (!query) { load(); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/users/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ query })
      });
      const j = await res.json().catch(() => null);
      if (res.ok && j && j.success) {
        setUsers(j.data || []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing({
      id: null,
      name: '',
      email: '',
      password: '',
      phone: ''
    });
  }

  function closeEdit() {
    setEditing(null);
    setSaving(false);
  }

  function onFieldChange(field, value) {
    setEditing(prev => ({ ...prev, [field]: value }));
  }

  async function onSave() {
    if (!editing) return;
    if (!editing.name || !editing.email || !editing.password) {
      alert('Vui lòng điền đầy đủ: Tên, Email, Mật khẩu');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/users/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: editing.name,
          email: editing.email,
          password: editing.password,
          phone: editing.phone || null
        })
      });
      const j = await res.json();
      if (!res.ok || !j.success) {
        throw new Error(j?.message || 'Tạo người dùng thất bại');
      }
      await load();
      closeEdit();
    } catch (err) {
      alert('Lưu thất bại: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  // Sidebar sync
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(localStorage.getItem('admin.sidebar.collapsed') === '1');

  return (
    <div 
      className="admin-root min-h-screen bg-slate-50/50"
      style={{ 
        display: 'grid', 
        gridTemplateColumns: isSidebarCollapsed ? '80px 1fr' : '280px 1fr',
        transition: 'grid-template-columns 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
      }}
    >
      <AdminSidebar onToggle={setIsSidebarCollapsed} />
      <main className="admin-main flex flex-col min-w-0">
        <AdminHeader title="Cơ sở dữ liệu người dùng" onSearch={handleSearch} onCreate={openCreate} />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="p-8"
        >
           <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="text-left bg-slate-50/50">
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20 text-center">ID</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh tính người dùng</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Kênh liên lạc</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Bảo mật</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-40">Gia nhập</th>
                      </tr>
                   </thead>
                   <motion.tbody
                    variants={{
                      animate: { transition: { staggerChildren: 0.05 } }
                    }}
                    initial="initial"
                    animate="animate"
                   >
                      {loading ? (
                         <tr><td colSpan="5" className="px-8 py-20 text-center text-[#155e3a] font-black uppercase tracking-widest text-xs animate-pulse">Truy xuất dữ liệu nhân khẩu...</td></tr>
                      ) : users.length === 0 ? (
                         <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Mạng lưới người dùng chưa có dữ liệu</td></tr>
                      ) : (
                         users.map((u, idx) => (
                           <motion.tr 
                             variants={{
                               initial: { opacity: 0, y: 10 },
                               animate: { opacity: 1, y: 0 }
                             }}
                             key={u.id} 
                             className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors group"
                            >
                             <td className="px-8 py-6 text-center">
                                <span className="font-black text-slate-400 text-xs tracking-tighter">#{u.id}</span>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-5">
                                   <div className="relative group/avatar">
                                      <Avatar className="h-14 w-14 rounded-2xl border-4 border-white shadow-xl font-black ring-1 ring-slate-100 group-hover:scale-110 transition-all duration-500">
                                         <AvatarImage src={u.avatar} className="object-cover" />
                                         <AvatarFallback className="bg-emerald-50 text-[#155e3a] text-lg font-black uppercase">
                                           {(u.name || 'U').charAt(0)}
                                         </AvatarFallback>
                                      </Avatar>
                                      {u.email_verified && (
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-lg">
                                           <Verified className="w-4 h-4 text-emerald-600" />
                                        </div>
                                      )}
                                   </div>
                                   <div>
                                      <div className="font-black text-slate-900 text-base leading-none mb-2 uppercase tracking-tight group-hover:text-[#155e3a] transition-colors">{u.name}</div>
                                      <div className="flex items-center gap-2">
                                         <Badge className="h-5 px-2 rounded-lg bg-[#0a2e1f] text-[#34d399] border-none font-black text-[8px] uppercase tracking-widest py-0">Gold Member</Badge>
                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Role: Customer</span>
                                      </div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <div className="inline-flex flex-col items-start gap-1.5">
                                   <div className="flex items-center gap-2 text-xs font-black text-slate-600">
                                      <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                                         <Mail className="w-3.5 h-3.5" />
                                      </div>
                                      {u.email}
                                   </div>
                                   <div className="flex items-center gap-2 text-xs font-black text-slate-600">
                                      <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                                         <Phone className="w-3.5 h-3.5" />
                                      </div>
                                      {u.phone || 'N/A Protocol'}
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <Badge className={`rounded-xl border-none font-black px-4 h-8 tracking-widest text-[9px] shadow-sm flex items-center gap-2 mx-auto w-fit uppercase ${u.email_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                   <Shield className={`w-4 h-4 ${u.email_verified ? 'text-emerald-500' : 'text-rose-500'}`} />
                                   {u.email_verified ? 'Verified' : 'Unverified'}
                                </Badge>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-3 text-slate-900">
                                   <div className="flex flex-col items-end">
                                      <span className="text-[11px] font-black tracking-tighter italic">{u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown'}</span>
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Node Creation</span>
                                   </div>
                                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#155e3a]/10 group-hover:text-[#155e3a] transition-all">
                                      <Calendar className="w-5 h-5" />
                                   </div>
                                </div>
                             </td>
                           </motion.tr>
                         ))
                      )}
                   </motion.tbody>
                </table>
             </div>
           </Card>
        </motion.div>

        {/* Create Modal */}
        <Dialog open={!!editing} onOpenChange={(open) => !open && closeEdit()}>
          <DialogContent className="max-w-md rounded-[3.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
            <DialogHeader className="p-10 bg-[#0a2e1f] text-white">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#155e3a] text-white flex items-center justify-center shadow-xl shadow-[#155e3a]/40 border border-white/10 group">
                     <UserPlus className="w-7 h-7 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-black uppercase tracking-tighter">Kiến tạo tài khoản</DialogTitle>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-1">Giao diện đăng ký quản trị</p>
                  </div>
               </div>
            </DialogHeader>

            <div className="p-10 space-y-8 bg-slate-50/30">
               <div className="space-y-5">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2">Đinh danh khách hàng *</Label>
                     <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 opacity-50" />
                        <Input 
                            value={editing?.name} 
                            onChange={e => onFieldChange('name', e.target.value)} 
                            placeholder="Nhập tên khách hàng..."
                            className="h-14 pl-12 rounded-[1.25rem] bg-white border-2 border-white focus-visible:ring-emerald-500/20 font-bold shadow-xl shadow-slate-200/40 text-sm"
                        />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2">Email xác thực *</Label>
                     <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 opacity-50" />
                        <Input 
                            type="email"
                            value={editing?.email} 
                            onChange={e => onFieldChange('email', e.target.value)} 
                            placeholder="email@luxury-brand.com"
                            className="h-14 pl-12 rounded-[1.25rem] bg-white border-2 border-white focus-visible:ring-emerald-500/20 font-bold shadow-xl shadow-slate-200/40 text-sm"
                        />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2">Mã khóa bảo mật (Password) *</Label>
                     <div className="relative">
                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 opacity-50" />
                        <Input 
                            type="password"
                            value={editing?.password} 
                            onChange={e => onFieldChange('password', e.target.value)} 
                            placeholder="Tạo mã bảo mật mạnh"
                            className="h-14 pl-12 rounded-[1.25rem] bg-white border-2 border-white focus-visible:ring-emerald-500/20 font-bold shadow-xl shadow-slate-200/40 text-sm"
                        />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2">Đường dây liên kết (Phone)</Label>
                     <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 opacity-50" />
                        <Input 
                            value={editing?.phone} 
                            onChange={e => onFieldChange('phone', e.target.value)} 
                            placeholder="Nhập số liên hệ..."
                            className="h-14 pl-12 rounded-[1.25rem] bg-white border-2 border-white focus-visible:ring-emerald-500/20 font-bold shadow-xl shadow-slate-200/40 text-sm"
                        />
                     </div>
                  </div>
               </div>
               
               <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex gap-3 items-start">
                  <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-black text-[#155e3a] leading-relaxed tracking-tight uppercase">
                    Người dùng mới sẽ được mặc định cấp đặc quyền <span className="bg-[#155e3a] text-white px-1.5 py-0.5 rounded ml-1">Standard Customer</span> và được phép truy cập hạ tầng thương mại ngay sau khi khởi tạo.
                  </p>
               </div>
            </div>

            <DialogFooter className="p-10 border-t bg-white">
               <div className="grid grid-cols-2 gap-5 w-full">
                  <Button variant="ghost" onClick={closeEdit} className="h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all border-none hover:bg-slate-50">Huỷ bỏ</Button>
                  <Button 
                    onClick={onSave} 
                    disabled={saving}
                    className="h-14 rounded-2xl bg-[#155e3a] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-[#155e3a]/40 hover:scale-[1.02] active:scale-95 transition-all border-none"
                  >
                    {saving ? 'ĐANG KHỞI TẠO...' : 'XÁC NHẬN TẠO'}
                  </Button>
               </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}