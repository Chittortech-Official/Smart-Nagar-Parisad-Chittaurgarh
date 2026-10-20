import { useState } from 'react';
import type { Ward, Department } from '../types';
import { X, Phone, Plus } from 'lucide-react';

interface NewComplaintModalProps {
  wards: Ward[];
  departments: Department[];
  onClose: () => void;
  onSubmit: (data: {
    citizen_name: string;
    citizen_phone: string;
    ward_number: number;
    address: string;
    landmark: string;
    department_name: string;
    category_name: string;
    problem_description: string;
    intake_channel: 'HELPLINE_CALL' | 'WHATSAPP';
  }) => void;
}

export const NewComplaintModal = ({
  wards,
  departments,
  onClose,
  onSubmit
}: NewComplaintModalProps) => {
  const [channel, setChannel] = useState<'HELPLINE_CALL' | 'WHATSAPP'>('HELPLINE_CALL');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('+91 ');
  const [wardNumber, setWardNumber] = useState<number>(1);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [selectedDept, setSelectedDept] = useState(departments[0]?.name || 'Sanitation & Garbage Collection');
  const [categoryName, setCategoryName] = useState('Kachra Patra Emptying & Overflow');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !address.trim() || !description.trim()) {
      alert("Please fill all mandatory fields.");
      return;
    }
    onSubmit({
      citizen_name: citizenName,
      citizen_phone: citizenPhone,
      ward_number: Number(wardNumber),
      address,
      landmark,
      department_name: selectedDept,
      category_name: categoryName,
      problem_description: description,
      intake_channel: channel
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Register Citizen Helpline Complaint
              </h3>
              <p className="text-xs text-slate-400">
                Helpline Hours: 10:00 AM – 6:00 PM &bull; Chittorgarh Municipal Area
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Channel selector */}
          <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-600">Intake Channel:</span>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
              <input
                type="radio"
                name="channel"
                checked={channel === 'HELPLINE_CALL'}
                onChange={() => setChannel('HELPLINE_CALL')}
              />
              Helpline Call (10 AM - 6 PM)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
              <input
                type="radio"
                name="channel"
                checked={channel === 'WHATSAPP'}
                onChange={() => setChannel('WHATSAPP')}
              />
              WhatsApp Intake
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Citizen Full Name *</label>
              <input
                type="text"
                required
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="e.g. Ramesh Chandra Bhati"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Mobile Number *</label>
              <input
                type="text"
                required
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                placeholder="+91 94140 00000"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Select Ward (1 to 60) *</label>
              <select
                value={wardNumber}
                onChange={(e) => setWardNumber(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
              >
                {wards.map((w) => (
                  <option key={w.ward_number} value={w.ward_number}>
                    Ward {w.ward_number} - {w.ward_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Municipal Department *</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Exact Locality &amp; Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Plot no., Street name, Mohalla..."
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Prominent Landmark</label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Old Temple, Behind Govt School, Overbridge"
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Problem Category *</label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Streetlight Defective, Waste Accumulation, Broken Slabs"
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Detailed Complaint Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the issue reported by the citizen on the call..."
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Submit for Portal Manager Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
