
import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';
import MarkdownEditor from '../../components/MarkdownEditor';
import { uploadToCloudinary } from '../../services/cloudinary';
import { 
  FileText, 
  Eye, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Upload, 
  CheckCircle2, 
  Clock,
  MoreVertical,
  Plus,
  Type,
  Tag,
  PenTool,
  Send,
  Sparkles
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

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    thumbnail_image: '',
    status: 'draft'
  });
  const thumbnailFileRef = useRef(null);

  const categories = [
    { value: 'general', label: 'Tổng hợp' },
    { value: 'promotion', label: 'Khuyến mãi' },
    { value: 'news', label: 'Tin tức' },
    { value: 'guide', label: 'Hướng dẫn' },
    { value: 'tips', label: 'Mẹo' },
    { value: 'other', label: 'Khác' }
  ];

  const getCategoryLabel = (value) => {
    const category = categories.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blogs/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBlogs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      category: 'general',
      thumbnail_image: '',
      status: 'draft'
    });
    setShowModal(true);
  };

  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title,
      content: blog.content,
      category: blog.category,
      thumbnail_image: blog.thumbnail_image || '',
      status: blog.status
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/blogs/${editingId}` : '/api/blogs/create';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        fetchBlogs();
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchBlogs();
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleUploadThumbnail = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await uploadToCloudinary(file);
        setFormData(prev => ({ ...prev, thumbnail_image: result.secure_url }));
      } catch (error) {
        console.error('Lỗi upload thumbnail:', error);
      }
    }
  };

  const handleInsertThumbnailUrl = () => {
    const url = prompt('Nhập URL ảnh thumbnail:');
    if (url) setFormData(prev => ({ ...prev, thumbnail_image: url }));
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
        <AdminHeader
          title="Tòa soạn & Bài viết"
          onSearch={(q) => setSearchTerm(q)}
          onCreate={handleCreate}
        />

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
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-96">Hồ sơ bài viết</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Danh xưng</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tình thái</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Chỉ số</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Khởi tạo</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Lệnh</th>
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
                         <tr><td colSpan="6" className="px-8 py-20 text-center text-[#155e3a] font-black uppercase tracking-widest text-xs animate-pulse">Đang nạp dữ liệu tòa soạn...</td></tr>
                      ) : filteredBlogs.length === 0 ? (
                         <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Phân hệ bài viết hiện tại đang trống</td></tr>
                      ) : (
                         filteredBlogs.map((blog) => (
                           <motion.tr 
                             variants={{
                               initial: { opacity: 0, y: 10 },
                               animate: { opacity: 1, y: 0 }
                             }}
                             key={blog.id} 
                             className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors group"
                            >
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-5">
                                   <div className="w-24 h-16 rounded-[1.25rem] overflow-hidden border-2 border-white shadow-xl group-hover:scale-105 transition-transform duration-500 shrink-0 relative bg-slate-50">
                                      <img src={blog.thumbnail_image || 'https://placehold.co/200?text=Blog'} className="w-full h-full object-cover" alt="" />
                                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                                   </div>
                                   <div className="min-w-0">
                                      <div className="font-black text-slate-900 group-hover:text-[#155e3a] transition-colors text-[13px] line-clamp-2 leading-tight uppercase tracking-tight">{blog.title}</div>
                                      <div className="flex items-center gap-1.5 mt-2">
                                         <Badge className="h-4 px-1.5 rounded-md bg-[#0a2e1f] text-[#34d399] border-none font-black text-[7px] uppercase tracking-widest">ID: {blog.id}</Badge>
                                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Post Identity</span>
                                      </div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <Badge variant="outline" className="border-emerald-100 text-[#155e3a] font-black text-[9px] px-3 h-7 rounded-xl uppercase tracking-widest bg-emerald-50/30">{getCategoryLabel(blog.category)}</Badge>
                             </td>
                             <td className="px-8 py-6 text-center">
                                {blog.status === 'published' ? (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] px-3 h-7 rounded-xl uppercase tracking-widest shadow-sm flex items-center gap-1.5 mx-auto w-fit">
                                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Published
                                  </Badge>
                                ) : (
                                  <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px] px-3 h-7 rounded-xl uppercase tracking-widest shadow-sm flex items-center gap-1.5 mx-auto w-fit">
                                     <Clock className="w-3 h-3" /> Draft Mode
                                  </Badge>
                                )}
                             </td>
                             <td className="px-8 py-6 text-center">
                                <div className="inline-flex items-center justify-center gap-2 font-black text-[#155e3a] text-xs bg-[#155e3a]/5 h-8 px-3 rounded-xl border border-[#155e3a]/10">
                                   <Eye className="w-4 h-4" /> {blog.view_count || 0}
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex flex-col items-end">
                                   <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter italic">{new Date(blog.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Archival Date</span>
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
                                      <DropdownMenuItem onClick={() => handleEdit(blog)} className="rounded-xl flex items-center gap-3 p-3 font-black text-[11px] uppercase tracking-widest cursor-pointer hover:bg-[#155e3a]/5 hover:text-[#155e3a]">
                                         <Edit3 className="w-4 h-4 text-emerald-600" /> Biên soạn lại
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDelete(blog.id)} className="rounded-xl flex items-center gap-3 p-3 font-black text-[11px] uppercase tracking-widest cursor-pointer text-rose-600 focus:text-rose-600 hover:bg-rose-50">
                                         <Trash2 className="w-4 h-4" /> Đình chỉ bài viết
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

        {/* Blog Editor Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[95vh] flex flex-col p-0 overflow-hidden border-none rounded-[4rem] shadow-2xl bg-white">
             <DialogHeader className="p-8 border-b bg-[#0a2e1f] text-white">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-[#155e3a] text-white flex items-center justify-center font-black shadow-xl shadow-[#155e3a]/40 border border-white/10 group">
                      {editingId ? <PenTool className="w-6 h-6 group-hover:scale-110 transition-transform" /> : <Plus className="w-7 h-7 group-hover:scale-110 transition-transform" />}
                   </div>
                   <div>
                     <DialogTitle className="text-2xl font-black tracking-tighter uppercase">
                       {editingId ? 'Nâng cấp nội dung bài viết' : 'Khởi thảo nội dung truyền thông'}
                     </DialogTitle>
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        Trình soạn thảo Markdown chuyên dụng
                     </p>
                   </div>
                </div>
             </DialogHeader>

             <ScrollArea className="flex-1 p-12 bg-slate-50/50">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
                   {/* Left: Settings */}
                   <div className="lg:col-span-4 space-y-10">
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-[#155e3a]" /> Phóng ảnh bìa (Thumbnail)
                         </Label>
                         <div className="aspect-[4/3] bg-white rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl shadow-slate-200/50 relative group">
                            {formData.thumbnail_image ? (
                               <img src={formData.thumbnail_image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                            ) : (
                               <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 bg-slate-50/50 gap-4">
                                  <ImageIcon className="w-20 h-20 opacity-20" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chưa có dữ liệu hình ảnh</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                               <Button variant="secondary" size="sm" className="rounded-2xl font-black h-12 px-6 bg-white text-slate-900 border-none shadow-xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest" onClick={() => thumbnailFileRef.current?.click()}>
                                  <Upload className="w-4 h-4 mr-2 text-emerald-600" /> TẢI ẢNH LÊN
                               </Button>
                               <Button variant="outline" size="sm" className="rounded-2xl font-black h-12 px-6 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white transition-all text-xs uppercase tracking-widest" onClick={handleInsertThumbnailUrl}>
                                  <LinkIcon className="w-4 h-4 mr-2" /> DÙNG URL NGOÀI
                               </Button>
                               <input ref={thumbnailFileRef} type="file" className="hidden" accept="image/*" onChange={handleUploadThumbnail} />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-8 bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 border-2 border-white">
                         <div className="space-y-4">
                            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] px-2">Pháp danh danh mục</Label>
                            <Select value={formData.category} onValueChange={v => setFormData(p => ({...p, category: v}))}>
                               <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-black text-xs uppercase tracking-widest focus-visible:ring-emerald-500/20">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="rounded-[1.5rem] border-none shadow-2xl p-2">
                                  {categories.map(c => (
                                    <SelectItem key={c.value} value={c.value} className="rounded-xl font-black uppercase tracking-widest text-[10px] py-3 cursor-pointer">{c.label}</SelectItem>
                                  ))}
                               </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-4">
                            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] px-2">Chế độ hiển thị</Label>
                            <Select value={formData.status} onValueChange={v => setFormData(p => ({...p, status: v}))}>
                               <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-black text-xs uppercase tracking-widest focus-visible:ring-emerald-500/20">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="rounded-[1.5rem] border-none shadow-2xl p-2">
                                  <SelectItem value="draft" className="rounded-xl font-black uppercase tracking-widest text-[10px] py-3 cursor-pointer">Bản thảo lưu trữ</SelectItem>
                                  <SelectItem value="published" className="rounded-xl font-black uppercase tracking-widest text-[10px] py-3 cursor-pointer">Truyền thông đại chúng</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                      </div>
                   </div>

                   {/* Right: Content */}
                   <div className="lg:col-span-8 space-y-10">
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] px-2">Danh xưng bài viết (Tiêu đề) *</Label>
                         <Input 
                            value={formData.title} 
                            onChange={e => setFormData(p => ({...p, title: e.target.value}))}
                            placeholder="Tiêu đề gợi mở cảm xúc & tò mò..."
                            className="h-20 rounded-[1.5rem] bg-white border-2 border-white font-black text-2xl tracking-tighter focus-visible:ring-emerald-500/10 shadow-2xl shadow-slate-200/50 px-8 placeholder:text-slate-200"
                         />
                      </div>

                      <div className="space-y-5">
                         <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] px-2 flex items-center gap-3">
                           <Type className="w-5 h-5 text-[#155e3a]" /> Kiến trúc nội dung (Markdown Engine)
                         </Label>
                         <div className="rounded-[3.5rem] border-4 border-white overflow-hidden bg-white shadow-2xl shadow-slate-200/50 min-h-[600px] mb-8">
                            <MarkdownEditor 
                               value={formData.content} 
                               onChange={v => setFormData(p => ({...p, content: v}))}
                               placeholder="Bắt đầu hành trình kể chuyện của bạn tại đây..."
                            />
                         </div>
                      </div>
                   </div>
                </div>
             </ScrollArea>

             <DialogFooter className="p-10 border-t bg-white text-slate-900 flex items-center justify-between sm:justify-between rounded-b-[4rem]">
                <Button variant="ghost" onClick={() => setShowModal(false)} className="rounded-[1.5rem] h-14 px-10 font-black uppercase text-[11px] tracking-widest hover:bg-slate-50 transition-all border-none">ĐÌNH CHỈ THIẾT KẾ</Button>
                <Button onClick={handleSave} className="rounded-[1.5rem] h-16 px-14 font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-[#155e3a]/40 bg-[#155e3a] text-white hover:bg-[#0f4a2b] border-none hover:scale-105 active:scale-95 transition-all flex gap-3">
                   <Send className="w-4 h-4" /> {editingId ? 'XÁC NHẬN NÂNG CẤP' : 'CÔNG BỐ NỘI DUNG'}
                </Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminBlogs;

