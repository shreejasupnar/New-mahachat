import React, { useState, useEffect } from 'react';
import { 
  X, 
  Gift, 
  Coins, 
  Search, 
  Check, 
  Edit2, 
  Power, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter,
  Save,
  TrendingUp,
  TrendingDown,
  Sliders,
  Sparkles,
  Flame,
  Tag
} from 'lucide-react';
import { CatalogGift, MarketCategoryRate } from '../../types/wallet';
import { 
  fetchLiveGiftCatalog, 
  updateCatalogGift, 
  fetchLiveMarketRates, 
  updateMarketRegime 
} from '../../services/giftCatalogService';

interface AdminGiftManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserUid?: string;
}

export const AdminGiftManagerModal: React.FC<AdminGiftManagerModalProps> = ({
  isOpen,
  onClose,
  currentUserUid
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'market' | 'ledger'>('catalog');
  const [gifts, setGifts] = useState<CatalogGift[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Price editing state
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<number>(0);
  const [savingGiftId, setSavingGiftId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Market regime state
  const [marketRates, setMarketRates] = useState<{ mode: string; headlineMr: string; categories: MarketCategoryRate[] } | null>(null);
  const [savingRegime, setSavingRegime] = useState(false);
  const [customPercentMap, setCustomPercentMap] = useState<Record<string, number>>({
    love: 10,
    friendship: -8,
    festival: 15,
    heritage: 0
  });

  // Add Gift Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGiftNameMr, setNewGiftNameMr] = useState('');
  const [newGiftNameEn, setNewGiftNameEn] = useState('');
  const [newGiftIcon, setNewGiftIcon] = useState('🎁');
  const [newGiftPrice, setNewGiftPrice] = useState(50);
  const [newGiftTheme, setNewGiftTheme] = useState('महाराष्ट्र संस्कृती');

  // Ledger state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState<string>('ALL');

  // Load catalog
  const loadGifts = async () => {
    setLoadingGifts(true);
    try {
      const res = await fetch('/api/admin/gifts');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.gifts)) {
          setGifts(data.gifts);
          return;
        }
      }
      const fallback = await fetchLiveGiftCatalog();
      setGifts(fallback);
    } catch (err) {
      console.warn('Could not load gifts:', err);
    } finally {
      setLoadingGifts(false);
    }
  };

  // Load market rates
  const loadMarketRates = async () => {
    try {
      const data = await fetchLiveMarketRates();
      if (data) {
        setMarketRates(data);
        const map: Record<string, number> = {};
        data.categories.forEach((c) => {
          map[c.category] = c.fluctuationPercent;
        });
        setCustomPercentMap(map);
      }
    } catch (err) {
      console.warn('Failed loading market rates:', err);
    }
  };

  const handleSetRegime = async (mode: string) => {
    setSavingRegime(true);
    setStatusMessage('बाजार भाव मोड बदलत आहे...');
    try {
      const ok = await updateMarketRegime({ mode });
      if (ok) {
        await Promise.all([loadMarketRates(), loadGifts()]);
        setStatusMessage('बाजार भाव मोड यशस्वीपणे लागू करण्यात आला!');
      }
    } catch (err: any) {
      setStatusMessage('त्रुटी: ' + err.message);
    } finally {
      setSavingRegime(false);
    }
  };

  const handleUpdateCategoryPercent = async (category: string, percent: number) => {
    setSavingRegime(true);
    try {
      const ok = await updateMarketRegime({ category, percent });
      if (ok) {
        await Promise.all([loadMarketRates(), loadGifts()]);
        setStatusMessage(`${category} दर टक्केवारी अपडेट झाली!`);
      }
    } catch (err: any) {
      setStatusMessage('त्रुटी: ' + err.message);
    } finally {
      setSavingRegime(false);
    }
  };

  // Load ledger
  const loadLedger = async () => {
    setLoadingLedger(true);
    try {
      const res = await fetch('/api/admin/transactions?limit=80');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
      }
    } catch (err) {
      console.warn('Could not load transactions:', err);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadGifts();
      loadLedger();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSavePrice = async (giftId: string) => {
    setSavingGiftId(giftId);
    setStatusMessage(null);
    try {
      const res = await updateCatalogGift(giftId, { coinPrice: editPriceInput });
      if (res.success) {
        setGifts((prev) =>
          prev.map((g) => (g.id === giftId ? { ...g, coinPrice: editPriceInput } : g))
        );
        setEditingGiftId(null);
        setStatusMessage('✅ किंमत यशस्वीरित्या अद्यतनित झाली!');
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        setStatusMessage(`❌ त्रुटी: ${res.error}`);
      }
    } catch (err: any) {
      setStatusMessage(`❌ त्रुटी: ${err.message}`);
    } finally {
      setSavingGiftId(null);
    }
  };

  const handleToggleActive = async (gift: CatalogGift) => {
    const newActive = !gift.active;
    try {
      const res = await updateCatalogGift(gift.id, { active: newActive });
      if (res.success) {
        setGifts((prev) =>
          prev.map((g) => (g.id === gift.id ? { ...g, active: newActive } : g))
        );
      }
    } catch (err) {
      console.warn('Toggle failed:', err);
    }
  };

  const handleCreateNewGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftNameMr.trim()) return;

    const id = `gift_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    try {
      const res = await fetch('/api/admin/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: id,
          nameMr: newGiftNameMr.trim(),
          nameEn: newGiftNameEn.trim() || newGiftNameMr.trim(),
          previewIcon: newGiftIcon.trim() || '🎁',
          coinPrice: Number(newGiftPrice) || 50,
          culturalTheme: newGiftTheme.trim() || 'महाराष्ट्र संस्कृती',
          active: true
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGifts((prev) => [data.gift, ...prev]);
        setShowAddModal(false);
        setNewGiftNameMr('');
        setNewGiftNameEn('');
        setStatusMessage('✅ नवीन गिफ्ट कॅटलॉगमध्ये जोडले गेले!');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err: any) {
      setStatusMessage(`❌ त्रुटी: ${err.message}`);
    }
  };

  const filteredGifts = gifts.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.nameMr.toLowerCase().includes(q) ||
      g.nameEn.toLowerCase().includes(q) ||
      g.culturalTheme.toLowerCase().includes(q) ||
      g.id.toLowerCase().includes(q)
    );
  });

  const filteredTransactions = transactions.filter((t) => {
    if (ledgerFilter === 'ALL') return true;
    return t.type === ledgerFilter;
  });

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-linear-to-r from-amber-950/80 to-slate-900 border-b border-amber-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                गिफ्ट व कॉइन वॉलेट प्रशासन (Admin Console)
              </h2>
              <p className="text-xs text-amber-200/80">
                कॅटलॉग दर व्यवस्थापन आणि व्यवहार नोंदवही (Auditing Ledger)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-xs font-semibold text-amber-300 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-amber-400">✕</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-amber-500/20 text-amber-300 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gift className="w-4 h-4" />
            गिफ्ट कॅटलॉग व्यवस्थापन ({gifts.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('market');
              loadMarketRates();
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'market'
                ? 'bg-amber-500/20 text-amber-300 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-rose-400" />
            लाईव्ह बाजार भाव नियंत्रण (Market Rates)
          </button>
          <button
            onClick={() => {
              setActiveTab('ledger');
              loadLedger();
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'bg-amber-500/20 text-amber-300 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            व्यवहार नोंदवही (Transaction Ledger)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'catalog' ? (
            <div className="space-y-4">
              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="गिफ्ट नाव किंवा थीम शोधा..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={loadGifts}
                    disabled={loadingGifts}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingGifts ? 'animate-spin' : ''}`} />
                    रिफ्रेश
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-3 py-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl text-xs font-bold text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    नवीन गिफ्ट जोडा
                  </button>
                </div>
              </div>

              {/* Gifts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredGifts.map((gift) => {
                  const isEditing = editingGiftId === gift.id;
                  const isSaving = savingGiftId === gift.id;

                  return (
                    <div
                      key={gift.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        gift.active !== false
                          ? 'bg-slate-800/60 border-slate-700/80 hover:border-amber-500/40'
                          : 'bg-slate-900/60 border-rose-900/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                          {gift.previewIcon || '🎁'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-white truncate">
                              {gift.nameMr}
                            </h4>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                                gift.active !== false
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {gift.active !== false ? 'सक्रिय' : 'बंद'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{gift.culturalTheme}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{gift.id}</p>
                        </div>
                      </div>

                      {/* Price Control & Actions */}
                      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1 mr-2">
                            <span className="text-xs text-amber-400">🪙</span>
                            <input
                              type="number"
                              min="1"
                              value={editPriceInput}
                              onChange={(e) => setEditPriceInput(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-20 bg-slate-950 border border-amber-400 rounded-lg px-2 py-1 text-xs text-white font-bold"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePrice(gift.id)}
                              disabled={isSaving}
                              className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingGiftId(null)}
                              className="p-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                              🪙 {gift.coinPrice}
                            </span>
                            <button
                              onClick={() => {
                                setEditingGiftId(gift.id);
                                setEditPriceInput(gift.coinPrice);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
                              title="किंमत बदला"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => handleToggleActive(gift)}
                          className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                            gift.active !== false
                              ? 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/30'
                          }`}
                          title={gift.active !== false ? 'गिफ्ट बंद करा' : 'गिफ्ट सक्रिय करा'}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span className="text-[10px]">
                            {gift.active !== false ? 'बंद करा' : 'सुरू करा'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'market' ? (
            <div className="space-y-6">
              {/* Regime Quick Selector */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span>बाजार भाव मोड (Market Regime Presets)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      एका क्लिकवर संपूर्ण कॅटलॉगच्या कॅटेगरीनुसार किंमतीमध्ये चढ-उतार करा
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadMarketRates}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>रिफ्रेश</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Romance Fest */}
                  <button
                    type="button"
                    onClick={() => handleSetRegime('ROMANCE_FEST')}
                    disabled={savingRegime}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      marketRates?.mode === 'ROMANCE_FEST'
                        ? 'border-pink-500 bg-pink-950/30 ring-1 ring-pink-400'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-pink-300 flex items-center gap-1.5">
                        💖 रोमँटिक संध्याकाळ / व्हॅलेंटाईन पर्व
                      </span>
                      {marketRates?.mode === 'ROMANCE_FEST' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500 text-slate-950 font-black">
                          सक्रिय (Active)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      प्रेम भेटवस्तू (गुलाब, रिंग, पेंडंट): <strong className="text-rose-400">+10% तेजी</strong>, 
                      मैत्री: <strong className="text-emerald-400">-8% सवलत</strong>, 
                      सण: <strong className="text-amber-400">+15%</strong>
                    </p>
                  </button>

                  {/* Festival Rush */}
                  <button
                    type="button"
                    onClick={() => handleSetRegime('FESTIVAL_RUSH')}
                    disabled={savingRegime}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      marketRates?.mode === 'FESTIVAL_RUSH'
                        ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-400'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                        🪔 सणासुदीचा महाउत्सव (Festival Rush)
                      </span>
                      {marketRates?.mode === 'FESTIVAL_RUSH' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                          सक्रिय (Active)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      सण भेटवस्तू (मोदक, समई, कंदील): <strong className="text-amber-400">+25% तेजी</strong>, 
                      प्रेम: <strong className="text-pink-400">+5%</strong>, 
                      मैत्री: <strong className="text-slate-300">स्थिर (0%)</strong>
                    </p>
                  </button>

                  {/* Friendship Happy Hour */}
                  <button
                    type="button"
                    onClick={() => handleSetRegime('FRIENDSHIP_HAPPY_HOUR')}
                    disabled={savingRegime}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      marketRates?.mode === 'FRIENDSHIP_HAPPY_HOUR'
                        ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-400'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                        🤝 कट्टा मैत्री हॅप्पी अवर (Friendship Hour)
                      </span>
                      {marketRates?.mode === 'FRIENDSHIP_HAPPY_HOUR' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black">
                          सक्रिय (Active)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      मैत्री भेटवस्तू (कटिंग चहा, टाळी, ट्रॉफी): <strong className="text-emerald-400">-15% महासवलत</strong>, 
                      इतर कॅटेगरी: <strong className="text-slate-300">स्थिर</strong>
                    </p>
                  </button>

                  {/* Normal Stable */}
                  <button
                    type="button"
                    onClick={() => handleSetRegime('NORMAL')}
                    disabled={savingRegime}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      marketRates?.mode === 'NORMAL'
                        ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-400'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                        ⚖️ सामान्य प्रमाणित दर (Normal Base Rates)
                      </span>
                      {marketRates?.mode === 'NORMAL' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black">
                          सक्रिय (Active)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      सर्व कॅटेगरी मूळ प्रमाणित बेस किंमतीवर चालतील (0% चढ-उतार).
                    </p>
                  </button>
                </div>
              </div>

              {/* Individual Category Fluctuation Tuning */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-pink-400" />
                  <span>वैयक्तिक कॅटेगरी दर टक्केवारी (Category Percentage Tuning)</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  प्रत्येक वर्गवारीसाठी थेट % चढ-उतार (Fluctuation) सेट करा (उदा. +15% किंवा -10%)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'love', label: '💖 प्रेम भेटवस्तू (Love)', desc: 'गुलाब, रिंग, पेंडंट, चॉकलेट' },
                    { id: 'friendship', label: '🤝 मैत्री व कट्टा (Friendship)', desc: 'कटिंग चहा, हाय फाईव्ह, ट्रॉफी' },
                    { id: 'festival', label: '🪔 सण व उत्सव (Festivals)', desc: 'मोदक, समई, पुरणपोळी, कंदील' },
                    { id: 'heritage', label: '🚩 संस्कृती व वारसा (Heritage)', desc: 'फेटा, पैठणी, किल्ले, मानचिन्हे' }
                  ].map((cat) => {
                    const currentPercent = customPercentMap[cat.id] !== undefined ? customPercentMap[cat.id] : 0;
                    return (
                      <div key={cat.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-200">{cat.label}</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                            currentPercent > 0 ? 'bg-rose-500/20 text-rose-300' :
                            currentPercent < 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-300'
                          }`}>
                            {currentPercent > 0 ? `+${currentPercent}% तेजी` : currentPercent < 0 ? `${currentPercent}% सवलत` : 'स्थिर (0%)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mb-2">{cat.desc}</p>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[-15, -10, -5, 0, 5, 10, 15, 20].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => handleUpdateCategoryPercent(cat.id, pct)}
                              disabled={savingRegime}
                              className={`px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                                currentPercent === pct 
                                  ? 'bg-amber-500 text-slate-950 font-black' 
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {pct > 0 ? `+${pct}%` : `${pct}%`}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sample Live Gifts Market Price Preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>लाईव्ह बाजार भावाचे नमुने (Live Price Calculation Preview)</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="py-2 px-2">भेटवस्तू</th>
                        <th className="py-2 px-2">कॅटेगरी</th>
                        <th className="py-2 px-2">बेस किंमत</th>
                        <th className="py-2 px-2">चढ-उतार (%)</th>
                        <th className="py-2 px-2">लाईव्ह बाजार भाव</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {gifts.slice(0, 10).map((g) => (
                        <tr key={g.id} className="hover:bg-white/3">
                          <td className="py-2 px-2 flex items-center gap-2 font-bold text-slate-200">
                            <span className="text-base">{g.previewIcon}</span>
                            <span>{g.nameMr}</span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                              {g.giftCategory || 'वारसा'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-slate-400 font-mono">
                            🪙 {g.basePrice || g.coinPrice}
                          </td>
                          <td className="py-2 px-2">
                            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                              (g.priceChangePercent || 0) > 0 ? 'bg-rose-500/20 text-rose-300' :
                              (g.priceChangePercent || 0) < 0 ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
                            }`}>
                              {(g.priceChangePercent || 0) > 0 ? `+${g.priceChangePercent}% 🔥` :
                               (g.priceChangePercent || 0) < 0 ? `${g.priceChangePercent}% 🏷️` : '0%'}
                            </span>
                          </td>
                          <td className="py-2 px-2 font-black text-amber-300 font-mono">
                            🪙 {g.marketPrice || g.coinPrice}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-300">फिल्टर प्रकार:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'ALL', label: 'सर्व' },
                      { id: 'PURCHASE', label: '🪙 रिचार्ज' },
                      { id: 'GIFT_SENT', label: '🎁 पाठवले' },
                      { id: 'GIFT_RECEIVED', label: '🎉 मिळाले' },
                      { id: 'ADMIN_ADJUSTMENT', label: '⚙️ ॲडमिन' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setLedgerFilter(f.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          ledgerFilter === f.id
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-700/70 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={loadLedger}
                  disabled={loadingLedger}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-200 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingLedger ? 'animate-spin' : ''}`} />
                  रिफ्रेश
                </button>
              </div>

              {/* Transactions Table / List */}
              {loadingLedger ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  नोंदवही लोड होत आहे...
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  कोणतेही व्यवहार नोंदी सापडल्या नाहीत.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTransactions.map((tx) => {
                    const isCredit = tx.amount > 0;
                    const dateFormatted = new Date(tx.createdAt).toLocaleString('mr-IN', {
                      dateStyle: 'short',
                      timeStyle: 'medium'
                    });

                    return (
                      <div
                        key={tx.id}
                        className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center justify-between gap-3 text-xs"
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
                            <p className="font-semibold text-white truncate">{tx.description}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>वापरकर्ता: {tx.userId.substring(0, 8)}...</span>
                              <span>•</span>
                              <span>{dateFormatted}</span>
                              <span>•</span>
                              <span className="font-mono text-slate-500">{tx.id}</span>
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
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add New Gift Modal Dialog */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-2xl p-5 text-white shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-sm text-amber-300">नवीन भेट जोडा</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateNewGift} className="space-y-3 mt-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">मराठी नाव</label>
                  <input
                    type="text"
                    required
                    value={newGiftNameMr}
                    onChange={(e) => setNewGiftNameMr(e.target.value)}
                    placeholder="उदा. पुणेरी मिसळ"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">इंग्रजी नाव</label>
                  <input
                    type="text"
                    value={newGiftNameEn}
                    onChange={(e) => setNewGiftNameEn(e.target.value)}
                    placeholder="उदा. Puneri Misal"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">आयकॉन / इमोजी</label>
                    <input
                      type="text"
                      value={newGiftIcon}
                      onChange={(e) => setNewGiftIcon(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-center text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">कॉइन किंमत (Coins)</label>
                    <input
                      type="number"
                      min="1"
                      value={newGiftPrice}
                      onChange={(e) => setNewGiftPrice(parseInt(e.target.value) || 10)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">सांस्कृतिक थीम</label>
                  <input
                    type="text"
                    value={newGiftTheme}
                    onChange={(e) => setNewGiftTheme(e.target.value)}
                    placeholder="उदा. खाद्यसंस्कृती / गडकोट / सण"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 font-bold text-slate-950 hover:from-amber-600 hover:to-orange-600"
                  >
                    जतन करा
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
