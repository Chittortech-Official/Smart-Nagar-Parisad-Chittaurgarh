import { useState, useEffect } from 'react';
import type { Ward } from '../types';
import { X, Save, UserCheck, Phone, MapPin, Building } from 'lucide-react';

interface EditParshadModalProps {
  isOpen: boolean;
  onClose: () => void;
  ward: Ward | null;
  onSave: (updatedWard: Ward) => void;
}

export const EditParshadModal = ({
  isOpen,
  onClose,
  ward,
  onSave
}: EditParshadModalProps) => {
  const [formData, setFormData] = useState<Ward | null>(null);

  useEffect(() => {
    if (ward) {
      setFormData({ ...ward });
    }
  }, [ward]);

  if (!isOpen || !ward || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.councillor_name.trim()) {
      alert('कृपया पार्षद का नाम दर्ज करें (Please enter Parshad Name)');
      return;
    }
    if (!formData.councillor_phone.trim()) {
      alert('कृपया पार्षद का मोबाइल नंबर दर्ज करें (Please enter Parshad Phone)');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                पार्षद विवरण संपादित करें (Edit Parshad)
              </h3>
              <p className="text-xs text-blue-100 font-mono">
                वार्ड {ward.ward_number} &bull; {ward.ward_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ward Number (Fixed) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                वार्ड संख्या (Ward Number - Fixed)
              </label>
              <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 font-mono font-bold text-slate-700 text-xs">
                वार्ड {ward.ward_number}
              </div>
            </div>

            {/* Zone */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                जोन (Zone)
              </label>
              <select
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="East Zone">East Zone</option>
                <option value="West Zone">West Zone</option>
                <option value="North Zone">North Zone</option>
                <option value="South Zone">South Zone</option>
                <option value="Central Zone">Central Zone</option>
              </select>
            </div>
          </div>

          {/* Ward Name / Area */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" />
              <span>वार्ड का नाम / क्षेत्र (Ward Name)</span>
            </label>
            <input
              type="text"
              value={formData.ward_name}
              onChange={(e) => setFormData({ ...formData, ward_name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="e.g. Ward 1 - Fort Road & Padan Pol"
            />
          </div>

          {/* Parshad Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-slate-400" />
              <span>पार्षद का नाम (Elected Parshad Name)</span>
            </label>
            <input
              type="text"
              value={formData.councillor_name}
              onChange={(e) => setFormData({ ...formData, councillor_name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="e.g. Rajendra Bhati"
            />
          </div>

          {/* Parshad Phone */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>पार्षद मोबाइल नंबर (WhatsApp / Call Phone)</span>
            </label>
            <input
              type="tel"
              value={formData.councillor_phone}
              onChange={(e) => setFormData({ ...formData, councillor_phone: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white font-mono font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="+919829000001"
            />
            <p className="text-[10px] text-slate-400">
              * यह नंबर व्हाट्सएप नोटिफिकेशन और कॉल डिस्पैच में उपयोग होगा।
            </p>
          </div>

          {/* Key Landmarks */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>प्रमुख लैंडमार्क / मोहल्ले (Key Landmarks)</span>
            </label>
            <textarea
              rows={2}
              value={formData.key_landmarks}
              onChange={(e) => setFormData({ ...formData, key_landmarks: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
              placeholder="e.g. Padan Pol, Bhairon Pol, Fort Foothills"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>सहेजें (Save Changes)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
