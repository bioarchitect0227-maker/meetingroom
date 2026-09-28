import React from 'react';
import { useRoom, timeToMinutes } from '../../context/RoomContext';
import { getRoomRealtimeStatus, getStatusMeta } from '../../utils/roomUtils';
import { 
  Calendar, 
  DoorClosed, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  UserX, 
  Plus, 
  ArrowRight, 
  Users, 
  MapPin, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  Ban
} from 'lucide-react';
import { ViewTab } from '../../types';

interface Props {
  onNavigateTab: (tab: ViewTab) => void;
  onOpenCancelModal: (id: string) => void;
  onOpenRejectModal: (id: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  onNavigateTab,
  onOpenCancelModal,
  onOpenRejectModal
}) => {
  const {
    rooms,
    reservations,
    selectedDepartment,
    currentDateString,
    currentTimeString,
    setDrawerReservationId,
    setIsReservationModalOpen,
    setPrefilledSlot,
    approveReservation,
    markNoShow,
    userRole
  } = useRoom();

  // Filter reservations by selected department if needed
  const deptReservations = selectedDepartment === 'all'
    ? reservations
    : reservations.filter(r => r.department === selectedDepartment);

  // Today's reservations
  const todaysReservations = deptReservations.filter(r => r.date === currentDateString);

  // Key KPI numbers
  const totalToday = todaysReservations.length;
  
  // Realtime room status calculation
  const roomStatusList = rooms.map(room => {
    const status = getRoomRealtimeStatus(room, reservations, currentDateString, currentTimeString);
    return { room, status };
  });

  const occupiedRoomsCount = roomStatusList.filter(item => item.status.state === 'in_use').length;
  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const cancelledOrNoShowToday = todaysReservations.filter(r => r.status === 'cancelled' || r.status === 'no_show').length;

  // Ongoing meetings and upcoming meetings
  const currentMinutes = timeToMinutes(currentTimeString);

  const ongoingMeetings = todaysReservations
    .filter(r => {
      if (r.status === 'cancelled' || r.status === 'rejected') return false;
      const s = timeToMinutes(r.startTime);
      const e = timeToMinutes(r.endTime);
      return currentMinutes >= s && currentMinutes < e;
    })
    .sort((a, b) => timeToMinutes(a.endTime) - timeToMinutes(b.endTime));

  const upcomingMeetings = todaysReservations
    .filter(r => {
      if (r.status === 'cancelled' || r.status === 'rejected') return false;
      const s = timeToMinutes(r.startTime);
      return s > currentMinutes;
    })
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const handleQuickBook = (roomId: string) => {
    setPrefilledSlot({
      roomId,
      date: currentDateString,
      startTime: currentTimeString < '12:00' ? '13:00' : '16:00',
      endTime: currentTimeString < '12:00' ? '14:00' : '17:00'
    });
    setIsReservationModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">부서 회의실 종합 현황</h2>
          <p className="text-xs text-slate-500 mt-1">
            오늘({currentDateString}) 예약 진행 상황과 회의실 점유율을 실시간으로 확인합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('calendar')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            타임라인 캘린더 이동
          </button>
        </div>
      </div>

      {/* F1: 4 Key Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Total Reservations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">오늘 총 예약</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{totalToday}</span>
              <span className="text-xs text-slate-500">건</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>확정 {todaysReservations.filter(r => r.status === 'confirmed').length}건</span>
              <span className="text-slate-300">·</span>
              <span>대기 {todaysReservations.filter(r => r.status === 'pending').length}건</span>
            </div>
          </div>
        </div>

        {/* Card 2: Current Occupancy */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">현재 사용 중 회의실</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DoorClosed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{occupiedRoomsCount}</span>
              <span className="text-xs text-slate-500 font-medium">/ {rooms.filter(r => r.isActive).length}실 가동 중</span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>실시간 가동률 {Math.round((occupiedRoomsCount / (rooms.length || 1)) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div 
          onClick={() => onNavigateTab('reservations')}
          className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
            pendingReservations.length > 0 
              ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400' 
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">승인 대기 요청</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              pendingReservations.length > 0 ? 'bg-amber-500 text-white font-bold' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${pendingReservations.length > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                {pendingReservations.length}
              </span>
              <span className="text-xs text-slate-500">건 미처리</span>
            </div>
            <div className="mt-2 text-[11px] text-amber-700 font-medium flex items-center justify-between">
              <span>{pendingReservations.length > 0 ? '승인 검토가 필요합니다' : '대기 건 없음'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 4: Cancellation & No-Show */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">오늘 취소 · 노쇼</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{cancelledOrNoShowToday}</span>
              <span className="text-xs text-slate-500">건</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
              <span className="text-rose-600 font-medium">
                노쇼 {todaysReservations.filter(r => r.status === 'no_show').length}건
              </span>
              <span className="text-slate-300">·</span>
              <span>취소 {todaysReservations.filter(r => r.status === 'cancelled').length}건</span>
            </div>
          </div>
        </div>
      </div>

      {/* Realtime Rooms Status Grid (회의실별 실시간 상태) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-900">회의실별 실시간 가동 상태</h3>
            <span className="text-xs text-slate-400">· 현재 시각 ({currentTimeString}) 기준</span>
          </div>
          <button
            onClick={() => onNavigateTab('rooms')}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            회의실 전체 관리 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {roomStatusList.map(({ room, status }) => (
            <div
              key={room.id}
              className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                status.state === 'in_use'
                  ? 'bg-blue-50/20 border-blue-200'
                  : status.state === 'maintenance'
                  ? 'bg-amber-50/20 border-amber-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Room Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: room.color }}
                    />
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {room.name}
                    </h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${status.badgeClass} shrink-0`}>
                    {status.label}
                  </span>
                </div>

                {/* Meta details */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                  <span>{room.floor}</span>
                  <span aria-hidden="true">·</span>
                  <span>최대 {room.capacity}인</span>
                  {room.requiresApproval && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-700 font-medium">[승인제]</span>
                    </>
                  )}
                </div>

                {/* State description */}
                <div className="mt-3 text-xs">
                  {status.state === 'in_use' && status.currentReservation && (
                    <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-md">
                      <div className="text-[11px] font-semibold text-blue-900 truncate">
                        진행: {status.currentReservation.title}
                      </div>
                      <div className="text-[11px] text-blue-700 mt-0.5 flex items-center justify-between">
                        <span>{status.currentReservation.organizer}</span>
                        <span className="font-mono">~{status.currentReservation.endTime} 까지</span>
                      </div>
                    </div>
                  )}

                  {status.state === 'vacant' && (
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-md text-[11px] text-slate-600">
                      {status.nextReservation ? (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">다음 회의:</span>
                          <span className="font-medium text-slate-800">
                            {status.nextReservation.startTime} ({status.nextReservation.title.slice(0, 10)}...)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">오늘 남은 예약 일정이 없습니다.</span>
                      )}
                    </div>
                  )}

                  {status.state === 'maintenance' && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-800">
                      <span className="font-medium">점검 사유:</span> {status.maintenanceReason || '시설 보수'}
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                {status.state === 'in_use' && status.currentReservation ? (
                  <button
                    onClick={() => setDrawerReservationId(status.currentReservation!.id)}
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    현재 회의 상세 확인
                  </button>
                ) : status.state === 'vacant' ? (
                  <button
                    onClick={() => handleQuickBook(room.id)}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    이 회의실 바로 예약
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">예약 일시 중단</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Live & Upcoming Meetings + Pending Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Ongoing & Upcoming meetings list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">오늘 진행 및 예정 회의</h3>
                <p className="text-xs text-slate-500 mt-0.5">시간 순서로 정렬된 당일 회의 목록입니다.</p>
              </div>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                전체 캘린더 보기
              </button>
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {ongoingMeetings.length === 0 && upcomingMeetings.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  오늘 남은 회의 일정이 없습니다.
                </div>
              ) : (
                <>
                  {ongoingMeetings.map(meeting => {
                    const room = rooms.find(r => r.id === meeting.roomId);
                    return (
                      <div
                        key={meeting.id}
                        onClick={() => setDrawerReservationId(meeting.id)}
                        className="p-3 rounded-lg border border-purple-200 bg-purple-50/30 hover:bg-purple-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-2.5 w-2.5 relative shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600"></span>
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                                진행중
                              </span>
                              <span className="font-bold text-xs text-slate-900 truncate">
                                {meeting.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                              <span className="font-semibold text-slate-700">{room?.name}</span>
                              <span aria-hidden="true">·</span>
                              <span>{meeting.organizer} ({meeting.department})</span>
                              <span aria-hidden="true">·</span>
                              <span>{meeting.attendeesCount}명</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {meeting.startTime} ~ {meeting.endTime}
                          </span>
                          <span className="block text-[10px] text-purple-700 font-medium">상세보기</span>
                        </div>
                      </div>
                    );
                  })}

                  {upcomingMeetings.map(meeting => {
                    const room = rooms.find(r => r.id === meeting.roomId);
                    const statusMeta = getStatusMeta(meeting.status);
                    return (
                      <div
                        key={meeting.id}
                        onClick={() => setDrawerReservationId(meeting.id)}
                        className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 transition-colors cursor-pointer flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: room?.color || '#3b82f6' }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-800 truncate">
                                {meeting.title}
                              </span>
                              <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                                {statusMeta.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                              <span className="font-medium text-slate-700">{room?.name}</span>
                              <span aria-hidden="true">·</span>
                              <span>{meeting.organizer} ({meeting.department})</span>
                              <span aria-hidden="true">·</span>
                              <span>{meeting.attendeesCount}명</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-xs font-bold text-slate-700">
                            {meeting.startTime} ~ {meeting.endTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Approval Queue */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">승인 대기 큐</h3>
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {pendingReservations.length}건
              </span>
            </div>

            {pendingReservations.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p>승인 대기 중인 예약 요청이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReservations.map(res => {
                  const room = rooms.find(r => r.id === res.roomId);
                  return (
                    <div
                      key={res.id}
                      className="p-3 rounded-lg border border-amber-200 bg-amber-50/20 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-xs text-slate-900 block truncate">
                            {res.title}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {room?.name} · {res.date} ({res.startTime}~{res.endTime})
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100">
                        <div>신청자: <span className="font-medium text-slate-800">{res.organizer}</span> ({res.department})</div>
                        {res.notes && <div className="text-slate-500 mt-0.5 truncate">비고: {res.notes}</div>}
                      </div>

                      {userRole === 'admin' ? (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => approveReservation(res.id)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> 승인
                          </button>
                          <button
                            onClick={() => onOpenRejectModal(res.id)}
                            className="flex-1 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" /> 반려
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 block text-center">
                          담당자 승인 대기 중입니다
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            {userRole === 'admin' 
              ? '담당자는 클릭 1회로 즉시 승인 및 반려가 가능합니다.'
              : '관리자 모드로 전환 시 직접 승인 처리가 가능합니다.'}
          </div>
        </div>
      </div>
    </div>
  );
};
