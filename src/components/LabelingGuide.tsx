const BADGE: Record<string, string> = {
  ext: 'bg-orange-100 text-orange-700',
  comm: 'bg-violet-100 text-violet-700',
  prod: 'bg-green-100 text-green-700',
  live: 'bg-sky-100 text-sky-700',
  deal: 'bg-teal-100 text-teal-700',
  acct: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-500',
};

function Badge({ type, children }: { type: keyof typeof BADGE; children: React.ReactNode }) {
  return <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold ${BADGE[type]}`}>{children}</span>;
}

function Kw({ children }: { children: React.ReactNode }) {
  return <code className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono">{children}</code>;
}

const DATA: {
  title: string;
  badge: keyof typeof BADGE;
  code: string;
  meaning: string;
  presets: string[];
  keywords: string[];
}[] = [
  {
    title: '외부거래',
    badge: 'ext',
    code: 'EXTERNAL_TRADE',
    meaning: '플랫폼 밖 거래/채널 유도',
    presets: ['외부 거래 (EXTERNAL_DEAL)', '외부 채널 홍보 (EXTERNAL_CHANNEL_PROMO)'],
    keywords: ['이체', '계좌', '입금', '수고비', '송금', '현금', '카톡', '카카오', '오픈채팅', '밴드', 'ㅂㄷ', '디스코드', '텔레그램'],
  },
  {
    title: '커뮤니티 위반',
    badge: 'comm',
    code: 'COMMUNITY_VIOLATION',
    meaning: '문제 채팅·비방·담합 등 커뮤니티 질서 파괴',
    presets: ['문제성 채팅 (INAPPROPRIATE_CHAT)', '서비스·타인 비방 (HARASSMENT)', '담합·친목 (GROUP_ABUSE)'],
    keywords: [],
  },
  {
    title: '판매 위반',
    badge: 'prod',
    code: 'PRODUCT_SELLING',
    meaning: '금지/문제성 상품 판매',
    presets: ['문제성 판매 (PROBLEMATIC_SALE)', '거래 금지 품목 (PROHIBITED_ITEM)', '허위·부정 거래 (FRAUDULENT_DEAL)'],
    keywords: ['수제', '랜덤박스', '오리파', '수제팩', '가품', '비라이센스', '대리가챠', '비현물', '허위', '부정 거래'],
  },
  {
    title: '라이브 위반',
    badge: 'live',
    code: 'LIVE_VIOLATION',
    meaning: '라이브 송출 관련 위반',
    presets: ['문제성 라이브 (INAPPROPRIATE_LIVE)', '비효율 라이브 (INEFFICIENT_LIVE)'],
    keywords: [],
  },
  {
    title: '거래 이슈',
    badge: 'deal',
    code: 'DEAL_ISSUE',
    meaning: '개인간 거래 이행 문제 (배송/파기)',
    presets: ['배송 문제 (DELIVERY_ISSUE)', '거래 파기 (DEAL_CANCELLATION)'],
    keywords: [],
  },
  {
    title: '계정 어뷰징',
    badge: 'acct',
    code: 'ACCOUNT_ABUSE',
    meaning: '계정 악용 (부계정/대여/닉네임)',
    presets: ['계정 어뷰징 (ACCOUNT_MISUSE)', '닉네임/이미지 (INAPPROPRIATE_PROFILE)'],
    keywords: ['부계정', '계정 대여', '타인 계정', 'permBan'],
  },
];

export default function LabelingGuide() {
  return (
    <div className="space-y-5">
      <div className="text-sm text-gray-500">
        유효·경고·제재 공통 적용 <strong>6+1 라벨</strong> 체계 (v4)
      </div>

      {/* 라벨 → 프리셋 매핑 + 키워드 */}
      <div className="space-y-3">
        {DATA.map((group) => (
          <div key={group.code} className="border border-gray-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge type={group.badge}>{group.code}</Badge>
              <span className="font-bold text-sm">{group.title}</span>
              <span className="text-xs text-gray-400 ml-auto">{group.meaning}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {group.presets.map((p) => (
                <span key={p} className="text-xs bg-gray-50 border border-gray-200 text-gray-700 px-2 py-0.5 rounded">{p}</span>
              ))}
            </div>
            {group.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {group.keywords.map((kw) => (
                  <Kw key={kw}>{kw}</Kw>
                ))}
              </div>
            )}
          </div>
        ))}
        {/* OTHER */}
        <div className="border border-gray-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <Badge type="other">OTHER</Badge>
            <span className="font-bold text-sm">기타</span>
            <span className="text-xs text-gray-400 ml-auto">미분류</span>
          </div>
        </div>
      </div>

      {/* 프리셋 전체 매핑 테이블 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <span className="font-bold text-sm">프리셋 매핑 (14종)</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-2 font-medium">프리셋</th>
              <th className="px-4 py-2 font-medium">하위 라벨</th>
              <th className="px-4 py-2 font-medium">상위 라벨</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              ['외부 거래', 'EXTERNAL_DEAL', 'EXTERNAL_TRADE', 'ext'],
              ['외부 채널 홍보', 'EXTERNAL_CHANNEL_PROMO', 'EXTERNAL_TRADE', 'ext'],
              ['문제성 채팅', 'INAPPROPRIATE_CHAT', 'COMMUNITY_VIOLATION', 'comm'],
              ['서비스·타인 비방', 'HARASSMENT', 'COMMUNITY_VIOLATION', 'comm'],
              ['담합·친목', 'GROUP_ABUSE', 'COMMUNITY_VIOLATION', 'comm'],
              ['문제성 판매', 'PROBLEMATIC_SALE', 'PRODUCT_SELLING', 'prod'],
              ['거래 금지 품목', 'PROHIBITED_ITEM', 'PRODUCT_SELLING', 'prod'],
              ['허위·부정 거래', 'FRAUDULENT_DEAL', 'PRODUCT_SELLING', 'prod'],
              ['문제성 라이브', 'INAPPROPRIATE_LIVE', 'LIVE_VIOLATION', 'live'],
              ['비효율 라이브', 'INEFFICIENT_LIVE', 'LIVE_VIOLATION', 'live'],
              ['배송 문제', 'DELIVERY_ISSUE', 'DEAL_ISSUE', 'deal'],
              ['거래 파기', 'DEAL_CANCELLATION', 'DEAL_ISSUE', 'deal'],
              ['계정 어뷰징', 'ACCOUNT_MISUSE', 'ACCOUNT_ABUSE', 'acct'],
              ['닉네임/이미지', 'INAPPROPRIATE_PROFILE', 'ACCOUNT_ABUSE', 'acct'],
            ].map(([preset, subLabel, label, badge]) => (
              <tr key={preset}>
                <td className="px-4 py-1.5 text-gray-700">{preset}</td>
                <td className="px-4 py-1.5"><code className="text-xs text-gray-600 bg-gray-50">{subLabel}</code></td>
                <td className="px-4 py-1.5"><Badge type={badge as keyof typeof BADGE}>{label}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
