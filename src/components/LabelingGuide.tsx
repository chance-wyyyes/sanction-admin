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

interface SubLabel {
  name: string;
  badge: keyof typeof BADGE;
  desc: string;
  channels: string;
  keywords: string[];
  examples: { source: string; text: string }[];
  policy?: string;
  details?: string[];
}

const DATA: { title: string; badge: keyof typeof BADGE; code: string; meaning: string; presets: string; subs: SubLabel[] }[] = [
  {
    title: '외부거래',
    badge: 'ext',
    code: 'EXTERNAL_TRADE',
    meaning: '플랫폼 밖 거래/채널 유도',
    presets: '외부 거래, 외부 채널 홍보',
    subs: [
      {
        name: '외부 거래',
        badge: 'ext',
        desc: '플랫폼 외부에서 실제 금전 거래를 시도/유도',
        channels: '유효, 경고, 제재',
        keywords: ['이체', '계좌', '입금', '수고비', '송금', '현금'],
        policy: '제2조 3항 ①',
        examples: [
          { source: '제재', text: '"이체로 드려야죠, 현금 송 투 더 금" — 윤하아빠' },
        ],
      },
      {
        name: '외부 채널 홍보',
        badge: 'ext',
        desc: '카카오/밴드/디스코드 등 외부 플랫폼 유도',
        channels: '유효, 경고, 제재',
        keywords: ['카톡', '카카오', '오픈채팅', '밴드', 'ㅂㄷ', '디스코드', '텔레그램'],
        policy: '제2조 1항 ③',
        examples: [
          { source: '제재', text: '"open.kakao*/o/gauWtLRh" — 레몬팜, 블랙카우' },
        ],
      },
    ],
  },
  {
    title: '커뮤니티 위반',
    badge: 'comm',
    code: 'COMMUNITY_VIOLATION',
    meaning: '문제 채팅·비방·담합 등 커뮤니티 질서 파괴',
    presets: '문제성 채팅, 서비스·타인 비방, 담합·친목',
    subs: [
      {
        name: '문제성 채팅',
        badge: 'comm',
        desc: '욕설·음란·폭력 등 부적절한 채팅',
        channels: '경고, 제재',
        keywords: [],
        policy: '제2조 2항 ⑤',
        details: [
          '오픈채팅방, 라이브 채팅으로 욕설, 음란성 등 라이브 진행 방해',
          '과도한 가격 할인 요구 등',
        ],
        examples: [
          { source: '제재', text: '"음란물, 범죄, 잔인, 폭력 등 부적합한 내용" — 고세구' },
        ],
      },
      {
        name: '서비스·타인 비방',
        badge: 'comm',
        desc: '다른 회원 또는 회사를 비방, 커뮤니티 질서 훼손',
        channels: '유효, 경고, 제재',
        keywords: [],
        details: [
          '다른 회원 또는 회사를 비방하는 행위',
          '서비스 내 분쟁 상황, 제재 사실 등을 화제로 삼아 혼란을 조장하는 행위',
        ],
        examples: [],
      },
      {
        name: '담합·친목',
        badge: 'comm',
        desc: '집단 담합, 과도한 친목',
        channels: '제재',
        keywords: [],
        details: [
          '일부 회원 간 과도한 친목으로 다른 회원에게 소외감 또는 심리적 압박을 주는 행위',
          '집단적으로 담합하여 라이브 시간대를 조율하거나 이를 시도하는 행위',
        ],
        examples: [],
      },
    ],
  },
  {
    title: '판매 위반',
    badge: 'prod',
    code: 'PRODUCT_SELLING',
    meaning: '금지/문제성 상품 판매',
    presets: '문제성 판매(커스텀팩), 거래 금지 품목',
    subs: [
      {
        name: '문제성 판매 (커스텀팩)',
        badge: 'prod',
        desc: '자체 제작 랜덤박스, 미승인 이벤트',
        channels: '제재',
        keywords: ['수제', '랜덤박스', '오리파', '수제팩', '재포장'],
        policy: '제2조 2항 ⑧',
        details: [
          '회사의 사전 승인 없이 일반 진행이 제한된 콘텐츠를 송출하는 경우',
          '주로 추가 경품 설정, 차등 무료나눔 시 적용, 자체 이벤트 등',
        ],
        examples: [
          { source: '제재', text: '"자체 제작 랜덤박스(오리파/수제팩 등 포함)" — 네미, 한글, 키티쥬' },
        ],
      },
      {
        name: '거래 금지 품목',
        badge: 'prod',
        desc: '가품·비라이센스·대리가챠·비현물 등 판매 불가 상품',
        channels: '제재',
        keywords: ['가품', '비라이센스', '거래 금지', '음란성 카드', '대리가챠', '비현물'],
        details: [
          '서비스 이용약관상 판매 불가 상품 (가품, 비라이센스 판매)',
          '존재하지 않거나 확보되지 않은 허위 매물의 판매',
          '예약 상품, 비현물, 대리 가챠, 자전거래 등',
        ],
        examples: [
          { source: '제재', text: '"본인 소유가 아닌 가쳐 기계를 활용한 대리 가쳐" — 징냥, 리앨' },
        ],
      },
    ],
  },
  {
    title: '라이브 위반',
    badge: 'live',
    code: 'LIVE_VIOLATION',
    meaning: '라이브 송출 관련 위반',
    presets: '문제성 라이브, 비효율 라이브',
    subs: [
      {
        name: '문제성 라이브',
        badge: 'live',
        desc: '부적절 콘텐츠 송출 (음주/흡연/외부 서비스 중계)',
        channels: '제재',
        keywords: [],
        policy: '제2조 2항 ⑥',
        details: [
          '음주, 흡연 등 미성년자에게 부적절한 행위가 포함된 라이브 송출',
          '다른 딜러의 라이브 또는 외부 서비스를 노출하거나 중계하는 행위',
        ],
        examples: [],
      },
      {
        name: '비효율 라이브',
        badge: 'live',
        desc: '서비스 성격에 부합하지 않는 비효율 진행',
        channels: '제재',
        keywords: [],
        details: [
          '과도한 비효율 라이브 진행자',
        ],
        examples: [],
      },
    ],
  },
  {
    title: '거래 이슈',
    badge: 'deal',
    code: 'DEAL_ISSUE',
    meaning: '개인간 거래 이행 문제 (배송/파기)',
    presets: '배송 문제, 거래 파기',
    subs: [
      {
        name: '배송 문제',
        badge: 'deal',
        desc: '장기 미발송, 허위 발송, 오배송',
        channels: '경고, 제재',
        keywords: [],
        policy: '제2조 2항 ⑤',
        details: [
          '장기 미발송, 허위 발송 외 상품이 사전 고지된 내용과 상이한 경우가 반복 발생',
          '배송정보를 잘못 입력하거나, 오기재로 인해 상품이 오배송되는 경우',
        ],
        examples: [],
      },
      {
        name: '거래 파기',
        badge: 'deal',
        desc: '일방적 취소, 단순 변심 환불 반복',
        channels: '제재',
        keywords: [],
        details: [
          '사전 고지된 내용을 정당한 사유 없이 일방적으로 변경·취소',
          '타당한 사유를 확인할 수 없는 반품 및 환불이 지속되는 경우',
        ],
        examples: [],
      },
    ],
  },
  {
    title: '계정 어뷰징',
    badge: 'acct',
    code: 'ACCOUNT_ABUSE',
    meaning: '계정 악용 (부계정/대여/닉네임)',
    presets: '계정 어뷰징, 닉네임/이미지',
    subs: [
      {
        name: '계정 어뷰징',
        badge: 'acct',
        desc: '부계정 생성/사용, 계정 대여',
        channels: '제재',
        keywords: ['부계정', '계정 대여', '타인 계정', 'permBan'],
        details: [
          '부계정 생성/사용 (permBan). 별도 탐지: #alert_user_abusing',
          '권한 없는 제3자에게 계정을 유·무상으로 대여',
        ],
        examples: [],
      },
      {
        name: '닉네임/이미지',
        badge: 'acct',
        desc: '부적절한 닉네임, 썸네일, 이미지',
        channels: '제재',
        keywords: [],
        details: [
          '라이브 제목·썸네일 등에 부적절한 표현 또는 기타 회사에서 금지하는 내용이 포함된 경우',
        ],
        examples: [],
      },
    ],
  },
];

