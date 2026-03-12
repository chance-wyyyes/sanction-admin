import { useState, useMemo } from 'react';
import type {
  PeriodFilter,
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
  mockReports,
  mockMemos,
} from './data/mock';
import Filters from './components/Filters';
import SanctionUserTable from './components/SanctionUserTable';
import SanctionDetailPanel from './components/SanctionDetailPanel';
import MemoModal from './components/MemoModal';
import Pagination from './components/Pagination';

const ITEMS_PER_PAGE = 10;

function App() {
  // 필터 상태
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: '2026-01-01',
    end: '2026-03-11',
  });
  const [userTypeFilter, setUserTypeFilter] = useState<UserType | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SANCTIONED' | 'NONE'>(
    'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // 정렬 상태 (기본: 누적 제재 내림차순)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'cumulativeSanctionCount',
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

    // 구분 필터
    if (userTypeFilter !== 'ALL') {
      result = result.filter((u) => u.userType === userTypeFilter);
    }

    // 카테고리 필터
    if (categoryFilter !== 'ALL') {
      result = result.filter((u) => u.lastCategory === categoryFilter);
    }

    // 상태 필터
    if (statusFilter === 'SANCTIONED') {
      result = result.filter((u) => u.status === 'SANCTIONED');
    } else if (statusFilter === 'NONE') {
      result = result.filter((u) => u.status === null);
    }

    // 검색
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
  const handlePeriodChange = (p: PeriodFilter) => {
    setPeriod(p);
    setCurrentPage(1);
  };
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
        {/* 헤더 */}
        <h1 className="text-xl font-bold mb-6">제재 유저 관리</h1>

        {/* 필터 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <Filters
            period={period}
            onPeriodChange={handlePeriodChange}
            customDateRange={customDateRange}
            onCustomDateChange={setCustomDateRange}
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
            총 {sortedUsers.length}명 | 신고/감지/경고/제재 숫자 = 선택한 기간 내
            카운트 | 누적 제재 = 전체 기간 고정
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
      </div>

      {/* 상세 패널 */}
      {selectedUser && (
        <SanctionDetailPanel
          user={selectedUser}
          sanctions={mockSanctions[selectedUser.userId] ?? []}
          warnings={mockWarnings[selectedUser.userId] ?? []}
          detections={mockDetections[selectedUser.userId] ?? []}
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
