import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Layers,
  Zap,
  CheckCircle2,
  XCircle,
  FileText,
  IndianRupee,
  Share2,
  Download,
  Calendar,
  Filter,
  Check,
  X,
  FileSpreadsheet,
  AlertTriangle,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';

type TimeRange = '24h' | '7d' | '30d' | 'all';
type ExportFormat = 'json' | 'csv';

export const AnalyticsView: React.FC = () => {
  const { printers, activePrinter, filaments, faults } = usePrinter();
  const [historyFilter, setHistoryFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [exportSuccessNotice, setExportSuccessNotice] = useState<string | null>(null);

  // Full dataset of historical jobs with dates covering multiple time ranges
  const rawHistoryJobs = [
    {
      id: 'job-h-01',
      file: 'bracket_reinforced_v2.gcode',
      printer: 'PRUSA-FDM-01',
      duration: '4h 12m',
      filament: '142g PLA',
      filamentGrams: 142,
      material: 'PLA',
      status: 'success',
      powerCost: '₹34.50',
      powerCostNum: 34.5,
      date: '2026-09-22 09:15',
    },
    {
      id: 'job-h-02',
      file: 'fan_duct_highflow.gcode',
      printer: 'VORON-2.4-IND',
      duration: '2h 05m',
      filament: '68g ABS',
      filamentGrams: 68,
      material: 'ABS',
      status: 'success',
      powerCost: '₹22.10',
      powerCostNum: 22.1,
      date: '2026-09-21 18:30',
    },
    {
      id: 'job-h-03',
      file: 'chassis_spacer_plate.gcode',
      printer: 'ENDER-PRO-02',
      duration: '1h 14m',
      filament: '32g PETG',
      filamentGrams: 32,
      material: 'PETG',
      status: 'failed',
      failureReason: 'Thermal runaway error (E0 heater drift)',
      powerCost: '₹12.00',
      powerCostNum: 12.0,
      date: '2026-09-21 14:02',
    },
    {
      id: 'job-h-04',
      file: 'sensor_housing_mount.gcode',
      printer: 'PRUSA-FDM-01',
      duration: '3h 45m',
      filament: '110g PLA',
      filamentGrams: 110,
      material: 'PLA',
      status: 'success',
      powerCost: '₹28.40',
      powerCostNum: 28.4,
      date: '2026-09-20 11:20',
    },
    {
      id: 'job-h-05',
      file: 'planetary_gearbox_stage1.gcode',
      printer: 'BAMBU-X1C-FARM',
      duration: '5h 50m',
      filament: '210g PA-CF',
      filamentGrams: 210,
      material: 'PA-CF',
      status: 'success',
      powerCost: '₹62.00',
      powerCostNum: 62.0,
      date: '2026-09-19 20:10',
    },
    {
      id: 'job-h-06',
      file: 'test_cube_20mm.gcode',
      printer: 'ENDER-PRO-02',
      duration: '0h 25m',
      filament: '12g PLA',
      filamentGrams: 12,
      material: 'PLA',
      status: 'failed',
      failureReason: 'Bed adhesion loss / Part detachment',
      powerCost: '₹4.50',
      powerCostNum: 4.5,
      date: '2026-09-18 16:45',
    },
    {
      id: 'job-h-07',
      file: 'bearing_carrier_block.gcode',
      printer: 'PRUSA-FDM-01',
      duration: '3h 10m',
      filament: '95g PETG',
      filamentGrams: 95,
      material: 'PETG',
      status: 'success',
      powerCost: '₹26.80',
      powerCostNum: 26.8,
      date: '2026-09-14 10:30',
    },
    {
      id: 'job-h-08',
      file: 'cooling_nozzle_aeroshroud.gcode',
      printer: 'VORON-2.4-IND',
      duration: '4h 40m',
      filament: '135g ABS',
      filamentGrams: 135,
      material: 'ABS',
      status: 'success',
      powerCost: '₹38.20',
      powerCostNum: 38.2,
      date: '2026-09-08 15:45',
    },
    {
      id: 'job-h-09',
      file: 'lead_screw_anti_backlash_nut.gcode',
      printer: 'BAMBU-X1C-FARM',
      duration: '1h 55m',
      filament: '48g PA-CF',
      filamentGrams: 48,
      material: 'PA-CF',
      status: 'success',
      powerCost: '₹21.50',
      powerCostNum: 21.5,
      date: '2026-08-30 12:10',
    },
    {
      id: 'job-h-10',
      file: 'spool_holder_roller_bracket.gcode',
      printer: 'ENDER-PRO-02',
      duration: '6h 15m',
      filament: '185g PLA',
      filamentGrams: 185,
      material: 'PLA',
      status: 'success',
      powerCost: '₹42.00',
      powerCostNum: 42.0,
      date: '2026-08-16 09:00',
    },
  ];

  // Helper to test if a date string falls inside the chosen timeRange
  const isDateInRange = (dateStr: string, range: TimeRange): boolean => {
    if (range === 'all') return true;
    const targetDate = new Date(dateStr).getTime();
    if (isNaN(targetDate)) return true;

    // Fixed mock timestamp anchor: September 22, 2026 21:00
    const now = new Date('2026-09-22T21:00:00Z').getTime();
    const diffHours = (now - targetDate) / (1000 * 60 * 60);

    if (range === '24h') return diffHours <= 24;
    if (range === '7d') return diffHours <= 7 * 24;
    if (range === '30d') return diffHours <= 30 * 24;
    return true;
  };

  // Filtered jobs according to chosen time range
  const jobsInRange = useMemo(() => {
    return rawHistoryJobs.filter((j) => isDateInRange(j.date, timeRange));
  }, [timeRange]);

  // Filtered faults according to chosen time range
  const faultsInRange = useMemo(() => {
    return faults.filter((f) => isDateInRange(f.timestamp, timeRange));
  }, [faults, timeRange]);

  // Filament stats aggregated for the chosen time range
  const filamentStats = useMemo(() => {
    let totalGrams = 0;
    const byMaterial: Record<string, number> = {};

    jobsInRange.forEach((job) => {
      totalGrams += job.filamentGrams;
      byMaterial[job.material] = (byMaterial[job.material] || 0) + job.filamentGrams;
    });

    const activeSpoolsSummary = filaments.map((s) => ({
      id: s.id,
      name: s.name,
      material: s.material,
      brand: s.brand,
      remainingGrams: s.remainingGrams,
      totalGrams: s.totalGrams,
      remainingPercent: Math.round((s.remainingGrams / s.totalGrams) * 100),
      colorName: s.colorName,
      status: s.loaded ? 'Loaded on Active Toolhead' : 'In Storage Carousel',
      rfidTag: s.rfidTag || 'N/A',
    }));

    return {
      totalGrams,
      totalKg: (totalGrams / 1000).toFixed(2),
      byMaterial,
      spools: activeSpoolsSummary,
    };
  }, [jobsInRange, filaments]);

  // Status-filtered jobs for table display
  const displayedHistory = useMemo(() => {
    return jobsInRange.filter((j) => {
      if (historyFilter === 'all') return true;
      return j.status === historyFilter;
    });
  }, [jobsInRange, historyFilter]);

  // Dynamic KPI calculation
  const totalJobsCount = jobsInRange.length;
  const successJobsCount = jobsInRange.filter((j) => j.status === 'success').length;
  const successRate = totalJobsCount > 0 ? ((successJobsCount / totalJobsCount) * 100).toFixed(1) : '100.0';
  const totalEnergyCost = jobsInRange.reduce((sum, j) => sum + j.powerCostNum, 0);

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case '24h':
        return 'Last 24 Hours';
      case '7d':
        return 'Last 7 Days';
      case '30d':
        return 'Last 30 Days';
      case 'all':
        return 'All Time History';
    }
  };

  // Export handlers
  const handleDownloadReport = () => {
    const timeLabel = getTimeRangeLabel(timeRange);
    const dateFormatted = new Date().toISOString().replace(/[:.]/g, '-');
    const institution = 'Kamala Institute of Technology and Science • Mechanical Department';

    if (exportFormat === 'json') {
      const exportObject = {
        reportHeader: {
          institution,
          title: 'VoxelSync IIoT Fleet Performance & Analytics Audit Report',
          selectedTimeRange: timeRange,
          timeRangeLabel: timeLabel,
          exportDate: new Date().toISOString(),
          generatedBy: 'Lab Lead / Department Operator',
        },
        summaryKPIs: {
          totalPrintJobs: totalJobsCount,
          successfulJobs: successJobsCount,
          failedJobs: totalJobsCount - successJobsCount,
          successRatePercent: Number(successRate),
          filamentConsumedGrams: filamentStats.totalGrams,
          totalPowerCostInr: totalEnergyCost.toFixed(2),
          activeFaultLogsCount: faultsInRange.length,
        },
        printHistory: jobsInRange.map((j) => ({
          jobId: j.id,
          fileName: j.file,
          printer: j.printer,
          duration: j.duration,
          filamentUsed: j.filament,
          filamentGrams: j.filamentGrams,
          material: j.material,
          status: j.status,
          failureReason: j.failureReason || null,
          powerCost: j.powerCost,
          completionDate: j.date,
        })),
        filamentUsageStatistics: {
          totalGramsConsumed: filamentStats.totalGrams,
          totalKilograms: filamentStats.totalKg,
          consumptionByMaterial: filamentStats.byMaterial,
          spoolInventory: filamentStats.spools,
        },
        faultLogs: faultsInRange.map((f) => ({
          faultId: f.id,
          faultCode: f.faultCode,
          faultType: f.faultType,
          severity: f.severity,
          machineId: f.machineId,
          machineName: f.machineName,
          status: f.status,
          timestamp: f.timestamp,
          resolvedAt: f.resolvedAt || null,
          resolvedBy: f.resolvedBy || null,
          description: f.description,
          possibleCause: f.possibleCause || null,
          recommendedAction: f.recommendedAction || null,
        })),
      };

      const jsonStr = JSON.stringify(exportObject, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VoxelSync_Analytics_Report_${timeRange}_${dateFormatted}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Build structured CSV with clear section blocks
      const csvLines: string[] = [];

      // Header block
      csvLines.push(`"VOXELSYNC IIOT ANALYTICS REPORT - ${institution}"`);
      csvLines.push(`"Report Time Window","${timeLabel}"`);
      csvLines.push(`"Generated Timestamp","${new Date().toISOString()}"`);
      csvLines.push(`"Success Rate","${successRate}% (${successJobsCount}/${totalJobsCount} jobs)"`);
      csvLines.push(`"Total Energy Cost","₹${totalEnergyCost.toFixed(2)}"`);
      csvLines.push('');

      // Section 1: Print History
      csvLines.push('--- SECTION 1: PRINT JOB HISTORY ---');
      csvLines.push(
        ['Job ID', 'File Name', 'Printer / Machine', 'Duration', 'Filament', 'Status', 'Failure Reason', 'Power Cost (INR)', 'Completion Date']
          .map((h) => `"${h}"`)
          .join(',')
      );
      jobsInRange.forEach((j) => {
        csvLines.push(
          [
            j.id,
            j.file,
            j.printer,
            j.duration,
            j.filament,
            j.status.toUpperCase(),
            j.failureReason || 'None',
            j.powerCost,
            j.date,
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(',')
        );
      });
      csvLines.push('');

      // Section 2: Filament Consumption By Material
      csvLines.push('--- SECTION 2: FILAMENT USAGE STATISTICS ---');
      csvLines.push(`"Total Filament Consumed in Window","${filamentStats.totalGrams} g (${filamentStats.totalKg} kg)"`);
      csvLines.push(['Material Type', 'Grams Consumed', 'Share (%)'].map((h) => `"${h}"`).join(','));
      Object.entries(filamentStats.byMaterial).forEach(([mat, grams]) => {
        const share = filamentStats.totalGrams > 0 ? ((grams / filamentStats.totalGrams) * 100).toFixed(1) : '0';
        csvLines.push([mat, `${grams}g`, `${share}%`].map((v) => `"${v}"`).join(','));
      });
      csvLines.push('');

      // Section 2.1: Active Spool Inventory
      csvLines.push('--- SECTION 2.1: SPOOL INVENTORY LEDGER ---');
      csvLines.push(
        ['Spool ID', 'Spool Name', 'Material', 'Brand', 'Remaining (g)', 'Total (g)', 'Remaining %', 'Location / Status', 'RFID Tag']
          .map((h) => `"${h}"`)
          .join(',')
      );
      filamentStats.spools.forEach((s) => {
        csvLines.push(
          [
            s.id,
            s.name,
            s.material,
            s.brand,
            s.remainingGrams,
            s.totalGrams,
            `${s.remainingPercent}%`,
            s.status,
            s.rfidTag,
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(',')
        );
      });
      csvLines.push('');

      // Section 3: Machine Fault & Anomaly Logs
      csvLines.push('--- SECTION 3: MACHINE FAULT & ANOMALY LOGS ---');
      csvLines.push(
        ['Fault ID', 'Fault Code', 'Type', 'Severity', 'Machine', 'Status', 'Timestamp', 'Resolved At', 'Description', 'Possible Cause', 'Action']
          .map((h) => `"${h}"`)
          .join(',')
      );
      faultsInRange.forEach((f) => {
        csvLines.push(
          [
            f.id,
            f.faultCode,
            f.faultType,
            f.severity.toUpperCase(),
            f.machineName,
            f.status.toUpperCase(),
            f.timestamp,
            f.resolvedAt || 'Active / Unresolved',
            f.description,
            f.possibleCause || 'Under Investigation',
            f.recommendedAction || 'Refer to maintenance runbook',
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(',')
        );
      });

      const csvContent = csvLines.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VoxelSync_Analytics_Report_${timeRange}_${dateFormatted}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    setExportSuccessNotice(`Successfully exported report (${exportFormat.toUpperCase()}) for ${timeLabel}`);
    setTimeout(() => {
      setExportSuccessNotice(null);
      setExportModalOpen(false);
    }, 1600);
  };

  return (
    <div className="space-y-4">
      {/* Top Header with Time Range Selector & Export Report Button */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-tech font-bold text-white tracking-wide">
              Fleet Performance & Production Telemetry Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Kamala Institute of Technology and Science • Mechanical Department • FDM IIoT Smart Factory
          </p>
        </div>

        {/* Action Controls: Time Range Selector & Export Button */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          {/* Time Range Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-0.5" />
            {(['24h', '7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === r
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === '24h' ? '24h' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All'}
              </button>
            ))}
          </div>

          {/* Export Report Trigger Button */}
          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-tech font-bold text-xs shadow-md shadow-cyan-600/30 transition-all active:scale-95 border border-cyan-400/40"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {exportSuccessNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 font-mono text-xs flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportSuccessNotice}</span>
          </div>
          <button onClick={() => setExportSuccessNotice(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>PRINT SUCCESS RATE</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-tech font-bold text-emerald-400">{successRate}%</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            {successJobsCount} of {totalJobsCount} jobs completed ({getTimeRangeLabel(timeRange)})
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>TOTAL JOBS RUN</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-tech font-bold text-white">{totalJobsCount}</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Across {printers.length} workcells
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>FILAMENT DISPENSED</span>
            <Share2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-tech font-bold text-amber-400">{filamentStats.totalGrams} g</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            {filamentStats.totalKg} kg consumed in period
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>ENERGY EXPENDITURE</span>
            <IndianRupee className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-tech font-bold text-purple-400">₹{totalEnergyCost.toFixed(2)}</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Est. rate @ ₹9.0/kWh
          </div>
        </div>
      </div>

      {/* Analytics Breakdown: Failures & Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Failure Breakdown */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-tech font-bold text-sm text-white">
              Root Cause Failure Frequency Breakdown
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {faultsInRange.length} Active/Logged Events
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Bed Adhesion Loss / First-Layer Warping:</span>
                <span className="text-cyan-400 font-bold">45% (9 incidents)</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Extruder Jam / Heat Creep Clogging:</span>
                <span className="text-amber-400 font-bold">30% (6 incidents)</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Thermal Runaway / Heater Cartridge Drift:</span>
                <span className="text-rose-400 font-bold">15% (3 incidents)</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Power Outage / Edge Gateway Disconnect:</span>
                <span className="text-purple-400 font-bold">10% (2 incidents)</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Utilization Breakdown */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="font-tech font-bold text-sm text-white mb-3">
            Individual Machine Utilization (OEE)
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {printers.map((p) => {
              const utilPercent =
                p.id === 'PRUSA-FDM-01' ? 88 : p.id === 'VORON-2.4-IND' ? 82 : p.id === 'BAMBU-X1C-FARM' ? 76 : 54;
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>
                      {p.name} ({p.model}):
                    </span>
                    <span className="text-cyan-400 font-bold">{utilPercent}% Active</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${utilPercent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Historical Print Job Ledger */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-3">
          <div>
            <h3 className="font-tech font-bold text-sm text-white">
              Historical Job Execution Audit Ledger
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Showing {displayedHistory.length} records for period: {getTimeRangeLabel(timeRange)}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {(['all', 'success', 'failed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setHistoryFilter(filter)}
                className={`px-2.5 py-0.5 rounded capitalize ${
                  historyFilter === filter
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">File Name</th>
                <th className="p-2.5">Machine</th>
                <th className="p-2.5">Duration</th>
                <th className="p-2.5">Filament</th>
                <th className="p-2.5">Power Cost</th>
                <th className="p-2.5">Completed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {displayedHistory.length > 0 ? (
                displayedHistory.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-2.5">
                      {job.status === 'success' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          SUCCESS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                          FAILED
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-bold text-white">
                      {job.file}
                      {job.failureReason && (
                        <div className="text-[10px] text-rose-400 font-normal mt-0.5">{job.failureReason}</div>
                      )}
                    </td>
                    <td className="p-2.5 text-cyan-300">{job.printer}</td>
                    <td className="p-2.5">{job.duration}</td>
                    <td className="p-2.5">{job.filament}</td>
                    <td className="p-2.5 text-purple-300 font-bold">{job.powerCost}</td>
                    <td className="p-2.5 text-slate-400">{job.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 font-mono">
                    No print history records found for the selected {getTimeRangeLabel(timeRange)} window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Report Configuration Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 font-mono text-xs text-slate-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Download className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-base font-tech font-bold text-white">Export Analytics Report</h2>
                  <div className="text-[11px] text-slate-400">
                    Kamala Institute of Technology and Science • Mechanical Dept
                  </div>
                </div>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Time Range Selection */}
            <div className="mt-4">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                1. Select Time Range Window
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['24h', '7d', '30d', 'all'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`py-2 px-2 rounded-xl border text-center font-bold transition-all ${
                      timeRange === r
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {r === '24h' ? '24 Hours' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Format Selector */}
            <div className="mt-4">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                2. Select Export File Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    exportFormat === 'csv'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white text-xs">CSV Spreadsheet (.csv)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Formatted tables for Excel, Google Sheets, or CAD audit.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setExportFormat('json')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    exportFormat === 'json'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <FileText className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white text-xs">Raw JSON Document (.json)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Hierarchical telemetry payload for automated IIoT pipelines.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Included Data Preview Summary */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Report Payload Breakdown ({getTimeRangeLabel(timeRange)}):</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">PRINT HISTORY</div>
                  <div className="text-cyan-400 font-bold text-sm">{jobsInRange.length} Jobs</div>
                  <div className="text-[10px] text-slate-400">{successJobsCount} successful</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">FILAMENT STATS</div>
                  <div className="text-amber-400 font-bold text-sm">{filamentStats.totalGrams} g</div>
                  <div className="text-[10px] text-slate-400">{filamentStats.spools.length} Spools</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">FAULT LOGS</div>
                  <div className="text-rose-400 font-bold text-sm">{faultsInRange.length} Events</div>
                  <div className="text-[10px] text-slate-400">PID, thermal, sensor</div>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-tech font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Generate & Download {exportFormat.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
