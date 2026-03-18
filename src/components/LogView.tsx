import { useState, useMemo } from 'react';

// ===== 타입 =====
type LogSource = 'DM' | 'OPENCHAT' | 'LIVE' | 'REPORT';
type PeriodOption = '24h' | '3d' | 'custom';

interface DmLog {
  type: 'dm';
  id: string;
  targetUserId: string;
  targetNickname: string;
  triggerMessage: string;
  violationType: string;
  chatContent: string;
  dmLink: string;
  timestamp: string;
}

interface LiveViolation {
  flaggedMessage: string;
  violationType: string;
  violationReason: string;
}

interface LiveLog {
  type: 'live';
  id: string;
  targetUserId: string;
  targetNickname: string;
  liveId: string;
  liveName: string;
  dealerName: string;
  violations: LiveViolation[];
  timestamp: string;
}

interface OpenChatLog {
  type: 'openchat';
  id: string;
  targetUserId: string;
  targetNickname: string;
  roomName: string;
  flaggedMessage: string;
  chatContext: string;
  timestamp: string;
}

interface ReportLog {
  type: 'report';
  id: string;
  targetUserId: string;
  targetNickname: string;
  reporterNickname: string;
  reason: string;
  liveName: string | null;
  targetMessage: string | null;
  timestamp: string;
}

type LogEntry = DmLog | LiveLog | OpenChatLog | ReportLog;

