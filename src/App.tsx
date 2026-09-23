import React, { useState } from 'react';
import { PrinterProvider, usePrinter } from './context/PrinterContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DemoScenarioModal } from './components/DemoScenarioModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AuthModal } from './components/AuthModal';
import { EmergencyStopModal } from './components/EmergencyStopModal';
import { CadStorageModal } from './components/CadStorageModal';

// Views
import { DashboardView } from './views/DashboardView';
import { FleetView } from './views/FleetView';
import { LiveMonitorView } from './views/LiveMonitorView';
import { CameraMonitorView } from './views/CameraMonitorView';
import { RemoteControlView } from './views/RemoteControlView';
import { FilamentView } from './views/FilamentView';
import { FilesView } from './views/FilesView';
import { FaultAlertsView } from './views/FaultAlertsView';
import { SensorManagementView } from './views/SensorManagementView';
import { AnalyticsView } from './views/AnalyticsView';
import { MaintenanceView } from './views/MaintenanceView';
import { AiInsightsView } from './views/AiInsightsView';
import { CadSlicerWorkflowView } from './views/CadSlicerWorkflowView';
import { ArchitectureView } from './views/ArchitectureView';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [estopModalOpen, setEstopModalOpen] = useState(false);
  const [cadStorageModalOpen, setCadStorageModalOpen] = useState(false);
  const [cadStorageModalTab, setCadStorageModalTab] = useState<'usb_ssd' | 'cad_data'>('usb_ssd');
  const [preselectedModelForSlicer, setPreselectedModelForSlicer] = useState<string | null>(null);

  const handleOpenUsbSsd = () => {
    setCadStorageModalTab('usb_ssd');
    setCadStorageModalOpen(true);
  };

  const handleOpenCadData = () => {
    setCadStorageModalTab('cad_data');
    setCadStorageModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Main Industrial Header & Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenScenarioModal={() => setScenarioModalOpen(true)}
        onOpenNotifications={() => setNotificationDrawerOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenEstopModal={() => setEstopModalOpen(true)}
        onOpenUsbSsdModal={handleOpenUsbSsd}
        onOpenCadDataModal={handleOpenCadData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 pb-20 md:pb-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenEstop={() => setEstopModalOpen(true)}
            onOpenScenarioModal={() => setScenarioModalOpen(true)}
          />
        )}
        {currentTab === 'fleet' && <FleetView onNavigate={(tab) => setCurrentTab(tab)} />}
        {currentTab === 'live-monitor' && <LiveMonitorView />}
        {currentTab === 'camera' && <CameraMonitorView />}
        {currentTab === 'control' && <RemoteControlView onOpenEstop={() => setEstopModalOpen(true)} />}
        {currentTab === 'filament' && <FilamentView />}
        {currentTab === 'files' && (
          <FilesView
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenUsbSsdModal={handleOpenUsbSsd}
            onOpenCadDataModal={handleOpenCadData}
          />
        )}
        {currentTab === 'faults' && <FaultAlertsView />}
        {currentTab === 'sensors' && <SensorManagementView />}
        {currentTab === 'analytics' && <AnalyticsView />}
        {currentTab === 'maintenance' && <MaintenanceView />}
        {currentTab === 'ai-insights' && <AiInsightsView />}
        {currentTab === 'slicer' && (
          <CadSlicerWorkflowView
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenUsbSsdModal={handleOpenUsbSsd}
            onOpenCadDataModal={handleOpenCadData}
            preselectedModel={preselectedModelForSlicer}
          />
        )}
        {currentTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Engineering Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-3 text-center text-xs font-mono text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>Kamala Institute of Technology and Science • Mechanical Department</span>
          <span>VoxelSync IIoT Cloud Platform • Klipper & Marlin Bridge</span>
          <span>Status: All Microservices Operational</span>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Android & Mobile Viewports) */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenEstopModal={() => setEstopModalOpen(true)}
      />

      {/* Global Modals & Drawers */}
      <DemoScenarioModal
        isOpen={scenarioModalOpen}
        onClose={() => setScenarioModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <EmergencyStopModal
        isOpen={estopModalOpen}
        onClose={() => setEstopModalOpen(false)}
      />

      <CadStorageModal
        isOpen={cadStorageModalOpen}
        onClose={() => setCadStorageModalOpen(false)}
        initialTab={cadStorageModalTab}
        onSelectModelForSlicing={(modelName) => {
          setPreselectedModelForSlicer(modelName);
          setCurrentTab('slicer');
        }}
        onNavigateToTab={(tab) => setCurrentTab(tab)}
      />
    </div>
  );
};

export function App() {
  return (
    <PrinterProvider>
      <MainLayout />
    </PrinterProvider>
  );
}

export default App;
