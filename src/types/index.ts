// 라벨 체계 (6+1)
export type Label =
  | 'EXTERNAL_TRADE'
  | 'COMMUNITY_VIOLATION'
  | 'PRODUCT_SELLING'
  | 'LIVE_VIOLATION'
  | 'DEAL_ISSUE'
  | 'ACCOUNT_ABUSE'
  | 'OTHER';

export const LABEL_TEXT: Record<Label, string> = {
  EXTERNAL_TRADE: '외부거래',
  COMMUNITY_VIOLATION: '커뮤니티 위반',
  PRODUCT_SELLING: '판매 위반',
  LIVE_VIOLATION: '라이브 위반',
  DEAL_ISSUE: '거래 이슈',
  ACCOUNT_ABUSE: '계정 어뷰징',
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

// 메인 테이블 집계 뷰
export interface SanctionUserSummary {
  userId: string;
  nickname: string;
  userType: UserType;
  status: SanctionStatus;
  tags: Label[];
  reportCount: number;
  detectionCount: number;
  validCount: number; // 유효 (어드민이 확인한 유효 건수)
  warningCount: number;
  sanctionCount: number;
  lastValidAt: string | null; // 마지막 유효 처리 일자
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

// 유효 확인
export interface Validation {
  id: string;
  targetUserId: string;
  adminUserId: string;
  adminNickname: string;
  label: Label;
  note: string;
  relatedDetectionId?: string;
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
  | 'validCount'
  | 'warningCount'
  | 'sanctionCount'
  | 'lastValidAt';

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