// ===== Mock 유틸 =====
function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(a: number, b: number) { return Math.floor(Math.random() * (b - a)) + a; }
function pad(n: number) { return String(n).padStart(2, '0'); }
function randomTimestamp(daysAgo: number): string {
  const now = new Date('2026-03-18T12:00:00');
  const ms = now.getTime() - Math.random() * daysAgo * 86400000;
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const NICKS = ['라큐럭키','김몽순','진격의드볼아빠','예니예니','레몬팜','사라지는옥수수540','나우아임영','포켓몬매니아','키드다은','머빈','고세구','한달50콩','주연진','카드초보','원피스팬','드래곤볼러','디지몬킹','부푸는탄제로','소아즈','첨선생','아사미','킬모기','행동하는대파','비타오빠','빵덕후','라부부잡이','징냥','네미','키티쥬','블랙카우','혜헤','하이냠냠이','피규어사냥꾼','미난','돈없는미나리','몽키D루피','데오임다'];

const DM_TRIGGERS: { msg: string; type: string }[] = [
  { msg: '카톡으로 거래하자', type: 'EXTERNAL_CHANNEL' },{ msg: '계좌이체 해주세요', type: 'EXTERNAL_TRADE' },
  { msg: '010구구칠팔06삼공', type: 'EXTERNAL_TRADE' },{ msg: '수고비 정두?', type: 'EXTERNAL_TRADE' },
  { msg: 'open.kakao.com/o/gauWtLRh', type: 'EXTERNAL_CHANNEL' },{ msg: '직거래 ㄱㄱ', type: 'EXTERNAL_TRADE' },
  { msg: '밴드로 와', type: 'EXTERNAL_CHANNEL' },{ msg: '디스코드 링크 보내줄게', type: 'EXTERNAL_CHANNEL' },
  { msg: '현금으로 보내줘', type: 'EXTERNAL_TRADE' },{ msg: '네이버페이로 보내줘', type: 'EXTERNAL_TRADE' },
  { msg: '안전번호 알려드릴게요', type: 'SUSPICIOUS_CONTACT' },{ msg: '라고할 뻔', type: 'INAPPROPRIATE_LANGUAGE' },
  { msg: '바보', type: 'INAPPROPRIATE_LANGUAGE' },{ msg: '* 흔들지 그랬음', type: 'INAPPROPRIATE_LANGUAGE' },
  { msg: '연락처 보내드림', type: 'EXTERNAL_TRADE' },{ msg: '텔레그램으로 연락해', type: 'EXTERNAL_CHANNEL' },
  { msg: '송금 완료했어요', type: 'EXTERNAL_TRADE' },{ msg: '입근드린다했어여', type: 'EXTERNAL_TRADE' },
  { msg: '오픈채팅 들어와', type: 'EXTERNAL_CHANNEL' },{ msg: 'Psa10보내지말라구!?', type: 'SUSPICIOUS_CONTACT' },
];
const DM_CHATS = [
  '{nick} - {msg}\n상대방 - 네 알겠습니다\n{nick} - 빨리 해주세요',
  '상대방 - 어떻게 보내드릴까요?\n{nick} - {msg}\n{nick} - 수수료 아끼게',
  '{nick} - 안녕하세요\n{nick} - {msg}\n상대방 - 그건 좀..\n{nick} - 괜찮아요',
  '상대방 - 결제는요?\n{nick} - {msg}\n{nick} - 이게 편해요\n상대방 - 넵',
  '{nick} - 사진을 보냈습니다.\n{nick} - {msg}\n상대방 - 확인했어요',
];

const LIVE_NAMES = ['놀이터?아니면 공사판','포켓몬 카드 경매','원피스 카드 라이브','피규어 언박싱','TCG 대전','아트토이 소개','스포츠카드 개봉','랜덤박스 오픈','가챠 라이브','컬렉션 쇼케이스','심야 카드 개봉','주말 특가 라이브'];
const DEALERS = ['띤동','카드왕','시금치다요','피규어맨','토이마스터','컬렉터킴','딜러박','스타딜러','라이브킹','보물사냥꾼'];
const LIVE_V: LiveViolation[] = [
  { flaggedMessage: '그건 빙신아냐?', violationType: '부적절한 언어', violationReason: '경멸적 표현 사용' },
  { flaggedMessage: '다 갬깍하셔요?', violationType: '딜러/컬렉터 공격', violationReason: '딜러 상품 비하' },
  { flaggedMessage: '라고할 뻔', violationType: '부적절한 언어', violationReason: '부적절한 표현' },
  { flaggedMessage: '3천?', violationType: '시세/가격 언급', violationReason: '가격 논의' },
  { flaggedMessage: '5억은 선넘지', violationType: '시세/가격 언급', violationReason: '고가 언급' },
  { flaggedMessage: '나 예니 번호땀', violationType: '외부 거래 유도', violationReason: '외부 연락처 공유 암시' },
  { flaggedMessage: '짝퉁이누…', violationType: '딜러/컬렉터 공격', violationReason: '상품 진정성 비하' },
  { flaggedMessage: '에이씨!!!', violationType: '부적절한 언어', violationReason: '욕설 약자' },
  { flaggedMessage: '보내주겠띠', violationType: '외부 거래 유도', violationReason: '연락처 공유 암시' },
  { flaggedMessage: '미쳐띠???', violationType: '부적절한 언어', violationReason: '경멸적 표현' },
  { flaggedMessage: '근뎉저런여자랑', violationType: '부적절한 언어', violationReason: '차별 표현' },
  { flaggedMessage: '구매 방해하지 마', violationType: '구매 방해', violationReason: '구매 행위 방해' },
  { flaggedMessage: '똥손들이라니ㅋ', violationType: '딜러/컬렉터 공격', violationReason: '딜러 능력 비하' },
];

const OC_ROOMS = ['피규어 잡담방','카드 거래 오픈챗','원피스 팬 모임','아트토이 수다방','TCG 정보 공유','스포츠카드 톡방','컬렉터 모임','초보 질문방','리뷰 채널','자유 채팅','포켓몬 교환방','한정판 알림방'];
const OC_FLAGS = ['카톡으로 연락주세요','시세 얼마에요?','직거래 하실분','에이 씻','개깍이네','밴드로 오세요','계좌번호 알려드림','ㅅㅂ 이게 뭐야','가품 아니에요?','010-xxxx-xxxx','오리파 팝니다','수제팩 3만원'];

const RPT_REASONS = ['욕설·반말 등 불쾌감을 주는 언행','구매를 방해하는 행위','외부 거래 및 외부 결제 유도','시세 및 가격 언급','딜러/컬렉터에 대한 언급·지적','와이스 및 커뮤니티에 대한 부정적 언행','기타 사유','허가되지 않은 상품 판매','불쾌한 메시지','사기 의심'];
const TARGET_MSGS = ['ㅅㅂ 뭐야 이게','갬깍 아니에요?','시세 3천 아닌가요','직거래 하자','밴드로 와요','개싸게 파는데?','짝퉁인데 뭐','계좌 보내드림','카톡으로 연락해','얘 바보아니냐',null,null,null];

// 생성
function genDm(count: number): DmLog[] {
  const logs: DmLog[] = [];
  const bases: { uid: string; nick: string; t: typeof DM_TRIGGERS[0] }[] = [];
  for (let i = 0; i < Math.floor(count * 0.55); i++) bases.push({ uid: `dm_${i}`, nick: randItem(NICKS), t: randItem(DM_TRIGGERS) });
  for (let i = 0; i < count; i++) {
    const b = randItem(bases);
    logs.push({ type: 'dm', id: `dm_${i}`, targetUserId: b.uid, targetNickname: b.nick, triggerMessage: b.t.msg, violationType: b.t.type, chatContent: randItem(DM_CHATS).replace(/\{nick\}/g, b.nick).replace(/\{msg\}/g, b.t.msg), dmLink: '#', timestamp: randomTimestamp(7) });
  }
  return logs;
}
function genLive(count: number): LiveLog[] {
  return Array.from({ length: count }, (_, i) => {
    const vs: LiveViolation[] = Array.from({ length: randBetween(1, 4) }, () => randItem(LIVE_V));
    return { type: 'live' as const, id: `live_${i}`, targetUserId: `lv_${i}`, targetNickname: randItem(NICKS), liveId: `l_${randBetween(10000, 99999)}`, liveName: randItem(LIVE_NAMES), dealerName: randItem(DEALERS), violations: vs, timestamp: randomTimestamp(7) };
  });
}
function genOc(count: number): OpenChatLog[] {
  return Array.from({ length: count }, (_, i) => {
    const nick = randItem(NICKS), flag = randItem(OC_FLAGS);
    return { type: 'openchat' as const, id: `oc_${i}`, targetUserId: `oc_${i}`, targetNickname: nick, roomName: randItem(OC_ROOMS), flaggedMessage: flag, chatContext: `유저A - 안녕하세요~\n유저B - 오 반가워요\n${nick} - ${flag}\n유저A - ??\n유저C - ㅋㅋ`, timestamp: randomTimestamp(7) };
  });
}
function genRpt(count: number): ReportLog[] {
  return Array.from({ length: count }, (_, i) => ({ type: 'report' as const, id: `rpt_${i}`, targetUserId: `rpt_${i}`, targetNickname: randItem(NICKS), reporterNickname: randItem(NICKS), reason: randItem(RPT_REASONS), liveName: Math.random() > 0.3 ? randItem(LIVE_NAMES) : null, targetMessage: randItem(TARGET_MSGS), timestamp: randomTimestamp(7) }));
}

const ALL: LogEntry[] = [...genDm(80), ...genLive(60), ...genOc(55), ...genRpt(55)].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// ===== 유틸 =====
function formatTs(ts: string) { const d = new Date(ts); return `${pad(d.getMonth()+1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; }

interface DmGroup { key: string; latest: DmLog; count: number; earliest: string; }
function groupDm(logs: DmLog[]): DmGroup[] {
  const m = new Map<string, DmLog[]>();
  for (const l of logs) { const k = `${l.targetUserId}::${l.triggerMessage}`; (m.get(k) ?? (m.set(k, []), m.get(k)!)).push(l); }
  return Array.from(m.entries()).map(([key, items]) => { items.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)); return { key, latest: items[0], count: items.length, earliest: items[items.length - 1].timestamp }; }).sort((a, b) => +new Date(b.latest.timestamp) - +new Date(a.latest.timestamp));
}

function filterPeriod(logs: LogEntry[], p: PeriodOption, cr: { start: string; end: string }): LogEntry[] {
  const now = new Date('2026-03-18T23:59:59');
  if (p === '24h') { const c = new Date(now.getTime() - 86400000); return logs.filter(l => new Date(l.timestamp) >= c); }
  if (p === '3d') { const c = new Date(now.getTime() - 3 * 86400000); return logs.filter(l => new Date(l.timestamp) >= c); }
  const s = new Date(cr.start + 'T00:00:00'), e = new Date(cr.end + 'T23:59:59');
  return logs.filter(l => { const d = new Date(l.timestamp); return d >= s && d <= e; });
}

// → 클릭 시 해당 원본으로 바로가기
function getLink(entry: LogEntry): string {
  if (entry.type === 'dm') return entry.dmLink;
  if (entry.type === 'live') return `#live/${entry.liveId}`;
  if (entry.type === 'openchat') return '#openchat';
  return '#report';
}

function handleNavigate(entry: LogEntry) {
  const url = getLink(entry);
  if (url && url !== '#') {
    window.open(url, '_blank');
  } else {
    // mock에서는 alert으로 표시
    const labels: Record<string, string> = { dm: 'DM 대화 모니터', live: '라이브 모니터', openchat: '오픈챗 모니터', report: '신고 상세' };
    alert(`${labels[entry.type]} 바로가기\n→ ${entry.targetNickname} (${formatTs(entry.timestamp)})`);
  }
}

// ===== 테이블 행 =====
function TrDm({ g }: { g: DmGroup }) {
  const l = g.latest;
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-2 px-2 text-xs text-gray-500 whitespace-nowrap">{formatTs(l.timestamp)}</td>
      <td className="py-2 px-2 text-sm font-medium">{l.targetNickname}</td>
      <td className="py-2 px-2 text-sm text-red-600 truncate max-w-[240px]">{l.triggerMessage}</td>
      <td className="py-2 px-2"><span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">{l.violationType}</span></td>
      <td className="py-2 px-2 text-xs text-gray-400 text-center">{g.count > 1 ? `${g.count}회` : ''}</td>
      <td className="py-2 px-1"><button onClick={() => handleNavigate(l)} className="text-gray-400 hover:text-blue-600 text-lg" title="DM 대화 바로가기">&rarr;</button></td>
    </tr>
  );
}

