import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type {
  SanctionUserSummary,
  Sanction,
  Warning,
  Detection,
  Validation,
  Report,
  AdminMemo,
} from '../types';
import { USER_TYPE_TEXT, LABEL_TEXT } from '../types';

interface SanctionDetailPanelProps {
  user: SanctionUserSummary;
  sanctions: Sanction[];
  warnings: Warning[];
  detections: Detection[];
  validations: Validation[];
  reports: Report[];
  memos: AdminMemo[];
  onClose: () => void;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return { date: `${month}.${day}`, time: `${hours}:${minutes}` };
}

function buildMonthlyChart(detections: Detection[], validations: Validation[]) {
  const months: Record<string, { month: string; 감지: number; 유효: number }> = {};

  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${d.getMonth() + 1}월`;
    months[key] = { month: label, 감지: 0, 유효: 0 };
  }

  for (const det of detections) {
    const d = new Date(det.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (months[key]) months[key].감지++;
  }

  for (const val of validations) {
    const d = new Date(val.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (months[key]) months[key].유효++;
  }

  return Object.values(months);
}

const PREVIEW_COUNT = 3;

function CollapsibleList<T extends { id: string }>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);
  const hasMore = items.length > PREVIEW_COUNT;

  return (
    <>
      {visible.map((item) => renderItem(item))}
      {hasMore && (
        <tr>
          <td colSpan={3} className="py-2 text-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              {expanded
                ? '접기'
                : `+${items.length - PREVIEW_COUNT}건 더보기`}
            </button>
          </td>
        </tr>
      )}
    </>
  );
}

/** 패트롤 감지 내용을 파싱해서 표시 */
function DetectionContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const headline = lines[0] || '';
  const violationType = lines[1] || '';
  const context = lines.slice(2).filter((l) => l.trim());

  return (
    <div className="space-y-1">
      <div className="font-semibold text-gray-800 text-sm">{headline}</div>
      {violationType && (
        <div className="text-xs text-purple-600">{violationType}</div>
      )}
      {context.length > 0 && (
        <div className="bg-gray-50 border-l-2 border-gray-300 pl-3 py-1.5 mt-1 space-y-0.5">
          {context.map((line, i) => (
            <div key={i} className="text-xs text-gray-500">{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SanctionDetailPanel({
  user,
  sanctions,
  warnings,
  detections,
  validations,
  reports,
  memos,
  onClose,
}: SanctionDetailPanelProps) {
  const chartData = useMemo(
    () => buildMonthlyChart(detections, validations),
    [detections, validations]
  );

  const hasChartData = detections.length > 0 || validations.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative w-[540px] bg-white h-full shadow-xl overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-5 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold">{user.nickname}</h2>
              <span className="text-sm text-gray-500">
                {USER_TYPE_TEXT[user.userType]}
              </span>
              {user.status === 'SANCTIONED' && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                  제재중
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              &times;
            </button>
          </div>
          <div className="mt-2 flex gap-1.5">
            {user.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
              >
                {LABEL_TEXT[tag]}
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            <span>
              가입일{' '}
              <strong className="text-gray-700">
                {user.joinedAt.replace(/-/g, '.')}
              </strong>
            </span>
            {user.enteredAt && (
              <span>
                입점일{' '}
                <strong className="text-gray-700">
                  {user.enteredAt.replace(/-/g, '.')}
                </strong>
              </span>
            )}
          </div>
          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            <span className="text-gray-400">
              신고 <strong className="text-gray-400">{reports.length}</strong>
            </span>
            <span className="text-gray-400">
              감지 <strong className="text-gray-400">{detections.length}</strong>
            </span>
            <span>
              유효 <strong className="text-blue-600">{validations.length}</strong>
            </span>
            <span>
              경고 <strong className="text-orange-600">{warnings.length}</strong>
            </span>
            <span>
              제재 <strong className="text-red-600">{sanctions.length}</strong>
            </span>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* 감지 + 유효 추이 차트 */}
          {hasChartData && (
            <section>
              <h3 className="font-bold text-sm mb-3">감지 / 유효 추이 (최근 6개월)</h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
                    <Tooltip />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="감지" fill="#d1d5db" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="유효" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* 어드민 메모 */}
          {memos.length > 0 && (
            <section>
              <h3 className="font-bold text-sm mb-2">
                어드민 메모 ({memos.length}건)
              </h3>
              <div className="space-y-2">
                {memos.map((m) => {
                  const dt = formatDateTime(m.createdAt);
                  return (
                    <div
                      key={m.id}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-amber-800">
                          {m.adminNickname}
                        </span>
                        <span className="text-xs text-gray-400">
                          {dt.date} {dt.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{m.content}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 제재 이력 */}
          <section>
            <h3 className="font-bold text-sm mb-2">
              제재 이력 ({sanctions.length}건)
            </h3>
            {sanctions.length === 0 ? (
              <p className="text-sm text-gray-400">이력 없음</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="py-2 pr-3 font-medium">시작</th>
                    <th className="py-2 pr-3 font-medium">종료</th>
                    <th className="py-2 pr-3 font-medium">라벨</th>
                    <th className="py-2 pr-3 font-medium">제재유형</th>
                    <th className="py-2 font-medium">상세</th>
                  </tr>
                </thead>
                <tbody>
                  {sanctions.map((s) => {
                    const startDt = formatDateTime(s.startAt);
                    const endDt = s.endAt ? formatDateTime(s.endAt) : null;
                    const days = s.endAt
                      ? Math.ceil(
                          (new Date(s.endAt).getTime() - new Date(s.startAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : null;
                    const sanctionLabel = s.sanctionType
                      .replace(/기능\s*제한:\s*/g, '')
                      .replace(/기능\s*제한\s*/g, '');
                    return (
                      <tr key={s.id} className="border-b border-gray-100">
                        <td className="py-2 pr-3 whitespace-nowrap text-gray-600">
                          <div>{startDt.date}</div>
                          <div className="text-xs text-gray-400">{startDt.time}</div>
                        </td>
                        <td className="py-2 pr-3 whitespace-nowrap text-gray-600">
                          {endDt ? (
                            <>
                              <div>{endDt.date}</div>
                              <div className="text-xs text-gray-400">
                                {endDt.time}{' '}
                                <span className="text-blue-500">({days}일)</span>
                              </div>
                            </>
                          ) : (
                            <span className="text-xs bg-gray-800 text-white px-1.5 py-0.5 rounded">
                              영구
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
                            {LABEL_TEXT[s.label]}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-gray-600">{sanctionLabel}</td>
                        <td className="py-2 text-gray-600">{s.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          {/* 경고 이력 */}
          <section>
            <h3 className="font-bold text-sm mb-2">
              경고 이력 ({warnings.length}건)
            </h3>
            {warnings.length === 0 ? (
              <p className="text-sm text-gray-400">이력 없음</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="py-2 pr-3 font-medium">일시</th>
                    <th className="py-2 pr-3 font-medium">라벨</th>
                    <th className="py-2 font-medium">경고 내용</th>
                  </tr>
                </thead>
                <tbody>
                  {warnings.map((w) => {
                    const dt = formatDateTime(w.createdAt);
                    return (
                      <tr key={w.id} className="border-b border-gray-100">
                        <td className="py-2 pr-3 whitespace-nowrap text-gray-600">
                          <div>{dt.date}</div>
                          <div className="text-xs text-gray-400">{dt.time}</div>
                        </td>
                        <td className="py-2 pr-3">
                          <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">
                            {LABEL_TEXT[w.label]}
                          </span>
                        </td>
                        <td className="py-2 text-gray-600">{w.message}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          {/* 유효 이력 */}
          <section>
            <h3 className="font-bold text-sm mb-2">
              유효 이력 ({validations.length}건)
            </h3>
            {validations.length === 0 ? (
              <p className="text-sm text-gray-400">이력 없음</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="py-2 pr-3 font-medium">일시</th>
                    <th className="py-2 pr-3 font-medium">라벨</th>
                    <th className="py-2 pr-3 font-medium">확인자</th>
                    <th className="py-2 font-medium">메모</th>
                  </tr>
                </thead>
                <tbody>
                  {validations.map((v) => {
                    const dt = formatDateTime(v.createdAt);
                    return (
                      <tr key={v.id} className="border-b border-gray-100">
                        <td className="py-2 pr-3 whitespace-nowrap text-gray-600">
                          <div>{dt.date}</div>
                          <div className="text-xs text-gray-400">{dt.time}</div>
                        </td>
                        <td className="py-2 pr-3">
                          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                            {LABEL_TEXT[v.label]}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-gray-500 text-xs">{v.adminNickname}</td>
                        <td className="py-2 text-gray-600">{v.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          {/* 감지 이력 (패트롤 형식) */}
          <section>
            <h3 className="font-bold text-sm mb-2">
              감지 이력 ({detections.length}건)
            </h3>
            {detections.length === 0 ? (
              <p className="text-sm text-gray-400">이력 없음</p>
            ) : (
              <div className="space-y-3">
                {detections.map((d) => {
                  const dt = formatDateTime(d.createdAt);
                  return (
                    <div key={d.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">
                          {LABEL_TEXT[d.label]}
                        </span>
                        <span className="text-xs text-gray-400">{dt.date} {dt.time}</span>
                      </div>
                      <DetectionContent content={d.content} />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 신고 이력 */}
          <section>
            <h3 className="font-bold text-sm mb-2 text-gray-400">
              신고 이력 ({reports.length}건)
            </h3>
            {reports.length === 0 ? (
              <p className="text-sm text-gray-400">이력 없음</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-400">
                    <th className="py-2 pr-3 font-medium">일시</th>
                    <th className="py-2 pr-3 font-medium">신고자</th>
                    <th className="py-2 font-medium">신고 사유</th>
                  </tr>
                </thead>
                <tbody>
                  <CollapsibleList
                    items={reports}
                    renderItem={(r) => {
                      const dt = formatDateTime(r.createdAt);
                      return (
                        <tr key={r.id} className="border-b border-gray-100">
                          <td className="py-2 pr-3 whitespace-nowrap text-gray-400">
                            <div>{dt.date}</div>
                            <div className="text-xs text-gray-300">{dt.time}</div>
                          </td>
                          <td className="py-2 pr-3 text-gray-400">
                            {r.reporterNickname}
                          </td>
                          <td className="py-2 text-gray-400">{r.reason}</td>
                        </tr>
                      );
                    }}
                  />
                </tbody>
              </table>
            )}
          </section>

          <div className="pt-4 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              유저 상세 페이지로 이동 &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
