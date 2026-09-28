import React, { useState, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import { AVAILABLE_EQUIPMENT } from '../../data/mockData';
import { X, DoorClosed, Plus } from 'lucide-react';

export const RoomModal: React.FC = () => {
  const {
    isRoomModalOpen,
    setIsRoomModalOpen,
    editingRoom,
    setEditingRoom,
    addRoom,
    updateRoom
  } = useRoom();

  const [name, setName] = useState('');
  const [floor, setFloor] = useState('3층');
  const [capacity, setCapacity] = useState(8);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [color, setColor] = useState('#3b82f6');
  const [locationDescription, setLocationDescription] = useState('');

  useEffect(() => {
    if (editingRoom) {
      setName(editingRoom.name);
      setFloor(editingRoom.floor);
      setCapacity(editingRoom.capacity);
      setEquipment(editingRoom.equipment || []);
      setRequiresApproval(editingRoom.requiresApproval);
      setIsActive(editingRoom.isActive);
      setColor(editingRoom.color);
      setLocationDescription(editingRoom.locationDescription || '');
    } else {
      setName('');
      setFloor('3층');
      setCapacity(8);
      setEquipment(['75인치 4K 스마트TV', '이동식 자석 화이트보드']);
      setRequiresApproval(false);
      setIsActive(true);
      setColor('#3b82f6');
      setLocationDescription('');
    }
  }, [editingRoom, isRoomModalOpen]);

  if (!isRoomModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingRoom) {
      updateRoom(editingRoom.id, {
        name,
        floor,
        capacity,
        equipment,
        requiresApproval,
        isActive,
        color,
        locationDescription
      });
    } else {
      addRoom({
        name,
        floor,
        capacity,
        equipment,
        requiresApproval,
        isActive,
        color,
        locationDescription,
        maintenanceBlocks: []
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setIsRoomModalOpen(false);
    setEditingRoom(null);
  };

  const toggleEquipment = (eq: string) => {
    setEquipment(prev => 
      prev.includes(eq) ? prev.filter(item => item !== eq) : [...prev, eq]
    );
  };

  const colorPresets = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#10b981', // emerald
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#64748b'  // slate
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <DoorClosed className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              {editingRoom ? '회의실 정보 수정' : '새 회의실 등록'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Room Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              회의실 명칭 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 중회의실 3 (안타레스)"
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Floor & Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                위치 (층수) <span className="text-rose-500">*</span>
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2층">2층</option>
                <option value="3층">3층</option>
                <option value="4층">4층</option>
                <option value="5층">5층</option>
                <option value="6층">6층</option>
                <option value="별관 B1층">별관 B1층</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                수용 정원 (명) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Location description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              상세 위치 안내
            </label>
            <input
              type="text"
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
              placeholder="예: 3층 중앙 엘리베이터 우측 복도 끝"
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Color theme for calendar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              캘린더 테마 색상
            </label>
            <div className="flex items-center gap-2">
              {colorPresets.map(preset => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setColor(preset)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    color === preset ? 'scale-110 border-slate-900 shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>
          </div>

          {/* Equipment Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              보유 장비 및 시설
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_EQUIPMENT.map(eq => (
                <label
                  key={eq}
                  className={`flex items-center gap-2 p-2 rounded border text-xs cursor-pointer ${
                    equipment.includes(eq)
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-medium'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={equipment.includes(eq)}
                    onChange={() => toggleEquipment(eq)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate">{eq}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>예약 시 관리자 승인 필수 (대회의실/VIP실 권장)</span>
            </label>

            <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>회의실 활성화 (체크 해제 시 즉시 예약 차단)</span>
            </label>
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {editingRoom ? '수정 완료' : '회의실 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
