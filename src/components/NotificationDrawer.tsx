import React, { useState } from 'react';
import { X, Bell, CheckCheck, Trash2, Volume2, VolumeX, AlertTriangle, Info, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadNotifsCount,
    markNotifAsRead,
    markAllNotifsAsRead,
    clearNotification,
    sendNotification,
    audioEnabled,
    setAudioEnabled,
    activePrinter,
  } = usePrinter();

  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.severity === filter;
  });

  const triggerTestAlert = () => {
    sendNotification({
      title: 'Manual Test Notification',
      message: `Diagnostic telemetry broadcast acknowledged by Cloud Broker for ${activePrinter.name}.`,
      severity: 'info',
      category: 'system',
      machineId: activePrinter.id,
    });
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-700 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-tech font-bold text-base text-white">Notification Center</h3>
              <p className="text-xs text-slate-400 font-mono">
                {unreadNotifsCount} unread alert{unreadNotifsCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title={audioEnabled ? 'Alarm Audio: On' : 'Alarm Audio: Off'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1">
            {(['all', 'critical', 'warning', 'info'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2 py-1 rounded capitalize transition-colors ${
                  filter === tab
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={markAllNotifsAsRead}
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 text-[11px]"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredNotifs.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
              <CheckCircle2 className="w-8 h-8 mb-2 text-slate-600" />
              No notifications matching filter.
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotifAsRead(n.id)}
                className={`p-3 rounded-xl border transition-all text-xs font-mono cursor-pointer ${
                  !n.read
                    ? 'bg-slate-950 border-cyan-500/40 shadow-sm shadow-cyan-950/40'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    {getIcon(n.severity)}
                    <span className="font-bold text-slate-200 font-tech">{n.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(n.id);
                      }}
                      className="p-1 text-slate-600 hover:text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed mb-1.5">{n.message}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span>{n.machineId || 'System'}</span>
                  <span className="uppercase text-slate-400 bg-slate-900 px-1 rounded">{n.category}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={triggerTestAlert}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Send Test Alert
          </button>
          <span className="text-[10px] text-slate-500 font-mono">Web + Push + MQTT</span>
        </div>
      </div>
    </div>
  );
};
