import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { DEPARTMENTS } from '../../data/mockData';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Plus, 
  Bell, 
  ShieldCheck, 
  User, 
  RotateCcw,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    selectedDepartment,
    setSelectedDepartment,
    userRole,
    setUserRole,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    currentTimeString,
    currentDateString,
    setIsReservationModalOpen,
    setPrefilledSlot,
    setEditingReservation,
    resetToDefault
  } = useRoom();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenNewReservation = () => {
    setEditingReservation(null);
    setPrefilledSlot(null);
    setIsReservationModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Office Live Info & Department Selector */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs font-semibold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-emerald-600">회의실 예약앱</span>
                <span className="text-xs text-slate-400 font-medium">부서 회의실 관리</span>
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200" aria-hidden="true" />

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">부서 선택:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">전체 부서 보기</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Current Office Date / Live Time */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {currentDateString}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 font-mono text-slate-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {currentTimeString}
              <span className="relative flex h-2 w-2 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </span>
          </div>
        </div>

        {/* Right: Role Switcher, Notification, New Reservation Button */}
        <div className="flex items-center gap-3">
          {/* User Role Switcher for MVP Testing */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setUserRole('admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                userRole === 'admin'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="승인·반려, 차단 설정, 통계 전체 권한"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              부서 담당자 모드
            </button>
            <button
              onClick={() => setUserRole('employee')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                userRole === 'employee'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="신청 및 본인 예약 조회 중심"
            >
              <User className="w-3.5 h-3.5" />
              일반 직원 모드
            </button>
          </div>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              title="알림 센터"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-slate-800">시스템 알림</span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] text-blue-600 font-medium">({unreadCount}건 안읽음)</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-slate-500 hover:text-blue-600 font-medium"
                    >
                      모두 읽음
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      새로운 알림이 없습니다.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-2.5 rounded text-left cursor-pointer transition-colors border ${
                          notif.read
                            ? 'bg-white border-slate-100 opacity-70'
                            : 'bg-blue-50/50 border-blue-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-semibold text-slate-800">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm('시연용 초기 데이터로 되돌리시겠습니까?')) {
                resetToDefault();
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            title="초기 샘플 데이터 복원"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Primary Action: Book Room */}
          <button
            onClick={handleOpenNewReservation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>새 예약 등록</span>
          </button>
        </div>
      </div>
    </header>
  );
};
