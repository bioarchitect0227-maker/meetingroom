import React, { useState, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import { DEPARTMENTS, AVAILABLE_EQUIPMENT } from '../../data/mockData';
import { X, AlertCircle, CheckCircle2, Clock, Calendar, Users, Building, Laptop } from 'lucide-react';

export const ReservationModal: React.FC = () => {
  const {
    isReservationModalOpen,
    setIsReservationModalOpen,
    editingReservation,
    setEditingReservation,
    prefilledSlot,
    setPrefilledSlot,
    rooms,
    checkConflict,
    createReservation,
    updateReservation,
    currentDateString,
    userRole
  } = useRoom();

  const [roomId, setRoomId] = useState<string>(rooms[0]?.id || '');
  const [date, setDate] = useState<string>(currentDateString);
  const [startTime, setStartTime] = useState<string>('10:00');
  const [endTime, setEndTime] = useState<string>('11:00');
  const [title, setTitle] = useState<string>('');
  const [organizer, setOrganizer] = useState<string>('');
  const [organizerEmail, setOrganizerEmail] = useState<string>('');
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [attendeesCount, setAttendeesCount] = useState<number>(4);
  const [notes, setNotes] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringType, setRecurringType] = useState<'none' | 'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync initial form values
  useEffect(() => {
    if (editingReservation) {
      setRoomId(editingReservation.roomId);
      setDate(editingReservation.date);
      setStartTime(editingReservation.startTime);
      setEndTime(editingReservation.endTime);
      setTitle(editingReservation.title);
      setOrganizer(editingReservation.organizer);
      setOrganizerEmail(editingReservation.organizerEmail || '');
      setDepartment(editingReservation.department);
      setAttendeesCount(editingReservation.attendeesCount);
      setNotes(editingReservation.notes || '');
      setSelectedEquipment(editingReservation.requiredEquipment || []);
      setIsRecurring(editingReservation.isRecurring || false);
      setRecurringType(editingReservation.recurringType || 'none');
    } else if (prefilledSlot) {
      if (prefilledSlot.roomId) setRoomId(prefilledSlot.roomId);
      if (prefilledSlot.date) setDate(prefilledSlot.date);
      if (prefilledSlot.startTime) setStartTime(prefilledSlot.startTime);
      if (prefilledSlot.endTime) setEndTime(prefilledSlot.endTime);
      setTitle('');
      setOrganizer(userRole === 'admin' ? '김민수 팀장' : '홍길동 매니저');
      setOrganizerEmail(userRole === 'admin' ? 'ms.kim@company.com' : 'gildong.hong@company.com');
      setDepartment(DEPARTMENTS[0]);
      setAttendeesCount(4);
      setNotes('');
      setSelectedEquipment([]);
      setIsRecurring(false);
    } else {
      setRoomId(rooms[0]?.id || '');
      setDate(currentDateString);
      setStartTime('14:00');
      setEndTime('15:00');
      setTitle('');
      setOrganizer(userRole === 'admin' ? '김민수 팀장' : '홍길동 매니저');
      setOrganizerEmail(userRole === 'admin' ? 'ms.kim@company.com' : 'gildong.hong@company.com');
      setDepartment(DEPARTMENTS[0]);
      setAttendeesCount(4);
      setNotes('');
      setSelectedEquipment([]);
      setIsRecurring(false);
    }
    setErrorMsg(null);
  }, [editingReservation, prefilledSlot, isReservationModalOpen, rooms, currentDateString, userRole]);

  if (!isReservationModalOpen) return null;

  // Real-time conflict check
  const conflictResult = checkConflict(
    roomId,
    date,
    startTime,
    endTime,
    editingReservation?.id
  );

  const selectedRoom = rooms.find(r => r.id === roomId);
  const exceedsCapacity = selectedRoom ? attendeesCount > selectedRoom.capacity : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('회의 제목을 입력해주세요.');
      return;
    }
    if (!organizer.trim()) {
      setErrorMsg('예약자 성명을 입력해주세요.');
      return;
    }
    if (conflictResult.hasConflict) {
      setErrorMsg(conflictResult.message || '시간 충돌로 인해 예약할 수 없습니다.');
      return;
    }

    if (editingReservation) {
      const res = updateReservation(editingReservation.id, {
        roomId,
        date,
        startTime,
        endTime,
        title,
        organizer,
        organizerEmail,
        department,
        attendeesCount,
        notes,
        requiredEquipment: selectedEquipment,
        isRecurring,
        recurringType: isRecurring ? recurringType : 'none'
      });
      if (!res.success) {
        setErrorMsg(res.error || '수정 중 오류가 발생했습니다.');
        return;
      }
    } else {
      const res = createReservation({
        roomId,
        date,
        startTime,
        endTime,
        title,
        organizer,
        organizerEmail,
        department,
        attendeesCount,
        notes,
        requiredEquipment: selectedEquipment,
        isRecurring,
        recurringType: isRecurring ? recurringType : 'none'
      });
      if (!res.success) {
        setErrorMsg(res.error || '예약 생성 중 오류가 발생했습니다.');
        return;
      }
    }

    handleClose();
  };

  const handleClose = () => {
    setIsReservationModalOpen(false);
    setEditingReservation(null);
    setPrefilledSlot(null);
    setErrorMsg(null);
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment(prev => 
      prev.includes(eq) ? prev.filter(item => item !== eq) : [...prev, eq]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editingReservation ? '회의실 예약 정보 수정' : '새 회의실 예약 등록'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              회의실 일정과 참석자 정보를 입력하세요. (실시간 중복 검증 작동)
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Real-time Conflict Alert Box */}
          {conflictResult.hasConflict ? (
            <div className="p-3.5 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>중복 예약 또는 점검 일정과 충돌합니다</span>
              </div>
              <p className="text-rose-700 leading-relaxed font-medium">
                {conflictResult.message}
              </p>
              <p className="text-[11px] text-rose-600">
                시간 또는 회의실을 변경해야 예약 저장이 가능합니다.
              </p>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>선택하신 회의실과 시간대에 중복 예약이 없습니다. 예약 가능합니다.</span>
            </div>
          )}

          {/* Approval Notice */}
          {selectedRoom?.requiresApproval && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
              <span className="font-medium">
                ※ {selectedRoom.name}은(는) 승인 필수 회의실입니다.
              </span>
              <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                {userRole === 'admin' ? '관리자 권한: 즉시 확정 가능' : '신청 후 승인 대기 상태 전환'}
              </span>
            </div>
          )}

          {/* Row 1: Room & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                회의실 선택 <span className="text-rose-500">*</span>
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {rooms.map(room => (
                  <option key={room.id} value={room.id} disabled={!room.isActive}>
                    {room.name} ({room.floor}, 최대 {room.capacity}인) {room.requiresApproval ? '· [승인제]' : ''} {!room.isActive ? '· (사용불가)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                예약 일자 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 2: Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                시작 시간 <span className="text-rose-500">*</span>
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                종료 시간 <span className="text-rose-500">*</span>
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Row 3: Meeting Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              회의 제목 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2026 Q4 신규 서비스 기획 리뷰"
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Row 4: Organizer, Department & Attendees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                예약자 성명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="예: 김민수 팀장"
                className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                소속 부서 <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                참석 인원 (명) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={attendeesCount}
                onChange={(e) => setAttendeesCount(Number(e.target.value))}
                className={`w-full text-xs border rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  exceedsCapacity ? 'border-amber-400 bg-amber-50/50' : 'border-slate-300'
                }`}
                required
              />
              {exceedsCapacity && selectedRoom && (
                <span className="text-[10px] text-amber-600 block mt-0.5">
                  해당 회의실 최대 정원({selectedRoom.capacity}명)을 초과합니다.
                </span>
              )}
            </div>
          </div>

          {/* Row 5: Organizer Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              예약자 이메일 (승인/취소 알림용)
            </label>
            <input
              type="email"
              value={organizerEmail}
              onChange={(e) => setOrganizerEmail(e.target.value)}
              placeholder="예: user@company.com"
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Row 6: Required Equipment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              필요 장비 선택
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_EQUIPMENT.map(eq => {
                const isSelected = selectedEquipment.includes(eq);
                return (
                  <label
                    key={eq}
                    className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-medium'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleEquipment(eq)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="truncate">{eq}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Row 7: Recurring Meeting */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>정기 회의 반복 예약 설정</span>
              </label>
              {isRecurring && (
                <select
                  value={recurringType}
                  onChange={(e) => setRecurringType(e.target.value as any)}
                  className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-700"
                >
                  <option value="weekly">매주 반복</option>
                  <option value="biweekly">격주 반복</option>
                  <option value="monthly">매월 특정 요일 반복</option>
                </select>
              )}
            </div>
            {isRecurring && (
              <p className="text-[11px] text-slate-500">
                향후 4회차가 동일한 시간대로 자동 스케줄링됩니다. (충돌 시 개별 통보)
              </p>
            )}
          </div>

          {/* Row 8: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              비고 / 안내사항
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="외부 손님 방문 여부, 다과 준비 필요사항 등"
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            >
              닫기
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={conflictResult.hasConflict}
                className={`px-5 py-2 rounded-md text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${
                  conflictResult.hasConflict
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                }`}
              >
                {editingReservation ? '변경 사항 저장' : '예약 신청 완료'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
