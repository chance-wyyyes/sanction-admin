import { useState, useMemo } from 'react';
import DmValidationModal from './DmValidationModal';
import ValidationModal from './ValidationModal';

// ===== 타입 =====
type LogSource = 'DM' | 'OPENCHAT' | 'LIVE' | 'REPORT';
type PeriodOption = '24h' | '3d' | 'custom';
type LogStatus = 'unread' | 'valid' | 'deleted';

interface DmLog { type: 'dm'; id: string; targetUserId: string; targetNickname: string; triggerMessage: string; violationType: string; chatContent: string; dmLink: string; timestamp: string; }
interface LiveViolation { flaggedMessage: string; violationType: string; violationReason: string; }
interface LiveLog { type: 'live'; id: string; targetUserId: string; targetNickname: string; liveId: string; liveName: string; dealerName: string; violations: LiveViolation[]; timestamp: string; }
interface OpenChatLog { type: 'openchat'; id: string; targetUserId: string; targetNickname: string; roomName: string; flaggedMessage: string; chatContext: string; timestamp: string; }
interface ReportLog { type: 'report'; id: string; targetUserId: string; targetNickname: string; reporterNickname: string; reason: string; liveName: string | null; targetMessage: string | null; timestamp: string; }
type LogEntry = DmLog | LiveLog | OpenChatLog | ReportLog;

// ===== Mock 유틸 =====
function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(a: number, b: number) { return Math.floor(Math.random() * (b - a)) + a; }
function pad(n: number) { return String(n).padStart(2, '0'); }
function randomTimestamp(daysAgo: number): string {
  const now = new Date('2026-03-19T12:00:00');
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
  { msg: '바보', type: 'INAPPROPRIATE_LANGUAGE' },{ msg: '연락처 보내드림', type: 'EXTERNAL_TRADE' },
  { msg: '텔레그램으로 연락해', type: 'EXTERNAL_CHANNEL' },{ msg: '송금 완료했어요', type: 'EXTERNAL_TRADE' },
];
const DM_CHATS = [
  '{nick} - {msg}\n상대방 - 네 알겠습니다\n{nick} - 빨리 해주세요',
  '상대방 - 어떻게 보내드릴까요?\n{nick} - {msg}\n{nick} - 수수료 아끼게',
  '{nick} - 안녕하세요\n{nick} - {msg}\n상대방 - 그건 좀..\n{nick} - 괜찮아요',
  '상대방 - 결제는요?\n{nick} - {msg}\n{nick} - 이게 편해요\n상대방 - 넵',
];
const LIVE_NAMES = ['놀이터?아니면 공사판','포켓몬 카드 경매','원피스 카드 라이브','피규어 언박싱','TCG 대전','아트토이 소개','스포츠카드 개봉','랜덤박스 오픈','가챠 라이브','컬렉션 쇼케이스','심야 카드 개봉','주말 특가 라이브'];
const DEALERS = ['띤동','카드왕','시금치다요','피규어맨','토이마스터','컬렉터킴','딜러박','스타딜러','라이브킹','보물사냥꾼'];
const LIVE_V: LiveViolation[] = [
  { flaggedMessage: '그건 빙신아냐?', violationType: '부적절한 언어', violationReason: '경멸적 표현' },
  { flaggedMessage: '다 갬깍하셔요?', violationType: '딜러/컬렉터 공격', violationReason: '딜러 상품 비하' },
  { flaggedMessage: '3천?', violationType: '시세/가격 언급', violationReason: '가격 논의' },
  { flaggedMessage: '5억은 선넘지', violationType: '시세/가격 언급', violationReason: '고가 언급' },
  { flaggedMessage: '나 예니 번호땀', violationType: '외부 거래 유도', violationReason: '외부 연락처 공유 암시' },
  { flaggedMessage: '짝퉁이누…', violationType: '딜러/컬렉터 공격', violationReason: '상품 진정성 비하' },
  { flaggedMessage: '에이씨!!!', violationType: '부적절한 언어', violationReason: '욕설 약자' },
  { flaggedMessage: '미쳐띠???', violationType: '부적절한 언어', violationReason: '경멸적 표현' },
  { flaggedMessage: '구매 방해하지 마', violationType: '구매 방해', violationReason: '구매 행위 방해' },
  { flaggedMessage: '똥손들이라니ㅋ', violationType: '딜러/컬렉터 공격', violationReason: '딜러 능력 비하' },
];
const OC_ROOMS = ['피규어 잡담방','카드 거래 오픈챗','원피스 팬 모임','아트토이 수다방','TCG 정보 공유','스포츠카드 톡방','컬렉터 모임','초보 질문방','리뷰 채널','자유 채팅'];
const OC_FLAGS = ['카톡으로 연락주세요','시세 얼마에요?','직거래 하실분','에이 씻','개깍이네','밴드로 오세요','계좌번호 알려드림','ㅅㅂ 이게 뭐야','가품 아니에요?','오리파 팝니다','수제팩 3만원'];
const RPT_REASONS = ['욕설·반말 등 불쾌감을 주는 언행','구매를 방해하는 행위','외부 거래 및 외부 결제 유도','시세 및 가격 언급','딜러/컬렉터에 대한 언급·지적','와이스 및 커뮤니티에 대한 부정적 언행','기타 사유','허가되지 않은 상품 판매','불쾌한 메시지','사기 의심'];
const TARGET_MSGS = ['ㅅㅂ 뭐야 이게','갬깍 아니에요?','시세 3천 아닌가요','직거래 하자','밴드로 와요','개싸게 파는데?','짝퉁인데 뭐','계좌 보내드림','카톡으로 연락해','얘 바보아니냐',null,null,null];

