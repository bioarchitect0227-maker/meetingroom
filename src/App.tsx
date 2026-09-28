/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RoomProvider } from './context/RoomContext';
import { ViewTab } from './types';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { CalendarTimelineView } from './components/calendar/CalendarTimelineView';
import { ReservationListView } from './components/reservations/ReservationListView';
import { RoomManagementView } from './components/rooms/RoomManagementView';
import { AnalyticsView } from './components/analytics/AnalyticsView';

// Modals & Panels
import { ReservationModal } from './components/modals/ReservationModal';
import { ReservationDetailDrawer } from './components/modals/ReservationDetailDrawer';
import { CancellationModal } from './components/modals/CancellationModal';
import { RejectionModal } from './components/modals/RejectionModal';
import { RoomModal } from './components/modals/RoomModal';
import { MaintenanceModal } from './components/modals/MaintenanceModal';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [cancellationTargetId, setCancellationTargetId] = useState<string | null>(null);
  const [rejectionTargetId, setRejectionTargetId] = useState<string | null>(null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
      />

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header />

        {/* Dynamic Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {currentTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenCancelModal={(id) => setCancellationTargetId(id)}
                onOpenRejectModal={(id) => setRejectionTargetId(id)}
              />
            )}

            {currentTab === 'calendar' && (
              <CalendarTimelineView />
            )}

            {currentTab === 'reservations' && (
              <ReservationListView
                onOpenCancelModal={(id) => setCancellationTargetId(id)}
                onOpenRejectModal={(id) => setRejectionTargetId(id)}
              />
            )}

            {currentTab === 'rooms' && (
              <RoomManagementView />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsView />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <ReservationModal />
      <ReservationDetailDrawer
        onOpenCancelModal={(id) => setCancellationTargetId(id)}
        onOpenRejectModal={(id) => setRejectionTargetId(id)}
      />
      <CancellationModal
        reservationId={cancellationTargetId}
        onClose={() => setCancellationTargetId(null)}
      />
      <RejectionModal
        reservationId={rejectionTargetId}
        onClose={() => setRejectionTargetId(null)}
      />
      <RoomModal />
      <MaintenanceModal />
    </div>
  );
};

export default function App() {
  return (
    <RoomProvider>
      <AppContent />
    </RoomProvider>
  );
}
