import { Room, Reservation } from '../types';

// Helper to get formatted date string 'YYYY-MM-DD'
export const getRelativeDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DEPARTMENTS = [
  '서비스개발본부',
  '프로덕트디자인팀',
  '사업기획전략실',
  '피플앤컬처(HR)팀',
  '글로벌마케팅팀',
  '데이터엔지니어링팀',
  '재무회계팀',
  '경영총괄본부'
];

export const AVAILABLE_EQUIPMENT = [
  '75인치 4K 스마트TV',
  'Zoom Rooms 화상회의 Kit',
  '빔프로젝터 & 대형 스크린',
  '무선 회의용 마이크 (2채널)',
  '이동식 자석 화이트보드',
  '고속 HDMI & C타입 허브',
  '음향 스피커폰',
  '화상 캠코더 (AI 트래킹)'
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: '대회의실 A (오리온)',
    floor: '4층',
    capacity: 20,
    equipment: ['75인치 4K 스마트TV', 'Zoom Rooms 화상회의 Kit', '무선 회의용 마이크 (2채널)', '고속 HDMI & C타입 허브'],
    requiresApproval: true,
    isActive: true,
    color: '#3b82f6', // blue
    locationDescription: '4층 서관 중앙 엘리베이터 정면',
    maintenanceBlocks: []
  },
  {
    id: 'room-2',
    name: '대회의실 B (안드로메다)',
    floor: '4층',
    capacity: 16,
    equipment: ['빔프로젝터 & 대형 스크린', '음향 스피커폰', '이동식 자석 화이트보드'],
    requiresApproval: true,
    isActive: true,
    color: '#8b5cf6', // purple
    locationDescription: '4층 동관 라운지 옆',
    maintenanceBlocks: []
  },
  {
    id: 'room-3',
    name: '중회의실 1 (시리우스)',
    floor: '3층',
    capacity: 10,
    equipment: ['75인치 4K 스마트TV', '화상 캠코더 (AI 트래킹)', '이동식 자석 화이트보드'],
    requiresApproval: false,
    isActive: true,
    color: '#10b981', // emerald
    locationDescription: '3층 개발본부 협업구역 안쪽',
    maintenanceBlocks: []
  },
  {
    id: 'room-4',
    name: '중회의실 2 (베가)',
    floor: '3층',
    capacity: 8,
    equipment: ['75인치 4K 스마트TV', '이동식 자석 화이트보드', '고속 HDMI & C타입 허브'],
    requiresApproval: false,
    isActive: true,
    color: '#f59e0b', // amber
    locationDescription: '3층 탕비실 맞은편',
    maintenanceBlocks: []
  },
  {
    id: 'room-5',
    name: '소회의실 1 (카시오페아)',
    floor: '5층',
    capacity: 6,
    equipment: ['75인치 4K 스마트TV', '화상 캠코더 (AI 트래킹)'],
    requiresApproval: false,
    isActive: true,
    color: '#06b6d4', // cyan
    locationDescription: '5층 경영지원본부 회의 복도',
    maintenanceBlocks: []
  },
  {
    id: 'room-6',
    name: '소회의실 2 (알타이르)',
    floor: '5층',
    capacity: 4,
    equipment: ['이동식 자석 화이트보드', '고속 HDMI & C타입 허브'],
    requiresApproval: false,
    isActive: true,
    color: '#ec4899', // pink
    locationDescription: '5층 남측 포커스 부스 옆',
    maintenanceBlocks: []
  }
];

