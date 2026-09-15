import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { db, UserProfile, VoiceParticipant } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ReportUserModalProps {
  targetUser: VoiceParticipant;
  currentUser: UserProfile;
  districtId: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  { id: 'abusive', label: 'अश्लील किंवा अयोग्य भाषा (Abusive language)' },
  { id: 'harassment', label: 'त्रास देणे किंवा छळ (Harassment/Bullying)' },
  { id: 'spam', label: 'स्पॅम किंवा जाहिराती (Spam / Promotion)' },
  { id: 'fraud', label: 'फसवणूक किंवा खोटी माहिती (Fraud / Scam)' },
  { id: 'impersonation', label: 'दुसऱ्याच्या नावाने खोटे प्रोफाइल (Impersonation)' },
  { id: 'other', label: 'इतर कारण (Other reason)' }
];

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  targetUser,
  currentUser,
  districtId,
  onClose
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].id);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'reports'), {
        districtId,
        reportedUid: targetUser.uid,
        reportedName: targetUser.displayName || 'सदस्य',
        reportedPhoto: targetUser.photoURL || '',
        reporterUid: currentUser.uid,
        reporterName: currentUser.displayName || 'सदस्य',
        reason: selectedReason,
        details: details.trim(),
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">तक्रार नोंदवा (Report User)</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-sm">तक्रार यशस्वीरित्या नोंदवली गेली!</h4>
            <p className="text-xs text-slate-400">
              आमची सुरक्षा टीम याची तात्काळ पडताळणी करेल. महाचॅट सुरक्षित ठेवल्याबद्दल धन्यवाद.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs text-slate-300">
              तुम्ही <span className="text-amber-300 font-bold">@{targetUser.displayName}</span> यांच्याविरुद्ध तक्रार नोंदवत आहात:
            </p>

            <div className="space-y-1.5">
              {REPORT_REASONS.map(r => (
                <label
                  key={r.id}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    selectedReason === r.id 
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40' 
                      : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.id}
                    checked={selectedReason === r.id}
                    onChange={() => setSelectedReason(r.id)}
                    className="accent-amber-500"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">अधिक तपशील (पर्यायी):</label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="काय घडले ते थोडक्यात सांगा..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {submitting ? 'नोंदवत आहे...' : 'तक्रार पाठवा'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
