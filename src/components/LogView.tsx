import { useState, useMemo } from 'react';

// ===== 타입 =====
type LogSource = 'REPORT' | 'DM' | 'OPENCHAT' | 'LIVE';
type PeriodOption = '24h' | '3d' | 'custom';

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

interface OpenChatLog {
  type: 'openchat';
  targetUserId: string;
  targetNickname: string;
  roomName: string;
  flaggedMessage: string;
  violationType: string;
  chatContext: string;
  timestamp: string;
}

interface ReportLog {
  type: 'report';
  targetUserId: string;
  targetNickname: string;
  reporterNickname: string;
  reason: string;
  label: string;
  timestamp: string;
}

type LogEntry = DmLog | LiveLog | OpenChatLog | ReportLog;

// ===== Mock 생성 유틸 =====
function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(a: number, b: number) { return Math.floor(Math.random() * (b - a)) + a; }
function pad(n: number) { return String(n).padStart(2, '0'); }

function randomTimestamp(daysAgo: number): string {
  const now = new Date('2026-03-18T12:00:00');
  const ms = now.getTime() - Math.random() * daysAgo * 86400000;
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const NICKS = ['라큐럭키','김몽순','진격의드볼아빠','예니예니','레몬팜','사라지는옥수수540','나우아임영','포켓몬매니아','키드다은','머빈','고세구','한달50콩','주연진','카드초보','원피스팬','드래곤볼러','디지몬킹','부푸는탄제로','소아즈','첨선생','아사미','킬모기','행동하는대파','비타오빠','유저123','빵덕후','라부부잡이','징냥','네미','키티쥬','블랙카우','딜러A','딜러B','셀러C','뉴비99'];
const DM_TRIGGERS = ['카톡으로 거래하자','계좌이체 해주세요','010구구칠팔06삼공','수고비 정두?','입근드린다했어여','open.kakao.com/o/gauWtLRh','직거래 ㄱㄱ','밴드로 와','디스코드 링크','현금으로 보내줘','네이버페이로','안전번호 알려드릴게요','연락처 보내드림','오픈채팅 들어와','텔레그램으로'];
const DM_CHATS = [
  '{t} - {msg}\n상대방 - 네 알겠습니다\n{t} - 빨리 해주세요',
  '상대방 - 어떻게 보내드릴까요?\n{t} - {msg}\n{t} - 수수료 아끼게',
  '{t} - 안녕하세요\n{t} - {msg}\n상대방 - 그건 좀..\n{t} - 괜찮아요',
  '상대방 - 결제는요?\n{t} - {msg}\n{t} - 이게 편해요\n상대방 - 넵',
];
const LIVE_NAMES = ['포켓몬 카드 경매','원피스 카드 라이브','놀이터?아니면 공사판','피규어 언박싱','TCG 대전','아트토이 소개','스포츠카드 개봉','랜덤박스 오픈','가챠 라이브','컬렉션 쇼케이스'];
const DEALERS = ['띤동','카드왕','시금치다요','피규어맨','토이마스터','컬렉터킴','딜러박','스타딜러','라이브킹','보물사냥꾼'];
const LIVE_VIOLATIONS: LiveViolation[][] = [
  [{ flaggedMessage: '그건 빙신아냐?', violationType: '부적절한 언어', violationReason: '경멸적 표현 사용', label: 'INAPPROPRIATE_CONTENT' }],
  [{ flaggedMessage: '다 갬깍하셔요?', violationType: '딜러/컬렉터 공격', violationReason: '딜러 상품 비하', label: 'COMMUNITY_DISRUPTION' }],
  [{ flaggedMessage: '라고할 뻔', violationType: '부적절한 언어', violationReason: '부적절한 언어 사용', label: 'INAPPROPRIATE_CONTENT' }, { flaggedMessage: '바보', violationType: '부적절한 언어', violationReason: '모욕적 표현', label: 'INAPPROPRIATE_CONTENT' }],
  [{ flaggedMessage: '3천?', violationType: '시세/가격 언급', violationReason: '가격 논의', label: 'EXTERNAL_TRADE' }],
  [{ flaggedMessage: '5억은 선넘지', violationType: '시세/가격 언급', violationReason: '고가 가격 언급', label: 'EXTERNAL_TRADE' }, { flaggedMessage: '아파트 팔아야해', violationType: '시세/가격 언급', violationReason: '금전적 의사표현', label: 'EXTERNAL_TRADE' }],
  [{ flaggedMessage: '나 예니 번호땀', violationType: '외부 거래 유도', violationReason: '외부 연락처 공유 암시', label: 'EXTERNAL_TRADE' }],
  [{ flaggedMessage: '짝퉁이누…', violationType: '딜러/컬렉터 공격', violationReason: '상품 진정성 비하', label: 'COMMUNITY_DISRUPTION' }],
  [{ flaggedMessage: '에이씨!!!', violationType: '부적절한 언어', violationReason: '욕설 약자', label: 'INAPPROPRIATE_CONTENT' }],
  [{ flaggedMessage: '구매 방해하지 마세요', violationType: '구매 방해', violationReason: '구매 방해 행위', label: 'COMMUNITY_DISRUPTION' }],
];
const OC_ROOMS = ['피규어 잡담방','카드 거래 오픈챗','원피스 팬 모임','아트토이 수다방','TCG 정보 공유','스포츠카드 톡방','컬렉터 모임','초보 질문방','리뷰 채널','자유 채팅'];
const OC_FLAGS = ['카톡으로 연락주세요','시세 얼마에요?','직거래 하실분','ㅅㅂ 이게 뭐야','개깍이네','밴드로 오세요','계좌번호 알려드림','에이 씻','가품 아니에요?','020-1234-5678'];
const OC_TYPES = ['외부 거래 유도','시세/가격 언급','부적절한 언어','딜러/컬렉터 공격','외부 채널 유도'];
const REPORT_REASONS = ['욕설·반말 등 불쾌감을 주는 언행','구매를 방해하는 행위','외부 거래 및 외부 결제 유도','시세 및 가격 언급','딜러/컬렉터에 대한 언급·지적','와이스 및 커뮤니티에 대한 부정적 언행','기타 사유','허가되지 않은 상품 판매','불쾌한 메시지','사기 의심'];
const REPORT_LABELS = ['INAPPROPRIATE_CONTENT','OTHER','EXTERNAL_TRADE','EXTERNAL_TRADE','COMMUNITY_DISRUPTION','COMMUNITY_DISRUPTION','OTHER','PRODUCT_SELLING','INAPPROPRIATE_CONTENT','OTHER'];

function genDmLogs(count: number): DmLog[] {
  const logs: DmLog[] = [];
  // 일부는 중복 (같은 유저+트리거)
  const uniqueCount = Math.floor(count * 0.6);
  const bases: { uid: string; nick: string; trigger: string }[] = [];
  for (let i = 0; i < uniqueCount; i++) {
    const nick = randItem(NICKS);
    bases.push({ uid: `u_dm_${i}`, nick, trigger: randItem(DM_TRIGGERS) });
  }
  for (let i = 0; i < count; i++) {
    const base = randItem(bases);
    const tpl = randItem(DM_CHATS);
    const chat = tpl.replace(/\{t\}/g, base.nick).replace(/\{msg\}/g, base.trigger);
    logs.push({
      type: 'dm',
      targetUserId: base.uid,
      targetNickname: base.nick,
      triggerMessage: base.trigger,
      chatContent: chat,
      dmLink: '#',
      timestamp: randomTimestamp(7),
    });
  }
  return logs;
}

function genLiveLogs(count: number): LiveLog[] {
  return Array.from({ length: count }, (_, i) => ({
    type: 'live' as const,
    targetUserId: `u_live_${i}`,
    targetNickname: randItem(NICKS),
    liveId: `live_${randBetween(10000, 99999)}`,
    liveName: randItem(LIVE_NAMES),
    dealerName: randItem(DEALERS),
    violations: randItem(LIVE_VIOLATIONS),
    primaryLabel: 'INAPPROPRIATE_CONTENT',
    timestamp: randomTimestamp(7),
  }));
}

function genOpenChatLogs(count: number): OpenChatLog[] {
  return Array.from({ length: count }, (_, i) => {
    const nick = randItem(NICKS);
    const flagged = randItem(OC_FLAGS);
    return {
      type: 'openchat' as const,
      targetUserId: `u_oc_${i}`,
      targetNickname: nick,
      roomName: randItem(OC_ROOMS),
      flaggedMessage: flagged,
      violationType: randItem(OC_TYPES),
      chatContext: `유저A - 안녕하세요~\n${nick} - ${flagged}\n유저B - ??`,
      timestamp: randomTimestamp(7),
    };
  });
}

function genReportLogs(count: number): ReportLog[] {
  return Array.from({ length: count }, (_, i) => {
    const idx = randBetween(0, REPORT_REASONS.length);
    return {
      type: 'report' as const,
      targetUserId: `u_rpt_${i}`,
      targetNickname: randItem(NICKS),
      reporterNickname: randItem(NICKS),
      reason: REPORT_REASONS[idx] ?? '기타 사유',
      label: REPORT_LABELS[idx] ?? 'OTHER',
      timestamp: randomTimestamp(7),
    };
  });
}

const ALL_LOGS: LogEntry[] = [
  ...genDmLogs(80),
  ...genLiveLogs(60),
  ...genOpenChatLogs(55),
  ...genReportLogs(55),
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// ===== 유틸 =====
function formatTs(ts: string) {
  const d = new Date(ts);
  return `${pad(d.getMonth()+1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// DM 그룹핑
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
    return { key, latest: items[0], count: items.length, earliest: items[items.length - 1].timestamp };
  }).sort((a, b) => new Date(b.latest.timestamp).getTime() - new Date(a.latest.timestamp).getTime());
}

function filterByPeriod(logs: LogEntry[], period: PeriodOption, customRange: { start: string; end: string }): LogEntry[] {
  const now = new Date('2026-03-18T23:59:59');
  if (period === '24h') {
    const cutoff = new Date(now.getTime() - 86400000);
    return logs.filter((l) => new Date(l.timestamp) >= cutoff);
  }
  if (period === '3d') {
    const cutoff = new Date(now.getTime() - 3 * 86400000);
    return logs.filter((l) => new Date(l.timestamp) >= cutoff);
  }
  // custom
  const start = new Date(customRange.start + 'T00:00:00');
  const end = new Date(customRange.end + 'T23:59:59');
  return logs.filter((l) => { const d = new Date(l.timestamp); return d >= start && d <= end; });
}

// ===== 카드 =====
function DmCard({ group }: { group: DmGroup }) {
  const [expanded, setExpanded] = useState(false);
  const log = group.latest;
  const lines = log.chatContent.split('\n');
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{log.targetNickname}</span>
          {group.count > 1 && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{group.count}회</span>}
        </div>
        <span className="text-xs text-gray-400">{formatTs(log.timestamp)}</span>
      </div>
      <div className="text-sm text-gray-800">
        {log.targetNickname}: <span className="text-red-600 font-medium">{log.triggerMessage}</span>
      </div>
      <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-500 hover:text-blue-700 mt-1">
        {expanded ? '접기' : '대화 보기'}
      </button>
      {expanded && (
        <div className="bg-gray-50 border-l-2 border-gray-300 pl-3 py-2 mt-1 space-y-0.5">
          {lines.map((line, i) => (
            <div key={i} className={`text-xs ${line.includes(log.triggerMessage) ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
              {line.replace(/^\*|\*$/g, '')}
            </div>
          ))}
        </div>
      )}
      {group.count > 1 && <div className="text-xs text-gray-400 mt-1">최초 {formatTs(group.earliest)} ~ 최근 {formatTs(log.timestamp)}</div>}
    </div>
  );
}

