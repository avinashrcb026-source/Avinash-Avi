import React from 'react';
import { AlertOctagon, X, ShieldAlert, Power } from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';

interface EmergencyStopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyStopModal: React.FC<EmergencyStopModalProps> = ({ isOpen, onClose }) => {
  const { emergencyStop, activePrinter } = usePrinter();

  if (!isOpen) return null;

  const handleConfirmEstop = () => {
    emergencyStop();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-950 border-2 border-rose-500 rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.4)] overflow-hidden">
        {/* Warning Banner */}
        <div className="bg-rose-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-7 h-7 text-white animate-bounce" />
            <div>
              <h3 className="font-tech font-bold text-lg leading-tight uppercase tracking-wider">
                Emergency Stop (M112)
              </h3>
              <p className="text-xs font-mono opacity-90">Hardware Interlock Cutoff</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-rose-700">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-xs font-mono text-rose-200 leading-relaxed">
            <p className="font-bold text-rose-400 mb-1">WARNING: Immediate Kinetic & Thermal Cutoff</p>
            This command will immediately dispatch <strong>M112</strong> to the firmware controller on{' '}
            <strong>{activePrinter.name}</strong>.
            <ul className="list-disc pl-4 mt-2 space-y-1 text-slate-300">
              <li>All stepper motor drivers will be de-energized.</li>
              <li>Hotend and bed heating elements will be turned OFF immediately.</li>
              <li>The active print job will be permanently aborted.</li>
              <li>Hardware reset required before subsequent commands can be received.</li>
            </ul>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Target Machine:</span>
            <span className="font-bold text-white">{activePrinter.name}</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold transition-colors"
            >
              Cancel / Abort
            </button>
            <button
              onClick={handleConfirmEstop}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-tech font-bold text-sm shadow-lg shadow-rose-600/40 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Power className="w-4 h-4" />
              CONFIRM E-STOP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
