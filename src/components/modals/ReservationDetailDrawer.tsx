import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { getStatusMeta } from '../../utils/roomUtils';
import { 
  X, 
  Clock, 
  Calendar, 
  MapPin, 
  Users, 
  Building, 
  Mail, 
  FileText, 
  ShieldCheck, 
  Check, 
  Ban, 
  Edit3, 
  UserX, 
  AlertTriangle,
  RotateCw
} from 'lucide-react';

interface Props {
  onOpenCancelModal: (id: string) => void;
  onOpenRejectModal: (id: string) => void;
}

export const ReservationDetailDrawer: React.FC<Props> = ({
  onOpenCancelModal,
  onOpenRejectModal
}) => {
  const {
    drawerReservation,
    setDrawerReservationId,
    rooms,
    userRole,
    approveReservation,
    markNoShow,
    setEditingReservation,
    setIsReservationModalOpen
  } = useRoom();

  if (!drawerReservation) return null;

  const room = rooms.find(r => r.id === drawerReservation.roomId);
  const statusMeta = getStatusMeta(drawerReservation.status);

  const handleEdit = () => {
    setEditingReservation(drawerReservation);
    setIsReservationModalOpen(true);
    setDrawerReservationId(null);
  };

  const handleApprove = () => {
    approveReservation(drawerReservation.id);
  };

  const handleNoShow = () => {
    if (window.confirm(`'${drawerReservation.title}' 건을 노쇼(No-Show) 처리하시겠습니까?`)) {
      markNoShow(drawerReservation.id);
    }
  };

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">
                {drawerReservation.code}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 mt-1 leading-snug">
              {drawerReservation.title}
            </h3>
          </div>
          <button
            onClick={() => setDrawerReservationId(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Status Specific Notice */}
          {drawerReservation.status === 'pending' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>부서 담당자 승인 대기 중</span>
              </div>
              <p>승인 전까지는 가예약 상태이며, 관리자가 승인해야 최종 확정됩니다.</p>
            </div>
          )}

          {drawerReservation.status === 'cancelled' && drawerReservation.cancellationReason && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
              <span className="font-bold">취소 사유:</span>
              <p>{drawerReservation.cancellationReason}</p>
            </div>
          )}

          {drawerReservation.status === 'rejected' && drawerReservation.rejectionReason && (
            <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-800 space-y-1">
              <span className="font-bold">반려 사유:</span>
              <p>{drawerReservation.rejectionReason}</p>
            </div>
          )}

          {drawerReservation.status === 'no_show' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              <span className="font-bold">⚠️ 노쇼 기록된 회의입니다.</span>
              <p className="mt-0.5">예약 시간 내 체크인 또는 실제 입실이 확인되지 않았습니다.</p>
            </div>
          )}

          {/* Room Details Card */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">배정 회의실</span>
              <span className="text-[11px] font-medium text-slate-400">{room?.floor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: room?.color || '#3b82f6' }}
              />
              <span className="font-bold text-sm text-slate-900">{room?.name}</span>
            </div>
            {room?.locationDescription && (
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {room.locationDescription}
              </p>
            )}
          </div>

          {/* Schedule Info */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">일시 및 인원</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  예약 일자
                </span>
                <span className="font-semibold text-slate-800">{drawerReservation.date}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  이용 시간
                </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {drawerReservation.startTime} ~ {drawerReservation.endTime}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                참석 인원
              </span>
              <span className="font-semibold text-slate-800">
                {drawerReservation.attendeesCount}명 (최대 {room?.capacity || 10}인실)
              </span>
            </div>
          </div>

          {/* Organizer Info */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">예약자 정보</h4>
            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">예약자</span>
                <span className="font-semibold text-slate-800">{drawerReservation.organizer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">소속 부서</span>
                <span className="font-medium text-slate-700">{drawerReservation.department}</span>
              </div>
              {drawerReservation.organizerEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">이메일</span>
                  <span className="font-mono text-slate-600">{drawerReservation.organizerEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Equipment */}
          {drawerReservation.requiredEquipment && drawerReservation.requiredEquipment.length > 0 && (
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">신청 장비</h4>
              <div className="flex flex-wrap gap-1.5">
                {drawerReservation.requiredEquipment.map(eq => (
                  <span key={eq} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-[11px] border border-slate-200">
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {drawerReservation.notes && (
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">비고 / 요청사항</h4>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
                {drawerReservation.notes}
              </p>
            </div>
          )}

          {/* Audit trail */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>예약 등록 시각:</span>
              <span>{new Date(drawerReservation.createdAt).toLocaleString('ko-KR')}</span>
            </div>
            {drawerReservation.approvedAt && (
              <div className="flex justify-between">
                <span>승인 완료:</span>
                <span>{drawerReservation.approvedBy || '관리자'} ({new Date(drawerReservation.approvedAt).toLocaleDateString('ko-KR')})</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2">
          {/* If Pending Approval */}
          {drawerReservation.status === 'pending' && userRole === 'admin' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleApprove}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                예약 승인
              </button>
              <button
                onClick={() => onOpenRejectModal(drawerReservation.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
              >
                <Ban className="w-4 h-4" />
                예약 반려
              </button>
            </div>
          )}

          {/* Standard Actions for Confirmed */}
          {(drawerReservation.status === 'confirmed' || drawerReservation.status === 'in_progress') && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  예약 수정
                </button>
                <button
                  onClick={() => onOpenCancelModal(drawerReservation.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  예약 취소
                </button>
              </div>

              {/* No-show marking for manager */}
              {userRole === 'admin' && (
                <button
                  onClick={handleNoShow}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-xs font-medium transition-colors cursor-pointer"
                >
                  <UserX className="w-3.5 h-3.5" />
                  노쇼(No-Show) 수동 마킹
                </button>
              )}
            </div>
          )}

          {/* Reset or Rebook for completed/cancelled */}
          {(drawerReservation.status === 'completed' || drawerReservation.status === 'cancelled' || drawerReservation.status === 'rejected' || drawerReservation.status === 'no_show') && (
            <button
              onClick={() => {
                setDrawerReservationId(null);
                setEditingReservation(null);
                setIsReservationModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              동일 조건으로 다시 예약
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
