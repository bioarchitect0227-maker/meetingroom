import React from 'react';
import { ViewTab } from '../../types';
import { useRoom } from '../../context/RoomContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  ListOrdered, 
  DoorClosed, 
  BarChart3, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { rooms, reservations, currentDateString, currentTimeString } = useRoom();

  // Calculate live room states for quick indicator
  const pendingCount = reservations.filter(r => r.status === 'pending').length;

  const navItems: { tab: ViewTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      tab: 'dashboard',
      label: '대시보드 홈',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      tab: 'calendar',
      label: '예약 캘린더',
      icon: <CalendarDays className="w-4 h-4" />
    },
    {
      tab: 'reservations',
      label: '전체 예약 목록',
      icon: <ListOrdered className="w-4 h-4" />,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    {
      tab: 'rooms',
      label: '회의실 관리',
      icon: <DoorClosed className="w-4 h-4" />
    },
    {
      tab: 'analytics',
      label: '통계 및 리포트',
      icon: <BarChart3 className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            회의
          </div>
          <div>
            <h1 className="font-bold text-base text-emerald-600 tracking-tight leading-tight">
              회의실 예약앱
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">사내 회의실 예약 관제</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          메뉴
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-emerald-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Room Quick Status Glance */}
        <div className="pt-6 px-3">
          <div className="flex items-center justify-between pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>보유 회의실</span>
            <span className="text-[11px] text-slate-400 font-normal">{rooms.length}개소</span>
          </div>
          <div className="space-y-1.5 mt-1">
            {rooms.slice(0, 5).map(room => (
              <div
                key={room.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-100 text-[11px] text-slate-700"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: room.color }}
                  />
                  <span className="truncate font-medium">{room.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-medium">{room.floor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-500">시스템 버전</span>
          <span className="font-mono text-slate-700 font-semibold">v1.2.0</span>
        </div>
        <p className="mt-1 text-[10px] text-emerald-700 font-medium leading-normal flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          중복 예약 0건 검증 가동 중
        </p>
      </div>
    </aside>
  );
};
