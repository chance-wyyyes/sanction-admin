import { useState, useMemo } from 'react';
import type {
  UserType,
  Category,
  SortConfig,
  SortField,
  SanctionUserSummary,
  AdminMemo,
} from './types';
import {
  mockUsers,
  mockSanctions,
  mockWarnings,
  mockDetections,
  mockValidations,
  mockReports,
  mockMemos,
} from './data/mock';
import Filters from './components/Filters';
import SanctionUserTable from './components/SanctionUserTable';
import SanctionDetailPanel from './components/SanctionDetailPanel';
import MemoModal from './components/MemoModal';
import Pagination from './components/Pagination';
import FieldDefinitions from './components/FieldDefinitions';
import LabelingGuide from './components/LabelingGuide';
import LogView from './components/LogView';

type Tab = 'main' | 'log' | 'definitions' | 'labeling';

const ITEMS_PER_PAGE = 10;

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('main');

  // 필터 상태
  const [userTypeFilter, setUserTypeFilter] = useState<UserType | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SANCTIONED' | 'NONE'>(
    'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // 정렬 상태 (기본: 마지막 유효일 내림차순)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'lastValidAt',
    direction: 'desc',
  });

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);

  // 상세 패널
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // 메모 모달
  const [memoUserId, setMemoUserId] = useState<string | null>(null);
  const [memoStore, setMemoStore] = useState<Record<string, AdminMemo[]>>(mockMemos);

  // 필터링
  const filteredUsers = useMemo(() => {
    let result = [...mockUsers];

    if (userTypeFilter !== 'ALL') {
      result = result.filter((u) => u.userType === userTypeFilter);
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter((u) => u.lastCategory === categoryFilter);
    }

    if (statusFilter === 'SANCTIONED') {
      result = result.filter((u) => u.status === 'SANCTIONED');
    } else if (statusFilter === 'NONE') {
      result = result.filter((u) => u.status === null);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((u) => u.nickname.toLowerCase().includes(q));
    }

    return result;
  }, [userTypeFilter, categoryFilter, statusFilter, searchQuery]);

  // 정렬
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];
    sorted.sort((a, b) => {
      const field = sortConfig.field;
      let aVal = a[field as keyof SanctionUserSummary];
      let bVal = b[field as keyof SanctionUserSummary];

      // status 정렬: SANCTIONED > null
      if (field === 'status') {
        aVal = aVal === 'SANCTIONED' ? 1 : 0;
        bVal = bVal === 'SANCTIONED' ? 1 : 0;
      }

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        cmp = aVal.localeCompare(bVal);
      } else {
        cmp = (aVal as number) - (bVal as number);
      }

      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [filteredUsers, sortConfig]);

  // 페이지네이션 적용
  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
    setCurrentPage(1);
  };

  const handleDetailClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleCloseDetail = () => {
    setSelectedUserId(null);
  };

  const handleMemoClick = (userId: string) => {
    setMemoUserId(userId);
  };

  const handleMemoSubmit = (content: string) => {
    if (!memoUserId) return;
    const newMemo: AdminMemo = {
      id: `m_${Date.now()}`,
      targetUserId: memoUserId,
      adminUserId: 'admin_current',
      adminNickname: '나',
      content,
      createdAt: new Date().toISOString(),
    };
    setMemoStore((prev) => ({
      ...prev,
      [memoUserId]: [newMemo, ...(prev[memoUserId] ?? [])],
    }));
  };

  const handleCloseMemo = () => {
    setMemoUserId(null);
  };

  // 필터 변경 시 1페이지로 리셋
  const handleUserTypeChange = (t: UserType | 'ALL') => {
    setUserTypeFilter(t);
    setCurrentPage(1);
  };
  const handleCategoryChange = (c: Category | 'ALL') => {
    setCategoryFilter(c);
    setCurrentPage(1);
  };
  const handleStatusChange = (s: 'ALL' | 'SANCTIONED' | 'NONE') => {
    setStatusFilter(s);
    setCurrentPage(1);
  };
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  // 상세 패널용 데이터
  const selectedUser = selectedUserId
    ? mockUsers.find((u) => u.userId === selectedUserId) ?? null
    : null;

  // 메모 모달용 데이터
  const memoUser = memoUserId
    ? mockUsers.find((u) => u.userId === memoUserId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* 헤더 + 탭 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">제재 유저 관리</h1>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('main')}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                activeTab === 'main'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              제재 관리
            </button>
            <button
              onClick={() => setActiveTab('log')}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                activeTab === 'log'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              로그
            </button>
            <button
              onClick={() => setActiveTab('labeling')}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                activeTab === 'labeling'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              라벨링
            </button>
            <button
              onClick={() => setActiveTab('definitions')}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                activeTab === 'definitions'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              필드 정의서
            </button>
          </div>
        </div>

        {activeTab === 'log' ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <LogView />
          </div>
        ) : activeTab === 'definitions' ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <FieldDefinitions />
          </div>
        ) : activeTab === 'labeling' ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <LabelingGuide />
          </div>
        ) : (
        <>
        {/* 필터 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <Filters
            userTypeFilter={userTypeFilter}
            onUserTypeFilterChange={handleUserTypeChange}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={handleCategoryChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusChange}
            searchQuery={searchQuery}
            onSearchQueryChange={handleSearchChange}
          />
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-400 mb-2">
            총 {sortedUsers.length}명 | 전체 누적 기준 | 기본 정렬: 마지막 유효일
          </div>

          <SanctionUserTable
            users={paginatedUsers}
            sortConfig={sortConfig}
            onSort={handleSort}
            onDetailClick={handleDetailClick}
            onMemoClick={handleMemoClick}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        </>
        )}
      </div>

      {/* 상세 패널 */}
      {selectedUser && (
        <SanctionDetailPanel
          user={selectedUser}
          sanctions={mockSanctions[selectedUser.userId] ?? []}
          warnings={mockWarnings[selectedUser.userId] ?? []}
          detections={mockDetections[selectedUser.userId] ?? []}
          validations={mockValidations[selectedUser.userId] ?? []}
          reports={mockReports[selectedUser.userId] ?? []}
          memos={memoStore[selectedUser.userId] ?? []}
          onClose={handleCloseDetail}
        />
      )}

      {/* 메모 모달 */}
      {memoUser && (
        <MemoModal
          nickname={memoUser.nickname}
          memos={memoStore[memoUser.userId] ?? []}
          onSubmit={handleMemoSubmit}
          onClose={handleCloseMemo}
        />
      )}
    </div>
  );
}

export default App;
