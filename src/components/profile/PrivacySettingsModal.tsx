import React, { useState } from 'react';
import { UserProfile, saveUserProfile } from '../../lib/firebase';
import { 
  X, 
  Shield, 
  Lock, 
  EyeOff, 
  Users, 
  Check, 
  Loader2, 
  UserCheck, 
  Info,
  Sliders,
  Globe
} from 'lucide-react';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onSaved?: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSaved
}) => {
  const [isProfilePrivate, setIsProfilePrivate] = useState(profile?.isProfilePrivate || false);
  const [hideFriendsList, setHideFriendsList] = useState(profile?.hideFriendsList || false);
  const [hideOnlineStatus, setHideOnlineStatus] = useState(profile?.hideOnlineStatus || false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen || !profile) return null;

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveUserProfile(profile.uid, {
        isProfilePrivate,
        hideFriendsList,
        hideOnlineStatus
      });
      setSaveSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err: any) {
      alert('सेटिंग्ज सेव्ह करताना त्रुटी: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-600/20 text-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                सेटिंग्ज व गोपनीयता (Settings & Privacy)
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                तुमचे प्रोफाइल आणि मैत्री गोपनीयता व्यवस्थापित करा
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Information Notice */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              तुमची गोपनीयता सुरक्षित ठेवण्यासाठी तुम्ही तुमचे प्रोफाइल आणि मित्रांची यादी इतरांपासून लपवू शकता.
            </p>
          </div>

          <div className="space-y-3">
            {/* Setting 1: Hide Friends List */}
            <div className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    hideFriendsList ? 'bg-amber-100 text-amber-700' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <span>मित्र यादी लपवा</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Hide Friends List)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      इतर कोणालाही तुमची मित्र यादी दिसणार नाही. केवळ तुम्हीच तुमचे मित्र पाहू शकाल.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setHideFriendsList(!hideFriendsList)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                    hideFriendsList ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  aria-pressed={hideFriendsList}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      hideFriendsList ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Setting 2: Private Profile */}
            <div className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isProfilePrivate ? 'bg-purple-100 text-purple-700' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <span>प्रोफाइल खाजगी ठेवा</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Private Profile)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      तुमची माहिती (बायो व क्रियाकलाप) केवळ जोडलेल्या मित्रांनाच दिसेल, अपरिचित व्यक्तींसाठी खाजगी राहील.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProfilePrivate(!isProfilePrivate)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                    isProfilePrivate ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  aria-pressed={isProfilePrivate}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      isProfilePrivate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Setting 3: Hide Online Status */}
            <div className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    hideOnlineStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    <EyeOff className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <span>ऑनलाइन स्थिती लपवा</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Hide Online Status)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      इतरांना तुम्ही ऑनलाइन आहात की ऑफलाइन हे दिसणार नाही.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setHideOnlineStatus(!hideOnlineStatus)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                    hideOnlineStatus ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  aria-pressed={hideOnlineStatus}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      hideOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Current Status Badge */}
          <div className="p-3 bg-slate-100/80 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">वर्तमान स्थिती:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              {isProfilePrivate ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                  <span>खाजगी (Private)</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>सार्वजनिक (Public)</span>
                </>
              )}
              {hideFriendsList && ' • मित्र गुप्त'}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            रद्द करा (Cancel)
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>सेव्ह होत आहे...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>सेव्ह झाले!</span>
              </>
            ) : (
              <span>सेव्ह करा (Save Changes)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
