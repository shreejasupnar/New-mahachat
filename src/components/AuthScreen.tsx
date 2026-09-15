import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { MahaChatLogo } from './MahaChatLogo';
import { Loader2, Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Email form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.warn('Google sign in error:', err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        setError('पॉप-अप ब्लॉक झाले आहे. कृपया ईमेल किंवा झटपट पर्यायाने लॉगिन करा.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('या डोमेनवर Google लॉगिन सुरू करत आहोत... कृपया खालील ईमेल/झटपट पर्यायाचा वापर करा.');
        setShowEmailForm(true);
      } else {
        setError(err.message || 'लॉगिन करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('कृपया ईमेल आणि पासवर्ड प्रविष्ट करा.');
      return;
    }
    if (isSignUp && password.length < 6) {
      setError('पासवर्ड किमान ६ अक्षरांचा असावा.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Email auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('ईमेल किंवा पासवर्ड चुकीचा आहे.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('हा ईमेल आधीच वापरला गेला आहे. कृपया लॉगिन करा.');
        setIsSignUp(false);
      } else {
        setError(err.message || 'लॉगिन अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGuestSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAnonymously(auth);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Anonymous auth error:', err);
      setError('लॉगिन अयशस्वी झाले: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-screen" className="min-h-screen w-full flex flex-col justify-between bg-white text-slate-800 relative overflow-hidden">
      {/* Top Brand Area */}
      <div className="pt-10 pb-4 px-6 flex flex-col items-center text-center">
        <MahaChatLogo size="lg" showTagline={true} />
      </div>

      {/* Main Card / Options */}
      <div className="w-full max-w-sm mx-auto px-6 py-2 flex flex-col items-center">
        {error && (
          <div className="w-full mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {!showEmailForm ? (
          <div className="w-full flex flex-col gap-3.5">
            {/* Primary Google Login Button matching Mockup Screen 2 */}
            <button
              id="google-signin-button"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-3 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {/* Google Colored 'G' Icon */}
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-1 shadow-xs">
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <span className="text-base tracking-wide">Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider matching Screen 2 */}
            <div className="flex items-center my-2">
              <div className="flex-1 border-t border-slate-200" />
              <span className="px-3 text-xs text-slate-400 font-medium">या किंवा</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Secondary Email/Mobile Login button matching Screen 2 */}
            <button
              id="email-auth-button"
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full py-3.5 px-5 bg-white hover:bg-slate-50 border border-blue-400 text-blue-600 font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-base">मोबाईल / ईमेल ने लॉगिन</span>
            </button>

            {/* Instant sign in option for direct access */}
            <button
              id="instant-auth-button"
              type="button"
              onClick={handleQuickGuestSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>थेट प्रवेश (झटपट प्रोफाइल तयार करा)</span>
            </button>
          </div>
        ) : (
          /* Email / Password Form */
          <form onSubmit={handleEmailAuth} className="w-full flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-800 text-sm">
                {isSignUp ? 'नवीन खाते तयार करा' : 'खात्यात लॉगिन करा'}
              </h3>
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                मागे जा
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ईमेल पत्ता</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  id="auth-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tumcha@email.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">पासवर्ड</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  id="auth-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            <button
              id="auth-submit-button"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSignUp ? 'नोंदणी करा (Sign Up)' : 'लॉगिन करा (Sign In)'}
            </button>

            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-slate-600 hover:text-blue-600"
              >
                {isSignUp ? 'आधीच खाते आहे? लॉगिन करा' : 'नवीन वापरकर्ता? येथे नोंदणी करा'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Bottom Heritage Silhouette graphic matching Mockup Screen 2 */}
      <div className="w-full flex flex-col items-center pt-4 pb-6 px-6">
        <div className="w-full max-w-xs flex flex-col items-center">
          {/* Gateway of India / Heritage Monument Silhouette */}
          <div className="w-48 h-20 text-blue-700/85 mb-2 flex items-center justify-center">
            <svg viewBox="0 0 200 80" fill="currentColor" className="w-full h-full opacity-80">
              {/* Ground base */}
              <rect x="10" y="70" width="180" height="8" rx="2" />
              {/* Left Pillar */}
              <rect x="35" y="25" width="22" height="46" />
              <polygon points="30,25 46,12 62,25" />
              {/* Central Archway Pillars */}
              <rect x="75" y="18" width="18" height="53" />
              <rect x="107" y="18" width="18" height="53" />
              {/* Center Dome & Arch */}
              <path d="M75,32 Q100,10 125,32 L125,70 L75,70 Z" />
              <circle cx="100" cy="12" r="4" />
              <path d="M85,70 V42 Q100,28 115,42 V70 Z" fill="white" />
              {/* Right Pillar */}
              <rect x="143" y="25" width="22" height="46" />
              <polygon points="138,25 154,12 170,25" />
              {/* Side Domes */}
              <circle cx="46" cy="10" r="3" />
              <circle cx="154" cy="10" r="3" />
            </svg>
          </div>

          <p className="text-slate-600 font-medium text-xs sm:text-sm tracking-wide text-center">
            मित्र, गप्पा आणि आपला जिल्हा...
          </p>
        </div>
      </div>
    </div>
  );
};
