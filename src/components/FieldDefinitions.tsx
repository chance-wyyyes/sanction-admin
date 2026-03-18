import { useState, useEffect, useCallback } from 'react';

interface TableRow {
  id: string;
  [key: string]: string;
}

interface TableSection {
  id: string;
  title: string;
  columns: { key: string; label: string; width?: string }[];
  rows: TableRow[];
}

const INITIAL_DATA: TableSection[] = [
  {
    id: 'main-columns',
    title: '제재 관리 — 테이블 컬럼',
    columns: [
      { key: 'name', label: '컬럼', width: 'w-[120px]' },
      { key: 'desc', label: '설명' },
      { key: 'note', label: '비고' },
    ],
    rows: [
      { id: '1', name: '닉네임', desc: '유저 닉네임. 클릭 시 유저 상세 페이지로 이동', note: '정렬 가능' },
      { id: '2', name: '카테고리', desc: '마지막 판매 시도 카테고리 (딜러만)', note: '피규어/아트토이/스포츠카드/TCG. 일반유저는 "-"' },
      { id: '3', name: '상태', desc: '현재 제재 상태 (제재중 / -)', note: '정렬 가능' },
      { id: '4', name: '태그', desc: '유저에 부여된 라벨 (6+1 체계)', note: '복수 가능. 유효/경고/제재 이력에서 자동 집계' },
      { id: '5', name: '신고', desc: '누적 신고 당한 횟수', note: '약한 강조 (muted). 정렬 가능' },
      { id: '6', name: '감지', desc: '누적 patrol 감지 횟수', note: '약한 강조 (muted). 정렬 가능' },
      { id: '7', name: '유효', desc: '어드민이 확인한 유효 건수', note: '파란색 강조. 정렬 가능' },
      { id: '8', name: '경고', desc: '어드민 DM 경고 횟수', note: '주황색 강조. 정렬 가능' },
      { id: '9', name: '제재', desc: '실제 제재 횟수', note: '빨간색 강조. 정렬 가능' },
      { id: '10', name: '유효일', desc: '마지막 유효 처리 일자 (MM.DD)', note: '기본 정렬 기준 (내림차순). 없으면 "-"' },
      { id: '11', name: '액션: 유효', desc: '해당 유저에 대해 유효 처리 버튼', note: '파란색 버튼' },
      { id: '12', name: '액션: →', desc: '상세 패널 열기', note: '' },
    ],
  },
  {
    id: 'filters',
    title: '제재 관리 — 필터',
    columns: [
      { key: 'name', label: '필터', width: 'w-[120px]' },
      { key: 'options', label: '선택지' },
      { key: 'default', label: '기본값', width: 'w-[80px]' },
      { key: 'desc', label: '설명' },
    ],
    rows: [
      { id: '1', name: '구분', options: '전체 / 라이브딜러 / 일반딜러 / 일반유저', default: '전체', desc: '유저 유형별 필터링' },
      { id: '2', name: '카테고리', options: '전체 / 피규어 / 아트토이 / 스포츠카드 / TCG', default: '전체', desc: '마지막 판매 카테고리 기준' },
      { id: '3', name: '상태', options: '전체 / 제재중 / 해제', default: '전체', desc: '현재 제재 상태 기준' },
      { id: '4', name: '검색', options: '닉네임 텍스트 입력', default: '-', desc: '부분 일치 검색' },
    ],
  },
  {
    id: 'detail-panel',
    title: '제재 관리 — 상세 패널 (→)',
    columns: [
      { key: 'section', label: '섹션', width: 'w-[130px]' },
      { key: 'fields', label: '표시 항목' },
      { key: 'desc', label: '설명' },
    ],
    rows: [
      { id: '1', section: '헤더', fields: '닉네임, 구분, 상태, 태그, 가입일, 입점일', desc: '유저 기본 정보' },
      { id: '2', section: '요약 수치', fields: '신고(muted), 감지(muted), 유효(파랑), 경고(주황), 제재(빨강)', desc: '유효~제재 강조, 신고·감지 약화' },
      { id: '3', section: '감지/유효 추이', fields: '월별 막대 그래프 (감지=회색, 유효=파랑)', desc: '최근 6개월. 데이터 있을 때만 표시' },
      { id: '4', section: '어드민 메모', fields: '작성자, 일시, 내용', desc: '메모 있을 때만 표시' },
      { id: '5', section: '제재 이력', fields: '시작일, 종료일(기간/영구), 라벨, 제재유형, 상세사유', desc: '' },
      { id: '6', section: '경고 이력', fields: '일시, 라벨, 경고 내용', desc: '' },
      { id: '7', section: '유효 이력', fields: '일시, 라벨, 확인자, 메모', desc: '어드민이 확인한 유효 건 목록' },
      { id: '8', section: '감지 이력', fields: '라벨, 일시 + 패트롤 형식 (닉네임:감지텍스트, 위반유형, DM맥락)', desc: '실제 슬랙 패트롤 알림과 동일 구조' },
      { id: '9', section: '신고 이력', fields: '일시, 신고자, 신고 사유', desc: 'muted 스타일. 3건 초과 시 접기/펼치기' },
    ],
  },
  {
    id: 'labels',
    title: '라벨 체계 (v4, 6+1)',
    columns: [
      { key: 'code', label: '코드', width: 'w-[180px]' },
      { key: 'text', label: '표시명', width: 'w-[110px]' },
      { key: 'presets', label: '대응 프리셋' },
    ],
    rows: [
      { id: '1', code: 'EXTERNAL_TRADE', text: '외부거래', presets: '외부 거래, 외부 채널 홍보' },
      { id: '2', code: 'COMMUNITY_VIOLATION', text: '커뮤니티 위반', presets: '문제성 채팅, 서비스·타인 비방, 담합·친목' },
      { id: '3', code: 'PRODUCT_SELLING', text: '판매 위반', presets: '문제성 판매(커스텀팩), 거래 금지 품목' },
      { id: '4', code: 'LIVE_VIOLATION', text: '라이브 위반', presets: '문제성 라이브, 비효율 라이브' },
      { id: '5', code: 'DEAL_ISSUE', text: '거래 이슈', presets: '배송 문제, 거래 파기' },
      { id: '6', code: 'ACCOUNT_ABUSE', text: '계정 어뷰징', presets: '계정 어뷰징, 닉네임/이미지' },
      { id: '7', code: 'OTHER', text: '기타', presets: '-' },
    ],
  },
  {
    id: 'log-tab',
    title: '로그 탭 — 구조',
    columns: [
      { key: 'source', label: '소스', width: 'w-[100px]' },
      { key: 'columns', label: '테이블 컬럼' },
      { key: 'detail', label: '상세 패널 (→)' },
      { key: 'note', label: '비고' },
    ],
    rows: [
      { id: '1', source: 'DM', columns: '시간, 닉네임, 감지 메시지, 위반 유형, 반복 횟수', detail: '감지 메시지, 위반 유형, 대화 내용 (하이라이트)', note: '동일 유저+메시지 그룹핑. 30분 주기 patrol 중복 제거' },
      { id: '2', source: '오픈챗', columns: '시간, 닉네임, 오픈챗방, 감지 메시지', detail: '감지 메시지, 대화 내용', note: '위반 유형 없음 (오픈챗 특성)' },
      { id: '3', source: '라이브챗', columns: '시간, 닉네임, 라이브명, 감지 메시지, 위반 유형, 건수', detail: '라이브명, 딜러, 위반 내역 (메시지+유형+사유)', note: '한 알림에 복수 위반 가능' },
      { id: '4', source: '신고', columns: '시간, 대상자, 라이브명, 사유, 대상자 발언, 신고자', detail: '라이브명, 신고 사유, 대상자 발언, 신고자', note: '라이브명·대상자 발언은 있을 때만 표시' },
    ],
  },
  {
    id: 'log-filters',
    title: '로그 탭 — 필터',
    columns: [
      { key: 'name', label: '필터', width: 'w-[100px]' },
      { key: 'options', label: '선택지' },
      { key: 'default', label: '기본값', width: 'w-[80px]' },
    ],
    rows: [
      { id: '1', name: '구분', options: 'DM / 오픈챗 / 라이브챗 / 신고 (드롭다운)', default: 'DM' },
      { id: '2', name: '기간', options: '24시간 / 3일 / 기간 설정 (datepicker)', default: '24시간' },
      { id: '3', name: '검색', options: '닉네임 텍스트 입력', default: '-' },
    ],
  },
  {
    id: 'data-flow',
    title: '데이터 흐름',
    columns: [
      { key: 'step', label: '단계', width: 'w-[120px]' },
      { key: 'source', label: '소스' },
      { key: 'action', label: '처리' },
    ],
    rows: [
      { id: '1', step: '신고', source: '유저 간 신고 (customer_issue 슬랙)', action: '→ 로그 탭에 기록. 신고 수 집계' },
      { id: '2', step: '감지', source: 'patrol 봇 (DM/오픈챗/라이브챗 슬랙)', action: '→ 로그 탭에 기록. 감지 수 집계' },
      { id: '3', step: '유효', source: '어드민이 감지/신고 건 확인 후 유효 처리', action: '→ 유효 이력 저장. 유효 수·유효일 갱신. 태그 자동 부여' },
      { id: '4', step: '경고', source: '어드민이 유저 상세 페이지에서 DM 경고', action: '→ 경고 이력 저장. 유저 상세에서 처리' },
      { id: '5', step: '제재', source: '어드민이 유저 상세 페이지에서 제재 실행', action: '→ 제재 이력 저장. 상태 갱신. 유저 상세에서 처리' },
    ],
  },
  {
    id: 'sort-rules',
    title: '정렬 규칙',
    columns: [
      { key: 'item', label: '항목', width: 'w-[130px]' },
      { key: 'desc', label: '설명' },
    ],
    rows: [
      { id: '1', item: '기본 정렬', desc: '마지막 유효일 내림차순 (최근 유효 처리된 유저가 상단)' },
      { id: '2', item: '정렬 방식', desc: '컬럼 헤더 클릭으로 오름차순/내림차순 토글' },
      { id: '3', item: '정렬 불가', desc: '카테고리, 태그 컬럼' },
    ],
  },
];

