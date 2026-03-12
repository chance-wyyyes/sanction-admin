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
    title: '메인 테이블 컬럼',
    columns: [
      { key: 'name', label: '필드명', width: 'w-[130px]' },
      { key: 'type', label: '타입', width: 'w-[90px]' },
      { key: 'desc', label: '설명' },
      { key: 'sort', label: '정렬', width: 'w-[60px]' },
      { key: 'note', label: '비고' },
    ],
    rows: [
      { id: '1', name: '닉네임', type: 'string', desc: '유저 닉네임. 클릭 시 유저 상세 페이지로 이동', sort: 'O', note: '가나다/ABC 순 정렬' },
      { id: '2', name: '카테고리', type: 'enum', desc: '마지막 판매 시도 카테고리 (딜러만 해당)', sort: 'X', note: '피규어 / 아트토이 / 스포츠카드 / TCG. 일반유저는 "-"' },
      { id: '3', name: '상태', type: 'enum', desc: '현재 제재 상태', sort: 'O', note: '제재중 / - (해제 또는 이력없음)' },
      { id: '4', name: '태그', type: 'string[]', desc: '유저에게 부여된 라벨 목록', sort: 'X', note: '외부거래, 상품판매, 부적절 콘텐츠, 사기, 기타. 복수 가능' },
      { id: '5', name: '신고', type: 'number', desc: '선택 기간 내 다른 유저에게 신고 당한 횟수', sort: 'O', note: '기간 필터에 따라 재계산' },
      { id: '6', name: '감지', type: 'number', desc: '선택 기간 내 patrol 시스템에서 감지된 횟수', sort: 'O', note: '기간 필터에 따라 재계산' },
      { id: '7', name: '경고', type: 'number', desc: '선택 기간 내 어드민이 DM으로 보낸 경고 횟수', sort: 'O', note: '기간 필터에 따라 재계산' },
      { id: '8', name: '제재', type: 'number', desc: '선택 기간 내 실제 제재 횟수', sort: 'O', note: '기간 필터에 따라 재계산' },
      { id: '9', name: '누적 제재', type: 'number', desc: '전체 기간 누적 제재 횟수', sort: 'O', note: '기간 필터 무관, 항상 고정값' },
      { id: '10', name: '제재일수', type: 'number', desc: '전체 기간 누적 제재 일수 합계', sort: 'O', note: '#,###일 형태. 기간 필터 무관' },
    ],
  },
  {
    id: 'filters',
    title: '상단 필터',
    columns: [
      { key: 'name', label: '필터명', width: 'w-[130px]' },
      { key: 'options', label: '선택지' },
      { key: 'default', label: '기본값', width: 'w-[90px]' },
      { key: 'desc', label: '설명' },
    ],
    rows: [
      { id: '1', name: '기간', options: '24시간 / 일주일 / 한달 / 누적 / 직접입력', default: '누적', desc: '신고/감지/경고/제재 카운트 집계 기간. 누적 제재, 제재일수는 영향 없음' },
      { id: '2', name: '구분', options: '전체 / 라이브딜러 / 일반딜러 / 일반유저', default: '전체', desc: '유저 유형별 필터링' },
      { id: '3', name: '카테고리', options: '전체 / 피규어 / 아트토이 / 스포츠카드 / TCG', default: '전체', desc: '마지막 판매 카테고리 기준 필터링. 일반유저는 카테고리 없음' },
      { id: '4', name: '상태 필터', options: '전체 / 제재중 / 해제', default: '전체', desc: '현재 제재 상태 기준 필터링' },
      { id: '5', name: '검색', options: '텍스트 입력', default: '-', desc: '닉네임 텍스트 검색 (부분 일치)' },
    ],
  },
  {
    id: 'labels',
    title: '라벨(태그) 체계',
    columns: [
      { key: 'code', label: '코드', width: 'w-[180px]' },
      { key: 'text', label: '표시 텍스트', width: 'w-[120px]' },
      { key: 'desc', label: '설명' },
    ],
    rows: [
      { id: '1', code: 'EXTERNAL_TRADE', text: '외부거래', desc: '플랫폼 외부에서 거래 유도/시도' },
      { id: '2', code: 'PRODUCT_SELLING', text: '상품판매', desc: '허가되지 않은 상품 판매' },
      { id: '3', code: 'INAPPROPRIATE_CONTENT', text: '부적절 콘텐츠', desc: '욕설, 음란물 등' },
      { id: '4', code: 'FRAUD', text: '사기', desc: '사기 행위' },
      { id: '5', code: 'OTHER', text: '기타', desc: '위 항목에 해당하지 않는 건' },
    ],
  },
  {
    id: 'detail-panel',
    title: '상세 패널 구성',
    columns: [
      { key: 'section', label: '섹션', width: 'w-[130px]' },
      { key: 'fields', label: '포함 필드' },
      { key: 'desc', label: '설명' },
    ],
    rows: [
      { id: '1', section: '헤더', fields: '닉네임, 구분, 상태, 태그, 가입일, 입점일', desc: '유저 기본 정보. 가입일/입점일은 YYYY.MM.DD 형태' },
      { id: '2', section: '요약 수치', fields: '신고, 감지, 경고, 제재 건수', desc: '전체 이력 기준 카운트' },
      { id: '3', section: '신고/감지 추이', fields: '월별 막대 그래프', desc: '최근 6개월 신고/감지 추이. 데이터 있을 때만 표시' },
      { id: '4', section: '어드민 메모', fields: '작성자, 작성일시, 내용', desc: '어드민이 유저 페이지에 기록한 메모. 최신순' },
      { id: '5', section: '제재 이력', fields: '시작일, 종료일(기간), 라벨, 제재유형, 상세사유', desc: '종료일 없으면 "영구" 표시. 기간은 N일 형태' },
      { id: '6', section: '경고 이력', fields: '일시, 라벨, 경고 내용', desc: '어드민 DM 경고 기록' },
      { id: '7', section: '감지 이력', fields: '일시, 라벨, 감지 내용', desc: 'patrol 시스템 감지 기록. 3건 초과 시 접기/펼치기' },
      { id: '8', section: '신고 이력', fields: '일시, 신고자, 신고 사유', desc: '유저 간 신고 기록. 3건 초과 시 접기/펼치기' },
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
      { id: '1', item: '기본 정렬', desc: '누적 제재 내림차순 (가장 많이 제재받은 유저가 상단)' },
      { id: '2', item: '정렬 방식', desc: '컬럼 헤더 클릭으로 오름차순/내림차순 토글' },
      { id: '3', item: '정렬 표시', desc: '활성 컬럼: 파란색 화살표 + 배경 하이라이트 / 비활성: 연한 회색 화살표' },
      { id: '4', item: '정렬 불가', desc: '카테고리, 태그 컬럼은 정렬 불가' },
    ],
  },
  {
    id: 'categories',
    title: '카테고리 정의',
    columns: [
      { key: 'code', label: '코드', width: 'w-[150px]' },
      { key: 'text', label: '표시 텍스트', width: 'w-[120px]' },
      { key: 'color', label: '뱃지 색상', width: 'w-[100px]' },
      { key: 'desc', label: '설명' },
    ],
    rows: [
      { id: '1', code: 'FIGURE', text: '피규어', color: '보라', desc: '피규어 카테고리 딜러' },
      { id: '2', code: 'ART_TOY', text: '아트토이', color: '핑크', desc: '아트토이 카테고리 딜러' },
      { id: '3', code: 'SPORTS_CARD', text: '스포츠카드', color: '초록', desc: '스포츠카드 카테고리 딜러' },
      { id: '4', code: 'TCG', text: 'TCG', color: '시안', desc: 'TCG 카테고리 딜러' },
    ],
  },
];

