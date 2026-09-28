export type ReservationStatus = 
  | 'pending'    // 승인 대기
  | 'confirmed'  // 확정
  | 'in_progress'// 진행 중
  | 'completed'  // 종료
  | 'cancelled'  // 취소
  | 'no_show'    // 노쇼
  | 'rejected';  // 반려

export interface MaintenanceBlock {
  id: string;
  roomId: string;
  reason: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string;   // YYYY-MM-DD
  endTime: string;   // HH:mm
  createdBy: string;
}

export interface Room {
  id: string;
  name: string;
  floor: string; // e.g., '3층', '4층', '5층'
  capacity: number;
  equipment: string[];
  requiresApproval: boolean;
  isActive: boolean;
  color: string; // Hex color for calendar/timeline
  locationDescription: string;
  maintenanceBlocks?: MaintenanceBlock[];
}

export interface Reservation {
  id: string;
  code: string; // e.g. RB-2026-101
  roomId: string;
  title: string;
  organizer: string;
  organizerEmail: string;
  department: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  attendeesCount: number;
  notes?: string;
  requiredEquipment?: string[];
  isRecurring?: boolean;
  recurringType?: 'none' | 'weekly' | 'biweekly' | 'monthly';
  status: ReservationStatus;
  cancellationReason?: string;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  reservationId?: string;
}

export type ViewTab = 'dashboard' | 'calendar' | 'reservations' | 'rooms' | 'analytics';
