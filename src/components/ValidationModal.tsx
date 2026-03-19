import { useState } from 'react';
import type { Label, SubLabel } from '../types';
import { SUB_LABEL_TEXT, SUB_LABEL_TO_LABEL } from '../types';

type Channel = 'LIVE' | 'COMMUNITY' | 'TRADE';

const ALL_SUB_LABELS: SubLabel[] = [
  'EXTERNAL_DEAL', 'EXTERNAL_CHANNEL_PROMO',
  'INAPPROPRIATE_CHAT', 'HARASSMENT', 'GROUP_ABUSE',
  'PROBLEMATIC_SALE', 'PROHIBITED_ITEM', 'FRAUDULENT_DEAL',
  'INAPPROPRIATE_LIVE', 'INEFFICIENT_LIVE',
  'DELIVERY_ISSUE', 'DEAL_CANCELLATION',
  'ACCOUNT_MISUSE', 'INAPPROPRIATE_PROFILE',
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
    onSubmit({ channel, label: SUB_LABEL_TO_LABEL[subLabel], subLabel, memo });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-[440px]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div>
            <h2 className="text-base font-bold">유효 처리</h2>
            <p className="text-xs text-gray-500">유저: <strong className="text-gray-800">{nickname}</strong></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* 채널 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 w-12 shrink-0">채널</span>
            <div className="flex gap-1.5">
              {(['LIVE', 'COMMUNITY', 'TRADE'] as Channel[]).map(ch => (
                <button key={ch} onClick={() => setChannel(ch)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${channel === ch ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                  {ch === 'LIVE' ? '라이브' : ch === 'COMMUNITY' ? '커뮤니티' : '거래'}
                </button>
              ))}
            </div>
          </div>

          {/* 라벨 — 플랫 나열 */}
          <div>
            <span className="text-xs font-medium text-gray-500 block mb-1.5">라벨</span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SUB_LABELS.map(sub => (
                <button key={sub} onClick={() => setSubLabel(sub)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${subLabel === sub ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                  {SUB_LABEL_TEXT[sub]}
                </button>
              ))}
            </div>
          </div>

          {/* 메모 */}
          <div className="flex items-start gap-2">
            <span className="text-xs font-medium text-gray-500 w-12 shrink-0 pt-1.5">메모</span>
            <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="선택" className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" rows={1} />
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
          <button onClick={handleSubmit} disabled={!canSubmit} className={`px-5 py-1.5 text-sm font-medium rounded-lg transition-colors ${canSubmit ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
