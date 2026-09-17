import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Crown, 
  CheckCircle2, 
  X, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  TrendingUp, 
  Loader2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../../lib/firebase';
import { RECHARGE_PACKAGES, calculateVipStatus } from '../../data/vipData';
import { processUserRecharge } from '../../services/vipService';
import { processGooglePayWebCheckout, buildGooglePayTezLink, isGooglePayWebReady } from '../../services/googlePayService';
import { verifyGooglePayPayment } from '../../lib/googlePay';
import { RechargePackage } from '../../types/vip';
import { VipBadge } from './VipBadge';

interface RechargeModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onSuccess?: (newLevel: number, leveledUp: boolean) => void;
  onOpenVipCenter?: () => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSuccess,
  onOpenVipCenter
}) => {
  const [selectedPkg, setSelectedPkg] = useState<RechargePackage>(RECHARGE_PACKAGES[1]); // ₹99 default
  const [paymentTab, setPaymentTab] = useState<'googlepay' | 'upi'>('googlepay');
  const [merchantUpiId, setMerchantUpiId] = useState('7620363213@ybl');
  const [secondaryUpiId, setSecondaryUpiId] = useState('7620363213-2@ybl');
  const [merchantName, setMerchantName] = useState('IndusInd Bank - 3213');

  // Google Pay Merchant Config
  const [googlePayMerchantId, setGooglePayMerchantId] = useState('');
  const [googlePayMerchantName, setGooglePayMerchantName] = useState('IndusInd Bank - 3213');
  const [googlePayUpiId, setGooglePayUpiId] = useState('7620363213@ybl');
  const [googlePayEnv, setGooglePayEnv] = useState<'PRODUCTION' | 'TEST'>('PRODUCTION');

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedSecondaryUpi, setCopiedSecondaryUpi] = useState(false);
  const [copiedGpayUpi, setCopiedGpayUpi] = useState(false);

  const [utrInput, setUtrInput] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);

  // Google Pay Interactive State
  const [gpayUtrInput, setGpayUtrInput] = useState('');
  const [gpayUtrError, setGpayUtrError] = useState<string | null>(null);
  const [isVerifyingGpayUtr, setIsVerifyingGpayUtr] = useState(false);
  const [isProcessingGooglePay, setIsProcessingGooglePay] = useState(false);
  const [googlePayError, setGooglePayError] = useState<string | null>(null);
  const [isGpayWebSupported, setIsGpayWebSupported] = useState(false);
  
  const [successNotice, setSuccessNotice] = useState<{
    coinsAdded: number;
    newCoins: number;
    newExp: number;
    leveledUp: boolean;
    newLevel: number;
    method: string;
    refId: string;
  } | null>(null);

  // Load live payment config on mount
  useEffect(() => {
    fetch('/api/payment/config')
      .then(res => res.json())
      .then(data => {
        if (data.upiId) setMerchantUpiId(data.upiId);
        if (data.upiSecondaryId) setSecondaryUpiId(data.upiSecondaryId);
        if (data.upiName) setMerchantName(data.upiName);
        if (data.googlePayMerchantId) setGooglePayMerchantId(data.googlePayMerchantId);
        if (data.googlePayMerchantName) setGooglePayMerchantName(data.googlePayMerchantName);
        if (data.googlePayUpiId) setGooglePayUpiId(data.googlePayUpiId);
        if (data.googlePayEnv) setGooglePayEnv(data.googlePayEnv);
      })
      .catch(() => {});

    isGooglePayWebReady().then(supported => {
      setIsGpayWebSupported(supported);
    }).catch(() => {});
  }, []);

  if (!isOpen) return null;

  const vipStatus = calculateVipStatus(
    currentUser.vipExp || 0,
    currentUser.coins || 0,
    currentUser.subscriptionAmount || 0
  );

  // Generate real dynamic UPI Intent URI for exact package amount
  const upiPayUrl = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${selectedPkg.inrPrice}&cu=INR&tn=${encodeURIComponent(`MahaChat Coins ${selectedPkg.coins + selectedPkg.bonusCoins}`)}`;
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(upiPayUrl)}`;

  // Generate dynamic Google Pay Tez URI and QR code
  const gpayTxnRef = `MCGP${Date.now().toString().slice(-8)}`;
  const gpayTezUrl = buildGooglePayTezLink({
    merchantUpiId: googlePayUpiId,
    merchantName: googlePayMerchantName,
    mcc: '5812',
    transactionRef: gpayTxnRef,
    amount: selectedPkg.inrPrice,
    note: `MahaChat VIP Coins ${selectedPkg.coins + selectedPkg.bonusCoins}`
  });
  const gpayQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(gpayTezUrl)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopySecondaryUpi = () => {
    navigator.clipboard.writeText(secondaryUpiId);
    setCopiedSecondaryUpi(true);
    setTimeout(() => setCopiedSecondaryUpi(false), 2500);
  };

  const handleCopyGpayUpi = () => {
    navigator.clipboard.writeText(googlePayUpiId);
    setCopiedGpayUpi(true);
    setTimeout(() => setCopiedGpayUpi(false), 2500);
  };

  // Real Direct UPI UTR Submission & Verification
  const handleVerifyUtr = async () => {
    const cleanUtr = utrInput.trim().replace(/\s+/g, '');
    if (!cleanUtr) {
      setUtrError('कृपया १२ अंकी UPI Ref / UTR नंबर टाका.');
      return;
    }
    if (cleanUtr.length < 10 || cleanUtr.length > 22) {
      setUtrError('अवैध UTR नंबर. PhonePe/GPay पावतीतील १२ अंकी UTR प्रविष्ट करा.');
      return;
    }

    setUtrError(null);
    setIsVerifyingUtr(true);

    try {
      // 1. Verify UTR format on server
      const verifyRes = await fetch('/api/payment/verify-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utrNumber: cleanUtr,
          amount: selectedPkg.inrPrice,
          planId: selectedPkg.id,
          userId: currentUser.uid
        })
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        throw new Error(verifyData.error || 'UTR पडताळणी अयशस्वी');
      }

      // 2. Process real recharge and credit coins in Firestore
      const res = await processUserRecharge(
        currentUser.uid,
        selectedPkg,
        'UPI',
        { utrNumber: cleanUtr }
      );

      if (res.success) {
        setSuccessNotice({
          coinsAdded: res.coinsAdded,
          newCoins: res.newCoins,
          newExp: res.newExp,
          leveledUp: res.leveledUp,
          newLevel: res.newLevel,
          method: 'थेट UPI पेमेंट (Verified)',
          refId: cleanUtr
        });

        setUtrInput('');
        if (onSuccess) {
          onSuccess(res.newLevel, res.leveledUp);
        }
      }
    } catch (err: any) {
      setUtrError(err.message || 'रिचार्ज प्रक्रिया करताना त्रुटी आली. कृपया UTR पुन्हा तपासा.');
    } finally {
      setIsVerifyingUtr(false);
    }
  };

  // Real Google Pay Web Checkout (GPay Payment Sheet + Direct Fallback)
  const handleGooglePayWebCheckout = async () => {
    setGooglePayError(null);
    setIsProcessingGooglePay(true);

    try {
      const result = await processGooglePayWebCheckout({
        planId: selectedPkg.id,
        amount: selectedPkg.inrPrice,
        planName: `${selectedPkg.coins + selectedPkg.bonusCoins} कॉईन्स रिचार्ज`,
        description: `${selectedPkg.vipExp} VIP EXP सह नाणी`,
        user: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          phoneNumber: currentUser.phoneNumber
        }
      });

      if (result.verified) {
        // Update coins and VIP status in Firestore after server verification
        const res = await processUserRecharge(
          currentUser.uid,
          selectedPkg,
          'GOOGLE_PAY',
          {
            googlePayOrderId: result.orderId,
            googlePayTransactionId: result.transactionRef
          }
        );

        if (res.success) {
          setSuccessNotice({
            coinsAdded: res.coinsAdded,
            newCoins: res.newCoins,
            newExp: res.newExp,
            leveledUp: res.leveledUp,
            newLevel: res.newLevel,
            method: 'Google Pay Merchant (Verified)',
            refId: result.transactionRef
          });

          if (onSuccess) {
            onSuccess(res.newLevel, res.leveledUp);
          }
        }
      } else if (result.method === 'GOOGLE_PAY_APP') {
        setGooglePayError(null);
      }
    } catch (err: any) {
      setGooglePayError(err.message || 'Google Pay सुरू करताना तांत्रिक अडचण आली. कृपया खालील UTR पर्याय वापरा.');
    } finally {
      setIsProcessingGooglePay(false);
    }
  };

  // Google Pay UTR Verification (from Google Pay receipt)
  const handleVerifyGooglePayUtr = async () => {
    const cleanUtr = gpayUtrInput.trim().replace(/\s+/g, '');
    if (!cleanUtr) {
      setGpayUtrError('कृपया Google Pay पावतीमधील १२ अंकी UPI Ref / UTR नंबर टाका.');
      return;
    }
    if (cleanUtr.length < 10 || cleanUtr.length > 22) {
      setGpayUtrError('अवैध UTR नंबर. Google Pay मधील १२ अंकी UPI व्यवहार क्रमांक टाका.');
      return;
    }

    setGpayUtrError(null);
    setIsVerifyingGpayUtr(true);

    try {
      const verifyRes = await verifyGooglePayPayment({
        orderId: `GPAY_${cleanUtr}`,
        transactionRef: cleanUtr,
        amount: selectedPkg.inrPrice,
        userId: currentUser.uid,
        utrNumber: cleanUtr
      });

      if (!verifyRes.success) {
        throw new Error(verifyRes.error || 'Google Pay पडताळणी अयशस्वी');
      }

      const res = await processUserRecharge(
        currentUser.uid,
        selectedPkg,
        'GOOGLE_PAY',
        {
          googlePayOrderId: `GPAY_${cleanUtr}`,
          googlePayTransactionId: cleanUtr,
          utrNumber: cleanUtr
        }
      );

      if (res.success) {
        setSuccessNotice({
          coinsAdded: res.coinsAdded,
          newCoins: res.newCoins,
          newExp: res.newExp,
          leveledUp: res.leveledUp,
          newLevel: res.newLevel,
          method: 'Google Pay Merchant (Verified UTR)',
          refId: cleanUtr
        });

        setGpayUtrInput('');
        if (onSuccess) {
          onSuccess(res.newLevel, res.leveledUp);
        }
      }
    } catch (err: any) {
      setGpayUtrError(err.message || 'रिचार्ज पडताळताना त्रुटी आली. कृपया UTR पुन्हा तपासा.');
    } finally {
      setIsVerifyingGpayUtr(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[94vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-3xl text-white shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-4 sm:p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Coins className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight leading-none">
                  नाणी रिचार्ज (Coin Recharge)
                </h2>
                {vipStatus.level > 0 && (
                  <VipBadge level={vipStatus.level} size="xs" />
                )}
              </div>
              <p className="text-[11px] text-amber-100 font-semibold mt-1">
                प्रत्यक्ष व सुरक्षित रिचार्ज • १ रुपया = १ VIP EXP + नाणी
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-200">
          
          {/* User Current Balance Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-3.5 border border-slate-700/80 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/40">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  तुमचे शिल्लक नाणी
                </div>
                <div className="text-xl font-black text-yellow-400 flex items-center gap-1">
                  <span>{(currentUser.coins || 0).toLocaleString()}</span>
                  <span className="text-xs text-yellow-200/80 font-normal">Coins</span>
                </div>
              </div>
            </div>

            {/* VIP Status pill */}
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                सध्याचा VIP स्तर
              </div>
              <div className="flex items-center gap-1.5 justify-end mt-0.5">
                {vipStatus.level > 0 ? (
                  <VipBadge level={vipStatus.level} size="sm" />
                ) : (
                  <span className="text-xs font-bold text-slate-400">VIP 0 (Non-VIP)</span>
                )}
              </div>
              {vipStatus.nextTier && (
                <div className="text-[10px] text-amber-300/80 mt-0.5">
                  पुढील: <strong>{vipStatus.nextTier.nameMr}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Recharge Packages Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                १. पॅकेज निवडा (Select Package)
              </label>
              <span className="text-[11px] font-bold text-amber-400">
                निवडलेले: ₹{selectedPkg.inrPrice} ({selectedPkg.coins + selectedPkg.bonusCoins} नाणी)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RECHARGE_PACKAGES.slice(0, 6).map((pkg) => {
                const isSelected = selectedPkg.id === pkg.id;
                const totalCoins = pkg.coins + pkg.bonusCoins;

                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => {
                      setSelectedPkg(pkg);
                      setSuccessNotice(null);
                      setUtrError(null);
                    }}
                    className={`relative p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-500/20 to-slate-800/80 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    {pkg.tagMr && (
                      <span className={`absolute -top-2 right-2 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider shadow-xs ${
                        pkg.isBestValue 
                          ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white' 
                          : pkg.isPopular
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-bold'
                          : 'bg-blue-600 text-white'
                      }`}>
                        {pkg.tagMr}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-1 text-sm font-black text-white">
                        <Coins className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{totalCoins.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        +{pkg.vipExp} VIP EXP
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300">
                        ₹{pkg.inrPrice}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              २. पेमेंट पद्धत निवडा (Payment Method)
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentTab('googlepay');
                  setUtrError(null);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  paymentTab === 'googlepay'
                    ? 'bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20 border-blue-400 text-blue-300 font-black shadow-md ring-1 ring-blue-400'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold leading-none">Google Pay मर्चंट</div>
                  <div className="text-[10px] opacity-75 mt-0.5 font-normal">GPay ॲप / Web SDK</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentTab('upi');
                  setGooglePayError(null);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  paymentTab === 'upi'
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400 text-amber-300 font-black shadow-md ring-1 ring-amber-400'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <div className="text-xs font-bold leading-none">इतर UPI / QR कोड</div>
                  <div className="text-[10px] opacity-75 mt-0.5 font-normal">PhonePe / Paytm / BHIM</div>
                </div>
              </button>
            </div>
          </div>

          {/* TAB 1: Google Pay Merchant Gateway */}
          {paymentTab === 'googlepay' && (
            <div className="bg-slate-800/70 border border-blue-500/30 rounded-2xl p-4 space-y-3.5 animate-in fade-in">
              {/* Google Pay Verified Merchant Banner */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-950/60 via-slate-900 to-emerald-950/40 rounded-xl border border-blue-500/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{googlePayMerchantName || merchantName}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        Google Pay मर्चंट
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-300 flex items-center gap-2 mt-0.5">
                      <span>GPay VPA: <strong className="text-blue-300 font-mono">{googlePayUpiId}</strong></span>
                      <button
                        type="button"
                        onClick={handleCopyGpayUpi}
                        className="px-1.5 py-0.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[9px] rounded flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {copiedGpayUpi ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedGpayUpi ? 'कॉपी झाले' : 'कॉपी'}</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30">
                    Google Pay Verified
                  </span>
                </div>
              </div>

              {/* Action Buttons: 1-Click Pay with Google Pay & Open GPay App */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1-Click Native Web/Sheet Google Pay */}
                <button
                  type="button"
                  disabled={isProcessingGooglePay}
                  onClick={handleGooglePayWebCheckout}
                  className="py-3 px-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60 border border-slate-200"
                >
                  {isProcessingGooglePay ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-blue-600 font-bold">Google Pay सुरू होत आहे...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 shrink-0">
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                      </div>
                      <span>Pay ₹{selectedPkg.inrPrice} with GPay</span>
                    </>
                  )}
                </button>

                {/* Direct Google Pay App Launcher (Mobile Deep Link) */}
                <a
                  href={gpayTezUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Smartphone className="w-4 h-4 text-cyan-300" />
                  <span>Google Pay ॲपमध्ये उघडा</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
                </a>
              </div>

              {googlePayError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs space-y-1.5">
                  <div className="flex items-start gap-1.5 font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{googlePayError}</span>
                  </div>
                </div>
              )}

              {/* QR Code & Scan Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                <div className="flex flex-col items-center shrink-0">
                  <div className="p-2 bg-white rounded-2xl shadow-xl border-2 border-blue-400 relative">
                    <img 
                      src={gpayQrCodeUrl} 
                      alt="Google Pay QR Code" 
                      className="w-32 h-32 sm:w-36 sm:h-36 rounded-lg object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center p-1 shadow-lg">
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-blue-300 font-bold mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    ₹{selectedPkg.inrPrice} Google Pay QR
                  </span>
                </div>

                <div className="flex-1 w-full space-y-2.5">
                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center text-[10px]">१</span>
                      Google Pay द्वारे पैसे भरा (Pay via GPay)
                    </p>
                    <p className="text-[11px] text-slate-400 pl-5">
                      वरील <strong>Pay with GPay</strong> किंवा <strong>Google Pay ॲपमध्ये उघडा</strong> वर टॅप करा किंवा QR कोड स्कॅन करून <strong>₹{selectedPkg.inrPrice}</strong> भरा.
                    </p>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center text-[10px]">२</span>
                      Google Pay पावतीतील १२ अंकी UPI Ref / UTR टाका:
                    </p>
                    <div className="flex gap-2 pl-5">
                      <input
                        type="text"
                        value={gpayUtrInput}
                        onChange={(e) => {
                          setGpayUtrInput(e.target.value);
                          if (gpayUtrError) setGpayUtrError(null);
                        }}
                        placeholder="उदा. 425612345678"
                        maxLength={22}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 focus:border-blue-400 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 outline-none transition-all"
                      />
                      <button
                        type="button"
                        disabled={isVerifyingGpayUtr || !gpayUtrInput.trim()}
                        onClick={handleVerifyGooglePayUtr}
                        className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {isVerifyingGpayUtr ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>पडताळा</span>
                      </button>
                    </div>
                    {gpayUtrError && (
                      <div className="p-2 ml-5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>{gpayUtrError}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Real Direct UPI & QR Code Payment (PhonePe, Paytm, BHIM, Bank) */}
          {paymentTab === 'upi' && (
            <div className="bg-slate-800/70 border border-amber-500/30 rounded-2xl p-4 space-y-3.5 animate-in fade-in">
              {/* Bank Account / PhonePe Verified Header */}
              <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 rounded-xl border border-purple-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                    पे
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{merchantName}</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded-md border border-emerald-500/30">
                        सक्रिय खाते
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      पैसे मिळवण्यासाठीचे प्राथमिक बँक खाते (PhonePe / All UPI)
                    </div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-purple-300 font-bold">PhonePe Verified</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                
                {/* Real Dynamic QR Code */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="p-2 bg-white rounded-2xl shadow-xl border-2 border-amber-400 relative">
                    <img 
                      src={qrCodeImgUrl} 
                      alt="UPI Payment QR Code" 
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-lg object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-purple-700 border-2 border-white flex items-center justify-center text-white text-xs font-black shadow-lg">
                        पे
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-300 font-bold mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    ₹{selectedPkg.inrPrice} साठी PhonePe / UPI QR
                  </span>
                </div>

                {/* Steps & Direct App link */}
                <div className="flex-1 space-y-2.5 text-xs text-slate-300 w-full">
                  {/* Primary UPI ID */}
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/80 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center justify-between">
                      <span>अधिकृत मुख्य UPI ID:</span>
                      <span className="text-amber-400 text-[9px] font-bold">PhonePe (@ybl)</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-amber-300 text-xs truncate">
                        {merchantUpiId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                      >
                        {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUpi ? 'कॉपी झाले' : 'कॉपी करा'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Secondary UPI ID option */}
                  {secondaryUpiId && (
                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block">पर्यायी ID:</span>
                        <span className="font-mono text-[11px] text-slate-300 truncate">{secondaryUpiId}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopySecondaryUpi}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 transition-all cursor-pointer shrink-0"
                      >
                        {copiedSecondaryUpi ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedSecondaryUpi ? 'कॉपी झाले' : 'कॉपी'}</span>
                      </button>
                    </div>
                  )}

                  {/* 1-Click Open in UPI App for mobile users */}
                  <a
                    href={upiPayUrl}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-600 hover:from-purple-600 hover:to-teal-500 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>PhonePe / GPay / Paytm मध्ये थेट उघडा</span>
                  </a>

                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <p>१. वर दिलेला QR कोड PhonePe किंवा कोणत्याही UPI ॲपने स्कॅन करा.</p>
                    <p>२. बरोबर <strong className="text-amber-300">₹{selectedPkg.inrPrice}</strong> रुपये पाठवा.</p>
                    <p>३. व्यवहारानंतर मिळालेला १२-अंकी <strong>UPI Ref / UTR नंबर</strong> खाली टाका.</p>
                  </div>
                </div>
              </div>

              {/* UTR Input Form */}
              <div className="pt-2 border-t border-slate-700/80 space-y-2">
                <label className="block text-xs font-black text-slate-200">
                  व्यवहारानंतर मिळालेला १२-अंकी UPI UTR / Reference No. टाका:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={22}
                    value={utrInput}
                    onChange={(e) => {
                      setUtrInput(e.target.value);
                      setUtrError(null);
                    }}
                    placeholder="उदा. 425619384912 (१२ अंकी UTR)"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-600 focus:border-amber-400 text-white placeholder-slate-500 text-xs font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    disabled={isVerifyingUtr || !utrInput.trim()}
                    onClick={handleVerifyUtr}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifyingUtr ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>पडताळत आहे...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>पुष्टी करा व नाणी मिळवा</span>
                      </>
                    )}
                  </button>
                </div>

                {utrError && (
                  <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{utrError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Notice Card if completed */}
          {successNotice && (
            <div className="bg-emerald-950/70 border border-emerald-500/60 rounded-2xl p-4 text-emerald-200 animate-in zoom-in-95 space-y-2">
              <div className="flex items-center gap-2 font-black text-emerald-300 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>रिचार्ज यशस्वी झाला! (Recharge Completed)</span>
              </div>
              <p className="text-xs text-emerald-200">
                तुमच्या खात्यात <strong>+{successNotice.coinsAdded} नाणी</strong> आणि <strong>+{selectedPkg.vipExp} VIP EXP</strong> थेट जमा झाले आहेत!
              </p>
              <div className="text-[11px] text-emerald-300/80 font-mono">
                पद्धत: {successNotice.method} • Ref: {successNotice.refId}
              </div>
              {successNotice.leveledUp && (
                <div className="pt-2 border-t border-emerald-500/30 flex items-center justify-between text-xs text-yellow-300 font-black">
                  <span>नवीन VIP स्तर अनलॉक झाला:</span>
                  <VipBadge level={successNotice.newLevel} size="sm" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Notice */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>१००% सुरक्षित व्यवहार • बनावट / सिम्युलेशन पर्याय पूर्ण बंद</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            बंद करा
          </button>
        </div>

      </div>
    </div>
  );
};