function TrLive({ l }: { l: LiveLog }) {
  const first = l.violations[0];
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-2 px-2 text-xs text-gray-500 whitespace-nowrap">{formatTs(l.timestamp)}</td>
      <td className="py-2 px-2 text-sm font-medium">{l.targetNickname}</td>
      <td className="py-2 px-2 text-xs text-gray-500 truncate max-w-[140px]">{l.liveName}</td>
      <td className="py-2 px-2 text-sm text-red-600 truncate max-w-[200px]">{first?.flaggedMessage}</td>
      <td className="py-2 px-2"><span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">{first?.violationType}</span></td>
      <td className="py-2 px-2 text-xs text-gray-400 text-center">{l.violations.length > 1 ? `${l.violations.length}건` : ''}</td>
      <td className="py-2 px-1"><button onClick={() => handleNavigate(l)} className="text-gray-400 hover:text-blue-600 text-lg" title="라이브 모니터 바로가기">&rarr;</button></td>
    </tr>
  );
}

function TrOc({ l }: { l: OpenChatLog }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-2 px-2 text-xs text-gray-500 whitespace-nowrap">{formatTs(l.timestamp)}</td>
      <td className="py-2 px-2 text-sm font-medium">{l.targetNickname}</td>
      <td className="py-2 px-2 text-xs text-gray-500 truncate max-w-[140px]">{l.roomName}</td>
      <td className="py-2 px-2 text-sm text-red-600 truncate max-w-[280px]">{l.flaggedMessage}</td>
      <td className="py-2 px-1"><button onClick={() => handleNavigate(l)} className="text-gray-400 hover:text-blue-600 text-lg" title="오픈챗 바로가기">&rarr;</button></td>
    </tr>
  );
}

