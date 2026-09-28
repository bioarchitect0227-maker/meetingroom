import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { 
  DoorClosed, 
  Plus, 
  Wrench, 
  Edit3, 
  Power, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Trash2, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Room } from '../../types';

export const RoomManagementView: React.FC = () => {
  const {
    rooms,
    userRole,
    setIsRoomModalOpen,
    setEditingRoom,
    toggleRoomActive,
    setIsMaintenanceModalOpen,
    setMaintenanceTargetRoomId,
    removeMaintenanceBlock
  } = useRoom();

  const handleAddNewRoom = () => {
    setEditingRoom(null);
    setIsRoomModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsRoomModalOpen(true);
  };

  const handleOpenMaintenance = (roomId: string) => {
    setMaintenanceTargetRoomId(roomId);
    setIsMaintenanceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">회의실 시설 관리</h2>
          <p className="text-xs text-slate-500 mt-1">
            부서 회의실 정보, 보유 장비, 승인 여부 및 시설 점검·차단 일정을 관리합니다.
          </p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={handleAddNewRoom}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            새 회의실 등록
          </button>
        )}
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map(room => {
          const maintenanceCount = room.maintenanceBlocks?.length || 0;

          return (
            <div
              key={room.id}
              className={`bg-white rounded-xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                room.isActive ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              <div className="p-5">
                {/* Header: Room Name, Floor, Active status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: room.color }}
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">
                        {room.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {room.floor}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Users className="w-3 h-3" />
                          최대 {room.capacity}명
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    room.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {room.isActive ? '운영 중' : '비활성'}
                  </span>
                </div>

                {/* Location Desc */}
                {room.locationDescription && (
                  <p className="text-xs text-slate-500 mt-3 bg-slate-50 p-2 rounded border border-slate-100">
                    {room.locationDescription}
                  </p>
                )}

                {/* Properties: Approval Requirement */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  {room.requiresApproval ? (
                    <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      관리자 승인 필수
                    </span>
                  ) : (
                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                      자율 예약 가능
                    </span>
                  )}
                </div>

                {/* Equipment Badges */}
                <div className="mt-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    보유 장비 ({room.equipment.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {room.equipment.length === 0 ? (
                      <span className="text-[11px] text-slate-400">등록된 장비 없음</span>
                    ) : (
                      room.equipment.map(eq => (
                        <span
                          key={eq}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] border border-slate-200/80"
                        >
                          {eq}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Maintenance Blocks info */}
                {maintenanceCount > 0 && (
                  <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        예약 차단 일정 ({maintenanceCount}건)
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {room.maintenanceBlocks?.map(block => (
                        <div
                          key={block.id}
                          className="p-2 bg-white rounded border border-amber-200 text-[11px] flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-semibold text-slate-800">{block.reason}</div>
                            <div className="text-slate-500 text-[10px] font-mono mt-0.5">
                              {block.startDate} {block.startTime} ~ {block.endDate} {block.endTime}
                            </div>
                          </div>
                          {userRole === 'admin' && (
                            <button
                              onClick={() => removeMaintenanceBlock(room.id, block.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              title="차단 해제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              {userRole === 'admin' ? (
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> 수정
                    </button>
                    <button
                      onClick={() => handleOpenMaintenance(room.id)}
                      className="px-2.5 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Wrench className="w-3 h-3" /> 차단 설정
                    </button>
                  </div>

                  <button
                    onClick={() => toggleRoomActive(room.id)}
                    className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                      room.isActive
                        ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={room.isActive ? '회의실 비활성화' : '회의실 활성화'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 text-center">
                  회의실 설정 변경은 부서 담당자만 가능합니다.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
