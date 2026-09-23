import React from 'react';
import { X, UserCheck, UserX, Shield, Users } from 'lucide-react';
import { StageRequest } from '../services/stageService';

interface GuestRequestsSheetProps {
  requests: StageRequest[];
  currentGuestCount: number;
  maxGuests: number;
  onAccept: (request: StageRequest) => void;
  onReject: (requestId: string) => void;
  onClose: () => void;
}

export const GuestRequestsSheet: React.FC<GuestRequestsSheetProps> = ({
  requests,
  currentGuestCount,
  maxGuests,
  onAccept,
  onReject,
  onClose,
}) => {
  const isStageFull = currentGuestCount >= maxGuests;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-4 max-h-[75vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">मंचावरील विनंत्या (Guest Requests)</h3>
              <p className="text-[11px] text-slate-400">
                मंचावर जागा: {currentGuestCount}/{maxGuests}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of pending requests */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {requests.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              सध्या कोणतीही प्रलंबित विनंती नाही.
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    {req.photoURL ? (
                      <img
                        src={req.photoURL}
                        alt={req.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-600"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-white">
                        {req.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-white truncate block">
                      {req.name}
                    </span>
                    {req.district && (
                      <span className="text-[10px] text-amber-300 font-medium">
                        [{req.district}]
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onReject(req.userId)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition-all cursor-pointer"
                    title="नाकारा (Decline)"
                  >
                    <UserX className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onAccept(req)}
                    disabled={isStageFull}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    title="स्वीकारा (Accept)"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>स्वीकारा</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
