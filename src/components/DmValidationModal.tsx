import { useState } from 'react';
import type { Label, SubLabel } from '../types';
import { LABEL_TEXT, SUB_LABEL_TEXT, LABEL_TO_SUB_LABELS, SUB_LABEL_TO_LABEL } from '../types';

const PARENT_LABELS: Exclude<Label, 'OTHER'>[] = [
  'EXTERNAL_TRADE',
  'COMMUNITY_VIOLATION',
  'PRODUCT_SELLING',
  'LIVE_VIOLATION',
  'DEAL_ISSUE',
  'ACCOUNT_ABUSE',
];

interface DmValidationModalProps {
  targetNickname: string;
  participants: string[];
  onSubmit: (data: { selectedUsers: string[]; label: Label; subLabel: SubLabel; memo: string }) => void;
  onClose: () => void;
}

export default function DmValidationModal({ targetNickname, participants, onSubmit, onClose }: DmValidationModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set([targetNickname]));
  const [subLabel, setSubLabel] = useState<SubLabel | null>(null);
  const [memo, setMemo] = useState('');

  const toggleUser = (nick: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(nick)) next.delete(nick);
      else next.add(nick);
      return next;
    });
  };

  const canSubmit = selectedUsers.size > 0 && subLabel;

  const handleSubmit = () => {
    if (!canSubmit || !subLabel) return;
    const parentLabel = SUB_LABEL_TO_LABEL[subLabel];
    onSubmit({ selectedUsers: Array.from(selectedUsers), label: parentLabel, subLabel, memo });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-[420px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-base font-bold">DM 유효 처리</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* 대상자 선택 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">대상자 선택</label>
            <div className="flex flex-wrap gap-2">
              {participants.map((nick) => (
                <button
                  key={nick}
                  onClick={() => toggleUser(nick)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    selectedUsers.has(nick)
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {nick}
                  {nick === targetNickname && <span className="ml-1 text-xs opacity-60">(감지)</span>}
                </button>
              ))}
            </div>
          </div>

          {/* 라벨 (하위 라벨 그룹핑) */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">라벨</label>
            <div className="space-y-3">
              {PARENT_LABELS.map((parent) => (
                <div key={parent}>
                  <div className="text-xs text-gray-400 mb-1">{LABEL_TEXT[parent]}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {LABEL_TO_SUB_LABELS[parent].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSubLabel(sub)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          subLabel === sub
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {SUB_LABEL_TEXT[sub]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="간단 메모"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              rows={2}
            />
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              canSubmit
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
