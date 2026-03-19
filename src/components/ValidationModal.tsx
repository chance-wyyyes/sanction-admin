import { useState } from 'react';
import type { Label, SubLabel } from '../types';
import { LABEL_TEXT, SUB_LABEL_TEXT, LABEL_TO_SUB_LABELS, SUB_LABEL_TO_LABEL } from '../types';

type Channel = 'LIVE' | 'COMMUNITY' | 'TRADE';

const CHANNELS: { value: Channel; label: string }[] = [
  { value: 'LIVE', label: '라이브' },
  { value: 'COMMUNITY', label: '커뮤니티' },
  { value: 'TRADE', label: '거래' },
];

const PARENT_LABELS: Exclude<Label, 'OTHER'>[] = [
  'EXTERNAL_TRADE',
  'COMMUNITY_VIOLATION',
  'PRODUCT_SELLING',
  'LIVE_VIOLATION',
  'DEAL_ISSUE',
  'ACCOUNT_ABUSE',
];

interface ValidationModalProps {
  nickname: string;
  onSubmit: (data: { channel: Channel; label: Label; subLabel: SubLabel; memo: string }) => void;
  onClose: () => void;
}

export default function ValidationModal({ nickname, onSubmit, onClose }: ValidationModalProps) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [subLabel, setSubLabel] = useState<SubLabel | null>(null);
  const [memo, setMemo] = useState('');

  const canSubmit = channel && subLabel;

  const handleSubmit = () => {
    if (!channel || !subLabel) return;
    const parentLabel = SUB_LABEL_TO_LABEL[subLabel];
    onSubmit({ channel, label: parentLabel, subLabel, memo });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-[480px] max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold">유효 처리</h2>
            <p className="text-sm text-gray-500 mt-0.5">유저: <strong className="text-gray-800">{nickname}</strong></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* 문제 채널 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">문제 채널</label>
            <div className="flex gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.value}
                  onClick={() => setChannel(ch.value)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    channel === ch.value
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {ch.label}
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
            <label className="text-sm font-medium text-gray-700 block mb-2">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="간단 메모 입력"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
              rows={3}
            />
          </div>
        </div>

        {/* 하단 */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
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