function TrRpt({ l }: { l: ReportLog }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-2 px-2 text-xs text-gray-500 whitespace-nowrap">{formatTs(l.timestamp)}</td>
      <td className="py-2 px-2 text-sm font-medium">{l.targetNickname}</td>
      <td className="py-2 px-2 text-xs text-gray-500 truncate max-w-[140px]">{l.liveName ?? '-'}</td>
      <td className="py-2 px-2 text-sm text-gray-700 truncate max-w-[200px]">{l.reason}</td>
      <td className="py-2 px-2 text-xs text-red-600 truncate max-w-[160px]">{l.targetMessage ?? ''}</td>
      <td className="py-2 px-2 text-xs text-gray-400">{l.reporterNickname}</td>
      <td className="py-2 px-1"><button onClick={() => handleNavigate(l)} className="text-gray-400 hover:text-blue-600 text-lg" title="신고 상세 바로가기">&rarr;</button></td>
    </tr>
  );
}

// ===== 메인 =====
const SRC_OPTS: { value: LogSource; label: string }[] = [
  { value: 'DM', label: 'DM' },{ value: 'OPENCHAT', label: '오픈챗' },{ value: 'LIVE', label: '라이브챗' },{ value: 'REPORT', label: '신고' },
];
const PER_OPTS: { value: PeriodOption; label: string }[] = [
  { value: '24h', label: '24시간' },{ value: '3d', label: '3일' },{ value: 'custom', label: '기간 설정' },
];

