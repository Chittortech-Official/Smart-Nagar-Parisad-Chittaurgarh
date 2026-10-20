import { useState } from 'react';
import { NagarParishadLogo } from './NagarParishadLogo';
import type { UserRole } from '../types';


import { 
  Database, 
  MapPin, 
  ShieldCheck, 
  Headphones, 
  Eye, 
  EyeOff, 
  Phone, 
  MessageSquare, 
  Mail, 
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (role: UserRole, email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@chittortech.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('SUPER_ADMIN');

  const rolePresets: { role: UserRole; label: string; email: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', email: 'admin@chittortech.com' },
    { role: 'PORTAL_MANAGER', label: 'Portal Manager', email: 'portalmanager@chittorgarh.gov.in' },
    { role: 'CALL_OPERATOR', label: 'Call Operator', email: 'calloperator@chittorgarh.gov.in' },
    { role: 'CHAIRMAN', label: 'Hon. Chairman', email: 'chairman@chittorgarh.gov.in' },
    { role: 'WARD_COUNCILLOR', label: 'Ward Councillor', email: 'councillor.w01@chittorgarh.gov.in' },
    { role: 'DEPARTMENTAL_OFFICER', label: 'Dept Officer', email: 'officer.sanitation@chittorgarh.gov.in' }
  ];

  const handleRoleChange = (role: UserRole, roleEmail: string) => {
    setSelectedRole(role);
    setEmail(roleEmail);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole, email);
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-slate-900 font-sans">
      {/* LEFT BRAND PANEL (Matches Reference Screenshot 1) */}
      <div className="relative flex flex-col justify-between bg-[#080E1E] p-8 lg:p-14 lg:w-1/2 text-white overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Subtle grid background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-700/60 px-3.5 py-1.5 rounded-lg shadow-sm">
            <NagarParishadLogo size="sm" theme="dark" />
          </div>
          <div className="bg-slate-900/90 border border-slate-700/60 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wider text-slate-300">
            ChittorTech <span className="text-amber-400 font-normal">OFFICIAL DEVELOPER</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 my-12 lg:my-0 space-y-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 tracking-wide uppercase">
            &lt;/&gt; ENGINEERED BY CHITTORTECH
          </div>

          <div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-tight">
              Nagar Parishad <span className="text-amber-400">Admin</span>
            </h1>
            <p className="mt-4 text-slate-400 text-sm lg:text-base leading-relaxed max-w-lg">
              Secure central portal for managing citizen complaints across all 60 wards of Chittorgarh, 
              live Supabase synchronization, WhatsApp automation, and executive monitoring.
            </p>
          </div>

          {/* Feature Bullets */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3.5 text-slate-200 text-sm">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <span>Real-time Supabase Cloud Database Sync</span>
            </div>

            <div className="flex items-center gap-3.5 text-slate-200 text-sm">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span>60-Ward Ward &amp; Councillor GIS Complaint Routing</span>
            </div>

            <div className="flex items-center gap-3.5 text-slate-200 text-sm">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Mandatory 2-Step Citizen-Certified Closure &amp; Hindi WhatsApp</span>
            </div>

            <div className="flex items-center gap-3.5 text-slate-200 text-sm">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <span>24/7 Dedicated ChittorTech Developer Support</span>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-300">System Status: Fully Operational</span>
          </div>
          <div className="text-slate-500">
            Cloudflare Edge SSL Protected
          </div>
        </div>
      </div>

      {/* RIGHT LOGIN CARD (Matches Reference Screenshot 1) */}
      <div className="flex items-center justify-center bg-white lg:w-1/2 p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500">
              Please select your role and enter your credentials to access the portal.
            </p>
          </div>

          {/* Quick Role Switcher for seamless testing */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Select Role for Demo / Login
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {rolePresets.map((preset) => (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleRoleChange(preset.role, preset.email)}
                  className={`px-2 py-1.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                    selectedRole === preset.role
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs ring-1 ring-blue-600'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Official Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@chittortech.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact ChittorTech Administrator for password recovery."); }} className="text-xs font-semibold text-blue-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* SUPPORT CARD (Matches Reference Screenshot 1) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Headphones className="w-4 h-4 text-emerald-600" />
                <span>NEED HELP? CHITTORTECH SUPPORT</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-[10px]">
                24/7 Priority
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a 
                href="tel:+917426016636" 
                className="flex items-center justify-center gap-1.5 p-2 bg-white rounded-lg border border-slate-200 font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>+91 7426016636</span>
              </a>
              <a 
                href="https://wa.me/917426016636" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-center gap-1.5 p-2 bg-white rounded-lg border border-slate-200 font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>

            <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-200 pt-2.5">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>Alternate: +91 9424466992</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>support@chittortech.com</span>
              </div>
            </div>

            <div className="text-center pt-1">
              <a 
                href="https://chittortech.com" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
              >
                <span>Visit ChittorTech Portal (chittortech.com)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
