import React, { useState, useEffect } from 'react';
import { 
  X, 
  Coins, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  Filter, 
  Gift, 
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { CoinTransaction, UserWallet } from '../../types/wallet';
import { getUserTransactionHistory, getUserWalletStats } from '../../services/walletService';
import { UserProfile } from '../../lib/firebase';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onOpenRecharge?: () => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onOpenRecharge
}) => {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletStats, setWalletStats] = useState<UserWallet | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PURCHASE' | 'GIFT_SENT' | 'GIFT_RECEIVED'>('ALL');

  const loadData = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      const [txList, wallet] = await Promise.all([
        getUserTransactionHistory(currentUser.uid, 50),
        getUserWalletStats(currentUser.uid)
      ]);
      setTransactions(txList);
      if (wallet) {
        setWalletStats(wallet);
      }
    } catch (err) {
      console.warn('Could not load user transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser?.uid) {
      loadData();
    }
  }, [isOpen, currentUser?.uid]);

  if (!isOpen) return null;

  const filtered = transactions.filter((t) => {
    if (selectedFilter === 'ALL') return true;
    return t.type === selectedFilter;
  });

  const currentCoins = currentUser?.coins ?? walletStats?.coinBalance ?? 0;
  const lifetimePurchased = walletStats?.lifetimeCoinsPurchased ?? currentUser?.lifetimeCoinsPurchased ?? currentUser?.totalRecharged ?? 0;
  const lifetimeSpent = walletStats?.lifetimeCoinsSpent ?? currentUser?.lifetimeCoinsSpent ?? 0;
  const lifetimeReceived = walletStats?.lifetimeCoinsReceived ?? currentUser?.lifetimeCoinsReceived ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88vh] bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-linear-to-r from-amber-950/80 via-slate-900 to-slate-900 border-b border-amber-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">व्यवहार नोंदवही (Coin Ledger)</h3>
              <p className="text-xs text-amber-200/80">तुमच्या खात्यातील कॉइन व्यवहार व इतिहास</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Overview Card */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 shrink-0">
          <div className="bg-linear-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-amber-300">सध्याची एकूण शिल्लक</span>
              <div className="text-2xl font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
                <span>🪙</span>
                <span>{currentCoins.toLocaleString()}</span>
              </div>
            </div>
            {onOpenRecharge && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRecharge();
                }}
                className="px-3 py-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                + रिचार्ज करा
              </button>
            )}
          </div>

          {/* Mini Stats Bar */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-2">
              <span className="text-[10px] text-slate-400 block">एकूण खरेदी</span>
              <span className="text-xs font-bold text-emerald-400">+{lifetimePurchased.toLocaleString()}</span>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-2">
              <span className="text-[10px] text-slate-400 block">एकूण खर्च</span>
              <span className="text-xs font-bold text-orange-400">-{lifetimeSpent.toLocaleString()}</span>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-2">
              <span className="text-[10px] text-slate-400 block">भेट मिळाले</span>
              <span className="text-xs font-bold text-purple-400">+{lifetimeReceived.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {[
              { id: 'ALL', label: 'सर्व' },
              { id: 'PURCHASE', label: '🪙 रिचार्ज' },
              { id: 'GIFT_SENT', label: '🎁 पाठवले' },
              { id: 'GIFT_RECEIVED', label: '🎉 मिळाले' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedFilter === f.id
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
            title="रिफ्रेश करा"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Transaction Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
              व्यवहार नोंदवही लोड होत आहे...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <p className="text-sm font-semibold text-slate-300 mb-1">कोणतेही व्यवहार नोंदी नाहीत</p>
              <p className="text-slate-500">तुम्ही केलेले सर्व रिचार्ज आणि भेट व्यवहार येथे दिसतील.</p>
            </div>
          ) : (
            filtered.map((tx) => {
              const isCredit = tx.amount > 0;
              const dateFormatted = new Date(tx.createdAt).toLocaleString('mr-IN', {
                dateStyle: 'short',
                timeStyle: 'short'
              });

              return (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-center justify-between gap-3 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'PURCHASE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : tx.type === 'GIFT_SENT'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{dateFormatted}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500">{tx.id.substring(0, 14)}...</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-black ${
                        isCredit ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {isCredit ? `+🪙 ${tx.amount}` : `-🪙 ${Math.abs(tx.amount)}`}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      शिल्लक: 🪙 {tx.balanceAfter}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
