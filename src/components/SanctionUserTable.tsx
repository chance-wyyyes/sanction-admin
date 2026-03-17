import type { SanctionUserSummary, SortConfig, SortField } from '../types';
import { LABEL_TEXT, CATEGORY_TEXT } from '../types';

interface SanctionUserTableProps {
  users: SanctionUserSummary[];
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  onDetailClick: (userId: string) => void;
  onMemoClick: (userId: string) => void;
}

interface ColumnDef {
  field: SortField | '_tag' | '_category';
  label: string;
  sortable: boolean;
  emphasis?: 'muted' | 'strong';
}

const COLUMNS: ColumnDef[] = [
  { field: 'nickname', label: '닉네임', sortable: true },
  { field: '_category', label: '카테고리', sortable: false },
  { field: 'status', label: '상태', sortable: true },
  { field: '_tag', label: '태그', sortable: false },
  { field: 'reportCount', label: '신고', sortable: true, emphasis: 'muted' },
  { field: 'detectionCount', label: '감지', sortable: true, emphasis: 'muted' },
  { field: 'validCount', label: '유효', sortable: true, emphasis: 'strong' },
  { field: 'warningCount', label: '경고', sortable: true, emphasis: 'strong' },
  { field: 'sanctionCount', label: '제재', sortable: true, emphasis: 'strong' },
  { field: 'lastValidAt', label: '유효일', sortable: true, emphasis: 'strong' },
];

const CATEGORY_COLORS: Record<string, string> = {
  FIGURE: 'bg-indigo-50 text-indigo-700',
  ART_TOY: 'bg-pink-50 text-pink-700',
  SPORTS_CARD: 'bg-green-50 text-green-700',
  TCG: 'bg-cyan-50 text-cyan-700',
};

function CountCell({ value, emphasis, color }: { value: number; emphasis?: 'muted' | 'strong'; color?: string }) {
  if (value === 0) {
    return <span className={emphasis === 'muted' ? 'text-gray-200' : 'text-gray-300'}>0</span>;
  }
  if (color) {
    return <span className={`${color} font-bold`}>{value}</span>;
  }
  if (emphasis === 'muted') {
    return <span className="text-gray-400">{value}</span>;
  }
  return <span className="text-gray-800 font-semibold">{value}</span>;
}

function formatShortDate(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

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
              const isMuted = col.emphasis === 'muted';
              return (
                <th
                  key={col.label}
                  className={`py-3 px-2 font-semibold select-none ${
                    isActive
                      ? 'text-gray-900 bg-gray-50'
                      : isMuted
                        ? 'text-gray-400'
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
                <td className="py-3 px-2">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left">
                    {user.nickname}
                  </button>
                </td>
                <td className="py-3 px-2">
                  {user.lastCategory ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[user.lastCategory]}`}>
                      {CATEGORY_TEXT[user.lastCategory]}
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  {user.status === 'SANCTIONED' ? (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">제재중</span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  <div className="flex flex-wrap gap-1">
                    {user.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {LABEL_TEXT[tag]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <CountCell value={user.reportCount} emphasis="muted" />
                </td>
                <td className="py-3 px-2 text-center">
                  <CountCell value={user.detectionCount} emphasis="muted" />
                </td>
                <td className="py-3 px-2 text-center">
                  <CountCell value={user.validCount} emphasis="strong" color={user.validCount > 0 ? 'text-blue-600' : undefined} />
                </td>
                <td className="py-3 px-2 text-center">
                  <CountCell value={user.warningCount} emphasis="strong" color={user.warningCount > 0 ? 'text-orange-600' : undefined} />
                </td>
                <td className="py-3 px-2 text-center">
                  <CountCell value={user.sanctionCount} emphasis="strong" color={user.sanctionCount > 0 ? 'text-red-600' : undefined} />
                </td>
                <td className="py-3 px-2 text-center text-xs">
                  {user.lastValidAt ? (
                    <span className="text-gray-700 font-medium">{formatShortDate(user.lastValidAt)}</span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="py-3 px-1">
                  <button
                    onClick={() => onMemoClick(user.userId)}
                    className="text-blue-500 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                    title="유효 처리"
                  >
                    유효
                  </button>
                </td>
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