const STORAGE_KEY = 'field-definitions-data-v2';

function EditableCell({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleBlur = () => { setEditing(false); if (draft !== value) onChange(draft); };

  if (editing) {
    return (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => { if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
        className="w-full border border-blue-400 rounded px-2 py-1 text-sm resize-y min-h-[32px] focus:outline-none focus:ring-2 focus:ring-blue-300"
        rows={draft.split('\n').length}
      />
    );
  }

  return (
    <div
      onClick={() => { setDraft(value); setEditing(true); }}
      className="cursor-text min-h-[24px] hover:bg-blue-50 rounded px-1 -mx-1 transition-colors"
      title="클릭하여 편집"
    >
      {value || <span className="text-gray-300 italic">클릭하여 입력</span>}
    </div>
  );
}

export default function FieldDefinitions() {
  const [sections, setSections] = useState<TableSection[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { return JSON.parse(saved); } catch { return INITIAL_DATA; } }
    return INITIAL_DATA;
  });

  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(sections)); }, [sections]);

  const updateCell = useCallback((sectionId: string, rowId: string, key: string, value: string) => {
    setSections(prev => prev.map(sec => sec.id === sectionId ? { ...sec, rows: sec.rows.map(row => row.id === rowId ? { ...row, [key]: value } : row) } : sec));
    setSaveStatus('저장됨');
    setTimeout(() => setSaveStatus(''), 1500);
  }, []);

  const addRow = useCallback((sectionId: string) => {
    setSections(prev => prev.map(sec => {
      if (sec.id !== sectionId) return sec;
      const newRow: TableRow = { id: `new_${Date.now()}` };
      sec.columns.forEach(col => { newRow[col.key] = ''; });
      return { ...sec, rows: [...sec.rows, newRow] };
    }));
  }, []);

  const deleteRow = useCallback((sectionId: string, rowId: string) => {
    setSections(prev => prev.map(sec => sec.id === sectionId ? { ...sec, rows: sec.rows.filter(r => r.id !== rowId) } : sec));
  }, []);

  const handleReset = () => {
    if (window.confirm('초기 데이터로 되돌리시겠습니까?')) {
      setSections(INITIAL_DATA);
      localStorage.removeItem(STORAGE_KEY);
      setSaveStatus('초기화됨');
      setTimeout(() => setSaveStatus(''), 1500);
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(sections, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'field-definitions.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          셀 <strong>클릭</strong>으로 편집. 자동 저장.
        </div>
        <div className="flex items-center gap-2">
          {saveStatus && <span className="text-xs text-green-600 font-medium">{saveStatus}</span>}
          <button onClick={handleExportJSON} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">JSON 내보내기</button>
          <button onClick={handleReset} className="px-3 py-1.5 text-xs bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">초기화</button>
        </div>
      </div>

      {sections.map(section => (
        <section key={section.id}>
          <h2 className="text-lg font-bold mb-3">{section.title}</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                {section.columns.map(col => (
                  <th key={col.key} className={`border border-gray-300 px-3 py-2 ${col.width ?? ''}`}>{col.label}</th>
                ))}
                <th className="border border-gray-300 px-2 py-2 w-[40px]"></th>
              </tr>
            </thead>
            <tbody>
              {section.rows.map(row => (
                <tr key={row.id} className="group hover:bg-gray-50">
                  {section.columns.map(col => (
                    <td key={col.key} className="border border-gray-300 px-3 py-2">
                      <EditableCell value={row[col.key] ?? ''} onChange={val => updateCell(section.id, row.id, col.key, val)} />
                    </td>
                  ))}
                  <td className="border border-gray-300 px-1 py-2 text-center">
                    <button onClick={() => deleteRow(section.id, row.id)} className="text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100" title="행 삭제">&times;</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => addRow(section.id)} className="mt-1 text-xs text-gray-400 hover:text-blue-600">+ 행 추가</button>
        </section>
      ))}
    </div>
  );
}