const STORAGE_KEY = 'field-definitions-data';

function EditableCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleBlur = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  if (editing) {
    return (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="w-full border border-blue-400 rounded px-2 py-1 text-sm resize-y min-h-[32px] focus:outline-none focus:ring-2 focus:ring-blue-300"
        rows={draft.split('\n').length}
      />
    );
  }

  return (
    <div
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
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
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  const [saveStatus, setSaveStatus] = useState<string>('');

  // localStorage에 자동 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  }, [sections]);

  const updateCell = useCallback(
    (sectionId: string, rowId: string, key: string, value: string) => {
      setSections((prev) =>
        prev.map((sec) =>
          sec.id === sectionId
            ? {
                ...sec,
                rows: sec.rows.map((row) =>
                  row.id === rowId ? { ...row, [key]: value } : row
                ),
              }
            : sec
        )
      );
      setSaveStatus('저장됨');
      setTimeout(() => setSaveStatus(''), 1500);
    },
    []
  );

  const addRow = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const newRow: TableRow = { id: `new_${Date.now()}` };
        sec.columns.forEach((col) => {
          newRow[col.key] = '';
        });
        return { ...sec, rows: [...sec.rows, newRow] };
      })
    );
  }, []);

  const deleteRow = useCallback((sectionId: string, rowId: string) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId
          ? { ...sec, rows: sec.rows.filter((r) => r.id !== rowId) }
          : sec
      )
    );
  }, []);

  const handleReset = () => {
    if (window.confirm('초기 데이터로 되돌리시겠습니까? 수정한 내용이 모두 사라집니다.')) {
      setSections(INITIAL_DATA);
      setSaveStatus('초기화됨');
      setTimeout(() => setSaveStatus(''), 1500);
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(sections, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'field-definitions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          각 셀을 <strong>클릭</strong>하면 바로 편집할 수 있습니다. 변경사항은 자동 저장됩니다.
        </div>
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-xs text-green-600 font-medium">{saveStatus}</span>
          )}
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            JSON 내보내기
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            초기화
          </button>
        </div>
      </div>

      {sections.map((section) => (
        <section key={section.id}>
          <h2 className="text-lg font-bold mb-3">{section.title}</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                {section.columns.map((col) => (
                  <th
                    key={col.key}
                    className={`border border-gray-300 px-3 py-2 ${col.width ?? ''}`}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="border border-gray-300 px-2 py-2 w-[40px]"></th>
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row) => (
                <tr key={row.id} className="group hover:bg-gray-50">
                  {section.columns.map((col) => (
                    <td key={col.key} className="border border-gray-300 px-3 py-2">
                      <EditableCell
                        value={row[col.key] ?? ''}
                        onChange={(val) =>
                          updateCell(section.id, row.id, col.key, val)
                        }
                      />
                    </td>
                  ))}
                  <td className="border border-gray-300 px-1 py-2 text-center">
                    <button
                      onClick={() => deleteRow(section.id, row.id)}
                      className="text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="행 삭제"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => addRow(section.id)}
            className="mt-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
          >
            + 행 추가
          </button>
        </section>
      ))}
    </div>
  );
}
