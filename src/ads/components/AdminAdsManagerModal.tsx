import React, { useState, useEffect } from 'react';
import { 
  Advertisement, 
  DEFAULT_ADVERTISEMENT 
} from '../types';
import { 
  getLocalCachedAds, 
  saveAdvertisement, 
  deleteAdvertisement, 
  setAdsTestMode, 
  getAdsTestMode 
} from '../services/adsService';
import { 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Phone, 
  Sparkles, 
  Sliders, 
  Check, 
  Clock, 
  ArrowUpDown,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdminAdsManagerModalProps {
  onClose: () => void;
}

export const AdminAdsManagerModal: React.FC<AdminAdsManagerModalProps> = ({ onClose }) => {
  const [adsList, setAdsList] = useState<Advertisement[]>([]);
  const [testMode, setTestModeState] = useState<'auto' | 'default_only' | 'single' | 'full'>('auto');
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form State for new or edited ad
  const [title, setTitle] = useState('');
  const [taglineMr, setTaglineMr] = useState('');
  const [advertiserName, setAdvertiserName] = useState('');
  const [contact, setContact] = useState('');
  const [imageUrl, setImageUrl] = useState('/ads/active/ad_001.png');
  const [targetUrl, setTargetUrl] = useState('');
  const [displayDuration, setDisplayDuration] = useState(4);
  const [priority, setPriority] = useState(5);
  const [locationMr, setLocationMr] = useState('महाराष्ट्र भर');
  const [isActive, setIsActive] = useState(true);

  const refreshAds = () => {
    setAdsList(getLocalCachedAds());
    setTestModeState(getAdsTestMode());
  };

  useEffect(() => {
    refreshAds();
  }, []);

  const handleTestModeChange = (mode: 'auto' | 'default_only' | 'single' | 'full') => {
    setAdsTestMode(mode);
    setTestModeState(mode);
    showNotice(`मोड बदलला: ${mode === 'default_only' ? 'फक्त डीफॉल्ट फलक' : mode === 'single' ? 'फक्त १ जाहिरात' : mode === 'full' ? 'सर्व ७ जाहिराती' : 'स्वयंचलित'}`);
  };

  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleToggleActive = async (ad: Advertisement) => {
    const updated = { ...ad, isActive: !ad.isActive };
    await saveAdvertisement(updated);
    refreshAds();
    showNotice(`जाहिरात ${updated.isActive ? 'सक्रिय (Active)' : 'निष्क्रिय (Inactive)'} केली.`);
  };

  const handleDelete = async (adId: string) => {
    if (window.confirm('तुम्हाला नक्की ही जाहिरात हटवायची आहे का?')) {
      await deleteAdvertisement(adId);
      refreshAds();
      showNotice('जाहिरात यशस्वीरित्या हटवली.');
    }
  };

  const handleStartEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setTaglineMr(ad.taglineMr || '');
    setAdvertiserName(ad.advertiserName);
    setContact(ad.contact);
    setImageUrl(ad.imageUrl);
    setTargetUrl(ad.targetUrl || '');
    setDisplayDuration(ad.displayDuration || 4);
    setPriority(ad.priority || 5);
    setLocationMr(ad.locationMr || 'महाराष्ट्र भर');
    setIsActive(ad.isActive);
    setShowAddForm(true);
  };

  const handleResetForm = () => {
    setEditingAd(null);
    setTitle('');
    setTaglineMr('');
    setAdvertiserName('');
    setContact('');
    setImageUrl('/ads/active/ad_001.png');
    setTargetUrl('');
    setDisplayDuration(4);
    setPriority(5);
    setLocationMr('महाराष्ट्र भर');
    setIsActive(true);
    setShowAddForm(false);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !advertiserName.trim() || !imageUrl.trim()) {
      alert('कृपया शीर्षक, जाहिरातदार नाव आणि इमेज URL भरा.');
      return;
    }

    const adToSave: Advertisement = {
      adId: editingAd ? editingAd.adId : `ad_custom_${Date.now()}`,
      title: title.trim(),
      taglineMr: taglineMr.trim(),
      advertiserName: advertiserName.trim(),
      contact: contact.trim(),
      imageUrl: imageUrl.trim(),
      targetUrl: targetUrl.trim() || undefined,
      displayDuration: Number(displayDuration) || 4,
      startDate: editingAd?.startDate || new Date().toISOString(),
      endDate: editingAd?.endDate || '2030-12-31T23:59:59.000Z',
      priority: Number(priority) || 5,
      isActive,
      createdAt: editingAd?.createdAt || new Date().toISOString(),
      locationMr: locationMr.trim() || undefined,
      impressionsCount: editingAd?.impressionsCount || 0,
      clicksCount: editingAd?.clicksCount || 0
    };

    await saveAdvertisement(adToSave);
    refreshAds();
    handleResetForm();
    showNotice(editingAd ? 'जाहिरात अपडेट झाली!' : 'नवीन जाहिरात जोडली गेली!');
  };

  const activeCount = adsList.filter(a => a.isActive).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                जाहिरात फलक व्यवस्थापन (Admin Control)
              </h3>
              <p className="text-[11px] text-slate-400">
                सक्रिय जाहिराती: <span className="text-amber-300 font-bold">{activeCount}</span> / एकूण {adsList.length}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status notice */}
        {statusMessage && (
          <div className="bg-emerald-600/90 text-white text-xs py-1.5 px-4 font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Quick Testing Modes Bar */}
        <div className="bg-slate-800/60 p-3 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
          <span className="text-slate-300 font-bold text-[11px] flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>चाचणी पद्धत (Testing Mode):</span>
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleTestModeChange('auto')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${testMode === 'auto' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'bg-slate-700 text-slate-300'}`}
            >
              ऑटो (सर्व)
            </button>
            <button
              type="button"
              onClick={() => handleTestModeChange('default_only')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${testMode === 'default_only' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-slate-700 text-slate-300'}`}
              title="0 जाहिराती असताना डीफॉल्ट 'जाहिरातीसाठी संपर्क करा 7620363213' फलक तपासा"
            >
              फक्त डीफॉल्ट फलक (0 Ads)
            </button>
            <button
              type="button"
              onClick={() => handleTestModeChange('single')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${testMode === 'single' ? 'bg-purple-500 text-white shadow-xs' : 'bg-slate-700 text-slate-300'}`}
            >
              १ जाहिरात (Single)
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Action to show Add Form */}
          {!showAddForm ? (
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                सर्व जाहिरात मोहिमा (All Campaigns)
              </h4>
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  setShowAddForm(true);
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer hover:from-amber-300 active:scale-95 shadow-md"
              >
                <Plus className="w-3.5 h-3.5 text-slate-950" />
                <span>नवीन जाहिरात जोडा</span>
              </button>
            </div>
          ) : (
            /* Add / Edit Form */
            <form onSubmit={handleSaveForm} className="bg-slate-800/70 border border-slate-700 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{editingAd ? 'जाहिरात संपादित करा' : 'नवीन जाहिरात जोडा'}</span>
                </h4>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  रद्द करा
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">जाहिरातीचे शीर्षक *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="उदा. सोलापूर चादर महोत्सव"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">जाहिरातदार नाव *</label>
                    <input
                      type="text"
                      value={advertiserName}
                      onChange={(e) => setAdvertiserName(e.target.value)}
                      placeholder="उदा. सोलापूर विव्हर्स"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">संपर्क नंबर</label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="उदा. 7620363213"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">टॅगलाइन / संक्षिप्त माहिती</label>
                  <input
                    type="text"
                    value={taglineMr}
                    onChange={(e) => setTaglineMr(e.target.value)}
                    placeholder="उदा. अस्सल जॅकॉर्ड चादरी थेट फॅक्टरी दरात"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">इमेज URL / पाथ *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/ad-image.png"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">टार्गेट लिंक (वेबसाइट)</label>
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">ठिकाण</label>
                    <input
                      type="text"
                      value={locationMr}
                      onChange={(e) => setLocationMr(e.target.value)}
                      placeholder="उदा. सोलापूर / पुणे"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">वेळ (सेकंद): {displayDuration}s</label>
                    <input
                      type="range"
                      min="3"
                      max="10"
                      step="1"
                      value={displayDuration}
                      onChange={(e) => setDisplayDuration(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">प्राधान्य (Priority): {priority}</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                  />
                  <label htmlFor="isActiveCheck" className="text-slate-300 cursor-pointer font-medium">
                    सक्रिय ठेवा (Active in Carousel)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-600"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 text-xs font-black hover:from-amber-300 shadow-md"
                >
                  जतन करा (Save)
                </button>
              </div>
            </form>
          )}

          {/* List of Advertisements */}
          <div className="space-y-2.5">
            {adsList.map((ad, idx) => (
              <div
                key={ad.adId}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  ad.isActive 
                    ? 'bg-slate-800/80 border-slate-700 hover:border-amber-400/50' 
                    : 'bg-slate-900/50 border-slate-800 opacity-60'
                }`}
              >
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-white/10 relative">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-0.5 left-0.5 px-1 rounded bg-black/70 text-[8px] font-mono text-white">
                    #{idx + 1}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center gap-1.5">
                    <h5 className="font-bold text-white truncate max-w-[180px]">
                      {ad.title}
                    </h5>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                      ad.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {ad.isActive ? 'Active' : 'Off'}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {ad.advertiserName} • {ad.contact}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[10px] text-amber-300/80 font-mono">
                    <span>वेळ: {ad.displayDuration}s</span>
                    <span>•</span>
                    <span>P:{ad.priority}</span>
                    <span>•</span>
                    <span>👁️ {ad.impressionsCount || 0}</span>
                    <span>•</span>
                    <span>👆 {ad.clicksCount || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(ad)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                      ad.isActive ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/30' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {ad.isActive ? 'Pause' : 'Play'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(ad)}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
                    title="संपादित करा"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(ad.adId)}
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/40 cursor-pointer"
                    title="हटवा"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Default Fallback Board Info Card */}
          <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>डीफॉल्ट बॅकअप जाहिरात फलक (Automatic Fallback)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              जेव्हा सर्व जाहिराती निष्क्रिय किंवा ० असतील, तेव्हा 'जाहिरातीसाठी संपर्क करा: 7620363213' हा डीफॉल्ट निऑन फलक आपोआप झळकतो. कधीही मोकळी जागा किंवा तुटलेली इमेज दिसणार नाही.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            MahaChat जाहिरात व्यवस्थापन प्रणाली
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            बंद करा (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
