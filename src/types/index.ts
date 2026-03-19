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

// 하위 라벨 14종
export type SubLabel =
  | 'EXTERNAL_DEAL'
  | 'EXTERNAL_CHANNEL_PROMO'
  | 'INAPPROPRIATE_CHAT'
  | 'HARASSMENT'
  | 'GROUP_ABUSE'
  | 'PROBLEMATIC_SALE'
  | 'PROHIBITED_ITEM'
  | 'FRAUDULENT_DEAL'
  | 'INAPPROPRIATE_LIVE'
  | 'INEFFICIENT_LIVE'
  | 'DELIVERY_ISSUE'
  | 'DEAL_CANCELLATION'
  | 'ACCOUNT_MISUSE'
  | 'INAPPROPRIATE_PROFILE';

export const SUB_LABEL_TEXT: Record<SubLabel, string> = {
  EXTERNAL_DEAL: '외부 거래',
  EXTERNAL_CHANNEL_PROMO: '외부 채널 홍보',
  INAPPROPRIATE_CHAT: '문제성 채팅',
  HARASSMENT: '서비스·타인 비방',
  GROUP_ABUSE: '담합·친목',
  PROBLEMATIC_SALE: '문제성 판매',
  PROHIBITED_ITEM: '거래 금지 품목',
  FRAUDULENT_DEAL: '허위·부정 거래',
  INAPPROPRIATE_LIVE: '문제성 라이브',
  INEFFICIENT_LIVE: '비효율 라이브',
  DELIVERY_ISSUE: '배송 문제',
  DEAL_CANCELLATION: '거래 파기',
  ACCOUNT_MISUSE: '계정 어뷰징',
  INAPPROPRIATE_PROFILE: '닉네임/이미지',
};

export const LABEL_TO_SUB_LABELS: Record<Exclude<Label, 'OTHER'>, SubLabel[]> = {
  EXTERNAL_TRADE: ['EXTERNAL_DEAL', 'EXTERNAL_CHANNEL_PROMO'],
  COMMUNITY_VIOLATION: ['INAPPROPRIATE_CHAT', 'HARASSMENT', 'GROUP_ABUSE'],
  PRODUCT_SELLING: ['PROBLEMATIC_SALE', 'PROHIBITED_ITEM', 'FRAUDULENT_DEAL'],
  LIVE_VIOLATION: ['INAPPROPRIATE_LIVE', 'INEFFICIENT_LIVE'],
  DEAL_ISSUE: ['DELIVERY_ISSUE', 'DEAL_CANCELLATION'],
  ACCOUNT_ABUSE: ['ACCOUNT_MISUSE', 'INAPPROPRIATE_PROFILE'],
};

export const SUB_LABEL_TO_LABEL: Record<SubLabel, Label> = {
  EXTERNAL_DEAL: 'EXTERNAL_TRADE',
  EXTERNAL_CHANNEL_PROMO: 'EXTERNAL_TRADE',
  INAPPROPRIATE_CHAT: 'COMMUNITY_VIOLATION',
  HARASSMENT: 'COMMUNITY_VIOLATION',
  GROUP_ABUSE: 'COMMUNITY_VIOLATION',
  PROBLEMATIC_SALE: 'PRODUCT_SELLING',
  PROHIBITED_ITEM: 'PRODUCT_SELLING',
  FRAUDULENT_DEAL: 'PRODUCT_SELLING',
  INAPPROPRIATE_LIVE: 'LIVE_VIOLATION',
  INEFFICIENT_LIVE: 'LIVE_VIOLATION',
  DELIVERY_ISSUE: 'DEAL_ISSUE',
  DEAL_CANCELLATION: 'DEAL_ISSUE',
  ACCOUNT_MISUSE: 'ACCOUNT_ABUSE',
  INAPPROPRIATE_PROFILE: 'ACCOUNT_ABUSE',
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
  subLabel?: SubLabel;
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
