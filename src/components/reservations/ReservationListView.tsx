import React, { useState, useMemo } from 'react';
import { useRoom, timeToMinutes } from '../../context/RoomContext';
import { getStatusMeta, exportReservationsToCSV } from '../../utils/roomUtils';
import { DEPARTMENTS } from '../../data/mockData';
import { ReservationStatus } from '../../types';
import { 
  Search, 
  Filter, 
  Download, 
  CheckSquare, 
  Square, 
  MoreVertical, 
  Check, 
  X, 
  Edit3, 
  UserX, 
  Eye, 
  Trash2, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';

interface Props {
  onOpenCancelModal: (id: string) => void;
  onOpenRejectModal: (id: string) => void;
}

export const ReservationListView: React.FC<Props> = ({
  onOpenCancelModal,
  onOpenRejectModal
}) => {
  const {
    reservations,
    rooms,
    userRole,
    setDrawerReservationId,
    setEditingReservation,
    setIsReservationModalOpen,
    approveReservation,
    markNoShow,
    bulkApprove,
    bulkCancel,
    currentDateString
  } = useRoom();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter & Sort Logic
  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = res.title.toLowerCase().includes(query);
        const matchOrganizer = res.organizer.toLowerCase().includes(query);
        const matchCode = res.code.toLowerCase().includes(query);
        if (!matchTitle && !matchOrganizer && !matchCode) return false;
      }

      // Status
      if (statusFilter !== 'all' && res.status !== statusFilter) return false;

      // Room
      if (roomFilter !== 'all' && res.roomId !== roomFilter) return false;

      // Department
      if (deptFilter !== 'all' && res.department !== deptFilter) return false;

      // Date Range
      if (dateRangeFilter === 'today' && res.date !== currentDateString) return false;
      if (dateRangeFilter === 'upcoming' && res.date < currentDateString) return false;
      if (dateRangeFilter === 'past' && res.date >= currentDateString) return false;

      return true;
    }).sort((a, b) => {
      const timeA = new Date(`${a.date}T${a.startTime}`).getTime();
      const timeB = new Date(`${b.date}T${b.startTime}`).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [reservations, searchTerm, statusFilter, roomFilter, deptFilter, dateRangeFilter, sortOrder, currentDateString]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReservations.slice(start, start + itemsPerPage);
  }, [filteredReservations, currentPage]);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedList.map(r => r.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    const pendingIds = selectedIds.filter(id => {
      const item = reservations.find(r => r.id === id);
      return item?.status === 'pending';
    });

    if (pendingIds.length === 0) {
      alert('선택된 항목 중 승인 대기 건이 없습니다.');
      return;
    }

    bulkApprove(pendingIds);
    setSelectedIds([]);
  };

  const handleBulkCancel = () => {
    const reason = prompt('선택한 예약들의 일괄 취소 사유를 입력해주세요:');
    if (!reason) return;

    bulkCancel(selectedIds, reason);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">전체 회의실 예약 목록</h2>
          <p className="text-xs text-slate-500 mt-1">
            부서 내 모든 회의실 예약 이력을 검색, 필터링, 승인 및 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportReservationsToCSV(filteredReservations, rooms)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            엑셀(CSV) 다운로드
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Top search & quick options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="회의 제목, 예약자, 예약번호 검색..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 상태</option>
              <option value="pending">승인 대기</option>
              <option value="confirmed">예약 확정</option>
              <option value="in_progress">진행 중</option>
              <option value="completed">이용 종료</option>
              <option value="cancelled">예약 취소</option>
              <option value="no_show">노쇼 (No-Show)</option>
              <option value="rejected">반려됨</option>
            </select>
          </div>

          {/* Room filter */}
          <div>
            <select
              value={roomFilter}
              onChange={(e) => {
                setRoomFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 회의실</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Department filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 부서</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date scope chips & sort */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">기간:</span>
            {(['all', 'today', 'upcoming', 'past'] as const).map(scope => {
              const labels = {
                all: '전체 기간',
                today: '오늘 예약',
                upcoming: '예정된 예약',
                past: '지난 예약'
              };
              const active = dateRangeFilter === scope;
              return (
                <button
                  key={scope}
                  onClick={() => {
                    setDateRangeFilter(scope);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {labels[scope]}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>일시순 {sortOrder === 'desc' ? '(최신순)' : '(과거순)'}</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (When rows selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between animate-in fade-in duration-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>총 {selectedIds.length}개 예약 선택됨</span>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'admin' && (
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                선택 일괄 승인
              </button>
            )}
            <button
              onClick={handleBulkCancel}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              선택 일괄 취소
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
            >
              선택 해제
            </button>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedList.length > 0 && selectedIds.length === paginatedList.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-3.5">예약 번호</th>
                <th className="p-3.5">회의실</th>
                <th className="p-3.5 min-w-[200px]">회의 제목</th>
                <th className="p-3.5">예약자 / 부서</th>
                <th className="p-3.5">예약 일시</th>
                <th className="p-3.5 text-center">인원</th>
                <th className="p-3.5 text-center">상태</th>
                <th className="p-3.5 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-xs text-slate-400">
                    조건에 해당하는 예약 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedList.map(res => {
                  const room = rooms.find(r => r.id === res.roomId);
                  const isSelected = selectedIds.includes(res.id);
                  const statusMeta = getStatusMeta(res.status);

                  return (
                    <tr
                      key={res.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(res.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* Code */}
                      <td className="p-3.5 font-mono text-[11px] font-semibold text-slate-500">
                        {res.code}
                      </td>

                      {/* Room */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: room?.color }}
                          />
                          <span className="font-semibold text-slate-900">{room?.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{room?.floor}</span>
                      </td>

                      {/* Title & Notes */}
                      <td className="p-3.5">
                        <button
                          onClick={() => setDrawerReservationId(res.id)}
                          className="font-bold text-slate-900 hover:text-blue-600 text-left block truncate max-w-xs transition-colors cursor-pointer"
                        >
                          {res.title}
                        </button>
                        {res.notes && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-xs mt-0.5">
                            {res.notes}
                          </span>
                        )}
                      </td>

                      {/* Organizer & Department */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{res.organizer}</div>
                        <div className="text-[11px] text-slate-400">{res.department}</div>
                      </td>

                      {/* Date & Time */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{res.date}</div>
                        <div className="font-mono text-[11px] text-blue-600 font-semibold">
                          {res.startTime} ~ {res.endTime}
                        </div>
                      </td>

                      {/* Attendees */}
                      <td className="p-3.5 text-center whitespace-nowrap font-medium text-slate-700">
                        {res.attendeesCount}명
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                          {statusMeta.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Approval for Admin */}
                          {res.status === 'pending' && userRole === 'admin' && (
                            <>
                              <button
                                onClick={() => approveReservation(res.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                title="승인"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onOpenRejectModal(res.id)}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors"
                                title="반려"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Quick Cancel for Confirmed */}
                          {res.status === 'confirmed' && (
                            <button
                              onClick={() => onOpenCancelModal(res.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                              title="예약 취소"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          {/* Detail Drawer Trigger */}
                          <button
                            onClick={() => setDrawerReservationId(res.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="상세 정보"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            총 <span className="font-semibold text-slate-800">{filteredReservations.length}</span>건 중{' '}
            <span className="font-semibold text-slate-800">
              {filteredReservations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>
            -
            <span className="font-semibold text-slate-800">
              {Math.min(currentPage * itemsPerPage, filteredReservations.length)}
            </span>
            건 표시
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-700 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
