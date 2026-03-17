import type { UserType, Category } from '../types';
import { CATEGORY_TEXT } from '../types';

interface FiltersProps {
  userTypeFilter: UserType | 'ALL';
  onUserTypeFilterChange: (type: UserType | 'ALL') => void;
  categoryFilter: Category | 'ALL';
  onCategoryFilterChange: (cat: Category | 'ALL') => void;
  statusFilter: 'ALL' | 'SANCTIONED' | 'NONE';
  onStatusFilterChange: (status: 'ALL' | 'SANCTIONED' | 'NONE') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export default function Filters({
  userTypeFilter,
  onUserTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
}: FiltersProps) {
  return (
    <div className="space-y-3">
      {/* 상단 필터 행 */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* 구분 필터 */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">구분:</label>
          <select
            value={userTypeFilter}
            onChange={(e) =>
              onUserTypeFilterChange(e.target.value as UserType | 'ALL')
            }
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
          >
            <option value="ALL">전체</option>
            <option value="LIVE_DEALER">라이브딜러</option>
            <option value="GENERAL_DEALER">일반딜러</option>
            <option value="GENERAL_USER">일반유저</option>
          </select>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">카테고리:</label>
          <select
            value={categoryFilter}
            onChange={(e) =>
              onCategoryFilterChange(e.target.value as Category | 'ALL')
            }
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
          >
            <option value="ALL">전체</option>
            {(Object.keys(CATEGORY_TEXT) as Category[]).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_TEXT[cat]}
              </option>
            ))}
          </select>
        </div>

        {/* 검색 */}
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm font-medium text-gray-600">검색:</label>
          <input
            type="text"
            placeholder="닉네임 검색"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48"
          />
        </div>
      </div>

      {/* 상태 필터 */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-gray-600 mr-2">상태 필터:</span>
        {(['ALL', 'SANCTIONED', 'NONE'] as const).map((status) => (
          <button
            key={status}
            onClick={() => onStatusFilterChange(status)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              statusFilter === status
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status === 'ALL' ? '전체' : status === 'SANCTIONED' ? '제재중' : '해제'}
          </button>
        ))}
      </div>
    </div>
  );
}
