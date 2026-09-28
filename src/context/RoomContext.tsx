import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Room, Reservation, ReservationStatus, NotificationItem, MaintenanceBlock } from '../types';
import { INITIAL_ROOMS, getInitialReservations, getRelativeDate } from '../data/mockData';

interface ConflictCheckResult {
  hasConflict: boolean;
  conflictType?: 'reservation' | 'maintenance';
  conflictingReservation?: Reservation;
  maintenanceReason?: string;
  message?: string;
}

interface RoomContextType {
  rooms: Room[];
  reservations: Reservation[];
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  userRole: 'admin' | 'employee';
  setUserRole: (role: 'admin' | 'employee') => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Real-time time
  currentTimeString: string;
  currentDateString: string;

  // Conflict detection
  checkConflict: (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeReservationId?: string
  ) => ConflictCheckResult;

  // CRUD Actions
  createReservation: (data: Omit<Reservation, 'id' | 'code' | 'createdAt' | 'status'> & { forceStatus?: ReservationStatus }) => { success: boolean; error?: string; reservation?: Reservation };
  updateReservation: (id: string, data: Partial<Reservation>) => { success: boolean; error?: string };
  cancelReservation: (id: string, reason: string) => void;
  approveReservation: (id: string) => void;
  rejectReservation: (id: string, reason: string) => void;
  markNoShow: (id: string) => void;
  bulkApprove: (ids: string[]) => void;
  bulkCancel: (ids: string[], reason: string) => void;
  
  // Room Actions
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  toggleRoomActive: (id: string) => void;
  addMaintenanceBlock: (roomId: string, block: Omit<MaintenanceBlock, 'id'>) => void;
  removeMaintenanceBlock: (roomId: string, blockId: string) => void;
  
  // Quick navigation / selection
  drawerReservation: Reservation | null;
  setDrawerReservationId: (id: string | null) => void;

  // Modals
  isReservationModalOpen: boolean;
  setIsReservationModalOpen: (open: boolean) => void;
  editingReservation: Reservation | null;
  setEditingReservation: (res: Reservation | null) => void;
  prefilledSlot: { roomId?: string; date?: string; startTime?: string; endTime?: string } | null;
  setPrefilledSlot: (slot: { roomId?: string; date?: string; startTime?: string; endTime?: string } | null) => void;

  isRoomModalOpen: boolean;
  setIsRoomModalOpen: (open: boolean) => void;
  editingRoom: Room | null;
  setEditingRoom: (room: Room | null) => void;

  isMaintenanceModalOpen: boolean;
  setIsMaintenanceModalOpen: (open: boolean) => void;
  maintenanceTargetRoomId: string | null;
  setMaintenanceTargetRoomId: (id: string | null) => void;

