import React, { useState } from 'react';
import {
  HardDrive,
  Usb,
  Database,
  Layers,
  FileCode,
  Download,
  Upload,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronRight,
  Sparkles,
  Folder,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Disc,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';

export interface CadModelItem {
  id: string;
  name: string;
  format: 'STEP' | 'STL' | 'IGES' | '3MF' | 'SLDPRT' | 'GCODE';
  fileSizeMb: number;
  category: string;
  dimensionsMm: string;
  volumeCm3: number;
  triangleCount: number;
  recommendedMaterial: string;
  revision: string;
  departmentProject: string;
  dateAdded: string;
  sourceDevice?: string;
  isGcode?: boolean;
}

interface CadStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'usb_ssd' | 'cad_data';
  onSelectModelForSlicing?: (modelName: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const CadStorageModal: React.FC<CadStorageModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'usb_ssd',
  onSelectModelForSlicing,
  onNavigateToTab,
}) => {
  const { activePrinter, uploadPrintFile, startJob } = usePrinter();

  const [activeTab, setActiveTab] = useState<'usb_ssd' | 'cad_data'>(initialTab);
  const [selectedDriveId, setSelectedDriveId] = useState<'usb_front' | 'ssd_nvme' | 'usb_rear'>('ssd_nvme');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [scanning, setScanning] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Synchronize initialTab if changed externally
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  // Connected physical drives list
  const connectedDrives = [
    {
      id: 'ssd_nvme' as const,
      name: 'Samsung 980 PRO M.2 NVMe SSD (1TB)',
      type: 'Industrial NVMe SSD',
      mountPoint: '/mnt/cad_nvme',
      totalGb: 1000,
      usedGb: 342.8,
      readSpeed: '1,050 MB/s',
      writeSpeed: '920 MB/s',
      health: '100% SMART Good (38°C)',
      status: 'Mounted (Read/Write)',
      filesystem: 'ext4 / Direct DMA',
    },
    {
      id: 'usb_front' as const,
      name: 'SanDisk Extreme Pro 3.2 Gen2 (64GB)',
      type: 'Front Panel USB 3.2',
      mountPoint: '/media/usb0',
      totalGb: 64,
      usedGb: 28.4,
      readSpeed: '420 MB/s',
      writeSpeed: '380 MB/s',
      health: 'Optimal (Clean FS)',
      status: 'Mounted (Active)',
      filesystem: 'FAT32 (Industrial exFAT compliant)',
    },
    {
      id: 'usb_rear' as const,
      name: 'Kingston DataTraveler Max (128GB)',
      type: 'Rear Edge Gateway Port',
      mountPoint: '/media/usb1',
      totalGb: 128,
      usedGb: 14.1,
      readSpeed: '310 MB/s',
      writeSpeed: '220 MB/s',
      health: 'Optimal',
      status: 'Mounted (Standby)',
      filesystem: 'NTFS / Klipper Virtual SD',
    },
  ];

  // Files residing on the connected physical drives
  const driveFiles: Record<string, CadModelItem[]> = {
    ssd_nvme: [
      {
        id: 'nvme-01',
        name: 'Turbine_Impeller_V2.step',
        format: 'STEP',
        fileSizeMb: 18.4,
        category: 'Aerospace & Turbomachinery',
        dimensionsMm: '110 × 110 × 42 mm',
        volumeCm3: 58.2,
        triangleCount: 84200,
        recommendedMaterial: 'PA-CF (Nylon Carbon Fiber)',
        revision: 'Rev 2.4 - CFD Verified',
        departmentProject: 'KITS Advanced Propulsion Lab',
        dateAdded: '2026-09-22 14:10',
        sourceDevice: 'Industrial NVMe SSD',
      },
      {
        id: 'nvme-02',
        name: 'robotic_gripper_finger_joint.step',
        format: 'STEP',
        fileSizeMb: 8.7,
        category: 'Robotics & Mechatronics',
        dimensionsMm: '72 × 34 × 22 mm',
        volumeCm3: 24.5,
        triangleCount: 38100,
        recommendedMaterial: 'PETG / Tough PLA',
        revision: 'Rev 1.8',
        departmentProject: 'Mechanical Dept Robotics Cell',
        dateAdded: '2026-09-21 11:30',
        sourceDevice: 'Industrial NVMe SSD',
      },
      {
        id: 'nvme-03',
        name: 'planetary_gearbox_housing_stage1.3mf',
        format: '3MF',
        fileSizeMb: 12.1,
        category: 'Powertrain & Gears',
        dimensionsMm: '124 × 124 × 58 mm',
        volumeCm3: 88.0,
        triangleCount: 112000,
        recommendedMaterial: 'ABS (Heat Resistant)',
        revision: 'Rev 3.0',
        departmentProject: 'Machine Design Studio',
        dateAdded: '2026-09-20 16:45',
        sourceDevice: 'Industrial NVMe SSD',
      },
      {
        id: 'nvme-04',
        name: 'bearing_carrier_block_precal.gcode',
        format: 'GCODE',
        fileSizeMb: 16.2,
        category: 'Pre-Sliced Direct Print',
        dimensionsMm: '85 × 85 × 35 mm',
        volumeCm3: 45.0,
        triangleCount: 0,
        recommendedMaterial: 'PLA',
        revision: 'G-Code Ready',
        departmentProject: 'Lab Tooling',
        dateAdded: '2026-09-22 08:15',
        sourceDevice: 'Industrial NVMe SSD',
        isGcode: true,
      },
    ],
    usb_front: [
      {
        id: 'usb-01',
        name: 'hexacopter_motor_bracket_v4.step',
        format: 'STEP',
        fileSizeMb: 6.8,
        category: 'Aerospace & Turbomachinery',
        dimensionsMm: '84 × 62 × 18 mm',
        volumeCm3: 18.2,
        triangleCount: 29400,
        recommendedMaterial: 'PETG / PA-CF',
        revision: 'Rev 4.1',
        departmentProject: 'UAV Capstone Project',
        dateAdded: '2026-09-22 17:02',
        sourceDevice: 'Front Panel USB 3.2',
      },
      {
        id: 'usb-02',
        name: 'iiot_bme280_sensor_enclosure.stl',
        format: 'STL',
        fileSizeMb: 4.2,
        category: 'IIoT Enclosures',
        dimensionsMm: '60 × 45 × 25 mm',
        volumeCm3: 14.8,
        triangleCount: 22600,
        recommendedMaterial: 'PLA',
        revision: 'Rev 2.0',
        departmentProject: 'Smart Factory Node Deployment',
        dateAdded: '2026-09-22 16:20',
        sourceDevice: 'Front Panel USB 3.2',
      },
      {
        id: 'usb-03',
        name: 'bracket_reinforced_v3_fast.gcode',
        format: 'GCODE',
        fileSizeMb: 14.8,
        category: 'Pre-Sliced Direct Print',
        dimensionsMm: '95 × 80 × 30 mm',
        volumeCm3: 38.0,
        triangleCount: 0,
        recommendedMaterial: 'PLA',
        revision: 'G-Code Ready',
        departmentProject: 'Quick Prototype Run',
        dateAdded: '2026-09-22 15:40',
        sourceDevice: 'Front Panel USB 3.2',
        isGcode: true,
      },
    ],
    usb_rear: [
      {
        id: 'rear-01',
        name: 'linear_rail_mgn12_alignment_jig.step',
        format: 'STEP',
        fileSizeMb: 3.5,
        category: 'Lab Tooling',
        dimensionsMm: '150 × 24 × 12 mm',
        volumeCm3: 11.2,
        triangleCount: 16800,
        recommendedMaterial: 'PLA Tough',
        revision: 'Rev 1.0',
        departmentProject: 'Maintenance Jigs',
        dateAdded: '2026-09-18 10:15',
        sourceDevice: 'Rear USB',
      },
      {
        id: 'rear-02',
        name: 'filament_spool_roller_bearing.3mf',
        format: '3MF',
        fileSizeMb: 5.1,
        category: 'Lab Tooling',
        dimensionsMm: '90 × 90 × 20 mm',
        volumeCm3: 22.0,
        triangleCount: 31000,
        recommendedMaterial: 'PETG',
        revision: 'Rev 2.2',
        departmentProject: 'Filament Management System',
        dateAdded: '2026-09-17 14:30',
        sourceDevice: 'Rear USB',
      },
    ],
  };

  // Central CAD Data Repository Items
  const centralCadRepository: CadModelItem[] = [
    {
      id: 'repo-01',
      name: 'Turbine_Impeller_V2.step',
      format: 'STEP',
      fileSizeMb: 18.4,
      category: 'Aerospace & Turbomachinery',
      dimensionsMm: '110 × 110 × 42 mm',
      volumeCm3: 58.2,
      triangleCount: 84200,
      recommendedMaterial: 'PA-CF',
      revision: 'Rev 2.4 - Approved',
      departmentProject: 'Aerodynamics & Fluid Power Lab',
      dateAdded: '2026-09-22',
    },
    {
      id: 'repo-02',
      name: 'robotic_gripper_finger_joint.step',
      format: 'STEP',
      fileSizeMb: 8.7,
      category: 'Robotics & Mechatronics',
      dimensionsMm: '72 × 34 × 22 mm',
      volumeCm3: 24.5,
      triangleCount: 38100,
      recommendedMaterial: 'PETG / TPU 95A',
      revision: 'Rev 1.8 - Approved',
      departmentProject: 'Mechatronics Capstone',
      dateAdded: '2026-09-21',
    },
    {
      id: 'repo-03',
      name: 'planetary_gearbox_housing_stage1.3mf',
      format: '3MF',
      fileSizeMb: 12.1,
      category: 'Powertrain & Gears',
      dimensionsMm: '124 × 124 × 58 mm',
      volumeCm3: 88.0,
      triangleCount: 112000,
      recommendedMaterial: 'ABS Heat Resistant',
      revision: 'Rev 3.0 - Standardized',
      departmentProject: 'Department Machine Tool Hub',
      dateAdded: '2026-09-20',
    },
    {
      id: 'repo-04',
      name: 'iiot_bme280_sensor_enclosure.stl',
      format: 'STL',
      fileSizeMb: 4.2,
      category: 'IIoT Enclosures',
      dimensionsMm: '60 × 45 × 25 mm',
      volumeCm3: 14.8,
      triangleCount: 22600,
      recommendedMaterial: 'PLA',
      revision: 'Rev 2.0 - Certified',
      departmentProject: 'KITS Smart Campus IoT Deployment',
      dateAdded: '2026-09-19',
    },
    {
      id: 'repo-05',
      name: 'tensile_test_dogbone_astm_d638.step',
      format: 'STEP',
      fileSizeMb: 2.8,
      category: 'Materials Testing Standards',
      dimensionsMm: '165 × 19 × 3.2 mm',
      volumeCm3: 8.4,
      triangleCount: 14500,
      recommendedMaterial: 'Standard Calibration Specimen',
      revision: 'ASTM D638 Type I Standard',
      departmentProject: 'Strength of Materials Lab',
      dateAdded: '2026-09-15',
    },
    {
      id: 'repo-06',
      name: 'venturi_vacuum_ejector_pump.step',
      format: 'STEP',
      fileSizeMb: 7.4,
      category: 'Aerospace & Turbomachinery',
      dimensionsMm: '95 × 38 × 38 mm',
      volumeCm3: 21.6,
      triangleCount: 46200,
      recommendedMaterial: 'PETG High Chemical Resistance',
      revision: 'Rev 1.2',
      departmentProject: 'Fluid Mechanics Lab',
      dateAdded: '2026-09-12',
    },
  ];

  const currentDrive = connectedDrives.find((d) => d.id === selectedDriveId) || connectedDrives[0];
  const filesOnActiveDrive = driveFiles[selectedDriveId] || [];

  const filteredRepoFiles = centralCadRepository.filter((f) => {
    if (selectedCategory === 'ALL') return true;
    return f.category === selectedCategory;
  });

  const categories = [
    'ALL',
    'Aerospace & Turbomachinery',
    'Robotics & Mechatronics',
    'Powertrain & Gears',
    'IIoT Enclosures',
    'Materials Testing Standards',
  ];

  // Action handlers
  const handleSliceModel = (modelName: string) => {
    if (onSelectModelForSlicing) {
      onSelectModelForSlicing(modelName);
    }
    if (onNavigateToTab) {
      onNavigateToTab('slicer');
    }
    onClose();
  };

  const handleDirectPrintGcode = (file: CadModelItem) => {
    uploadPrintFile({
      fileName: file.name,
      fileSizeBytes: file.fileSizeMb * 1024 * 1024,
      layerCount: 220,
      estimatedSeconds: 5400,
      filamentGrams: 48,
      filamentMeters: 16.2,
      material: 'PLA',
      slicer: 'Direct USB/SSD Dispatch Engine',
      version: '1.0',
      description: `Loaded from ${file.sourceDevice || 'External Storage'}`,
      assignedPrinterId: activePrinter.id,
      printCount: 0,
    });
    startJob();
    setStatusNotice(`Dispatched "${file.name}" from ${file.sourceDevice} directly to ${activePrinter.name}!`);
    setTimeout(() => {
      setStatusNotice(null);
      if (onNavigateToTab) onNavigateToTab('dashboard');
      onClose();
    }, 1200);
  };

  const handleScanMedia = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setStatusNotice(`Drive scan complete: Synchronized 100% of CAD and G-Code artifacts from ${currentDrive.name}`);
      setTimeout(() => setStatusNotice(null), 3000);
    }, 800);
  };

  const handleDownloadCadFile = (fileName: string) => {
    const sampleCadContent = `// Kamala Institute of Technology and Science - Mechanical Department\n// CAD Model: ${fileName}\n// Format: Standard ISO 10303-21 STEP File\nISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('KITS Additive CAD Data'),'2;1');\nFILE_NAME('${fileName}','2026-09-22T21:00:00',('Lab Lead'),('Mechanical Dept'),'OpenCascade 7.8','VoxelSync Slicer','');\nENDSEC;\nDATA;\n#1=MANIFOLD_SOLID_BREP('${fileName}',#2);\nENDSEC;\nEND-ISO-10303-21;\n`;
    const blob = new Blob([sampleCadContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusNotice(`Downloaded CAD model "${fileName}" successfully.`);
    setTimeout(() => setStatusNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs text-slate-200">
        {/* Modal Top Ribbon Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-950/90 via-slate-900 to-cyan-950/90 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {activeTab === 'usb_ssd' ? (
                <HardDrive className="w-5 h-5 text-cyan-400" />
              ) : (
                <Database className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-tech font-bold text-white tracking-wide">
                  {activeTab === 'usb_ssd' ? 'USB / SSD CAD Storage Access Hub' : 'Department CAD Data Repository'}
                </h2>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-800">
                  {activeTab === 'usb_ssd' ? 'Direct Hardware Bus' : 'Central CAD Archive'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Kamala Institute of Technology and Science • Mechanical Department • FDM Workcell Storage
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('usb_ssd')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'usb_ssd'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Usb className="w-3.5 h-3.5" />
                <span>USB / SSD Access</span>
              </button>
              <button
                onClick={() => setActiveTab('cad_data')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'cad_data'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>CAD Data Access</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Notice Alert if present */}
        {statusNotice && (
          <div className="px-4 py-2 bg-emerald-950/80 border-b border-emerald-500/60 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusNotice}</span>
            </div>
            <button onClick={() => setStatusNotice(null)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TAB 1: USB / SSD Physical Media Access */}
        {activeTab === 'usb_ssd' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Drive Selection Ribbon */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5 text-cyan-400" />
                  Connected Storage Media ({connectedDrives.length} Detected)
                </span>
                <button
                  onClick={handleScanMedia}
                  disabled={scanning}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                  <span>{scanning ? 'Scanning Bus...' : 'Scan / Refresh Media'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {connectedDrives.map((drive) => {
                  const isSelected = drive.id === selectedDriveId;
                  const usedPercent = Math.round((drive.usedGb / drive.totalGb) * 100);

                  return (
                    <button
                      key={drive.id}
                      onClick={() => setSelectedDriveId(drive.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                        isSelected
                          ? 'bg-slate-950 border-cyan-400 shadow-md ring-1 ring-cyan-400/40 text-cyan-100'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] font-mono text-cyan-300 border border-slate-800">
                          {drive.type}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      </div>
                      <div className="font-bold text-white text-xs truncate" title={drive.name}>
                        {drive.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                        <span>{drive.usedGb} GB / {drive.totalGb} GB</span>
                        <span className="text-cyan-400 font-bold">{usedPercent}% Used</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                          style={{ width: `${usedPercent}%` }}
                        ></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Drive Specs Bar */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <div className="text-slate-500 text-[10px]">MOUNT LOCATION</div>
                <div className="text-cyan-300 font-bold">{currentDrive.mountPoint}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">THROUGHPUT (READ / WRITE)</div>
                <div className="text-white font-bold">{currentDrive.readSpeed} / {currentDrive.writeSpeed}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">FILESYSTEM & BUS</div>
                <div className="text-slate-300 truncate">{currentDrive.filesystem}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">DRIVE HEALTH</div>
                <div className="text-emerald-400 font-bold">{currentDrive.health}</div>
              </div>
            </div>

            {/* Files List on Selected Physical Drive */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-cyan-400" />
                  CAD Geometries & Toolpaths on {currentDrive.name} ({filesOnActiveDrive.length} files)
                </span>
                <span className="text-[10px] text-slate-400">Direct Bus Ready • No Cloud Latency</span>
              </div>

              <div className="space-y-2">
                {filesOnActiveDrive.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg border shrink-0 ${
                          file.isGcode
                            ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                            : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                        }`}
                      >
                        {file.isGcode ? <FileCode className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{file.name}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                              file.isGcode
                                ? 'bg-purple-950 text-purple-300 border-purple-800'
                                : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            }`}
                          >
                            {file.format}
                          </span>
                          <span className="text-[10px] text-slate-400">{file.fileSizeMb} MB</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Dim: <strong className="text-slate-300">{file.dimensionsMm}</strong></span>
                          {!file.isGcode && (
                            <span>Vol: <strong className="text-cyan-400">{file.volumeCm3} cm³</strong></span>
                          )}
                          <span>Project: <strong className="text-slate-300">{file.departmentProject}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {file.isGcode ? (
                        <button
                          onClick={() => handleDirectPrintGcode(file)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-tech font-bold text-xs shadow-md transition-all active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Direct Print</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSliceModel(file.name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold text-xs shadow-md transition-all active:scale-95"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Slice in Cloud Slicer</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadCadFile(file.name)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                        title="Download file to client device"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Central CAD Data Access Portal */}
        {activeTab === 'cad_data' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* CAD Models Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredRepoFiles.map((model) => (
                <div
                  key={model.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 font-bold text-[10px] border border-cyan-800">
                        {model.format} • {model.fileSizeMb} MB
                      </span>
                      <span className="text-[10px] text-slate-400">{model.revision}</span>
                    </div>

                    <h3 className="font-tech font-bold text-white text-sm truncate" title={model.name}>
                      {model.name}
                    </h3>
                    <div className="text-[11px] text-cyan-400 font-medium mt-0.5">
                      {model.departmentProject}
                    </div>

                    {/* Geometric specifications */}
                    <div className="grid grid-cols-2 gap-2 mt-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px]">
                      <div>
                        <div className="text-slate-500">BOUNDING BOX</div>
                        <div className="text-slate-200 font-bold">{model.dimensionsMm}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">VOLUME & FACETS</div>
                        <div className="text-slate-200 font-bold">{model.volumeCm3} cm³ • {model.triangleCount.toLocaleString()} △</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-slate-500">RECOMMENDED RESIN / FILAMENT</div>
                        <div className="text-amber-400 font-bold">{model.recommendedMaterial}</div>
                      </div>
                    </div>
                  </div>

                  {/* Model Card Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleDownloadCadFile(model.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CAD</span>
                    </button>

                    <button
                      onClick={() => handleSliceModel(model.name)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold text-xs shadow-md shadow-cyan-600/30 transition-all active:scale-95"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Open in Slicer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Bottom Status Bar */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Industrial USB 3.2 & NVMe Host Controller: Online (DMA Zero-Copy Active)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
