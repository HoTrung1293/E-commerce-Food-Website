
import React, { useEffect, useState, useRef } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';
import MarkdownEditor from '../../components/MarkdownEditor';
import { uploadToCloudinary } from '../../services/cloudinary';
import { 
  Package, 
  Trash2, 
  Edit3, 
  Plus, 
  Image as ImageIcon, 
  Globe, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  ChevronRight,
  Upload,
  Link as LinkIcon,
  Box,
  Tag,
  Store,
  ArrowRight
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // edit modal state
  const [editing, setEditing] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [addingImages, setAddingImages] = useState(false);
  const imagesInputRef = useRef(null);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => { 
    loadCategories();
    loadSuppliers();
    load(); 
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch('/api/categories/');
      const j = await res.json();
      if (j.success && j.data) {
        setCategories(j.data);
      }
    } catch (err) {
      console.error('Load categories error:', err);
    }
  }

  async function loadSuppliers() {
    try {
      const res = await fetch('/api/suppliers/all');
      const j = await res.json();
      if (j.success && j.data) {
        setSuppliers(j.data);
      }
    } catch (err) {
      console.error('Load suppliers error:', err);
    }
  }

  function mapProduct(p) {
    let imgs = [];
    try { imgs = p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images) : []; } catch { imgs = []; }
    const variants = (p.variants && typeof p.variants === 'string') ? JSON.parse(p.variants) : (p.variants || []);
    const category_raw = p.category_id ?? p.categoryId ?? (p.category && (p.category.id ?? p.category.category_id));
    const supplier_raw = p.supplier_id ?? p.supplierId ?? (p.supplier && (p.supplier.id ?? p.supplier.supplier_id));
    const category_id = (category_raw != null && category_raw !== '') ? Number(category_raw) : null;
    const supplier_id = (supplier_raw != null && supplier_raw !== '') ? Number(supplier_raw) : null;
    return { ...p, imagesArray: imgs, variants, category_id, supplier_id };
  }

  async function load() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/products/getAllProducts', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const j = await res.json();
      const rows = (j.data || []).map(mapProduct);
      setProducts(rows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query) {
    if (!query) { await load(); return; }
    setLoading(true);
    try {
      if (/^\d+$/.test(query)) {
        const res = await fetch(`/api/products/detailProduct/${query}`);
        const j = await res.json().catch(()=>null);
        if (res.ok && j && j.success && j.data) {
          setProducts([mapProduct(j.data)]);
        } else {
          setProducts([]);
        }
      } else {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/products/productByName', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ name: query })
        });
        const j = await res.json().catch(()=>null);
        if (res.ok && j && j.success) {
          const rows = (j.data || []).map(mapProduct);
          setProducts(rows);
        } else {
          setProducts([]);
        }
      }
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    if (!confirm('Xoá sản phẩm này? Thao tác này không thể hoàn tác.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/products/deleteProduct/${id}`, { 
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j || !j.success) {
        alert(j?.message || 'Xoá thất bại');
        return;
      }
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  function openEdit(product) {
    const copy = {
      id: product.id,
      avatar: product.avatar || '',
      name: product.name || '',
      origin: product.origin || '',
      status: product.status || '',
      description: product.description || '',
      category_id: (product.category_id ?? product.categoryId ?? (product.category && (product.category.id ?? product.category.category_id))) != null
        ? Number(product.category_id ?? product.categoryId ?? (product.category && (product.category.id ?? product.category.category_id)))
        : null,
      supplier_id: (product.supplier_id ?? product.supplierId ?? (product.supplier && (product.supplier.id ?? product.supplier.supplier_id))) != null
        ? Number(product.supplier_id ?? product.supplierId ?? (product.supplier && (product.supplier.id ?? product.supplier.supplier_id)))
        : null,
      expiry_date: product.expiry_date ? (product.expiry_date.split ? product.expiry_date.split('T')[0] : product.expiry_date) : '',
      images: Array.isArray(product.imagesArray) ? [...product.imagesArray] : [],
      variants: Array.isArray(product.variants) ? product.variants.map(v => ({ ...v })) : []
    };
    setEditing(copy);
    setAvatarFile(null);
    setPreviewUrl(copy.avatar || copy.images[0] || '');
  }

  function closeEdit() {
    setEditing(null);
    setAvatarFile(null);
    setPreviewUrl(null);
    setSaving(false);
    setAddingImages(false);
    setAvatarUrlInput('');
    setImageUrlInput('');
  }

  function onFieldChange(field, value) {
    setEditing(prev => ({ ...prev, [field]: value }));
  }

  function onSelectAvatar(file) {
    if (!file) return;
    if (previewUrl && previewUrl.startsWith('blob:')) {
      try { URL.revokeObjectURL(previewUrl); } catch (e) {}
    }
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function onAddImagesFiles(files) {
    if (!files || !files.length) return;
    if (!editing) return;
    setAddingImages(true);
    try {
      const uploaded = [];
      for (const f of files) {
        const json = await uploadToCloudinary(f);
        uploaded.push(json.secure_url);
      }
      setEditing(prev => ({ ...prev, images: [...(prev.images || []), ...uploaded] }));
    } catch (err) {
      console.error('Upload images thất bại:', err);
    } finally {
      setAddingImages(false);
      if (imagesInputRef.current) imagesInputRef.current.value = '';
    }
  }

  function onRemoveImage(url) {
    if (!editing) return;
    setEditing(prev => ({ ...prev, images: (prev.images || []).filter(u => u !== url) }));
  }

  function onAddAvatarUrl() {
    if (!avatarUrlInput.trim()) return;
    setPreviewUrl(avatarUrlInput);
    setEditing(prev => ({ ...prev, avatar: avatarUrlInput }));
    setAvatarUrlInput('');
  }

  function onAddImageUrl() {
    if (!imageUrlInput.trim()) return;
    setEditing(prev => ({ ...prev, images: [...(prev.images || []), imageUrlInput] }));
    setImageUrlInput('');
  }

  function onVariantChange(index, field, value) {
    setEditing(prev => {
      const next = { ...prev };
      next.variants = next.variants.map((v, i) => i === index ? { ...v, [field]: value } : v);
      return next;
    });
  }

  function onAddVariant() {
    setEditing(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { id: null, name: '', unit: '', price_list: 0, price_sale: 0, stock: 0 }]
    }));
  }

  async function onRemoveVariant(index) {
    if (!editing) return;
    const v = editing.variants && editing.variants[index];
    if (v && v.id) {
      if (!confirm('Xóa variant này vĩnh viễn?')) return;
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/products/deleteVariant/${v.id}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('Delete variant failed');
        setEditing(prev => ({ ...prev, variants: (prev.variants || []).filter((_, i) => i !== index) }));
      } catch (err) {
        console.error('Delete variant error', err);
      }
    } else {
      setEditing(prev => ({ ...prev, variants: (prev.variants || []).filter((_, i) => i !== index) }));
    }
  }

  function openCreate() {
    setEditing({
      id: null,
      avatar: '',
      name: '',
      origin: '',
      status: 'active',
      description: '',
      category_id: categories.length > 0 ? categories[0].id : null,
      supplier_id: suppliers.length > 0 ? suppliers[0].id : null,
      expiry_date: '',
      images: [],
      variants: []
    });
    setAvatarFile(null);
    setPreviewUrl(null);
  }

  async function onSave() {
    if (!editing) return;
    setSaving(true);
    try {
      let avatarUrl = editing.avatar || '';
      if (avatarFile) {
        const json = await uploadToCloudinary(avatarFile);
        avatarUrl = json.secure_url;
      }

      const normalizedVariants = (editing.variants || []).map(v => ({
        id: v.id || null,
        name: v.name || '',
        unit: v.unit || '',
        price_list: Number(v.price_list || 0),
        price_sale: Number(v.price_sale || 0),
        stock: Number(v.stock || 0)
      }));

      const payload = {
        avatar: avatarUrl || null,
        name: editing.name || null,
        origin: editing.origin || null,
        status: editing.status || null,
        description: editing.description || null,
        expiry_date: editing.expiry_date || null,
        images: editing.images || [],
        category_id: editing.category_id ? Number(editing.category_id) : null,
        supplier_id: editing.supplier_id ? Number(editing.supplier_id) : null,
        variants: normalizedVariants
      };

      let res;
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      
      if (editing.id) {
        res = await fetch(`/api/products/updateProduct/${editing.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/products/createProduct', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }   
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.message || 'Save failed');
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
        <AdminHeader title="Kho sản phẩm" onSearch={handleSearch} onCreate={openCreate} />
        
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
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">Mã</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-72">Sản phẩm</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nguồn gốc</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phân loại</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-32">Thao tác</th>
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
                    <tr><td colSpan="5" className="px-8 py-20 text-center text-[#155e3a] font-black uppercase tracking-widest text-xs">Đang tải dữ liệu...</td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Không có sản phẩm nào</td></tr>
                  ) : (
                    products.map((p, idx) => (
                      <motion.tr 
                        variants={{
                          initial: { opacity: 0, y: 10 },
                          animate: { opacity: 1, y: 0 }
                        }}
                        key={p.id} 
                        className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors group"
                      >
                        <td className="px-8 py-6 font-black text-slate-400 text-xs">#{p.id}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-500 bg-slate-50">
                              <img 
                                src={p.avatar || (p.imagesArray && p.imagesArray[0]) || 'https://placehold.co/100'} 
                                alt={p.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => { e.target.src = 'https://placehold.co/200?text=No+Image'; }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-slate-900 group-hover:text-[#155e3a] transition-colors text-sm line-clamp-2 leading-tight mb-2 tracking-tight uppercase">{p.name || '-'}</div>
                              <div className="flex items-center gap-2">
                                {p.status === 'active' ? (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-black rounded-lg px-2 h-5 uppercase tracking-tighter">Đang bán</Badge>
                                ) : (
                                  <Badge className="bg-rose-100 text-rose-700 border-none text-[9px] font-black rounded-lg px-2 h-5 uppercase tracking-tighter">Tạm khóa</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 align-top">
                           <div className="space-y-3">
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                 <Globe className="w-3.5 h-3.5 text-emerald-600" />
                                 <span className="text-slate-900">{p.origin || '-'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                 <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                 <span className="text-slate-900">{p.expiry_date ? p.expiry_date.split('T')[0] : 'N/A'}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex flex-wrap gap-2 max-w-md">
                              {(p.variants || []).map(v => (
                                <div key={v.id || v.variant_id} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col gap-1 shadow-sm min-w-[140px] hover:bg-white hover:border-[#155e3a]/20 transition-all group/v">
                                   <span className="font-black text-[10px] text-slate-900 uppercase leading-none tracking-tight">{v.name}</span>
                                   <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-slate-100">
                                      <span className="text-[11px] font-black text-[#155e3a] tracking-tighter">
                                        {(v.price_sale || v.price_list).toLocaleString('vi-VN')} ₫
                                      </span>
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{v.stock} {v.unit}</span>
                                   </div>
                                </div>
                              ))}
                              {(p.variants || []).length === 0 && (
                                <span className="text-[10px] text-slate-300 uppercase font-black tracking-widest">Không có phân loại</span>
                              )}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-[#155e3a]/5 hover:text-[#155e3a] transition-all">
                                    <MoreVertical className="w-5 h-5" />
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-[1.5rem] p-2 shadow-2xl border-slate-100">
                                 <DropdownMenuItem onClick={() => openEdit(p)} className="rounded-xl flex items-center gap-3 p-3 font-black text-[11px] uppercase tracking-widest cursor-pointer hover:bg-[#155e3a]/5 hover:text-[#155e3a]">
                                    <Edit3 className="w-4 h-4" /> Sửa thông tin
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => onDelete(p.id)} className="rounded-xl flex items-center gap-3 p-3 font-black text-[11px] uppercase tracking-widest cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                                    <Trash2 className="w-4 h-4" /> Xoá vĩnh viễn
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </td>
                      </motion.tr>
                    )
                  ))}
                </motion.tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Editor Modal */}
        <Dialog open={!!editing} onOpenChange={(open) => !open && closeEdit()}>
          <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0 overflow-hidden border-none rounded-[3.5rem] shadow-2xl">
            <DialogHeader className="p-8 border-b bg-[#0a2e1f] text-white">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#155e3a] text-white flex items-center justify-center font-black shadow-lg shadow-[#155e3a]/40 border border-white/10">
                     {editing?.id ? <Edit3 className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black tracking-tighter uppercase">
                      {editing?.id ? 'Biên dịch sản phẩm' : 'Kiến tạo sản phẩm'}
                    </DialogTitle>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-1">Cập nhật dữ liệu hệ thống</p>
                  </div>
               </div>
            </DialogHeader>

            <ScrollArea className="flex-1 p-10 bg-slate-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Media */}
                <div className="lg:col-span-4 space-y-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] px-1">Ảnh đại diện diện (Avatar)</Label>
                    <div className="aspect-square bg-white rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl shadow-slate-200/50 group relative box-content max-w-[320px] mx-auto">
                      {previewUrl ? (
                         <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                            <ImageIcon className="w-16 h-16 opacity-30 mb-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Chưa có ảnh</span>
                         </div>
                      )}
                      
                      <div className="absolute inset-0 bg-[#0a2e1f]/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                        <Button variant="secondary" size="sm" className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 px-6 gap-2 bg-white text-[#0a2e1f] hover:scale-105 active:scale-95 shadow-xl transition-all" asChild>
                           <label className="cursor-pointer">
                              <Upload className="w-4 h-4" /> Tải lên mới
                              <input type="file" className="hidden" accept="image/*" onChange={e => onSelectAvatar(e.target.files?.[0])} />
                           </label>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] px-1">Bộ sưu tập chi tiết</Label>
                    <div className="grid grid-cols-3 gap-4">
                       {(editing?.images || []).map((u, i) => (
                         <motion.div 
                           initial={{ scale: 0.9, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1 }}
                           key={i} 
                           className="aspect-square bg-white rounded-3xl overflow-hidden relative group border-2 border-white shadow-lg"
                         >
                            <img src={u} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => onRemoveImage(u)} className="absolute top-2 right-2 bg-rose-500 text-white rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110">
                               <Trash2 className="w-3.5 h-3.5" />
                            </button>
                         </motion.div>
                       ))}
                       <label className="aspect-square border-4 border-dashed border-white bg-white/50 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#155e3a] hover:bg-emerald-50 transition-all text-slate-400 font-black shadow-inner">
                          <input 
                            ref={imagesInputRef}
                            type="file" 
                            className="hidden" 
                            multiple 
                            accept="image/*" 
                            onChange={e => e.target.files && onAddImagesFiles(Array.from(e.target.files))} 
                          />
                          <Plus className="w-6 h-6 text-[#155e3a]" />
                          <span className="text-[9px] uppercase tracking-tighter">{addingImages ? '...' : 'Thêm ảnh'}</span>
                       </label>
                    </div>
                  </div>
                </div>

                {/* Right: Info */}
                <div className="lg:col-span-8 space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-1">Tên sản phẩm thượng hạng</Label>
                         <Input 
                            value={editing?.name} 
                            onChange={e => onFieldChange('name', e.target.value)} 
                            placeholder="Nhập tên sản phẩm..."
                            className="h-14 rounded-2xl bg-white border-none font-bold text-sm shadow-xl shadow-slate-200/50 focus-visible:ring-[#155e3a]/20"
                         />
                      </div>
                      <div className="space-y-3">
                         <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-1">Khu vực khai thác / Xuất xứ</Label>
                         <Input 
                            value={editing?.origin} 
                            onChange={e => onFieldChange('origin', e.target.value)} 
                            placeholder="Địa danh, quốc gia..."
                            className="h-14 rounded-2xl bg-white border-none font-bold text-sm shadow-xl shadow-slate-200/50 focus-visible:ring-[#155e3a]/20"
                         />
                      </div>
                      <div className="space-y-3">
                         <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-1">Phân hạng danh mục</Label>
                         <Select value={editing?.category_id?.toString()} onValueChange={v => onFieldChange('category_id', Number(v))}>
                            <SelectTrigger className="h-14 rounded-2xl bg-white border-none font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200/50 focus:ring-[#155e3a]/20">
                               <SelectValue placeholder="Chọn danh mục..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-[2rem] shadow-2xl border-none p-2">
                               {categories.map(cat => (
                                 <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl font-black text-[11px] uppercase p-3">{cat.name}</SelectItem>
                               ))}
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-3">
                         <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-1">Nhà cung ứng chiến lược</Label>
                         <Select value={editing?.supplier_id?.toString()} onValueChange={v => onFieldChange('supplier_id', Number(v))}>
                            <SelectTrigger className="h-14 rounded-2xl bg-white border-none font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200/50 focus:ring-[#155e3a]/20">
                               <SelectValue placeholder="Chọn nhà cung cấp..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-[2rem] shadow-2xl border-none p-2">
                               {suppliers.map(sup => (
                                 <SelectItem key={sup.id} value={sup.id.toString()} className="rounded-xl font-black text-[11px] uppercase p-3">{sup.name}</SelectItem>
                               ))}
                            </SelectContent>
                         </Select>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-1">Ký sự sản phẩm (Mô tả)</Label>
                      <div className="rounded-[2.5rem] border-4 border-white overflow-hidden bg-white shadow-2xl shadow-slate-200/50">
                         <MarkdownEditor 
                            value={editing?.description || ''} 
                            onChange={v => onFieldChange('description', v)} 
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-1">Chế độ vận hành (Trạng thái)</Label>
                          <Select value={editing?.status} onValueChange={v => onFieldChange('status', v)}>
                             <SelectTrigger className="h-14 rounded-2xl bg-white border-none font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200/50">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="rounded-[1.5rem] p-2">
                                <SelectItem value="active" className="rounded-xl font-black text-[11px] uppercase p-3">Sẵn sàng thương mại</SelectItem>
                                <SelectItem value="inactive" className="rounded-xl font-black text-[11px] uppercase p-3 text-rose-500">Tạm ngừng cung ứng</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-1">Thời hạn tinh hoa (HSD)</Label>
                          <Input 
                             type="date"
                             value={editing?.expiry_date} 
                             onChange={e => onFieldChange('expiry_date', e.target.value)} 
                             className="h-14 rounded-2xl bg-white border-none font-black text-xs shadow-xl shadow-slate-200/50 block focus-visible:ring-[#155e3a]/20"
                          />
                       </div>
                   </div>

                   <div className="space-y-8">
                      <div className="flex items-center justify-between px-1">
                         <Label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#155e3a]">
                              <Tag className="w-4 h-4" />
                           </div>
                           Ma trận phiên bản (Variants)
                         </Label>
                         <Button type="button" variant="outline" size="sm" onClick={onAddVariant} className="rounded-2xl border-[#155e3a] text-[#155e3a] font-black text-[10px] h-10 px-6 hover:bg-[#155e3a] hover:text-white uppercase tracking-widest transition-all shadow-lg active:scale-95">
                            + Thêm phân loại
                         </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                         {AnimatePresence && (editing?.variants || []).map((v, idx) => (
                           <motion.div 
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             key={idx}
                           >
                              <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] bg-white p-8 group/variant relative overflow-hidden">
                                <div className="absolute top-4 right-4 opacity-0 group-hover/variant:opacity-100 transition-all">
                                  <Button variant="ghost" size="icon" className="h-10 w-10 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl" onClick={() => onRemoveVariant(idx)}>
                                    <Trash2 className="w-5 h-5" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                   <div className="md:col-span-4 space-y-2">
                                      <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Định danh phiên bản</Label>
                                      <Input 
                                         value={v.name} 
                                         onChange={e => onVariantChange(idx, 'name', e.target.value)} 
                                         placeholder="VD: Phần Tiêu Chuẩn 500g"
                                         className="h-12 rounded-xl bg-slate-50 border-none font-bold text-sm shadow-inner"
                                      />
                                   </div>
                                   <div className="md:col-span-2 space-y-2">
                                      <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Đơn vị</Label>
                                      <Input 
                                         value={v.unit} 
                                         onChange={e => onVariantChange(idx, 'unit', e.target.value)} 
                                         placeholder="Đơn vị"
                                         className="h-12 rounded-xl bg-slate-50 border-none font-bold text-sm shadow-inner"
                                      />
                                   </div>
                                   <div className="md:col-span-4 space-y-2">
                                      <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Chiến lược giá (Gốc / Ưu đãi)</Label>
                                      <div className="flex items-center gap-3">
                                         <div className="relative flex-1">
                                            <Input 
                                               type="number" 
                                               value={v.price_list} 
                                               onChange={e => onVariantChange(idx, 'price_list', e.target.value)} 
                                               className="h-12 rounded-xl bg-slate-50 border-none font-black text-xs pl-4 shadow-inner"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">₫</span>
                                         </div>
                                         <ArrowRight className="w-4 h-4 text-emerald-400" />
                                         <div className="relative flex-1">
                                            <Input 
                                               type="number" 
                                               value={v.price_sale} 
                                               onChange={e => onVariantChange(idx, 'price_sale', e.target.value)} 
                                               className="h-12 rounded-xl bg-emerald-50 border-none font-black text-xs pl-4 text-[#155e3a] shadow-inner"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#155e3a]">₫</span>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="md:col-span-2 space-y-2">
                                      <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Lưu kho</Label>
                                      <Input 
                                         type="number" 
                                         value={v.stock} 
                                         onChange={e => onVariantChange(idx, 'stock', e.target.value)} 
                                         className="h-12 rounded-xl bg-slate-50 border-none font-black text-sm shadow-inner"
                                      />
                                   </div>
                                </div>
                              </Card>
                           </motion.div>
                         ))}
                         {(editing?.variants || []).length === 0 && (
                           <div className="text-center py-16 border-4 border-dashed border-white rounded-[3rem] text-slate-300 font-black uppercase tracking-[0.2em] text-xs animate-pulse">
                             Chưa có định nghĩa phiên bản
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="p-8 border-t bg-white flex items-center justify-between sm:justify-between">
               <div className="hidden sm:flex items-center gap-3 text-emerald-600">
                  <Store className="w-5 h-5" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sẵn sàng đồng bộ hệ thống</p>
               </div>
               <div className="flex gap-4">
                  <Button variant="ghost" onClick={closeEdit} className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all">HUỶ BỎ</Button>
                  <Button 
                    onClick={onSave} 
                    disabled={saving}
                    className="rounded-[1.5rem] h-14 px-12 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[#155e3a]/40 bg-[#155e3a] text-white hover:bg-[#0f4a2b] border-none hover:scale-105 active:scale-95 transition-all"
                  >
                    {saving ? 'ĐANG ĐỒNG BỘ...' : 'XÁC NHẬN LƯU'}
                  </Button>
               </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}