function genDm(count: number): DmLog[] {
  return Array.from({ length: count }, (_, i) => {
    const nick = randItem(NICKS), t = randItem(DM_TRIGGERS);
    const other = randItem(NICKS.filter(n => n !== nick));
    const tpl = randItem(DM_CHATS);
    return { type: 'dm' as const, id: `dm_${i}`, targetUserId: `dm_${i}`, targetNickname: nick, triggerMessage: t.msg, violationType: t.type, chatContent: tpl.replace(/\{nick\}/g, nick).replace(/상대방/g, other).replace(/\{msg\}/g, t.msg), dmLink: '#', timestamp: randomTimestamp(7) };
  });
}
function genLive(count: number): LiveLog[] {
  return Array.from({ length: count }, (_, i) => ({ type: 'live' as const, id: `live_${i}`, targetUserId: `lv_${i}`, targetNickname: randItem(NICKS), liveId: `l_${randBetween(10000,99999)}`, liveName: randItem(LIVE_NAMES), dealerName: randItem(DEALERS), violations: Array.from({ length: randBetween(1,3) }, () => randItem(LIVE_V)), timestamp: randomTimestamp(7) }));
}
function genOc(count: number): OpenChatLog[] {
  return Array.from({ length: count }, (_, i) => { const nick = randItem(NICKS), flag = randItem(OC_FLAGS); return { type: 'openchat' as const, id: `oc_${i}`, targetUserId: `oc_${i}`, targetNickname: nick, roomName: randItem(OC_ROOMS), flaggedMessage: flag, chatContext: `유저A - 안녕하세요~\n${nick} - ${flag}\n유저B - ??`, timestamp: randomTimestamp(7) }; });
}
function genRpt(count: number): ReportLog[] {
  return Array.from({ length: count }, (_, i) => ({ type: 'report' as const, id: `rpt_${i}`, targetUserId: `rpt_${i}`, targetNickname: randItem(NICKS), reporterNickname: randItem(NICKS), reason: randItem(RPT_REASONS), liveName: Math.random() > 0.3 ? randItem(LIVE_NAMES) : null, targetMessage: randItem(TARGET_MSGS), timestamp: randomTimestamp(7) }));
}

const ALL: LogEntry[] = [...genDm(80), ...genLive(60), ...genOc(55), ...genRpt(55)].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));

