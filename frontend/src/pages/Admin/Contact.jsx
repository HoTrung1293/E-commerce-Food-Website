
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';
import { 
  Trash2, 
  Eye, 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  User,
  Calendar,
  Search,
  Inbox,
  Send,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

const AdminContact = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/contact', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Xóa yêu cầu liên hệ này? Thao tác này không thể hoàn tác.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/contact/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        fetchRequests();
        if (selectedRequest) {
          setSelectedRequest({ ...selectedRequest, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
        <AdminHeader title="Hệ thống liên lạc & Hỗ trợ" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="p-8"
        >
           {/* Header & Stats */}
           <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-8">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-[1.5rem] bg-[#0a2e1f] text-[#34d399] flex items-center justify-center shadow-2xl shadow-[#0a2e1f]/30">
                    <Inbox className="w-8 h-8" />
                 </div>
                 <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Phân hệ hòm thư</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                       <ShieldCheck className="w-3.5 h-3.5 text-[#155e3a]" /> Quản trị luồng yêu cầu từ khách hàng ưu tiên
                    </p>
                 </div>
              </div>
              <Card className="bg-white border-none rounded-[2rem] px-10 py-6 flex items-center gap-6 shadow-2xl shadow-slate-200/50 group border-b-4 border-[#155e3a]">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#155e3a] group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Yêu cầu hiện hữu</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{requests.length}</span>
                 </div>
              </Card>
           </div>

           {/* Table */}
           <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="text-left bg-slate-50/50">
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20 text-center">ID</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-96">Định danh gửi tin</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phân nhóm</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng đoạn</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Khởi phát</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
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
                         <tr><td colSpan="6" className="px-8 py-20 text-center text-[#155e3a] font-black uppercase tracking-widest text-xs animate-pulse">Đang định vị tín hiệu hỗ trợ...</td></tr>
                      ) : requests.length === 0 ? (
                         <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Hiện tại chưa có yêu cầu cần xử lý</td></tr>
                      ) : (
                         requests.map((req) => (
                           <motion.tr 
                             variants={{
                               initial: { opacity: 0, y: 10 },
                               animate: { opacity: 1, y: 0 }
                             }}
                             key={req.id} 
                             className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors group"
                            >
                             <td className="px-8 py-6 text-center">
                                <span className="font-black text-slate-400 text-xs tracking-tighter">#{req.id}</span>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-5">
                                   <div className="w-12 h-12 rounded-xl bg-[#155e3a]/5 text-[#155e3a] flex items-center justify-center font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
                                      {(req.name || 'U').charAt(0).toUpperCase()}
                                   </div>
                                   <div className="min-w-0">
                                      <div className="font-black text-slate-900 group-hover:text-[#155e3a] transition-colors text-[13px] uppercase tracking-tight leading-none mb-2">{req.name}</div>
                                      <div className="flex flex-col gap-1">
                                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 lowercase tracking-tight">
                                            <Mail className="w-3 h-3 text-[#155e3a]" /> {req.email}
                                         </div>
                                         {req.phone && (
                                           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 lowercase tracking-tight">
                                              <Phone className="w-3 h-3 text-[#155e3a]" /> {req.phone}
                                           </div>
                                         )}
                                      </div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <Badge variant="outline" className="border-emerald-100 bg-emerald-50 text-[#155e3a] text-[8px] font-black uppercase tracking-widest rounded-lg px-2 h-5">LIÊN HỆ PHÁP NHÂN</Badge>
                             </td>
                             <td className="px-8 py-6 text-center">
                                {req.status === 'resolved' ? (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] h-7 px-4 rounded-xl uppercase tracking-widest shadow-sm flex items-center gap-1.5 mx-auto w-fit">
                                     <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                                  </Badge>
                                ) : (
                                  <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] h-7 px-4 rounded-xl uppercase tracking-widest shadow-sm flex items-center gap-1.5 mx-auto w-fit">
                                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> Pending
                                  </Badge>
                                )}
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex flex-col items-end">
                                   <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter italic">{new Date(req.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Signal Received</span>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-[#155e3a]/10 hover:text-[#155e3a] transition-all">
                                         <MoreVertical className="w-5 h-5" />
                                      </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 shadow-2xl border-none ring-1 ring-slate-100">
                                      <DropdownMenuItem onClick={() => handleOpenModal(req)} className="rounded-xl flex items-center gap-3 p-3 font-black text-[11px] uppercase tracking-widest cursor-pointer hover:bg-[#155e3a]/5 hover:text-[#155e3a]">
                                         <Eye className="w-4 h-4 text-emerald-600" /> Truy xuất chi tiết
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDeleteRequest(req.id)} className="rounded-xl flex items-center gap-3 p-3 font-black text-[11px] uppercase tracking-widest cursor-pointer text-rose-600 focus:text-rose-600 hover:bg-rose-50">
                                         <Trash2 className="w-4 h-4" /> Thanh trừng yêu cầu
                                      </DropdownMenuItem>
                                   </DropdownMenuContent>
                                </DropdownMenu>
                             </td>
                           </motion.tr>
                         ))
                      )}
                   </motion.tbody>
                </table>
             </div>
           </Card>
        </motion.div>

        {/* Request Detail Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl rounded-[4rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
            <DialogHeader className="p-10 bg-[#0a2e1f] text-white">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-[#155e3a] text-white flex items-center justify-center shadow-xl shadow-[#155e3a]/40 border border-white/10">
                     <MessageSquare className="w-8 h-8" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Hồ sơ liên lạc chi tiết</DialogTitle>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-1">Giao thức yêu cầu #{selectedRequest?.id}</p>
                  </div>
               </div>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] bg-slate-50/50">
               <div className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2">Chủ sở hữu thông tín</Label>
                        <div className="h-16 bg-white border-2 border-white rounded-2xl flex items-center px-6 font-black text-slate-900 uppercase text-xs tracking-tight shadow-2xl shadow-slate-200/50">
                           {selectedRequest?.name}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2">Giao điểm phản hồi (Email)</Label>
                        <div className="h-16 bg-white border-2 border-white rounded-2xl flex items-center px-6 font-black text-[#155e3a] text-xs shadow-2xl shadow-slate-200/50">
                           {selectedRequest?.email}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <Inbox className="w-4 h-4 text-[#155e3a]" /> Nội dung thông báo thỉnh cầu
                     </Label>
                     <div className="bg-white rounded-[2.5rem] p-10 font-bold text-slate-600 leading-[1.8] shadow-2xl shadow-slate-200/50 border-2 border-white min-h-[180px] text-sm italic">
                        "{selectedRequest?.message}"
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2">Cập nhật trạng thái thụ lý</Label>
                        <Select
                           value={selectedRequest?.status}
                           onValueChange={(v) => handleUpdateStatus(selectedRequest.id, v)}
                        >
                           <SelectTrigger className="h-16 rounded-2xl bg-[#0a2e1f] border-none text-white font-black uppercase text-[10px] tracking-[0.2em] focus:ring-emerald-500/20 shadow-2xl shadow-[#0a2e1f]/20">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-[1.5rem] shadow-2xl p-2 border-none ring-1 ring-slate-100">
                              <SelectItem value="pending" className="rounded-xl font-black text-[10px] uppercase py-3 tracking-widest cursor-pointer group focus:bg-amber-50 focus:text-amber-600">
                                 Đang chờ thụ lý (Pending)
                              </SelectItem>
                              <SelectItem value="resolved" className="rounded-xl font-black text-[10px] uppercase py-3 tracking-widest cursor-pointer group focus:bg-emerald-50 focus:text-emerald-600">
                                 Đã hoàn tất xử lý (Resolved)
                              </SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="flex flex-col items-end gap-3 px-4 h-16 justify-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Tình trạng thực thi</div>
                        {selectedRequest?.status === 'resolved' ? (
                          <div className="flex items-center gap-3 text-emerald-600 font-black uppercase text-[11px] tracking-widest">
                             <ShieldCheck className="w-5 h-5" /> Secured & Resolved
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-amber-500 font-black uppercase text-[11px] tracking-widest animate-pulse">
                             <AlertCircle className="w-5 h-5" /> Active Awaiting
                          </div>
                        )}
                     </div>
                  </div>
               </div>
            </ScrollArea>

            <DialogFooter className="p-10 border-t bg-white flex justify-between sm:justify-between rounded-b-[4rem]">
               <Button variant="ghost" onClick={() => setShowModal(false)} className="h-14 rounded-2xl px-10 font-black uppercase text-[11px] tracking-widest hover:bg-slate-50 border-none">ĐÓNG HỒ SƠ</Button>
               <Button onClick={() => setShowModal(false)} className="h-16 rounded-[1.5rem] px-14 bg-[#155e3a] text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-[#155e3a]/40 hover:bg-[#0f4a2b] hover:scale-105 active:scale-95 transition-all outline-none border-none flex gap-3">
                  <Send className="w-4 h-4" /> LƯU & XÁC THỰC
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminContact;

