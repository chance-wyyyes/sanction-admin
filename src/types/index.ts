// 라벨 체계
export type Label =
  | 'EXTERNAL_TRADE'
  | 'PRODUCT_SELLING'
  | 'INAPPROPRIATE_CONTENT'
  | 'FRAUD'
  | 'OTHER';

export const LABEL_TEXT: Record<Label, string> = {
  EXTERNAL_TRADE: '외부거래',
  PRODUCT_SELLING: '상품판매',
  INAPPROPRIATE_CONTENT: '부적절 콘텐츠',
  FRAUD: '사기',
  OTHER: '기타',
};

// 유저 구분
export type UserType = 'LIVE_DEALER' | 'GENERAL_DEALER' | 'GENERAL_USER';

export const USER_TYPE_TEXT: Record<UserType, string> = {
  LIVE_DEALER: '라이브딜러',
  GENERAL_DEALER: '일반딜러',
  GENERAL_USER: '일반유저',
};

// 카테고리
export type Category = 'FIGURE' | 'ART_TOY' | 'SPORTS_CARD' | 'TCG';

export const CATEGORY_TEXT: Record<Category, string> = {
  FIGURE: '피규어',
  ART_TOY: '아트토이',
  SPORTS_CARD: '스포츠카드',
  TCG: 'TCG',
};

// 제재 상태
export type SanctionStatus = 'SANCTIONED' | null;

// 기간 필터
export type PeriodFilter = '24h' | '7d' | '30d' | 'all' | 'custom';

// 메인 테이블 집계 뷰
export interface SanctionUserSummary {
  userId: string;
  nickname: string;
  userType: UserType;
  status: SanctionStatus;
  tags: Label[];
  reportCount: number;
  detectionCount: number;
  warningCount: number;
  sanctionCount: number;
  cumulativeSanctionCount: number; // 누적 제재 (기간 무관 고정값)
  cumulativeSanctionDays: number; // 누적 제재일수
  lastCategory: Category | null; // 마지막 판매 시도 카테고리 (딜러만)
  joinedAt: string; // 가입일
  enteredAt: string | null; // 입점일 (딜러만)
}

// 신고
export interface Report {
  id: string;
  targetUserId: string;
  reporterUserId: string;
  reporterNickname: string;
  reason: string;
  createdAt: string;
}

// 적발
export interface Detection {
  id: string;
  targetUserId: string;
  label: Label;
  source: string;
  content: string;
  slackMessageId?: string;
  createdAt: string;
}

// 경고
export interface Warning {
  id: string;
  targetUserId: string;
  adminUserId: string;
  label: Label;
  message: string;
  createdAt: string;
}

// 제재
export interface Sanction {
  id: string;
  targetUserId: string;
  adminUserId: string;
  label: Label;
  sanctionType: string;
  reason: string;
  startAt: string;
  endAt: string | null;
  isActive: boolean;
  createdAt: string;
}

// 어드민 메모
export interface AdminMemo {
  id: string;
  targetUserId: string;
  adminUserId: string;
  adminNickname: string;
  content: string;
  createdAt: string;
}

// 유저 태그
export interface UserTag {
  userId: string;
  tag: Label;
  assignedBy: string;
  assignedAt: string;
}

// 정렬
export type SortField =
  | 'nickname'
  | 'userType'
  | 'status'
  | 'reportCount'
  | 'detectionCount'
  | 'warningCount'
  | 'sanctionCount'
  | 'cumulativeSanctionCount'
  | 'cumulativeSanctionDays';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// 유저 상세 데이터
export interface UserDetail {
  summary: SanctionUserSummary;
  sanctions: Sanction[];
  warnings: Warning[];
  detections: Detection[];
  reports: Report[];
}