  // Reset
  resetToDefault: () => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

const ROOMS_KEY = 'roomboard_rooms_v1';
const RESERVATIONS_KEY = 'roomboard_reservations_v1';
const NOTIFICATIONS_KEY = 'roomboard_notifications_v1';

// Convert HH:mm to minutes from midnight
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial rooms
  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem(ROOMS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ROOMS;
  });

  // Load initial reservations
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem(RESERVATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getInitialReservations();
  });

  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [userRole, setUserRole] = useState<'admin' | 'employee'>('admin');
  
  // Real-time clock for office dashboard (Defaults to 10:25 AM for rich daytime preview)
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const currentDateString = getRelativeDate(0);
  const currentTimeString = useMemo(() => {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [now]);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'notif-1',
        title: '신규 예약 승인 요청',
        message: '최유진 선임이 대회의실 A (오리온) 14:00~16:00 예약을 요청했습니다.',
        timestamp: '10분 전',
        type: 'warning',
        read: false,
        reservationId: 'res-3'
      },
      {
        id: 'notif-2',
        title: '신규 예약 승인 요청',
        message: '강도윤 수석이 대회의실 B (안드로메다) 16:00~18:00 예약을 요청했습니다.',
        timestamp: '25분 전',
        type: 'warning',
        read: false,
        reservationId: 'res-6'
      },
      {
        id: 'notif-3',
        title: '노쇼 발생 알림',
        message: '소회의실 2 (알타이르) 08:30 긴급 회의가 노쇼 처리되었습니다.',
        timestamp: '1시간 전',
        type: 'alert',
        read: true,
        reservationId: 'res-7'
      }
    ];
  });

  // Modals & Panels state
  const [drawerReservationId, setDrawerReservationId] = useState<string | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [prefilledSlot, setPrefilledSlot] = useState<{ roomId?: string; date?: string; startTime?: string; endTime?: string } | null>(null);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceTargetRoomId, setMaintenanceTargetRoomId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Push notification helper
  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: '방금 전',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Conflict Detection Engine
  const checkConflict = (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeReservationId?: string
  ): ConflictCheckResult => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) {
      return { hasConflict: true, message: '존재하지 않는 회의실입니다.' };
    }

    if (!targetRoom.isActive) {
      return { hasConflict: true, message: '해당 회의실은 현재 비활성화되어 예약할 수 없습니다.' };
    }

    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    if (newStart >= newEnd) {
      return { hasConflict: true, message: '종료 시간은 시작 시간보다 늦어야 합니다.' };
    }

    // 1. Check Maintenance Blocks
    if (targetRoom.maintenanceBlocks && targetRoom.maintenanceBlocks.length > 0) {
      for (const block of targetRoom.maintenanceBlocks) {
        if (block.startDate <= date && block.endDate >= date) {
          const blockStart = timeToMinutes(block.startTime);
          const blockEnd = timeToMinutes(block.endTime);
          
          if (newStart < blockEnd && newEnd > blockStart) {
            return {
              hasConflict: true,
              conflictType: 'maintenance',
              maintenanceReason: block.reason,
              message: `해당 시간대에 점검/차단 일정이 설정되어 있습니다. (사유: ${block.reason}, ${block.startTime}~${block.endTime})`
            };
          }
        }
      }
    }

    // 2. Check Overlapping Reservations
    const activeReservations = reservations.filter(res => {
      if (res.roomId !== roomId) return false;
      if (res.date !== date) return false;
      if (excludeReservationId && res.id === excludeReservationId) return false;
      // Cancelled and rejected do not block
      if (res.status === 'cancelled' || res.status === 'rejected') return false;
      return true;
    });

    for (const res of activeReservations) {
      const existingStart = timeToMinutes(res.startTime);
      const existingEnd = timeToMinutes(res.endTime);

      if (newStart < existingEnd && newEnd > existingStart) {
        return {
          hasConflict: true,
          conflictType: 'reservation',
          conflictingReservation: res,
          message: `이미 예약된 회의와 시간이 겹칩니다: [${res.title}] (${res.organizer}, ${res.startTime}~${res.endTime})`
        };
      }
    }

    return { hasConflict: false };
  };

  // Create Reservation
  const createReservation = (data: Omit<Reservation, 'id' | 'code' | 'createdAt' | 'status'> & { forceStatus?: ReservationStatus }) => {
    const conflict = checkConflict(data.roomId, data.date, data.startTime, data.endTime);
    if (conflict.hasConflict) {
      return { success: false, error: conflict.message };
    }

    const targetRoom = rooms.find(r => r.id === data.roomId);
    const requiresApproval = targetRoom?.requiresApproval ?? false;
    
    // Status resolution: if forceStatus given (e.g. admin confirms), use it; otherwise pending if approval needed
    let initialStatus: ReservationStatus = 'confirmed';
    if (data.forceStatus) {
      initialStatus = data.forceStatus;
    } else if (requiresApproval && userRole !== 'admin') {
      initialStatus = 'pending';
    } else if (requiresApproval && userRole === 'admin') {
      initialStatus = 'confirmed';
    }

    const codeNum = 100 + reservations.length + 1;
    const newReservation: Reservation = {
      ...data,
      id: `res-${Date.now()}`,
      code: `RB-2026-${codeNum}`,
      status: initialStatus,
      createdAt: new Date().toISOString(),
      approvedAt: initialStatus === 'confirmed' ? new Date().toISOString() : undefined,
      approvedBy: initialStatus === 'confirmed' ? (userRole === 'admin' ? '부서 관리자' : undefined) : undefined
    };

    setReservations(prev => [newReservation, ...prev]);

    if (initialStatus === 'pending') {
      addNotification({
        title: '신규 승인 대기 건 등록',
        message: `${data.organizer}님이 ${targetRoom?.name || '회의실'} 승인을 요청했습니다.`,
        type: 'warning',
        reservationId: newReservation.id
      });
    } else {
      addNotification({
        title: '회의실 예약 확정',
        message: `[${targetRoom?.name}] '${data.title}' 예약이 완료되었습니다.`,
        type: 'success',
        reservationId: newReservation.id
      });
    }

    return { success: true, reservation: newReservation };
  };

  // Update Reservation
  const updateReservation = (id: string, data: Partial<Reservation>) => {
    const existing = reservations.find(r => r.id === id);
    if (!existing) return { success: false, error: '예약을 찾을 수 없습니다.' };

    const roomId = data.roomId || existing.roomId;
    const date = data.date || existing.date;
    const startTime = data.startTime || existing.startTime;
    const endTime = data.endTime || existing.endTime;

    const conflict = checkConflict(roomId, date, startTime, endTime, id);
    if (conflict.hasConflict) {
      return { success: false, error: conflict.message };
    }

    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));

    addNotification({
      title: '예약 정보 변경',
      message: `'${existing.title}' 예약 정보가 수정되었습니다.`,
      type: 'info',
      reservationId: id
    });

    return { success: true };
  };

  // Cancel Reservation
  const cancelReservation = (id: string, reason: string) => {
    setReservations(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'cancelled',
          cancellationReason: reason || '사용자 요청으로 취소됨'
        };
      }
      return r;
    }));

    const res = reservations.find(r => r.id === id);
    addNotification({
      title: '예약 취소 처리',
      message: `'${res?.title || '회의'}' 예약이 취소되었습니다. (사유: ${reason || '미기재'})`,
      type: 'alert',
      reservationId: id
    });
  };

  // Approve Reservation
  const approveReservation = (id: string) => {
    setReservations(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'confirmed',
          approvedAt: new Date().toISOString(),
          approvedBy: '부서 관리자'
        };
      }
      return r;
    }));

    const res = reservations.find(r => r.id === id);
    addNotification({
      title: '예약 승인 완료',
      message: `'${res?.title || '회의'}' 예약이 승인되었습니다.`,
      type: 'success',
      reservationId: id
    });
  };

  // Reject Reservation
  const rejectReservation = (id: string, reason: string) => {
    setReservations(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'rejected',
          rejectionReason: reason || '부서 회의실 관리 방침상 반려됨'
        };
      }
      return r;
    }));

    const res = reservations.find(r => r.id === id);
    addNotification({
      title: '예약 반려 처리',
      message: `'${res?.title || '회의'}' 예약이 반려되었습니다. (사유: ${reason || '관리자 반려'})`,
      type: 'alert',
      reservationId: id
    });
  };

  // Mark No-Show
  const markNoShow = (id: string) => {
    setReservations(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'no_show'
        };
      }
      return r;
    }));

    const res = reservations.find(r => r.id === id);
    addNotification({
      title: '노쇼(No-Show) 기록',
      message: `'${res?.title || '회의'}' 건이 노쇼로 기록되었습니다.`,
      type: 'alert',
      reservationId: id
    });
  };

  // Bulk Approve
  const bulkApprove = (ids: string[]) => {
    setReservations(prev => prev.map(r => {
      if (ids.includes(r.id) && r.status === 'pending') {
        return {
          ...r,
          status: 'confirmed',
          approvedAt: new Date().toISOString(),
          approvedBy: '부서 관리자'
        };
      }
      return r;
    }));

    addNotification({
      title: '일괄 승인 완료',
      message: `총 ${ids.length}건의 예약이 일괄 승인되었습니다.`,
      type: 'success'
    });
  };

  // Bulk Cancel
  const bulkCancel = (ids: string[], reason: string) => {
    setReservations(prev => prev.map(r => {
      if (ids.includes(r.id) && r.status !== 'cancelled') {
        return {
          ...r,
          status: 'cancelled',
          cancellationReason: reason || '관리자 일괄 취소'
        };
      }
      return r;
    }));

    addNotification({
      title: '일괄 취소 처리',
      message: `총 ${ids.length}건의 예약이 일괄 취소되었습니다.`,
      type: 'alert'
    });
  };

  // Room Management Actions
  const addRoom = (roomData: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...roomData,
      id: `room-${Date.now()}`
    };
    setRooms(prev => [...prev, newRoom]);
    addNotification({
      title: '신규 회의실 등록',
      message: `'${newRoom.name}'이(가) 등록되었습니다.`,
      type: 'info'
    });
  };

  const updateRoom = (id: string, roomData: Partial<Room>) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...roomData } : r));
    addNotification({
      title: '회의실 정보 수정',
      message: '회의실 설정이 저장되었습니다.',
      type: 'info'
    });
  };

  const toggleRoomActive = (id: string) => {
    setRooms(prev => prev.map(r => {
      if (r.id === id) {
        const nextState = !r.isActive;
        return { ...r, isActive: nextState };
      }
      return r;
    }));
  };

  const addMaintenanceBlock = (roomId: string, blockData: Omit<MaintenanceBlock, 'id'>) => {
    const newBlock: MaintenanceBlock = {
      ...blockData,
      id: `maint-${Date.now()}`,
      roomId
    };

    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          maintenanceBlocks: [...(r.maintenanceBlocks || []), newBlock]
        };
      }
      return r;
    }));

    addNotification({
      title: '회의실 예약 차단 설정',
      message: `'${blockData.reason}' 사유로 회의실 차단 일정이 등록되었습니다.`,
      type: 'warning'
    });
  };

  const removeMaintenanceBlock = (roomId: string, blockId: string) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          maintenanceBlocks: (r.maintenanceBlocks || []).filter(b => b.id !== blockId)
        };
      }
      return r;
    }));
  };

  const resetToDefault = () => {
    localStorage.removeItem(ROOMS_KEY);
    localStorage.removeItem(RESERVATIONS_KEY);
    localStorage.removeItem(NOTIFICATIONS_KEY);
    setRooms(INITIAL_ROOMS);
    setReservations(getInitialReservations());
    setDrawerReservationId(null);
    window.location.reload();
  };

  const drawerReservation = useMemo(() => {
    if (!drawerReservationId) return null;
    return reservations.find(r => r.id === drawerReservationId) || null;
  }, [drawerReservationId, reservations]);

  return (
    <RoomContext.Provider
      value={{
        rooms,
        reservations,
        selectedDepartment,
        setSelectedDepartment,
        userRole,
        setUserRole,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        currentTimeString,
        currentDateString,
        checkConflict,
        createReservation,
        updateReservation,
        cancelReservation,
        approveReservation,
        rejectReservation,
        markNoShow,
        bulkApprove,
        bulkCancel,
        addRoom,
        updateRoom,
        toggleRoomActive,
        addMaintenanceBlock,
        removeMaintenanceBlock,
        drawerReservation,
        setDrawerReservationId,
        isReservationModalOpen,
        setIsReservationModalOpen,
        editingReservation,
        setEditingReservation,
        prefilledSlot,
        setPrefilledSlot,
        isRoomModalOpen,
        setIsRoomModalOpen,
        editingRoom,
        setEditingRoom,
        isMaintenanceModalOpen,
        setIsMaintenanceModalOpen,
        maintenanceTargetRoomId,
        setMaintenanceTargetRoomId,
        resetToDefault
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
