import type { SanctionUserSummary, SortConfig, SortField } from '../types';
import { LABEL_TEXT, CATEGORY_TEXT } from '../types';

interface SanctionUserTableProps {
  users: SanctionUserSummary[];
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  onDetailClick: (userId: string) => void;
  onMemoClick: (userId: string) => void;
}

function formatDays(days: number) {
  return days.toLocaleString() + '일';
}

interface ColumnDef {
  field: SortField | '_tag' | '_category';
  label: string;
  sortable: boolean;
}

const COLUMNS: ColumnDef[] = [
  { field: 'nickname', label: '닉네임', sortable: true },
  { field: '_category', label: '카테고리', sortable: false },
  { field: 'status', label: '상태', sortable: true },
  { field: '_tag', label: '태그', sortable: false },
  { field: 'reportCount', label: '신고', sortable: true },
  { field: 'detectionCount', label: '감지', sortable: true },
  { field: 'warningCount', label: '경고', sortable: true },
  { field: 'sanctionCount', label: '제재', sortable: true },
  { field: 'cumulativeSanctionCount', label: '누적 제재', sortable: true },
  { field: 'cumulativeSanctionDays', label: '제재일수', sortable: true },
];

const CATEGORY_COLORS: Record<string, string> = {
  FIGURE: 'bg-indigo-50 text-indigo-700',
  ART_TOY: 'bg-pink-50 text-pink-700',
  SPORTS_CARD: 'bg-green-50 text-green-700',
  TCG: 'bg-cyan-50 text-cyan-700',
};

export default function SanctionUserTable({
  users,
  sortConfig,
  onSort,
  onDetailClick,
  onMemoClick,
}: SanctionUserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200 text-left">
            {COLUMNS.map((col) => {
              const isSortable = col.sortable && col.field !== '_tag' && col.field !== '_category';
              const isActive = isSortable && sortConfig.field === col.field;
              return (
                <th
                  key={col.label}
                  className={`py-3 px-2 font-semibold select-none ${
                    isActive
                      ? 'text-gray-900 bg-gray-50'
                      : 'text-gray-600'
                  } ${isSortable ? 'cursor-pointer hover:text-gray-900 hover:bg-gray-50' : ''}`}
                  onClick={() => isSortable && onSort(col.field as SortField)}
                >
                  {col.label}
                  {isSortable && (
                    <span className={`text-xs ml-0.5 ${isActive ? 'text-blue-600' : 'text-gray-300'}`}>
                      {isActive
                        ? sortConfig.direction === 'asc' ? '\u25B2' : '\u25BC'
                        : '\u25BC'}
                    </span>
                  )}
                </th>
              );
            })}
            <th className="py-3 px-2 font-semibold text-gray-600 text-center" colSpan={2}>
              액션
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={12} className="py-12 text-center text-gray-400">
                해당하는 유저가 없습니다.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.userId}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* 닉네임 */}
                <td className="py-3 px-2">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left">
                    {user.nickname}
                  </button>
                </td>
                {/* 카테고리 */}
                <td className="py-3 px-2">
                  {user.lastCategory ? (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        CATEGORY_COLORS[user.lastCategory]
                      }`}
                    >
                      {CATEGORY_TEXT[user.lastCategory]}
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                {/* 상태 */}
                <td className="py-3 px-2">
                  {user.status === 'SANCTIONED' ? (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                      제재중
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                {/* 태그 */}
                <td className="py-3 px-2">
                  <div className="flex flex-wrap gap-1">
                    {user.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                      >
                        {LABEL_TEXT[tag]}
                      </span>
                    ))}
                  </div>
                </td>
                {/* 신고 */}
                <td className="py-3 px-2 text-center font-medium">
                  {user.reportCount > 0 ? (
                    <span className="text-gray-800">{user.reportCount}</span>
                  ) : (
                    <span className="text-gray-300">0</span>
                  )}
                </td>
                {/* 감지 */}
                <td className="py-3 px-2 text-center font-medium">
                  {user.detectionCount > 0 ? (
                    <span className="text-gray-800">{user.detectionCount}</span>
                  ) : (
                    <span className="text-gray-300">0</span>
                  )}
                </td>
                {/* 경고 */}
                <td className="py-3 px-2 text-center font-medium">
                  {user.warningCount > 0 ? (
                    <span className="text-gray-800">{user.warningCount}</span>
                  ) : (
                    <span className="text-gray-300">0</span>
                  )}
                </td>
                {/* 제재 */}
                <td className="py-3 px-2 text-center font-medium">
                  {user.sanctionCount > 0 ? (
                    <span className="text-red-600">{user.sanctionCount}</span>
                  ) : (
                    <span className="text-gray-300">0</span>
                  )}
                </td>
                {/* 누적 제재 */}
                <td className="py-3 px-2 text-center font-medium">
                  {user.cumulativeSanctionCount > 0 ? (
                    <span className="text-red-800 font-bold">
                      {user.cumulativeSanctionCount}
                    </span>
                  ) : (
                    <span className="text-gray-300">0</span>
                  )}
                </td>
                {/* 제재일수 */}
                <td className="py-3 px-2 text-center font-medium">
                  {user.cumulativeSanctionDays > 0 ? (
                    <span className="text-red-800">
                      {formatDays(user.cumulativeSanctionDays)}
                    </span>
                  ) : (
                    <span className="text-gray-300">0일</span>
                  )}
                </td>
                {/* 메모 */}
                <td className="py-3 px-1">
                  <button
                    onClick={() => onMemoClick(user.userId)}
                    className="text-gray-400 hover:text-amber-600 text-sm px-1.5 py-0.5 rounded hover:bg-amber-50 transition-colors"
                    title="메모 작성"
                  >
                    메모
                  </button>
                </td>
                {/* 상세 */}
                <td className="py-3 px-1">
                  <button
                    onClick={() => onDetailClick(user.userId)}
                    className="text-gray-400 hover:text-gray-700 text-lg"
                    title="상세 보기"
                  >
                    &rarr;
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
