
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Truck, Package, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ShipmentModal({ orderId, isOpen, onClose, orderStatus, onSave, token }) {
  const [formData, setFormData] = useState({
    tracking_number: '',
    carrier: '',
    shipped_date: '',
    delivered_date: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const carriers = ['GHN', 'GHTK', 'ViettelPost', 'Grab', 'Khác'];

  // Fetch existing shipment data when modal opens
  useEffect(() => {
    if (isOpen && orderId) {
      fetchShipmentData();
    }
  }, [isOpen, orderId]);

  const fetchShipmentData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/shipments/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const json = await res.json();

      if (res.ok && json.success && json.data) {
        setFormData({
          tracking_number: json.data.tracking_number || '',
          carrier: json.data.carrier || '',
          shipped_date: json.data.shipped_date ? new Date(json.data.shipped_date).toISOString().slice(0, 10) : '',
          delivered_date: json.data.delivered_date ? new Date(json.data.delivered_date).toISOString().slice(0, 10) : ''
        });
      }
    } catch (err) {
      console.error('Fetch shipment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCarrierChange = (value) => {
    setFormData(prev => ({ ...prev, carrier: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      setLoading(true);

      if (!formData.tracking_number || !formData.carrier || !formData.shipped_date) {
        setError('Vui lòng điền đủ: Mã vận đơn, Nhà vận chuyển và Ngày gửi hàng.');
        setLoading(false);
        return;
      }

      const payload = {
        tracking_number: formData.tracking_number,
        carrier: formData.carrier,
        shipped_date: formData.shipped_date,
        delivered_date: formData.delivered_date || null
      };

      const res = await fetch(`/api/shipments/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || 'Cập nhật thông tin vận đơn thất bại');
        return;
      }

      setSuccessMsg('Cập nhật thông tin vận đơn thành công!');
      setTimeout(() => {
        if (onSave) onSave();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Submit error:', err);
      setError('Lỗi khi cập nhật thông tin vận đơn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="p-10 bg-slate-50/50 border-b relative">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                 <Truck className="w-7 h-7" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    Thông tin vận đơn
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-400 px-2 h-5 rounded-md uppercase">Order #{orderId}</Badge>
                    {orderStatus === 'delivered' && <Badge className="bg-green-100 text-green-600 border-none text-[9px] font-black h-5 px-2 rounded-md uppercase">GIAO THÀNH CÔNG</Badge>}
                </div>
              </div>
           </div>
        </DialogHeader>

        <div className="p-10 space-y-8 bg-white">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
               <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 text-green-600 text-xs font-bold border border-green-100 animate-in fade-in slide-in-from-top-2">
               <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
            </div>
          )}

          <div className="space-y-6">
             <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã vận đơn (Tracking No.) *</Label>
                <Input 
                  value={formData.tracking_number} 
                  onChange={e => setFormData(p => ({...p, tracking_number: e.target.value}))}
                  placeholder="VD: 1234567890"
                  className="h-14 rounded-2xl bg-slate-50 border-none font-black text-slate-800 placeholder:text-slate-200 px-6 shadow-inner focus-visible:ring-primary/10"
                />
             </div>

             <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Đơn vị vận chuyển *</Label>
                <Select value={formData.carrier} onValueChange={handleCarrierChange}>
                   <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-black text-slate-800 px-6 shadow-inner focus:ring-primary/10">
                      <SelectValue placeholder="-- Chọn nhà vận chuyển --" />
                   </SelectTrigger>
                   <SelectContent className="rounded-2xl shadow-2xl border-none ring-1 ring-slate-100">
                      {carriers.map(c => (
                        <SelectItem key={c} value={c} className="rounded-xl font-bold py-3">{c}</SelectItem>
                      ))}
                   </SelectContent>
                </Select>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày gửi hàng *</Label>
                   <Input 
                      type="date"
                      value={formData.shipped_date}
                      onChange={e => setFormData(p => ({...p, shipped_date: e.target.value}))}
                      className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 px-6 shadow-inner focus-visible:ring-primary/10"
                   />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày đã giao (Opt.)</Label>
                   <Input 
                      type="date"
                      value={formData.delivered_date}
                      onChange={e => setFormData(p => ({...p, delivered_date: e.target.value}))}
                      className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-800 px-6 shadow-inner focus-visible:ring-primary/10"
                   />
                </div>
             </div>
          </div>
        </div>

        <DialogFooter className="p-8 border-t bg-slate-50/50 flex justify-end gap-3 px-10">
           <Button variant="ghost" onClick={onClose} className="rounded-2xl h-12 px-8 font-black uppercase text-xs">HUỶ BỎ</Button>
           <Button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="rounded-2xl h-12 px-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 bg-primary hover:scale-105 active:scale-95 transition-all outline-none border-none"
           >
              {loading ? 'ĐANG LƯU...' : 'CẬP NHẬT'}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
