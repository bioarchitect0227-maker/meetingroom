import { Room, Reservation, ReservationStatus } from '../types';
import { timeToMinutes } from '../context/RoomContext';

export interface RoomRealtimeStatus {
  state: 'in_use' | 'vacant' | 'maintenance' | 'inactive';
  label: string;
  badgeClass: string;
  currentReservation?: Reservation;
  nextReservation?: Reservation;
  maintenanceReason?: string;
}

export const getRoomRealtimeStatus = (
  room: Room,
  reservations: Reservation[],
  currentDate: string,
  currentTime: string
): RoomRealtimeStatus => {
  if (!room.isActive) {
    return {
      state: 'inactive',
      label: '사용 불가',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200'
    };
  }

  const currentMinutes = timeToMinutes(currentTime);

  // Check maintenance
  if (room.maintenanceBlocks && room.maintenanceBlocks.length > 0) {
    for (const block of room.maintenanceBlocks) {
      if (block.startDate <= currentDate && block.endDate >= currentDate) {
        const startMin = timeToMinutes(block.startTime);
        const endMin = timeToMinutes(block.endTime);
        if (currentMinutes >= startMin && currentMinutes < endMin) {
          return {
            state: 'maintenance',
            label: '점검·차단',
            badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
            maintenanceReason: block.reason
          };
        }
      }
    }
  }

  // Check today's active reservations
  const todaysReservations = reservations
    .filter(r => r.roomId === room.id && r.date === currentDate && r.status !== 'cancelled' && r.status !== 'rejected')
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // Current ongoing reservation
  const ongoing = todaysReservations.find(r => {
    const s = timeToMinutes(r.startTime);
    const e = timeToMinutes(r.endTime);
    return currentMinutes >= s && currentMinutes < e;
  });

  if (ongoing) {
    return {
      state: 'in_use',
      label: '사용 중',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      currentReservation: ongoing
    };
  }

  // Next upcoming reservation today
  const next = todaysReservations.find(r => timeToMinutes(r.startTime) > currentMinutes);

  return {
    state: 'vacant',
    label: '비어 있음',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    nextReservation: next
  };
};

export const getStatusMeta = (status: ReservationStatus) => {
  switch (status) {
    case 'pending':
      return {
        label: '승인 대기',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500'
      };
    case 'confirmed':
      return {
        label: '예약 확정',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-600'
      };
    case 'in_progress':
      return {
        label: '진행 중',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-600'
      };
    case 'completed':
      return {
        label: '이용 종료',
        bg: 'bg-slate-50',
        text: 'text-slate-600',
        border: 'border-slate-200',
        dot: 'bg-slate-400'
      };
    case 'cancelled':
      return {
        label: '예약 취소',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500'
      };
    case 'no_show':
      return {
        label: '노쇼 (No-Show)',
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        dot: 'bg-red-600'
      };
    case 'rejected':
      return {
        label: '반려됨',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-300',
        dot: 'bg-slate-500'
      };
  }
};

export const exportReservationsToCSV = (reservations: Reservation[], rooms: Room[]) => {
  const roomMap = new Map(rooms.map(r => [r.id, r.name]));

  const headers = [
    '예약번호',
    '회의실',
    '회의제목',
    '예약자',
    '이메일',
    '부서',
    '예약일자',
    '시작시간',
    '종료시간',
    '참석인원',
    '상태',
    '등록일시',
    '취소/반려사유'
  ];

  const rows = reservations.map(res => [
    res.code,
    roomMap.get(res.roomId) || res.roomId,
    `"${res.title.replace(/"/g, '""')}"`,
    res.organizer,
    res.organizerEmail || '',
    res.department,
    res.date,
    res.startTime,
    res.endTime,
    res.attendeesCount,
    getStatusMeta(res.status).label,
    res.createdAt,
    `"${(res.cancellationReason || res.rejectionReason || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `회의실예약목록_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