// ===== 유틸 =====
function formatTs(ts: string) { const d = new Date(ts); return `${pad(d.getMonth()+1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; }

function filterPeriod(logs: LogEntry[], p: PeriodOption, cr: { start: string; end: string }): LogEntry[] {
  const now = new Date('2026-03-19T23:59:59');
  if (p === '24h') { const c = new Date(now.getTime() - 86400000); return logs.filter(l => new Date(l.timestamp) >= c); }
  if (p === '3d') { const c = new Date(now.getTime() - 3 * 86400000); return logs.filter(l => new Date(l.timestamp) >= c); }
  const s = new Date(cr.start + 'T00:00:00'), e = new Date(cr.end + 'T23:59:59');
  return logs.filter(l => { const d = new Date(l.timestamp); return d >= s && d <= e; });
}

function handleNavigate(entry: LogEntry) {
  const labels: Record<string, string> = { dm: 'DM 대화 모니터', live: '라이브 모니터', openchat: '오픈챗 모니터', report: '신고 상세' };
  if (entry.type === 'dm' && entry.dmLink !== '#') { window.open(entry.dmLink, '_blank'); return; }
  alert(`${labels[entry.type]} 바로가기\n→ ${entry.targetNickname} (${formatTs(entry.timestamp)})`);
}

// ===== 현황 바 =====
function StatsBar({ total, unread, valid, deleted }: { total: number; unread: number; valid: number; deleted: number }) {
  const pctValid = total ? (valid / total) * 100 : 0;
  const pctDeleted = total ? (deleted / total) * 100 : 0;
  const pctUnread = total ? (unread / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-gray-800">{unread}<span className="text-gray-400">/{total}</span></span>
        <span className="text-gray-400">미처리</span>
        <span className="text-blue-600 font-medium">{valid}</span>
        <span className="text-gray-400">유효</span>
        <span className="text-gray-400 font-medium">{deleted}</span>
        <span className="text-gray-400">삭제</span>
      </div>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
        {pctValid > 0 && <div className="bg-blue-500 h-full" style={{ width: `${pctValid}%` }} />}
        {pctDeleted > 0 && <div className="bg-gray-300 h-full" style={{ width: `${pctDeleted}%` }} />}
        {pctUnread > 0 && <div className="bg-amber-400 h-full" style={{ width: `${pctUnread}%` }} />}
      </div>
    </div>
  );
}

// ===== 행 =====
function ActionBtns({ onValid, onDelete }: { onValid: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-1">
      <button onClick={onValid} className="text-blue-500 hover:text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded border border-blue-200 hover:bg-blue-50">유효</button>
      <button onClick={onDelete} className="text-gray-400 hover:text-gray-600 text-xs px-1.5 py-0.5 rounded border border-gray-200 hover:bg-gray-50">삭제</button>
    </div>
  );
}

function TrDm({ l, onValid, onDelete, className, dimmed }: { l: DmLog; onValid: () => void; onDelete: () => void; className?: string; dimmed?: boolean }) {
  return (
    <tr className={`border-b border-gray-100 ${dimmed ? '' : 'hover:bg-gray-50'} ${className ?? ''}`}>
      <td className="py-1.5 px-2 text-xs text-gray-500 whitespace-nowrap">{formatTs(l.timestamp)}</td>
      <td className="py-1.5 px-2 text-sm font-medium truncate">{l.targetNickname}</td>
      <td className="py-1.5 px-2 text-sm text-red-600 break-words">{l.triggerMessage}</td>
      <td className="py-1.5 px-2"><span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded whitespace-nowrap">{l.violationType}</span></td>
      <td className="py-1.5 px-1">{dimmed ? <span className="text-green-500 text-xs px-1.5">&#10003;</span> : <ActionBtns onValid={onValid} onDelete={onDelete} />}</td>
      <td className="py-1.5 px-1"><button onClick={() => handleNavigate(l)} className="text-gray-400 hover:text-blue-600">&rarr;</button></td>
    </tr>
  );
}
function TrLive({ l, onValid, onDelete, className, dimmed }: { l: LiveLog; onValid: () => void; onDelete: () => void; className?: string; dimmed?: boolean }) {
  const first = l.violations[0];
  return (
    <tr className={`border-b border-gray-100 ${dimmed ? '' : 'hover:bg-gray-50'} ${className ?? ''}`}>
      <td className="py-1.5 px-2 text-xs text-gray-500 whitespace-nowrap">{formatTs(l.timestamp)}</td>
      <td className="py-1.5 px-2 text-sm font-medium truncate">{l.targetNickname}</td>
      <td className="py-1.5 px-2 text-xs text-gray-500 truncate">{l.liveName}</td>
      <td className="py-1.5 px-2 text-sm text-red-600 truncate">{first?.flaggedMessage}</td>
      <td className="py-1.5 px-2"><span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded whitespace-nowrap">{first?.violationType}</span></td>
      <td className="py-1.5 px-2 text-xs text-gray-400 text-center">{l.violations.length > 1 ? l.violations.length : ''}</td>
      <td className="py-1.5 px-1">{dimmed ? <span className="text-green-500 text-xs px-1.5">&#10003;</span> : <ActionBtns onValid={onValid} onDelete={onDelete} />}</td>
      <td className="py-1.5 px-1"><button onClick={() => handleNavigate(l)} className="text-gray-400 hover:text-blue-600">&rarr;</button></td>
    </tr>
  );
}
function TrOc({ l, onValid, onDelete, className, dimmed }: { l: OpenChatLog; onValid: () => void; onDelete: () => void; className?: string; dimmed?: boolean }) {
  return (
    <tr className={`border-b border-gray-100 ${dimmed ? '' : 'hover:bg-gray-50'} ${className ?? ''}`}>
      <td className="py-1.5 px-2 text-xs text-gray-500 whitespace-nowrap">{formatTs(l.timestamp)}</td>
      <td className="py-1.5 px-2 text-sm font-medium truncate">{l.targetNickname}</td>
      <td className="py-1.5 px-2 text-xs text-gray-500 truncate">{l.roomName}</td>
      <td className="py-1.5 px-2 text-sm text-red-600 break-words">{l.flaggedMessage}</td>
      <td className="py-1.5 px-1">{dimmed ? <span className="text-green-500 text-xs px-1.5">&#10003;</span> : <ActionBtns onValid={onValid} onDelete={onDelete} />}</td>
      <td className="py-1.5 px-1"><button onClick={() => handleNavigate(l)} className="text-gray-400 hover:text-blue-600">&rarr;</button></td>
    </tr>
  );
}
function TrRpt({ l, onValid, onDelete, className, dimmed }: { l: ReportLog; onValid: () => void; onDelete: () => void; className?: string; dimmed?: boolean }) {
  return (
    <tr className={`border-b border-gray-100 ${dimmed ? '' : 'hover:bg-gray-50'} ${className ?? ''}`}>
      <td className="py-1.5 px-2 text-xs text-gray-500 whitespace-nowrap">{formatTs(l.timestamp)}</td>
      <td className="py-1.5 px-2 text-sm font-medium truncate">{l.targetNickname}</td>
      <td className="py-1.5 px-2 text-xs text-gray-500 truncate">{l.liveName ?? '-'}</td>
      <td className="py-1.5 px-2 text-sm text-gray-700 truncate">{l.reason}</td>
      <td className="py-1.5 px-2 text-xs text-red-600 truncate">{l.targetMessage ?? ''}</td>
      <td className="py-1.5 px-2 text-xs text-gray-400 truncate">{l.reporterNickname}</td>
      <td className="py-1.5 px-1">{dimmed ? <span className="text-green-500 text-xs px-1.5">&#10003;</span> : <ActionBtns onValid={onValid} onDelete={onDelete} />}</td>
      <td className="py-1.5 px-1"><button onClick={() => handleNavigate(l)} className="text-gray-400 hover:text-blue-600">&rarr;</button></td>
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
  const [customRange, setCustomRange] = useState({ start: '2026-03-16', end: '2026-03-19' });
  const [search, setSearch] = useState('');

  // 상태 관리: logId → status (localStorage 저장)
  const [statuses, setStatuses] = useState<Record<string, LogStatus>>(() => {
    try { const saved = localStorage.getItem('log-statuses'); return saved ? JSON.parse(saved) : {}; } catch { return {}; }
  });
  const getStatus = (id: string): LogStatus => statuses[id] ?? 'unread';
  const setLogStatus = (id: string, s: LogStatus) => setStatuses(prev => {
    const next = { ...prev, [id]: s };
    localStorage.setItem('log-statuses', JSON.stringify(next));
    return next;
  });

  // 유효 모달
  const [dmValidTarget, setDmValidTarget] = useState<DmLog | null>(null);
  const [validTarget, setValidTarget] = useState<{ id: string; nick: string } | null>(null);

  // 필터링
  const bySource = useMemo(() => ALL.filter(l => l.type === (source === 'OPENCHAT' ? 'openchat' : source === 'LIVE' ? 'live' : source === 'REPORT' ? 'report' : 'dm')), [source]);
  const byPeriod = useMemo(() => filterPeriod(bySource, period, customRange), [bySource, period, customRange]);
  const bySearch = useMemo(() => {
    if (!search.trim()) return byPeriod;
    const q = search.trim().toLowerCase();
    return byPeriod.filter(l => l.targetNickname.toLowerCase().includes(q));
  }, [byPeriod, search]);

  // 삭제 제외 (시간순 유지, unread+valid 섞여서 표시)
  const visibleLogs = useMemo(() => bySearch.filter(l => getStatus(l.id) !== 'deleted'), [bySearch, statuses]);

  // 현황 집계
  const stats = useMemo(() => {
    let unread = 0, valid = 0, deleted = 0;
    bySearch.forEach(l => { const s = getStatus(l.id); if (s === 'unread') unread++; else if (s === 'valid') valid++; else deleted++; });
    return { total: bySearch.length, unread, valid, deleted };
  }, [bySearch, statuses]);

  const handleValid = (entry: LogEntry) => {
    if (entry.type === 'dm') setDmValidTarget(entry);
    else setValidTarget({ id: entry.id, nick: entry.targetNickname });
  };
  const handleDelete = (id: string) => setLogStatus(id, 'deleted');

  const colSpan = source === 'REPORT' ? 8 : source === 'LIVE' ? 8 : 6;

  const renderRow = (l: LogEntry) => {
    const isValid = getStatus(l.id) === 'valid';
    const cls = isValid ? 'opacity-40' : '';
    const vFn = isValid ? () => {} : () => handleValid(l);
    const dFn = isValid ? () => {} : () => handleDelete(l.id);
    if (l.type === 'dm') return <TrDm key={l.id} l={l} onValid={vFn} onDelete={dFn} className={cls} dimmed={isValid} />;
    if (l.type === 'live') return <TrLive key={l.id} l={l} onValid={vFn} onDelete={dFn} className={cls} dimmed={isValid} />;
    if (l.type === 'openchat') return <TrOc key={l.id} l={l} onValid={vFn} onDelete={dFn} className={cls} dimmed={isValid} />;
    if (l.type === 'report') return <TrRpt key={l.id} l={l} onValid={vFn} onDelete={dFn} className={cls} dimmed={isValid} />;
    return null;
  };

  return (
    <div className="space-y-3">
      {/* 필터 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">구분:</label>
          <select value={source} onChange={e => setSource(e.target.value as LogSource)} className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
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

      {/* 현황 바 */}
      <StatsBar total={stats.total} unread={stats.unread} valid={stats.valid} deleted={stats.deleted} />

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <colgroup>
            {source === 'DM' && <><col style={{width:78}} /><col style={{width:120}} /><col style={{width:200}} /><col style={{width:130}} /><col style={{width:90}} /><col style={{width:28}} /></>}
            {source === 'LIVE' && <><col style={{width:78}} /><col style={{width:120}} /><col style={{width:150}} /><col /><col style={{width:120}} /><col style={{width:36}} /><col style={{width:90}} /><col style={{width:28}} /></>}
            {source === 'OPENCHAT' && <><col style={{width:78}} /><col style={{width:120}} /><col style={{width:150}} /><col style={{width:220}} /><col style={{width:90}} /><col style={{width:28}} /></>}
            {source === 'REPORT' && <><col style={{width:78}} /><col style={{width:110}} /><col style={{width:140}} /><col /><col style={{width:140}} /><col style={{width:90}} /><col style={{width:90}} /><col style={{width:28}} /></>}
          </colgroup>
          <thead>
            {source === 'DM' && (
              <tr className="border-b-2 border-gray-200 text-left text-gray-500 text-xs">
                <th className="py-2 px-2 font-medium">시간</th><th className="py-2 px-2 font-medium">닉네임</th><th className="py-2 px-2 font-medium">감지 메시지</th><th className="py-2 px-2 font-medium">위반 유형</th><th className="py-2 px-1"></th><th className="py-2 px-1"></th>
              </tr>
            )}
            {source === 'LIVE' && (
              <tr className="border-b-2 border-gray-200 text-left text-gray-500 text-xs">
                <th className="py-2 px-2 font-medium">시간</th><th className="py-2 px-2 font-medium">닉네임</th><th className="py-2 px-2 font-medium">라이브</th><th className="py-2 px-2 font-medium">감지 메시지</th><th className="py-2 px-2 font-medium">위반 유형</th><th className="py-2 px-2 font-medium text-center">건수</th><th className="py-2 px-1"></th><th className="py-2 px-1"></th>
              </tr>
            )}
            {source === 'OPENCHAT' && (
              <tr className="border-b-2 border-gray-200 text-left text-gray-500 text-xs">
                <th className="py-2 px-2 font-medium">시간</th><th className="py-2 px-2 font-medium">닉네임</th><th className="py-2 px-2 font-medium">오픈챗방</th><th className="py-2 px-2 font-medium">감지 메시지</th><th className="py-2 px-1"></th><th className="py-2 px-1"></th>
              </tr>
            )}
            {source === 'REPORT' && (
              <tr className="border-b-2 border-gray-200 text-left text-gray-500 text-xs">
                <th className="py-2 px-2 font-medium">시간</th><th className="py-2 px-2 font-medium">대상자</th><th className="py-2 px-2 font-medium">라이브</th><th className="py-2 px-2 font-medium">사유</th><th className="py-2 px-2 font-medium">대상자 발언</th><th className="py-2 px-2 font-medium">신고자</th><th className="py-2 px-1"></th><th className="py-2 px-1"></th>
              </tr>
            )}
          </thead>
          <tbody>
            {visibleLogs.length === 0 && (
              <tr><td colSpan={colSpan} className="py-12 text-center text-gray-400">로그가 없습니다</td></tr>
            )}
            {visibleLogs.map(l => renderRow(l))}
          </tbody>
        </table>
      </div>

      {/* DM 유효 모달 */}
      {dmValidTarget && (() => {
        const nicks = new Set<string>();
        dmValidTarget.chatContent.split('\n').forEach(line => { const m = line.replace(/^\*/, '').match(/^(.+?) - /); if (m) nicks.add(m[1].trim()); });
        const participants = Array.from(nicks);
        return (
          <DmValidationModal
            targetNickname={dmValidTarget.targetNickname}
            participants={participants.length >= 2 ? participants : [dmValidTarget.targetNickname, '상대방']}
            onSubmit={() => setLogStatus(dmValidTarget.id, 'valid')}
            onClose={() => setDmValidTarget(null)}
          />
        );
      })()}

      {/* 일반 유효 모달 */}
      {validTarget && (
        <ValidationModal
          nickname={validTarget.nick}
          onSubmit={() => setLogStatus(validTarget.id, 'valid')}
          onClose={() => setValidTarget(null)}
        />
      )}
    </div>
  );
}
