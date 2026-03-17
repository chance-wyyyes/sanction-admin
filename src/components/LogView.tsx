import { useState, useMemo } from 'react';

// ===== 타입 =====
type LogSource = 'ALL' | 'REPORT' | 'DM' | 'LIVE';

interface DmLog {
  type: 'dm';
  targetUserId: string;
  targetNickname: string;
  triggerMessage: string;
  chatContent: string;
  dmLink: string;
  timestamp: string;
}

interface LiveViolation {
  flaggedMessage: string;
  violationType: string;
  violationReason: string;
  label: string;
}

interface LiveLog {
  type: 'live';
  targetUserId: string;
  targetNickname: string;
  liveId: string;
  liveName: string;
  dealerName: string;
  violations: LiveViolation[];
  primaryLabel: string;
  timestamp: string;
}

interface ReportLog {
  type: 'report';
  targetUserId: string;
  targetNickname: string;
  reporterNickname: string;
  reason: string;
  label: string;
  liveLink?: string;
  timestamp: string;
}

type LogEntry = DmLog | LiveLog | ReportLog;

// ===== Mock 데이터 =====
const MOCK_LOGS: LogEntry[] = [
  // DM Patrol
  {
    type: 'dm',
    targetUserId: 'u_dm1',
    targetNickname: '진격의드볼아빠',
    triggerMessage: '010구구칠팔06삼공',
    chatContent: '돈없는미나리 - 넵 안녕히주무세요\n진격의드볼아빠 - 010구구칠팔06삼공\n진격의드볼아빠 - 연    락\n돈없는미나리 - 준비 다하고 바로 연락드리겠습니다',
    dmLink: '#',
    timestamp: '2026-03-15 13:34:05',
  },
  {
    type: 'dm',
    targetUserId: 'u_dm2',
    targetNickname: '사라지는옥수수540',
    triggerMessage: '수고비 정두?',
    chatContent: '사라지는옥수수540 - 수고비 정두?\n사라지는옥수수540 - 입근드린다했어여\n상대방 - 네 감사합니다',
    dmLink: '#',
    timestamp: '2026-03-15 12:10:00',
  },
  {
    type: 'dm',
    targetUserId: 'u_dm2',
    targetNickname: '사라지는옥수수540',
    triggerMessage: '수고비 정두?',
    chatContent: '사라지는옥수수540 - 수고비 정두?\n사라지는옥수수540 - 입근드린다했어여\n상대방 - 네 감사합니다',
    dmLink: '#',
    timestamp: '2026-03-15 11:40:00',
  },
  {
    type: 'dm',
    targetUserId: 'u_dm3',
    targetNickname: '예니예니',
    triggerMessage: '안전번호 뜰때 캡해논게',
    chatContent: '예니예니 - 안전번호 뜰때 캡해논게 좀 시간이 되가지구\n예니예니 - 안전\n예니예니 - 번\n예니예니 - 호우\n몽키.D.루피 - 예.',
    dmLink: '#',
    timestamp: '2026-03-15 13:34:04',
  },
  {
    type: 'dm',
    targetUserId: 'u_dm4',
    targetNickname: '김몽순',
    triggerMessage: '* 흔들지 그랬음',
    chatContent: '나우아임영 - 아 피곤ㄴ하다 택배 다쌈\n김몽순 - * 흔들지 그랬음\n김몽순 - 도와줬을텐데\n나우아임영 - 택배다뺏당',
    dmLink: '#',
    timestamp: '2026-03-15 13:34:06',
  },
  {
    type: 'dm',
    targetUserId: 'u_dm4',
    targetNickname: '김몽순',
    triggerMessage: '* 흔들지 그랬음',
    chatContent: '나우아임영 - 아 피곤ㄴ하다 택배 다쌈\n김몽순 - * 흔들지 그랬음\n김몽순 - 도와줬을텐데\n나우아임영 - 택배다뺏당',
    dmLink: '#',
    timestamp: '2026-03-15 13:05:06',
  },
  {
    type: 'dm',
    targetUserId: 'u_dm5',
    targetNickname: '레몬팜',
    triggerMessage: 'open.kakao.com/o/gauWtLRh',
    chatContent: '레몬팜 - 여기로 오세요\n레몬팜 - open.kakao.com/o/gauWtLRh\n상대방 - 이게 뭐에요?',
    dmLink: '#',
    timestamp: '2026-03-14 20:15:00',
  },

  // Live Chat Patrol
  {
    type: 'live',
    targetUserId: 'u_live1',
    targetNickname: '키드다은',
    liveId: '43da774571347407',
    liveName: '놀이터?아니면 공사판',
    dealerName: '띤동',
    violations: [
      { flaggedMessage: '그건 빙신아냐?', violationType: '부적절한 언어', violationReason: '경멸적 표현 사용', label: 'INAPPROPRIATE_CONTENT' },
      { flaggedMessage: '3천?', violationType: '시세/가격 언급', violationReason: '가격 논의', label: 'EXTERNAL_TRADE' },
    ],
    primaryLabel: 'INAPPROPRIATE_CONTENT',
    timestamp: '2026-03-15 14:16:58',
  },
  {
    type: 'live',
    targetUserId: 'u_live2',
    targetNickname: '포켓몬매니아',
    liveId: '55ab889912345678',
    liveName: '포켓몬 카드 경매',
    dealerName: '카드왕',
    violations: [
      { flaggedMessage: '다 갬깍하셔요?', violationType: '딜러/컬렉터 공격', violationReason: '딜러의 상품 진정성에 대한 비하', label: 'COMMUNITY_DISRUPTION' },
    ],
    primaryLabel: 'COMMUNITY_DISRUPTION',
    timestamp: '2026-03-15 13:42:00',
  },
  {
    type: 'live',
    targetUserId: 'u_live3',
    targetNickname: '머빈',
    liveId: '66cd990023456789',
    liveName: '원피스 카드 라이브',
    dealerName: '시금치다요',
    violations: [
      { flaggedMessage: '라고할 뻔', violationType: '부적절한 언어', violationReason: '부적절한 언어 사용', label: 'INAPPROPRIATE_CONTENT' },
      { flaggedMessage: '바보', violationType: '부적절한 언어', violationReason: '모욕적 표현', label: 'INAPPROPRIATE_CONTENT' },
    ],
    primaryLabel: 'INAPPROPRIATE_CONTENT',
    timestamp: '2026-03-18 07:32:00',
  },

  // Reports
  {
    type: 'report',
    targetUserId: 'u_rpt1',
    targetNickname: '한달50콩제한국어사전',
    reporterNickname: '비타오빠',
    reason: '욕설·반말 등 불쾌감을 주는 언행',
    label: 'INAPPROPRIATE_CONTENT',
    timestamp: '2026-03-14 15:32:00',
  },
  {
    type: 'report',
    targetUserId: 'u_rpt2',
    targetNickname: '주연진',
    reporterNickname: '행동하는대파',
    reason: '구매를 방해하는 행위',
    label: 'OTHER',
    timestamp: '2026-03-14 14:49:14',
  },
  {
    type: 'report',
    targetUserId: 'u_rpt3',
    targetNickname: 'dealer_lee',
    reporterNickname: 'buyer_aaa',
    reason: '외부 거래 및 외부 결제 유도',
    label: 'EXTERNAL_TRADE',
    timestamp: '2026-03-15 09:10:00',
  },
  {
    type: 'report',
    targetUserId: 'u_rpt4',
    targetNickname: '고세구',
    reporterNickname: '유저123',
    reason: '시세 및 가격 언급',
    label: 'EXTERNAL_TRADE',
    liveLink: '#',
    timestamp: '2026-03-13 22:05:00',
  },
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// ===== 유틸 =====
const SOURCE_OPTIONS: { value: LogSource; label: string; count: number }[] = [
  { value: 'ALL', label: '전체', count: MOCK_LOGS.length },
  { value: 'REPORT', label: '신고', count: MOCK_LOGS.filter((l) => l.type === 'report').length },
  { value: 'DM', label: 'DM', count: MOCK_LOGS.filter((l) => l.type === 'dm').length },
  { value: 'LIVE', label: '라이브챗', count: MOCK_LOGS.filter((l) => l.type === 'live').length },
];

function formatTs(ts: string) {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${m}.${day} ${h}:${min}`;
}

// DM 그룹핑: targetUserId + triggerMessage 로 묶기
interface DmGroup {
  key: string;
  latest: DmLog;
  count: number;
  earliest: string;
}

function groupDmLogs(logs: DmLog[]): DmGroup[] {
  const map = new Map<string, DmLog[]>();
  for (const log of logs) {
    const key = `${log.targetUserId}::${log.triggerMessage}`;
    const arr = map.get(key) ?? [];
    arr.push(log);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([key, items]) => {
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return {
      key,
      latest: items[0],
      count: items.length,
      earliest: items[items.length - 1].timestamp,
    };
  }).sort((a, b) => new Date(b.latest.timestamp).getTime() - new Date(a.latest.timestamp).getTime());
}

// ===== 카드 컴포넌트 =====
function DmCard({ group }: { group: DmGroup }) {
  const [expanded, setExpanded] = useState(false);
  const log = group.latest;
  const lines = log.chatContent.split('\n');

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium">DM</span>
          <span className="font-semibold text-sm">{log.targetNickname}</span>
          {group.count > 1 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{group.count}회 반복</span>
          )}
        </div>
        <span className="text-xs text-gray-400">{formatTs(log.timestamp)}</span>
      </div>
      <div className="text-sm text-gray-800 font-medium mb-2">
        {log.targetNickname}: <span className="text-red-600">{log.triggerMessage}</span>
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-blue-500 hover:text-blue-700 mb-1"
      >
        {expanded ? '대화 접기' : '대화 보기'}
      </button>
      {expanded && (
        <div className="bg-gray-50 border-l-2 border-gray-300 pl-3 py-2 mt-1 space-y-0.5">
          {lines.map((line, i) => {
            const isFlagged = line.startsWith('*') || line.includes(log.triggerMessage);
            return (
              <div key={i} className={`text-xs ${isFlagged ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                {line.replace(/^\*|\*$/g, '')}
              </div>
            );
          })}
        </div>
      )}
      {group.count > 1 && (
        <div className="text-xs text-gray-400 mt-1">
          최초 {formatTs(group.earliest)} ~ 최근 {formatTs(log.timestamp)}
        </div>
      )}
    </div>
  );
}

