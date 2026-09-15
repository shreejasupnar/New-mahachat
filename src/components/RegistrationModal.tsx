import React, { useState } from 'react';
import { type User } from 'firebase/auth';
import { saveUserProfile, type UserProfile } from '../lib/firebase';
import { MAHARASHTRA_DISTRICTS } from '../data/districts';
import { MahaChatLogo } from './MahaChatLogo';
import { DistrictIcon } from './DistrictIcon';
import { MapPin, User as UserIcon, Camera, Loader2, Check, Sparkles } from 'lucide-react';

interface RegistrationModalProps {
  user: User;
  existingProfile: UserProfile | null;
  onComplete: () => void;
}

// Pre-curated authentic Maharashtrian cultural avatar presets or user photo
const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  user,
  existingProfile,
  onComplete
}) => {
  const [displayName, setDisplayName] = useState(
    existingProfile?.displayName || user.displayName || 'माझा मित्र'
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    existingProfile?.district || ''
  );
  const [bio, setBio] = useState(existingProfile?.bio || '');
  const [photoURL, setPhotoURL] = useState(
    existingProfile?.photoURL || user.photoURL || AVATAR_OPTIONS[0]
  );
  const [loading, setLoading] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filteredDistricts = MAHARASHTRA_DISTRICTS.filter(d => 
    d.nameMr.toLowerCase().includes(districtSearch.toLowerCase()) ||
    d.nameEn.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('कृपया तुमचे नाव प्रविष्ट करा.');
      return;
    }
    if (!selectedDistrict) {
      setError('कृपया तुमचा जिल्हा निवडा.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await saveUserProfile(user.uid, {
        displayName: displayName.trim(),
        district: selectedDistrict,
        photoURL,
        bio: bio.trim(),
        isOnline: true
      });
      onComplete();
    } catch (err: any) {
      console.error('Save profile error:', err);
      setError('माहिती सेव्ह करताना त्रुटी आली: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 my-8 border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-4">
          <MahaChatLogo size="md" />
          <h2 className="text-xl font-bold text-slate-800 mt-2">तुमचा प्रोफाइल सेट करा</h2>
          <p className="text-xs text-slate-500">MahaChat मध्ये आपले स्वागत आहे!</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
              प्रोफाइल फोटो निवडा
            </label>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {AVATAR_OPTIONS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotoURL(url)}
                  className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-transform ${
                    photoURL === url ? 'border-blue-600 ring-2 ring-blue-300 scale-105' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                  {photoURL === url && (
                    <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              तुमचे नाव (Display Name) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="registration-name-input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="उदा. राहुल, स्नेहा, अमित"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                maxLength={40}
              />
            </div>
          </div>

          {/* District Selection - Required */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                तुमचा जिल्हा निवडा (Select District) <span className="text-red-500">*</span>
              </label>
              {selectedDistrict && (
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {MAHARASHTRA_DISTRICTS.find(d => d.id === selectedDistrict)?.nameMr}
                </span>
              )}
            </div>

            <input
              type="text"
              value={districtSearch}
              onChange={(e) => setDistrictSearch(e.target.value)}
              placeholder="जिल्हा शोधा... (उदा. पुणे, मुंबई, नाशिक)"
              className="w-full px-3 py-1.5 mb-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
              {filteredDistricts.map((d) => {
                const isSelected = selectedDistrict === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDistrict(d.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all text-xs ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-100'
                    }`}
                  >
                    <DistrictIcon type={d.iconType} size={18} color={isSelected ? '#ffffff' : d.color} />
                    <div className="truncate">
                      <div className="truncate">{d.nameMr}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {d.nameEn}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bio Optional */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              बायो (पर्यायी - Bio)
            </label>
            <textarea
              id="registration-bio-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="तुमच्याबद्दल थोडक्यात सांगा... (उदा. संगणक अभियंता, वाचन व प्रवासाची आवड)"
              rows={2}
              maxLength={150}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit button */}
          <button
            id="registration-submit-button"
            type="submit"
            disabled={loading || !selectedDistrict}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>MahaChat सुरू करा</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