function LiveCard({ log }: { log: LiveLog }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{log.targetNickname}</span>
          <span className="text-xs text-gray-400">in {log.liveName} · 딜러: {log.dealerName}</span>
        </div>
        <span className="text-xs text-gray-400">{formatTs(log.timestamp)}</span>
      </div>
      <div className="space-y-1.5">
        {log.violations.map((v, i) => (
          <div key={i} className="bg-gray-50 rounded p-2">
            <div className="text-sm text-gray-800">{log.targetNickname}: <span className="text-red-600 font-medium">{v.flaggedMessage}</span></div>
            <div className="text-xs text-purple-600 mt-0.5">위반 유형: [{v.violationType}]</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenChatCard({ log }: { log: OpenChatLog }) {
  const [expanded, setExpanded] = useState(false);
  const lines = log.chatContext.split('\n');
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{log.targetNickname}</span>
          <span className="text-xs text-gray-400">in {log.roomName}</span>
        </div>
        <span className="text-xs text-gray-400">{formatTs(log.timestamp)}</span>
      </div>
      <div className="text-sm text-gray-800">
        {log.targetNickname}: <span className="text-red-600 font-medium">{log.flaggedMessage}</span>
      </div>
      <div className="text-xs text-purple-600 mt-0.5">위반 유형: [{log.violationType}]</div>
      <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-500 hover:text-blue-700 mt-1">
        {expanded ? '접기' : '대화 보기'}
      </button>
      {expanded && (
        <div className="bg-gray-50 border-l-2 border-gray-300 pl-3 py-2 mt-1 space-y-0.5">
          {lines.map((line, i) => (
            <div key={i} className={`text-xs ${line.includes(log.flaggedMessage) ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportCard({ log }: { log: ReportLog }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{log.targetNickname}</span>
        </div>
        <span className="text-xs text-gray-400">{formatTs(log.timestamp)}</span>
      </div>
      <div className="text-sm text-gray-700">{log.reason}</div>
      <div className="text-xs text-gray-400 mt-1">신고자: {log.reporterNickname}</div>
    </div>
  );
}

// ===== 메인 =====
const SOURCE_OPTIONS: { value: LogSource; label: string }[] = [
  { value: 'DM', label: 'DM' },
  { value: 'OPENCHAT', label: '오픈챗' },
  { value: 'LIVE', label: '라이브챗' },
  { value: 'REPORT', label: '신고' },
];

const PERIOD_OPTIONS: { value: PeriodOption; label: string }[] = [
  { value: '24h', label: '24시간' },
  { value: '3d', label: '3일' },
  { value: 'custom', label: '기간 설정' },
];

export default function LogView() {
  const [source, setSource] = useState<LogSource>('DM');
  const [period, setPeriod] = useState<PeriodOption>('24h');
  const [customRange, setCustomRange] = useState({ start: '2026-03-15', end: '2026-03-18' });
  const [search, setSearch] = useState('');

  const bySource = useMemo(() => {
    if (source === 'REPORT') return ALL_LOGS.filter((l) => l.type === 'report');
    if (source === 'DM') return ALL_LOGS.filter((l) => l.type === 'dm');
    if (source === 'OPENCHAT') return ALL_LOGS.filter((l) => l.type === 'openchat');
    return ALL_LOGS.filter((l) => l.type === 'live');
  }, [source]);

  const byPeriod = useMemo(() => filterByPeriod(bySource, period, customRange), [bySource, period, customRange]);

  const filtered = useMemo(() => {
    if (!search.trim()) return byPeriod;
    const q = search.trim().toLowerCase();
    return byPeriod.filter((l) => l.targetNickname.toLowerCase().includes(q));
  }, [byPeriod, search]);

  const dmGroups = useMemo(() => {
    if (source !== 'DM') return [];
    return groupDmLogs(filtered as DmLog[]);
  }, [source, filtered]);

  const displayCount = source === 'DM' ? dmGroups.length : filtered.length;

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">구분:</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as LogSource)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
          >
            {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">기간:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodOption)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
          >
            {PERIOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {period === 'custom' && (
            <div className="flex items-center gap-1">
              <input type="date" value={customRange.start} onChange={(e) => setCustomRange((r) => ({ ...r, start: e.target.value }))} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <span className="text-gray-400">~</span>
              <input type="date" value={customRange.end} onChange={(e) => setCustomRange((r) => ({ ...r, end: e.target.value }))} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
          )}
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
        {displayCount}건{source === 'DM' ? ' (동일 유저+메시지 그룹핑)' : ''}
      </div>

      {/* 로그 */}
      <div className="space-y-2">
        {displayCount === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">해당 기간에 로그가 없습니다.</div>
        )}
        {source === 'DM' && dmGroups.map((g) => <DmCard key={g.key} group={g} />)}
        {source === 'LIVE' && (filtered as LiveLog[]).map((l, i) => <LiveCard key={i} log={l} />)}
        {source === 'OPENCHAT' && (filtered as OpenChatLog[]).map((l, i) => <OpenChatCard key={i} log={l} />)}
        {source === 'REPORT' && (filtered as ReportLog[]).map((l, i) => <ReportCard key={i} log={l} />)}
      </div>
    </div>
  );
}