function LiveCard({ log }: { log: LiveLog }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded font-medium">라이브</span>
          <span className="font-semibold text-sm">{log.targetNickname}</span>
          <span className="text-xs text-gray-400">in {log.liveName}</span>
        </div>
        <span className="text-xs text-gray-400">{formatTs(log.timestamp)}</span>
      </div>
      <div className="text-xs text-gray-500 mb-2">딜러: {log.dealerName}</div>
      <div className="space-y-2">
        {log.violations.map((v, i) => (
          <div key={i} className="bg-gray-50 rounded p-2">
            <div className="font-semibold text-sm text-gray-800">
              {log.targetNickname}: <span className="text-red-600">{v.flaggedMessage}</span>
            </div>
            <div className="text-xs text-purple-600 mt-0.5">위반 유형: [{v.violationType}]</div>
            <div className="text-xs text-gray-400 mt-0.5">{v.violationReason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportCard({ log }: { log: ReportLog }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-medium">신고</span>
          <span className="font-semibold text-sm">{log.targetNickname}</span>
        </div>
        <span className="text-xs text-gray-400">{formatTs(log.timestamp)}</span>
      </div>
      <div className="text-sm text-gray-700 mb-1">{log.reason}</div>
      <div className="text-xs text-gray-400">신고자: {log.reporterNickname}</div>
    </div>
  );
}

// ===== 메인 컴포넌트 =====
export default function LogView() {
  const [source, setSource] = useState<LogSource>('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = MOCK_LOGS;
    if (source === 'REPORT') result = result.filter((l) => l.type === 'report');
    else if (source === 'DM') result = result.filter((l) => l.type === 'dm');
    else if (source === 'LIVE') result = result.filter((l) => l.type === 'live');

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((l) => l.targetNickname.toLowerCase().includes(q));
    }
    return result;
  }, [source, search]);

  // DM은 그룹핑, 나머지는 그대로
  const dmGroups = useMemo(() => {
    if (source !== 'DM' && source !== 'ALL') return [];
    const dmLogs = (source === 'DM' ? filtered : MOCK_LOGS.filter((l) => l.type === 'dm')) as DmLog[];
    return groupDmLogs(dmLogs);
  }, [source, filtered]);

  const nonDmLogs = useMemo(() => {
    if (source === 'DM') return [];
    return filtered.filter((l) => l.type !== 'dm');
  }, [source, filtered]);

  // ALL: 시간순 인터리빙 (DM 그룹의 latest timestamp 기준)
  const renderAll = source === 'ALL';
  const renderDmOnly = source === 'DM';

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-600 mr-1">구분:</span>
          {SOURCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSource(opt.value)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                source === opt.value
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {opt.label} <span className="text-xs opacity-60">{opt.count}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="text"
            placeholder="닉네임 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48"
          />
        </div>
      </div>

      <div className="text-xs text-gray-400">
        {source === 'DM'
          ? `${dmGroups.length}건 (동일 유저+메시지 그룹핑 적용)`
          : `${filtered.length}건`}
      </div>

      {/* 로그 리스트 */}
      <div className="space-y-2">
        {renderDmOnly ? (
          dmGroups.map((g) => <DmCard key={g.key} group={g} />)
        ) : renderAll ? (
          // ALL: 모든 타입 시간순
          <>
            {nonDmLogs.map((log, i) => {
              if (log.type === 'live') return <LiveCard key={`live-${i}`} log={log} />;
              if (log.type === 'report') return <ReportCard key={`rpt-${i}`} log={log} />;
              return null;
            })}
            {dmGroups.length > 0 && (
              <>
                <div className="text-xs text-gray-400 font-medium pt-2 border-t border-gray-200 mt-2">
                  DM Patrol ({dmGroups.length}건, 그룹핑 적용)
                </div>
                {dmGroups.map((g) => <DmCard key={g.key} group={g} />)}
              </>
            )}
          </>
        ) : (
          filtered.map((log, i) => {
            if (log.type === 'live') return <LiveCard key={`live-${i}`} log={log} />;
            if (log.type === 'report') return <ReportCard key={`rpt-${i}`} log={log} />;
            return null;
          })
        )}
      </div>
    </div>
  );
}
