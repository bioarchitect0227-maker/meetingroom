import React, { useState, useMemo } from 'react';
import { useRoom, timeToMinutes } from '../../context/RoomContext';
import { getRelativeDate } from '../../data/mockData';
import { getStatusMeta } from '../../utils/roomUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Filter, 
  Clock, 
  Layers, 
  Users, 
  Plus,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Room, Reservation } from '../../types';

export const CalendarTimelineView: React.FC = () => {
  const {
    rooms,
    reservations,
    currentDateString,
    currentTimeString,
    setDrawerReservationId,
    setIsReservationModalOpen,
    setPrefilledSlot
  } = useRoom();

  const [viewMode, setViewMode] = useState<'timeline' | 'weekly'>('timeline');
  const [selectedDate, setSelectedDate] = useState<string>(currentDateString);
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [minCapacityFilter, setMinCapacityFilter] = useState<number>(0);

  // Time grid range: 08:00 to 20:00 (12 hours = 24 slots of 30 mins)
  const START_HOUR = 8;
  const END_HOUR = 20;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const TOTAL_MINUTES = TOTAL_HOURS * 60; // 720 mins

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (!room.isActive) return false;
      if (floorFilter !== 'all' && room.floor !== floorFilter) return false;
      if (minCapacityFilter > 0 && room.capacity < minCapacityFilter) return false;
      return true;
    });
  }, [rooms, floorFilter, minCapacityFilter]);

  // Date Navigation handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setSelectedDate(currentDateString);
  };

  // Convert time to percentage on timeline
  const getTimeLeftPercentage = (timeStr: string) => {
    const minutes = timeToMinutes(timeStr) - START_HOUR * 60;
    return Math.max(0, Math.min(100, (minutes / TOTAL_MINUTES) * 100));
  };

  // Calculate current time line position if selectedDate is today
  const isToday = selectedDate === currentDateString;
  const currentMinutes = timeToMinutes(currentTimeString) - START_HOUR * 60;
  const currentTimePercentage = Math.max(0, Math.min(100, (currentMinutes / TOTAL_MINUTES) * 100));

  // Timeline slot click: instant booking at clicked time!
  const handleTimelineClick = (roomId: string, e: React.MouseEvent<HTMLDivElement>) => {
    // Determine clicked time based on click X relative to container
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const totalMinutesClicked = START_HOUR * 60 + ratio * TOTAL_MINUTES;
    
    // Snap to nearest 30 mins
    const roundedMinutes = Math.floor(totalMinutesClicked / 30) * 30;
    const startHour = Math.floor(roundedMinutes / 60);
    const startMin = roundedMinutes % 60;
    const endMinutes = roundedMinutes + 60;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;

    const startTimeFormatted = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
    const endTimeFormatted = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    setPrefilledSlot({
      roomId,
      date: selectedDate,
      startTime: startTimeFormatted,
      endTime: endTimeFormatted
    });
    setIsReservationModalOpen(true);
  };

  // Weekly view dates (Mon to Sun of the week of selectedDate)
  const weekDates = useMemo(() => {
    const curr = new Date(selectedDate);
    const day = curr.getDay(); // 0 is Sun
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(curr.setDate(diff));

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      dates.push(nextDate.toISOString().slice(0, 10));
    }
    return dates;
  }, [selectedDate]);

  const weekDayNames = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div className="space-y-4">
      {/* Top Toolbar: View switch, Date controls & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            오늘
          </button>
          <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200">
            <button
              onClick={handlePrevDay}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
              title="이전 날"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-xs text-slate-800 font-mono">
              {selectedDate} ({new Date(selectedDate).toLocaleDateString('ko-KR', { weekday: 'short' })})
            </span>
            <button
              onClick={handleNextDay}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
              title="다음 날"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1 text-slate-700 bg-white"
          />
        </div>

        {/* View switcher & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Floor Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium">층:</span>
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-700"
            >
              <option value="all">전체 층</option>
              <option value="3층">3층</option>
              <option value="4층">4층</option>
              <option value="5층">5층</option>
            </select>
          </div>

          {/* Min Capacity Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium">인원:</span>
            <select
              value={minCapacityFilter}
              onChange={(e) => setMinCapacityFilter(Number(e.target.value))}
              className="border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-700"
            >
              <option value={0}>인원 전체</option>
              <option value={6}>6인 이상</option>
              <option value={10}>10인 이상</option>
              <option value={16}>16인 이상 (대회의실)</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              일간 타임라인
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              주간 캘린더
            </button>
          </div>
        </div>
      </div>

      {/* Guide Banner */}
      <div className="px-4 py-2 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>빈 시간 슬롯을 클릭하면 해당 회의실과 시간대로 즉시 예약 창이 열립니다.</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block" /> 예약 확정
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> 승인 대기
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> 진행중
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-300 inline-block" /> 점검·차단
          </span>
        </div>
      </div>

      {/* VIEW 1: Daily Timeline View */}
      {viewMode === 'timeline' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header: Timeline Hours */}
            <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
              <div className="w-48 shrink-0 p-3 text-xs font-bold text-slate-700 border-r border-slate-200 flex items-center">
                회의실 목록 ({filteredRooms.length})
              </div>
              <div className="flex-1 relative flex">
                {Array.from({ length: TOTAL_HOURS }, (_, i) => {
                  const hour = START_HOUR + i;
                  return (
                    <div
                      key={hour}
                      className="flex-1 text-center py-2.5 border-r border-slate-200/80 text-[11px] font-mono text-slate-500 font-medium"
                    >
                      {String(hour).padStart(2, '0')}:00
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Rows */}
            <div className="divide-y divide-slate-100">
              {filteredRooms.map(room => {
                // Get active reservations on selectedDate for this room
                const roomReservations = reservations.filter(
                  r => r.roomId === room.id && 
                       r.date === selectedDate && 
                       r.status !== 'cancelled' && 
                       r.status !== 'rejected'
                );

                // Maintenance blocks on selectedDate
                const roomMaintenance = (room.maintenanceBlocks || []).filter(
                  b => b.startDate <= selectedDate && b.endDate >= selectedDate
                );

                return (
                  <div key={room.id} className="flex group hover:bg-slate-50/40 transition-colors">
                    {/* Left: Room Title Column */}
                    <div className="w-48 shrink-0 p-3.5 border-r border-slate-200 flex flex-col justify-center bg-white group-hover:bg-slate-50/40">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: room.color }}
                        />
                        <span className="font-bold text-xs text-slate-900 truncate" title={room.name}>
                          {room.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                        <span>{room.floor}</span>
                        <span>·</span>
                        <span>최대 {room.capacity}인</span>
                        {room.requiresApproval && (
                          <span className="text-amber-700 text-[10px] font-semibold bg-amber-50 px-1 rounded">
                            승인제
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Interactive Timeline Track */}
                    <div
                      className="flex-1 relative h-20 bg-slate-50/20 cursor-pointer overflow-hidden"
                      onClick={(e) => handleTimelineClick(room.id, e)}
                      title="클릭하여 이 시간대에 새 예약 생성"
                    >
                      {/* Background Hour Grids */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                          <div
                            key={i}
                            className="flex-1 border-r border-dashed border-slate-200/70 h-full"
                          />
                        ))}
                      </div>

                      {/* Maintenance Blocked Intervals */}
                      {roomMaintenance.map(maint => {
                        const left = getTimeLeftPercentage(maint.startTime);
                        const right = getTimeLeftPercentage(maint.endTime);
                        const width = Math.max(2, right - left);

                        return (
                          <div
                            key={maint.id}
                            style={{ left: `${left}%`, width: `${width}%` }}
                            className="absolute top-1 bottom-1 bg-amber-100/90 border border-amber-300 rounded text-amber-900 px-2 py-1 text-[11px] flex items-center gap-1.5 z-10 pointer-events-auto"
                            title={`[점검/차단] ${maint.reason} (${maint.startTime}~${maint.endTime})`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-semibold truncate">
                              점검: {maint.reason}
                            </span>
                          </div>
                        );
                      })}

                      {/* Reservation Blocks */}
                      {roomReservations.map(res => {
                        const left = getTimeLeftPercentage(res.startTime);
                        const right = getTimeLeftPercentage(res.endTime);
                        const width = Math.max(3, right - left);
                        const statusMeta = getStatusMeta(res.status);

                        const isPending = res.status === 'pending';
                        const isNoShow = res.status === 'no_show';

                        return (
                          <div
                            key={res.id}
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              backgroundColor: isPending ? '#fef3c7' : isNoShow ? '#fee2e2' : '#eff6ff',
                              borderColor: isPending ? '#f59e0b' : isNoShow ? '#ef4444' : room.color
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawerReservationId(res.id);
                            }}
                            className="absolute top-1.5 bottom-1.5 rounded-md border-l-4 border-r border-t border-b p-1.5 text-xs shadow-xs hover:shadow-md transition-all cursor-pointer z-20 overflow-hidden flex flex-col justify-center"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-[11px] text-slate-900 truncate">
                                {res.title}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                {res.startTime}~{res.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-600 truncate mt-0.5">
                              <span className="font-medium">{res.organizer}</span>
                              <span>({res.department})</span>
                              {isPending && (
                                <span className="text-amber-800 font-bold bg-amber-200/80 px-1 rounded text-[9px]">
                                  승인대기
                                </span>
                              )}
                              {isNoShow && (
                                <span className="text-red-800 font-bold bg-red-200/80 px-1 rounded text-[9px]">
                                  노쇼
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Live Current Time Red Bar */}
                      {isToday && currentTimePercentage > 0 && currentTimePercentage < 100 && (
                        <div
                          style={{ left: `${currentTimePercentage}%` }}
                          className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none"
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1 -top-1 absolute shadow-xs" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Weekly Calendar View */}
      {viewMode === 'weekly' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
          <div className="grid grid-cols-7 gap-3">
            {weekDates.map((dateStr, idx) => {
              const dayReservations = reservations.filter(
                r => r.date === dateStr && r.status !== 'cancelled' && r.status !== 'rejected'
              );
              const isSelectedDay = dateStr === selectedDate;
              const isTodayDate = dateStr === currentDateString;

              return (
                <div
                  key={dateStr}
                  className={`min-h-[420px] rounded-lg border p-2.5 flex flex-col ${
                    isSelectedDay
                      ? 'border-blue-500 bg-blue-50/20'
                      : isTodayDate
                      ? 'border-emerald-300 bg-emerald-50/10'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-700">
                        {weekDayNames[idx]}요일
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 block">
                        {dateStr.slice(5)}
                      </span>
                    </div>
                    {isTodayDate && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        오늘
                      </span>
                    )}
                  </div>

                  {/* List of reservations on this day */}
                  <div className="mt-2.5 flex-1 space-y-1.5 overflow-y-auto">
                    {dayReservations.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[11px] text-slate-400">
                        예약 없음
                      </div>
                    ) : (
                      dayReservations.map(res => {
                        const room = rooms.find(r => r.id === res.roomId);
                        return (
                          <div
                            key={res.id}
                            onClick={() => setDrawerReservationId(res.id)}
                            className="p-2 rounded bg-slate-50 border border-slate-200 hover:border-blue-400 transition-colors cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: room?.color }}
                              />
                              <span className="font-bold text-[11px] text-slate-900 truncate">
                                {res.title}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                              <span className="font-mono">{res.startTime}~{res.endTime}</span>
                              <span className="truncate">{room?.name.split(' ')[0]}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setPrefilledSlot({
                        date: dateStr,
                        startTime: '10:00',
                        endTime: '11:00'
                      });
                      setIsReservationModalOpen(true);
                    }}
                    className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> 예약 추가
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
