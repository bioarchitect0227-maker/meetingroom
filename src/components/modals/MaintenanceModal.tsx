import React, { useState, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import { X, Wrench, AlertTriangle } from 'lucide-react';

export const MaintenanceModal: React.FC = () => {
  const {
    isMaintenanceModalOpen,
    setIsMaintenanceModalOpen,
    maintenanceTargetRoomId,
    setMaintenanceTargetRoomId,
    rooms,
    addMaintenanceBlock,
    currentDateString
  } = useRoom();

  const [roomId, setRoomId] = useState<string>(maintenanceTargetRoomId || rooms[0]?.id || '');
  const [reason, setReason] = useState<string>('정기 음향/화상회의 장비 점검');
  const [startDate, setStartDate] = useState<string>(currentDateString);
  const [endDate, setEndDate] = useState<string>(currentDateString);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('18:00');

  useEffect(() => {
    if (maintenanceTargetRoomId) {
      setRoomId(maintenanceTargetRoomId);
    }
  }, [maintenanceTargetRoomId]);

  if (!isMaintenanceModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    addMaintenanceBlock(roomId, {
      roomId,
      reason,
      startDate,
      endDate,
      startTime,
      endTime,
      createdBy: '시설/운영 담당자'
    });

    handleClose();
  };

  const handleClose = () => {
    setIsMaintenanceModalOpen(false);
    setMaintenanceTargetRoomId(null);
  };

  const presetReasons = [
    '정기 음향/화상회의 장비 점검',
    '전사 타운홀 미팅 사전 세팅',
    '회의실 방음재 및 인테리어 보수',
    '네트워크 광케이블 점검 공사',
    'VIP 방문 대비 보안 구역 설정'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              회의실 점검 및 예약 차단 설정
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>일정 차단 주의</span>
            </div>
            <p className="leading-relaxed">
              설정된 기간 동안 일반 직원의 신규 예약 신청이 자동으로 차단됩니다.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              대상 회의실 <span className="text-rose-500">*</span>
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.floor})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              차단 사유 <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {presetReasons.map(preset => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setReason(preset)}
                  className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                    reason === preset
                      ? 'border-amber-500 bg-amber-50 text-amber-800 font-medium'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="차단 사유를 상세히 입력하세요"
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                시작 일자
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                종료 일자
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                시작 시간
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {Array.from({ length: 25 }, (_, i) => {
                  const hour = Math.floor(i / 2) + 8;
                  const minute = (i % 2) * 30;
                  const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                  return <option key={time} value={time}>{time}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                종료 시간
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {Array.from({ length: 25 }, (_, i) => {
                  const hour = Math.floor(i / 2) + 8;
                  const minute = (i % 2) * 30;
                  const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                  return <option key={time} value={time}>{time}</option>;
                })}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              차단 일정 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