export default function LogView() {
  const [source, setSource] = useState<LogSource>('DM');
  const [period, setPeriod] = useState<PeriodOption>('24h');
  const [customRange, setCustomRange] = useState({ start: '2026-03-15', end: '2026-03-18' });
  const [search, setSearch] = useState('');

  const bySource = useMemo(() => ALL.filter(l => l.type === (source === 'OPENCHAT' ? 'openchat' : source === 'LIVE' ? 'live' : source === 'REPORT' ? 'report' : 'dm')), [source]);
  const byPeriod = useMemo(() => filterPeriod(bySource, period, customRange), [bySource, period, customRange]);
  const filtered = useMemo(() => {
    if (!search.trim()) return byPeriod;
    const q = search.trim().toLowerCase();
    return byPeriod.filter(l => l.targetNickname.toLowerCase().includes(q));
  }, [byPeriod, search]);

  const dmGroups = useMemo(() => source === 'DM' ? groupDm(filtered as DmLog[]) : [], [source, filtered]);
  const count = source === 'DM' ? dmGroups.length : filtered.length;

  return (
    <div className="space-y-3">
      {/* 필터 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">구분:</label>
          <select value={source} onChange={e => { setSource(e.target.value as LogSource); setSelected(null); }} className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
            {SRC_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">기간:</label>
          <select value={period} onChange={e => setPeriod(e.target.value as PeriodOption)} className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
            {PER_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {period === 'custom' && (
            <div className="flex items-center gap-1">
              <input type="date" value={customRange.start} onChange={e => setCustomRange(r => ({ ...r, start: e.target.value }))} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <span className="text-gray-400">~</span>
              <input type="date" value={customRange.end} onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
          )}
        </div>
        <div className="ml-auto">
          <input type="text" placeholder="닉네임 검색" value={search} onChange={e => setSearch(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-44" />
        </div>
      </div>

      <div className="text-xs text-gray-400">{count}건{source === 'DM' ? ' (그룹핑)' : ''}</div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {source === 'DM' && (
              <tr className="border-b-2 border-gray-200 text-left text-gray-500 text-xs">
                <th className="py-2 px-2 font-medium w-[90px]">시간</th>
                <th className="py-2 px-2 font-medium">닉네임</th>
                <th className="py-2 px-2 font-medium">감지 메시지</th>
                <th className="py-2 px-2 font-medium">위반 유형</th>
                <th className="py-2 px-2 font-medium w-[50px] text-center">반복</th>
                <th className="py-2 px-1 w-[30px]"></th>
              </tr>
            )}
            {source === 'LIVE' && (
              <tr className="border-b-2 border-gray-200 text-left text-gray-500 text-xs">
                <th className="py-2 px-2 font-medium w-[90px]">시간</th>
                <th className="py-2 px-2 font-medium">닉네임</th>
                <th className="py-2 px-2 font-medium">라이브</th>
                <th className="py-2 px-2 font-medium">감지 메시지</th>
                <th className="py-2 px-2 font-medium">위반 유형</th>
                <th className="py-2 px-2 font-medium w-[50px] text-center">건수</th>
                <th className="py-2 px-1 w-[30px]"></th>
              </tr>
            )}
            {source === 'OPENCHAT' && (
              <tr className="border-b-2 border-gray-200 text-left text-gray-500 text-xs">
                <th className="py-2 px-2 font-medium w-[90px]">시간</th>
                <th className="py-2 px-2 font-medium">닉네임</th>
                <th className="py-2 px-2 font-medium">오픈챗방</th>
                <th className="py-2 px-2 font-medium">감지 메시지</th>
                <th className="py-2 px-1 w-[30px]"></th>
              </tr>
            )}
            {source === 'REPORT' && (
              <tr className="border-b-2 border-gray-200 text-left text-gray-500 text-xs">
                <th className="py-2 px-2 font-medium w-[90px]">시간</th>
                <th className="py-2 px-2 font-medium">대상자</th>
                <th className="py-2 px-2 font-medium">라이브</th>
                <th className="py-2 px-2 font-medium">사유</th>
                <th className="py-2 px-2 font-medium">대상자 발언</th>
                <th className="py-2 px-2 font-medium">신고자</th>
                <th className="py-2 px-1 w-[30px]"></th>
              </tr>
            )}
          </thead>
          <tbody>
            {count === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">해당 기간에 로그가 없습니다.</td></tr>
            )}
            {source === 'DM' && dmGroups.map(g => <TrDm key={g.key} g={g} />)}
            {source === 'LIVE' && (filtered as LiveLog[]).map(l => <TrLive key={l.id} l={l} />)}
            {source === 'OPENCHAT' && (filtered as OpenChatLog[]).map(l => <TrOc key={l.id} l={l} />)}
            {source === 'REPORT' && (filtered as ReportLog[]).map(l => <TrRpt key={l.id} l={l} />)}
          </tbody>
        </table>
      </div>

    </div>
  );
}
