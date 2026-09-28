import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { X, AlertTriangle } from 'lucide-react';

interface Props {
  reservationId: string | null;
  onClose: () => void;
}

export const CancellationModal: React.FC<Props> = ({ reservationId, onClose }) => {
  const { cancelReservation, reservations, setDrawerReservationId } = useRoom();
  const [reason, setReason] = useState<string>('일정 변경 및 긴급 회의 취소');

  if (!reservationId) return null;
  const target = reservations.find(r => r.id === reservationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cancelReservation(reservationId, reason);
    setDrawerReservationId(null);
    onClose();
  };

  const presetReasons = [
    '일정 변경 및 긴급 취소',
    '온라인 화상 미팅(슬랙/줌)으로 대체',
    '주요 참석자 불참으로 연기',
    '예약자 중복 등록 실수'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>예약 취소 확인</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-400 block mb-0.5 font-mono">{target?.code}</span>
            <div className="font-bold text-slate-800 text-sm">{target?.title}</div>
            <div className="text-slate-500 mt-1">
              {target?.date} {target?.startTime}~{target?.endTime} · {target?.organizer}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              취소 사유 입력 <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {presetReasons.map(preset => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setReason(preset)}
                  className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                    reason === preset
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              required
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md"
            >
              닫기
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
            >
              예약 취소 확정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
