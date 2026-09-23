import React, { useState } from 'react';
import { X, Shield, User, Lock, Key, Check, AlertCircle } from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';
import { UserRole } from '../types/printer';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setUserRole, auditLogs } = usePrinter();
  const [activeTab, setActiveTab] = useState<'roles' | 'profile' | 'audit'>('roles');

  if (!isOpen) return null;

  const roleDefinitions: Array<{
    role: UserRole;
    name: string;
    description: string;
    permissions: string[];
    badgeColor: string;
  }> = [
    {
      role: 'admin',
      name: 'Industrial Administrator',
      description: 'Full supervisory authority across all factory cells, cloud brokers, and firmware configurations.',
      permissions: [
        'Full machine control & emergency override',
        'Hardware configuration & sensor calibration',
        'User management & role assignment',
        'Security token generation & firmware flashing',
      ],
      badgeColor: 'text-purple-400 bg-purple-500/20 border-purple-500/40',
    },
    {
      role: 'engineer',
      name: 'Mechanical & Automation Engineer',
      description: 'Authorized for machine control, telemetry analytics, AI diagnostic reports, and slicer configuration.',
      permissions: [
        'Full machine motion & thermal control',
        'AI anomaly scans & computer vision tuning',
        'Predictive maintenance logging',
        'G-Code file uploading & printer assignment',
      ],
      badgeColor: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40',
    },
    {
      role: 'operator',
      name: 'Shift Operator',
      description: 'Authorized to dispatch approved print files, pause/resume jobs, load filaments, and report faults.',
      permissions: [
        'Job start, pause, and resume',
        'Filament spool loading & PEI plate prep',
        'Fault acknowledgement & notification review',
        'Read-only sensor calibration view',
      ],
      badgeColor: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
    },
    {
      role: 'viewer',
      name: 'Read-Only Viewer',
      description: 'Safe audit-only role for academic reviewers, inspectors, and clients without machine control privileges.',
      permissions: [
        'Live temperature graph monitoring',
        'Camera stream viewing',
        'Analytics & maintenance record review',
        'Strictly zero machine motion or heating permissions',
      ],
      badgeColor: 'text-slate-400 bg-slate-500/20 border-slate-500/40',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tech font-bold text-base text-white">
                Access Control & User Profile (RBAC)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Current Role: <strong className="text-cyan-400 uppercase">{currentUser.role}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-950/60 text-xs font-mono">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'roles' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Role Switching (RBAC)
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'profile' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Session Profile
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'audit' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Security Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'roles' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
                Select an engineering persona to test Role-Based Access Controls (RBAC) across machine controls and safety operations:
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {roleDefinitions.map((item) => {
                  const isCurrent = currentUser.role === item.role;
                  return (
                    <div
                      key={item.role}
                      onClick={() => {
                        setUserRole(item.role);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-slate-950 border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${item.badgeColor}`}>
                            {item.role.toUpperCase()}
                          </span>
                          <span className="font-tech font-bold text-sm text-slate-100">{item.name}</span>
                        </div>
                        {isCurrent && (
                          <div className="flex items-center gap-1 text-cyan-400 text-xs font-mono font-bold">
                            <Check className="w-4 h-4" />
                            ACTIVE
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mb-2 leading-relaxed">{item.description}</p>

                      <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-300">
                        {item.permissions.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            <span className="truncate">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400"
                />
                <div>
                  <h4 className="text-base font-bold text-white font-tech">{currentUser.name}</h4>
                  <div className="text-slate-400">{currentUser.email}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase font-bold text-[10px]">
                      {currentUser.role}
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      OAuth & JWT Authenticated
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[11px]">Security Credentials</div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Cloud Organization:</span>
                  <span className="text-slate-200">Vyom Additive Technologies IIoT</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">MQTT Client ID:</span>
                  <span className="text-slate-200">usr_avinash_edge_auth_88</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Session Expiration:</span>
                  <span className="text-slate-200">2026-09-23 04:00 (12h lease)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="text-[11px] text-slate-400 mb-2">
                Immutable machine command log tracking all user interactions and remote commands:
              </div>
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="text-cyan-400 font-bold">{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-200 text-xs font-semibold">{log.details}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    By: <strong>{log.user}</strong> ({log.role.toUpperCase()})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
