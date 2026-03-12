import { useState } from 'react';
import type { AdminMemo } from '../types';

interface MemoModalProps {
  nickname: string;
  memos: AdminMemo[];
  onSubmit: (content: string) => void;
  onClose: () => void;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}.${day} ${hours}:${minutes}`;
}

export default function MemoModal({
  nickname,
  memos,
  onSubmit,
  onClose,
}: MemoModalProps) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-[440px] max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-bold text-sm">
            {nickname} 메모
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* 기존 메모 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {memos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">메모 없음</p>
          ) : (
            memos.map((m) => (
              <div
                key={m.id}
                className="bg-amber-50 border border-amber-200 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-amber-800">
                    {m.adminNickname}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDateTime(m.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{m.content}</p>
              </div>
            ))
          )}
        </div>

        {/* 입력 */}
        <div className="p-4 border-t border-gray-200">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="메모를 입력하세요..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="px-4 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
