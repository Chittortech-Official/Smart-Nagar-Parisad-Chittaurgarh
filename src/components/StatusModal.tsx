import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export type StatusModalType = 'confirm' | 'success' | 'warning' | 'error' | 'info';

export type StatusModalConfig = {
  isOpen: boolean;
  type: StatusModalType;
  title: string;
  subtitle?: string;
  details?: string[];
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
};

// Runtime export safeguard for bundlers
export const StatusModalConfig = {};

interface StatusModalProps {
  config: StatusModalConfig;
  onClose: () => void;
}

export function StatusModal({ config, onClose }: StatusModalProps) {
  if (!config.isOpen) return null;

  const isConfirm = config.type === 'confirm';
  const isSuccess = config.type === 'success';
  const isWarning = config.type === 'warning';
  const isError = config.type === 'error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 text-center space-y-5 animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Circular Icon (Matches Reference Screenshot 1, 2, 3) */}
        <div className="flex justify-center">
          {isSuccess && (
            <div className="w-20 h-20 rounded-full border-4 border-emerald-400 bg-emerald-50 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 stroke-[2.2]" />
            </div>
          )}

          {isConfirm && (
            <div className="w-20 h-20 rounded-full border-4 border-amber-300 bg-amber-50 flex items-center justify-center shadow-inner">
              <span className="text-amber-500 font-bold text-4xl leading-none">!</span>
            </div>
          )}

          {isWarning && (
            <div className="w-20 h-20 rounded-full border-4 border-amber-400 bg-amber-50 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-10 h-10 text-amber-500 stroke-[2.2]" />
            </div>
          )}

          {isError && (
            <div className="w-20 h-20 rounded-full border-4 border-rose-400 bg-rose-50 flex items-center justify-center shadow-inner">
              <XCircle className="w-10 h-10 text-rose-500 stroke-[2.2]" />
            </div>
          )}

          {config.type === 'info' && (
            <div className="w-20 h-20 rounded-full border-4 border-blue-400 bg-blue-50 flex items-center justify-center shadow-inner">
              <Info className="w-10 h-10 text-blue-500 stroke-[2.2]" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {config.title}
          </h3>
          {config.subtitle && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* Additional Details Box if available */}
        {config.details && config.details.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-1 text-xs text-slate-700 font-medium">
            {config.details.map((item, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">&bull;</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions Buttons (Matches Reference Screenshot 1 & 3) */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {/* Cancel button if confirmation */}
          {(isConfirm || config.showCancel) && (
            <button
              type="button"
              onClick={() => {
                if (config.onCancel) config.onCancel();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
            >
              {config.cancelText || 'Cancel'}
            </button>
          )}

          {/* Primary confirm/OK button */}
          <button
            type="button"
            onClick={() => {
              if (config.onConfirm) {
                config.onConfirm();
              } else {
                onClose();
              }
            }}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all active:scale-95 ${
              isConfirm
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : isSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : isError
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {config.confirmText || (isSuccess ? 'OK' : 'Yes, Confirm!')}
          </button>
        </div>
      </div>
    </div>
  );
}