export default function LabelingGuide() {
  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500 mb-4">
        유효·경고·제재 조치에 공통 적용되는 <strong>6+1 상위 라벨</strong> 분류 기준입니다.
        <br />
        <span className="text-xs text-gray-400">v4 — 조치 전용 대분류 (기존 INAPPROPRIATE_CONTENT→COMMUNITY_VIOLATION 흡수, TRANSACTION_ISSUE→DEAL_ISSUE)</span>
      </div>

      {DATA.map((group) => (
        <section key={group.code} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* 대분류 헤더 */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Badge type={group.badge}>{group.code}</Badge>
              <span className="font-bold text-sm">{group.title}</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>핵심의미: <strong className="text-gray-700">{group.meaning}</strong></span>
              <span>대응 프리셋: <strong className="text-gray-700">{group.presets}</strong></span>
            </div>
          </div>

          {/* 세부분류 */}
          <div className="divide-y divide-gray-100">
            {group.subs.map((sub) => (
              <div key={sub.name} className="px-4 py-3">
                <div className="flex items-start gap-2 mb-1.5">
                  <span className="font-semibold text-sm">{sub.name}</span>
                  {sub.policy && (
                    <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{sub.policy}</span>
                  )}
                  <span className="text-xs text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded ml-auto">{sub.channels}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{sub.desc}</p>

                {/* 상세 설명 */}
                {sub.details && sub.details.length > 0 && (
                  <ul className="text-xs text-gray-500 mb-2 list-disc pl-4 space-y-0.5">
                    {sub.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}

                {/* 키워드 */}
                {sub.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {sub.keywords.map((kw) => (
                      <Kw key={kw}>{kw}</Kw>
                    ))}
                  </div>
                )}

                {/* 예시 */}
                {sub.examples.length > 0 && (
                  <div className="space-y-1">
                    {sub.examples.map((ex, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className="text-gray-400 shrink-0 w-[60px] text-right">{ex.source}</span>
                        <span className="text-gray-600">{ex.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* 프리셋 매핑 검증표 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <span className="font-bold text-sm">프리셋 매핑 검증표 (13/13)</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-2 font-medium w-[30px]">No</th>
              <th className="px-4 py-2 font-medium">프리셋 항목</th>
              <th className="px-4 py-2 font-medium">상위 라벨</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              ['1', '외부 거래', 'EXTERNAL_TRADE'],
              ['2', '외부 채널 홍보', 'EXTERNAL_TRADE'],
              ['3', '문제성 채팅', 'COMMUNITY_VIOLATION'],
              ['4', '서비스·타인 비방', 'COMMUNITY_VIOLATION'],
              ['5', '담합·친목', 'COMMUNITY_VIOLATION'],
              ['6', '문제성 판매 (커스텀팩)', 'PRODUCT_SELLING'],
              ['7', '거래 금지 품목', 'PRODUCT_SELLING'],
              ['8', '문제성 라이브', 'LIVE_VIOLATION'],
              ['9', '비효율 라이브', 'LIVE_VIOLATION'],
              ['10', '배송 문제', 'DEAL_ISSUE'],
              ['11', '거래 파기', 'DEAL_ISSUE'],
              ['12', '계정 어뷰징', 'ACCOUNT_ABUSE'],
              ['13', '닉네임, 이미지', 'ACCOUNT_ABUSE'],
            ].map(([no, preset, label]) => (
              <tr key={no}>
                <td className="px-4 py-1.5 text-gray-400">{no}</td>
                <td className="px-4 py-1.5 text-gray-700">{preset}</td>
                <td className="px-4 py-1.5"><code className="text-xs text-blue-600">{label}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 참고사항 */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700 space-y-1">
        <p><strong>v4 변경사항</strong></p>
        <p>· 기존 INAPPROPRIATE_CONTENT + COMMUNITY_DISRUPTION → <strong>COMMUNITY_VIOLATION</strong>으로 통합</p>
        <p>· 기존 TRANSACTION_ISSUE → <strong>DEAL_ISSUE</strong>로 명칭 변경 (개인간 거래 뉘앙스)</p>
        <p>· 정산 계좌 오류 — 라벨링 대상에서 제외</p>
        <p>· 적용 범위: 유효·경고·제재 조치 전용 대분류</p>
      </div>
    </div>
  );
}
