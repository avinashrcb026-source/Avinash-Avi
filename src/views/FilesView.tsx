import React, { useState } from 'react';
import {
  FolderArchive,
  Upload,
  Play,
  Trash2,
  Clock,
  Layers,
  Search,
  CheckCircle2,
  FileCode,
  Share2,
  HardDrive,
  Database,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';
import { PrintFile } from '../types/printer';

interface FilesViewProps {
  onNavigate: (tab: string) => void;
  onOpenUsbSsdModal?: () => void;
  onOpenCadDataModal?: () => void;
}

export const FilesView: React.FC<FilesViewProps> = ({
  onNavigate,
  onOpenUsbSsdModal,
  onOpenCadDataModal,
}) => {
  const {
    files,
    printers,
    activePrinter,
    assignFileToPrinter,
    deletePrintFile,
    uploadPrintFile,
    startJob,
    canExecuteControl,
  } = usePrinter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMaterial, setFilterMaterial] = useState<string>('ALL');
  const [uploading, setUploading] = useState(false);

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredFiles = files.filter((f) => {
    if (filterMaterial !== 'ALL' && f.material !== filterMaterial) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.fileName.toLowerCase().includes(q) || f.material.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSimulatedFileUpload = () => {
    setUploading(true);
    setTimeout(() => {
      const randomLayers = Math.floor(200 + Math.random() * 400);
      const randomMinutes = Math.floor(60 + Math.random() * 180);
      uploadPrintFile({
        fileName: `custom_manifold_bracket_rev${Math.floor(Math.random() * 10)}.gcode`,
        fileSizeBytes: 14200000,
        layerCount: randomLayers,
        estimatedSeconds: randomMinutes * 60,
        filamentGrams: Number((randomMinutes * 0.45).toFixed(1)),
        filamentMeters: Number((randomMinutes * 0.15).toFixed(1)),
        material: 'PLA',
        slicer: 'PrusaSlicer 2.7.2',
        version: '1.0',
        description: 'Uploaded via Web UI',
        assignedPrinterId: activePrinter.id,
        printCount: 0,
      });
      setUploading(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-tech font-bold text-white">
              Cloud Print File & G-Code Repository
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cloud sliced artifacts • Integrated geometry preview, thermal profile pairing, and fleet job assignment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => onOpenUsbSsdModal?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/50 font-tech font-bold transition-all shadow-sm active:scale-95"
            title="Browse CAD models and G-code on connected USB & NVMe SSD storage"
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>USB / SSD CAD Access</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
          </button>

          <button
            onClick={() => onOpenCadDataModal?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-500/50 font-tech font-bold transition-all shadow-sm active:scale-95"
            title="Browse central department CAD model library"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>CAD Data Access</span>
          </button>

          <button
            onClick={handleSimulatedFileUpload}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Parsing G-Code...' : 'Upload G-Code File'}
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search gcode, model, material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 px-1">Material:</span>
          {['ALL', 'PLA', 'PETG', 'ABS', 'TPU', 'PA-CF'].map((mat) => (
            <button
              key={mat}
              onClick={() => setFilterMaterial(mat)}
              className={`px-2 py-0.5 rounded capitalize ${
                filterMaterial === mat
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mat}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredFiles.map((file) => {
          const isAssignedToActive = file.assignedPrinterId === activePrinter.id;
          return (
            <div
              key={file.id}
              className={`p-4 rounded-xl border transition-all text-xs font-mono flex flex-col justify-between ${
                isAssignedToActive
                  ? 'bg-slate-950 border-cyan-400/80 shadow-md shadow-cyan-950/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-tech font-bold text-sm text-white truncate max-w-[180px]">
                        {file.fileName}
                      </h3>
                      <div className="text-[10px] text-slate-400">
                        {(file.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB • Uploaded {file.uploadDate}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deletePrintFile(file.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500">EST. TIME</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{formatSeconds(file.estimatedSeconds)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">LAYERS</div>
                    <div className="font-bold text-white mt-0.5">{file.layerCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">FILAMENT</div>
                    <div className="font-bold text-cyan-400 mt-0.5">{file.filamentGrams}g</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Material: <strong className="text-slate-200">{file.material}</strong></span>
                  <span>Print History: <strong className="text-slate-200">{file.printCount ?? 1}x</strong></span>
                </div>
              </div>

              {/* Assignment & Print Dispatch */}
              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <select
                  value={file.assignedPrinterId || ''}
                  onChange={(e) => assignFileToPrinter(file.id, e.target.value)}
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-mono focus:border-cyan-400 max-w-[140px]"
                >
                  <option value="">Queue to Machine...</option>
                  {printers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    startJob(file.id);
                    onNavigate('dashboard');
                  }}
                  disabled={!canExecuteControl}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold text-xs shadow disabled:opacity-50"
                >
                  <Play className="w-3 h-3" />
                  Print Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