export const getInitialReservations = (): Reservation[] => {
  const today = getRelativeDate(0);
  const tomorrow = getRelativeDate(1);
  const yesterday = getRelativeDate(-1);
  const dayAfter = getRelativeDate(2);

  return [
    {
      id: 'res-1',
      code: 'RB-2026-101',
      roomId: 'room-1',
      title: '2026 Q4 전사 전략기획 얼라인먼트',
      organizer: '김민수 팀장',
      organizerEmail: 'ms.kim@company.com',
      department: '사업기획전략실',
      date: today,
      startTime: '09:00',
      endTime: '11:00',
      attendeesCount: 15,
      notes: '경영진 및 각 부서장 참석, 화상 연결 필요',
      requiredEquipment: ['75인치 4K 스마트TV', 'Zoom Rooms 화상회의 Kit', '무선 회의용 마이크 (2채널)'],
      status: 'confirmed',
      createdAt: '2026-09-24T09:30:00'
    },
    {
      id: 'res-2',
      code: 'RB-2026-102',
      roomId: 'room-3',
      title: '디자인 시스템 v2 스프린트 리뷰',
      organizer: '이지은 수석',
      organizerEmail: 'jieun.lee@company.com',
      department: '프로덕트디자인팀',
      date: today,
      startTime: '10:00',
      endTime: '11:30',
      attendeesCount: 8,
      notes: '피그마 컴포넌트 라이브러리 검수',
      requiredEquipment: ['75인치 4K 스마트TV', '이동식 자석 화이트보드'],
      status: 'confirmed',
      createdAt: '2026-09-25T14:15:00'
    },
    {
      id: 'res-3',
      code: 'RB-2026-103',
      roomId: 'room-1',
      title: '글로벌 파트너사 비즈니스 제휴 미팅',
      organizer: '최유진 선임',
      organizerEmail: 'yj.choi@company.com',
      department: '글로벌마케팅팀',
      date: today,
      startTime: '14:00',
      endTime: '16:00',
      attendeesCount: 18,
      notes: '해외 지사진 온라인 동시 참여, 동시통역 장비 세팅 필요',
      requiredEquipment: ['75인치 4K 스마트TV', 'Zoom Rooms 화상회의 Kit'],
      status: 'pending',
      createdAt: '2026-09-26T11:20:00'
    },
    {
      id: 'res-4',
      code: 'RB-2026-104',
      roomId: 'room-4',
      title: '클라우드 인프라 보안 아키텍처 회의',
      organizer: '박준형 책임',
      organizerEmail: 'jh.park@company.com',
      department: '서비스개발본부',
      date: today,
      startTime: '13:00',
      endTime: '14:30',
      attendeesCount: 6,
      notes: 'AWS/GCP 하이브리드 네트워크 점검',
      requiredEquipment: ['75인치 4K 스마트TV', '고속 HDMI & C타입 허브'],
      status: 'confirmed',
      createdAt: '2026-09-25T16:00:00'
    },
    {
      id: 'res-5',
      code: 'RB-2026-105',
      roomId: 'room-5',
      title: '신규 입사자 온보딩 1:1 면담',
      organizer: '정하늘 매니저',
      organizerEmail: 'hn.jung@company.com',
      department: '피플앤컬처(HR)팀',
      date: today,
      startTime: '15:00',
      endTime: '16:00',
      attendeesCount: 2,
      notes: '수습 평가 피드백 및 복리후생 안내',
      requiredEquipment: [],
      status: 'confirmed',
      createdAt: '2026-09-26T10:00:00'
    },
    {
      id: 'res-6',
      code: 'RB-2026-106',
      roomId: 'room-2',
      title: '데이터 파이프라인 마이그레이션 PoC 보고',
      organizer: '강도윤 수석',
      organizerEmail: 'dy.kang@company.com',
      department: '데이터엔지니어링팀',
      date: today,
      startTime: '16:00',
      endTime: '18:00',
      attendeesCount: 12,
      notes: '대용량 로그 실시간 수집 시스템 검증',
      requiredEquipment: ['빔프로젝터 & 대형 스크린', '이동식 자석 화이트보드'],
      status: 'pending',
      createdAt: '2026-09-26T17:30:00'
    },
    {
      id: 'res-7',
      code: 'RB-2026-107',
      roomId: 'room-6',
      title: '긴급 결제 PG사 API 오류 점검 회의',
      organizer: '윤서연 대리',
      organizerEmail: 'sy.yoon@company.com',
      department: '서비스개발본부',
      date: today,
      startTime: '08:30',
      endTime: '09:30',
      attendeesCount: 3,
      notes: '모바일 결제 트랜잭션 타임아웃 건 (온라인 슬랙 허들로 전환되어 불참)',
      requiredEquipment: [],
      status: 'no_show',
      createdAt: '2026-09-27T08:00:00'
    },
    {
      id: 'res-8',
      code: 'RB-2026-108',
      roomId: 'room-3',
      title: '하반기 마케팅 예산 결산 워크숍',
      organizer: '송재원 팀장',
      organizerEmail: 'jw.song@company.com',
      department: '재무회계팀',
      date: yesterday,
      startTime: '14:00',
      endTime: '16:00',
      attendeesCount: 7,
      status: 'completed',
      createdAt: '2026-09-22T09:00:00'
    },
    {
      id: 'res-9',
      code: 'RB-2026-109',
      roomId: 'room-1',
      title: '전사 타운홀 미팅 리허설',
      organizer: '김민수 팀장',
      organizerEmail: 'ms.kim@company.com',
      department: '경영총괄본부',
      date: tomorrow,
      startTime: '10:00',
      endTime: '12:00',
      attendeesCount: 16,
      status: 'confirmed',
      createdAt: '2026-09-25T11:00:00'
    },
    {
      id: 'res-10',
      code: 'RB-2026-110',
      roomId: 'room-4',
      title: '신규 기능 UX 프로토타입 사용자 테스트',
      organizer: '이지은 수석',
      organizerEmail: 'jieun.lee@company.com',
      department: '프로덕트디자인팀',
      date: tomorrow,
      startTime: '14:00',
      endTime: '17:00',
      attendeesCount: 5,
      status: 'confirmed',
      createdAt: '2026-09-25T18:00:00'
    },
    {
      id: 'res-11',
      code: 'RB-2026-111',
      roomId: 'room-2',
      title: '외부 벤더 솔루션 데모 시연회',
      organizer: '조승우 책임',
      organizerEmail: 'sw.cho@company.com',
      department: '서비스개발본부',
      date: dayAfter,
      startTime: '13:00',
      endTime: '15:00',
      attendeesCount: 10,
      status: 'pending',
      createdAt: '2026-09-26T15:00:00'
    }
  ];
};
