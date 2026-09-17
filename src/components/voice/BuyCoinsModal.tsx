import React, { useState, useEffect } from 'react';
import { 
  X, 
  Coins, 
  ShieldCheck, 
  Loader2, 
  QrCode, 
  CreditCard, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { UserProfile, db } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { processGooglePayWebCheckout, buildGooglePayTezLink } from '../../services/googlePayService';
import { verifyGooglePayPayment } from '../../lib/googlePay';

interface BuyCoinsModalProps {
  currentUser: UserProfile;
  onCoinsUpdated: (newCoins: number) => void;
  onClose: () => void;
}

const COIN_PACKAGES = [
  { id: 'coins_100', coins: 100, price: 19, labelMr: 'सुरुवात पॅक', bonus: '' },
  { id: 'coins_500', coins: 500, price: 79, labelMr: 'अस्सल मराठी पॅक', bonus: 'सर्वात लोकप्रिय', isPopular: true },
  { id: 'coins_1200', coins: 1200, price: 169, labelMr: 'महाउत्सव पॅक', bonus: '+20% अतिरिक्त' },
  { id: 'coins_3000', coins: 3000, price: 399, labelMr: 'शाही VIP पॅक', bonus: '+35% अतिरिक्त' }
];

export const BuyCoinsModal: React.FC<BuyCoinsModalProps> = ({
  currentUser,
  onCoinsUpdated,
  onClose
}) => {
  const [selectedPack, setSelectedPack] = useState(COIN_PACKAGES[1]);
  const [paymentTab, setPaymentTab] = useState<'googlepay' | 'upi'>('googlepay');
  const [merchantUpiId, setMerchantUpiId] = useState('7620363213@ybl');
  const [secondaryUpiId, setSecondaryUpiId] = useState('7620363213-2@ybl');
  const [merchantName, setMerchantName] = useState('IndusInd Bank - 3213');
  const [googlePayMerchantName, setGooglePayMerchantName] = useState('IndusInd Bank - 3213');
  const [googlePayUpiId, setGooglePayUpiId] = useState('7620363213@ybl');

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedSecondaryUpi, setCopiedSecondaryUpi] = useState(false);
  const [copiedGpayUpi, setCopiedGpayUpi] = useState(false);

  const [utrInput, setUtrInput] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);

  const [gpayUtrInput, setGpayUtrInput] = useState('');
  const [gpayUtrError, setGpayUtrError] = useState<string | null>(null);
  const [isVerifyingGpayUtr, setIsVerifyingGpayUtr] = useState(false);

  const [loadingGooglePay, setLoadingGooglePay] = useState(false);
  const [googlePayError, setGooglePayError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/payment/config')
      .then(res => res.json())
      .then(data => {
        if (data.upiId) setMerchantUpiId(data.upiId);
        if (data.upiSecondaryId) setSecondaryUpiId(data.upiSecondaryId);
        if (data.upiName) setMerchantName(data.upiName);
        if (data.googlePayMerchantName) setGooglePayMerchantName(data.googlePayMerchantName);
        if (data.googlePayUpiId) setGooglePayUpiId(data.googlePayUpiId);
      })
      .catch(() => {});
  }, []);

  const upiPayUrl = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${selectedPack.price}&cu=INR&tn=${encodeURIComponent(`MahaChat ${selectedPack.coins} Coins`)}`;
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiPayUrl)}`;

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

  // Real Direct UPI UTR Submission
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
      // Check duplicate in Firestore
      const duplicateRef = doc(db, 'recharges', `upi_${cleanUtr}`);
      const duplicateSnap = await getDoc(duplicateRef);
      if (duplicateSnap.exists()) {
        throw new Error('हा UPI UTR नंबर आधीच वापरला गेला आहे.');
      }

      // Verify on backend
      const verifyRes = await fetch('/api/payment/verify-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utrNumber: cleanUtr,
          amount: selectedPack.price,
          planId: selectedPack.id,
          userId: currentUser.uid
        })
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        throw new Error(verifyData.error || 'UTR पडताळणी अयशस्वी');
      }

      // Credit coins in Firestore
      const currentCoins = Number(currentUser.coins) || 0;
      const newBalance = currentCoins + selectedPack.coins;
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { coins: newBalance });

      // Save recharge record
      await setDoc(duplicateRef, {
        id: `upi_${cleanUtr}`,
        userId: currentUser.uid,
        packageId: selectedPack.id,
        inrPrice: selectedPack.price,
        coinsGranted: selectedPack.coins,
        paymentMethod: 'UPI',
        transactionRef: cleanUtr,
        createdAt: new Date().toISOString(),
        status: 'completed'
      });

      onCoinsUpdated(newBalance);
      setSuccessMessage(`🎉 अभिनंदन! +${selectedPack.coins} कॉईन्स थेट जमा झाले आहेत!`);
      setUtrInput('');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setUtrError(err.message || 'पडताळणी अयशस्वी. कृपया UTR पुन्हा तपासा.');
    } finally {
      setIsVerifyingUtr(false);
    }
  };

  const gpayTxnRef = `MCVC${Date.now().toString().slice(-8)}`;
  const gpayTezUrl = buildGooglePayTezLink({
    merchantUpiId: googlePayUpiId,
    merchantName: googlePayMerchantName,
    mcc: '5812',
    transactionRef: gpayTxnRef,
    amount: selectedPack.price,
    note: `MahaChat ${selectedPack.coins} Coins`
  });
  const gpayQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(gpayTezUrl)}`;

  const handleCopyGpayUpi = () => {
    navigator.clipboard.writeText(googlePayUpiId);
    setCopiedGpayUpi(true);
    setTimeout(() => setCopiedGpayUpi(false), 2500);
  };

  // Google Pay Web / Sheet Checkout
  const handleGooglePayPurchase = async () => {
    setLoadingGooglePay(true);
    setGooglePayError(null);

    try {
      const verifiedResult = await processGooglePayWebCheckout({
        planId: selectedPack.id,
        amount: selectedPack.price,
        planName: `${selectedPack.coins} महा कॉईन्स पॅक`,
        description: 'वॉईस रूम्स आणि भेटवस्तूसाठी नाणी',
        user: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          phoneNumber: currentUser.phoneNumber
        }
      });

      if (verifiedResult.verified) {
        const currentCoins = Number(currentUser.coins) || 0;
        const newBalance = currentCoins + selectedPack.coins;
        await updateDoc(doc(db, 'users', currentUser.uid), { coins: newBalance });
        
        const txnRef = verifiedResult.transactionRef || verifiedResult.orderId;
        await setDoc(doc(db, 'recharges', txnRef), {
          id: txnRef,
          userId: currentUser.uid,
          packageId: selectedPack.id,
          inrPrice: selectedPack.price,
          coinsGranted: selectedPack.coins,
          paymentMethod: 'GOOGLE_PAY',
          transactionRef: txnRef,
          googlePayOrderId: verifiedResult.orderId,
          createdAt: new Date().toISOString(),
          status: 'completed'
        });

        onCoinsUpdated(newBalance);
        setSuccessMessage(`🎉 अभिनंदन! +${selectedPack.coins} कॉईन्स Google Pay द्वारे थेट जमा झाले आहेत!`);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else if (verifiedResult.method === 'GOOGLE_PAY_APP') {
        setGooglePayError(null);
      }
    } catch (err: any) {
      setGooglePayError(err.message || 'Google Pay सुरू करताना अडचण आली.');
    } finally {
      setLoadingGooglePay(false);
    }
  };

  // Google Pay UTR Manual Verification
  const handleVerifyGooglePayUtr = async () => {
    const cleanUtr = gpayUtrInput.trim().replace(/\s+/g, '');
    if (!cleanUtr) {
      setGpayUtrError('कृपया १२ अंकी UPI Ref / UTR टाका.');
      return;
    }
    if (cleanUtr.length < 8 || cleanUtr.length > 22) {
      setGpayUtrError('कृपया Google Pay पावतीतील वैध १२ अंकी UTR प्रविष्ट करा.');
      return;
    }

    setGpayUtrError(null);
    setIsVerifyingGpayUtr(true);

    try {
      const verifiedResult = await verifyGooglePayPayment({
        orderId: `gpay_utr_${cleanUtr}`,
        transactionRef: `REF_GPAY_${cleanUtr}`,
        utrNumber: cleanUtr,
        amount: selectedPack.price,
        userId: currentUser.uid
      });

      if (!verifiedResult.success) {
        throw new Error(verifiedResult.error || 'Google Pay UTR पडताळणी अयशस्वी.');
      }

      const currentCoins = Number(currentUser.coins) || 0;
      const newBalance = currentCoins + selectedPack.coins;
      await updateDoc(doc(db, 'users', currentUser.uid), { coins: newBalance });

      await setDoc(doc(db, 'recharges', `gpay_${cleanUtr}`), {
        id: `gpay_${cleanUtr}`,
        userId: currentUser.uid,
        packageId: selectedPack.id,
        inrPrice: selectedPack.price,
        coinsGranted: selectedPack.coins,
        paymentMethod: 'GOOGLE_PAY_UTR',
        transactionRef: cleanUtr,
        createdAt: new Date().toISOString(),
        status: 'completed'
      });

      onCoinsUpdated(newBalance);
      setSuccessMessage(`🎉 अभिनंदन! +${selectedPack.coins} कॉईन्स जमा झाले आहेत!`);
      setGpayUtrInput('');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setGpayUtrError(err.message || 'पडताळणी अयशस्वी. कृपया UTR पुन्हा तपासा.');
    } finally {
      setIsVerifyingGpayUtr(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-4 sm:p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm">थेट नाणी खरेदी (Buy Coins)</h3>
              <p className="text-[11px] text-slate-400">सध्याचे कॉईन्स: 🪙 {currentUser.coins ?? 0}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-2 gap-2">
          {COIN_PACKAGES.map(pack => {
            const isSelected = selectedPack.id === pack.id;
            return (
              <button
                key={pack.id}
                onClick={() => {
                  setSelectedPack(pack);
                  setUtrError(null);
                  setGooglePayError(null);
                }}
                className={`relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-gradient-to-b from-amber-500/20 to-slate-800/80 border-amber-400 shadow-md ring-1 ring-amber-400' 
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 text-slate-300'
                }`}
              >
                {pack.bonus && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[8px] shadow-xs">
                    {pack.bonus}
                  </span>
                )}

                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-sm">🪙</span>
                  <span className="font-black text-white text-sm">{pack.coins}</span>
                </div>
                <div className="text-[10px] text-slate-300">{pack.labelMr}</div>
                <div className="text-xs font-black text-amber-400 mt-1">₹{pack.price}</div>
              </button>
            );
          })}
        </div>

        {/* Tabs: Google Pay vs UPI */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setPaymentTab('googlepay');
              setUtrError(null);
            }}
            className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
              paymentTab === 'googlepay'
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 ring-1 ring-blue-400'
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-4 h-4 shrink-0">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            </div>
            <span>Google Pay मर्चंट</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentTab('upi');
              setGooglePayError(null);
            }}
            className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
              paymentTab === 'upi'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>इतर UPI / QR कोड</span>
          </button>
        </div>

        {/* Google Pay Merchant Screen */}
        {paymentTab === 'googlepay' && (
          <div className="bg-slate-800/60 border border-blue-500/30 rounded-2xl p-3 space-y-3">
            {/* Google Pay Verified Merchant Banner */}
            <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-blue-950/60 via-slate-900 to-emerald-950/40 rounded-xl border border-blue-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shadow-xs shrink-0">
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
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/30">Verified</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>VPA: <strong className="font-mono text-blue-300">{googlePayUpiId}</strong></span>
                    <button
                      type="button"
                      onClick={handleCopyGpayUpi}
                      className="text-[9px] text-blue-400 hover:text-blue-300 bg-blue-500/20 px-1 rounded flex items-center gap-0.5 cursor-pointer"
                    >
                      {copiedGpayUpi ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>{copiedGpayUpi ? 'झाले' : 'कॉपी'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions: GPay Web & Open App */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loadingGooglePay}
                onClick={handleGooglePayPurchase}
                className="py-2.5 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {loadingGooglePay ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <div className="w-3.5 h-3.5 shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                  </div>
                )}
                <span>Pay ₹{selectedPack.price}</span>
              </button>

              <a
                href={gpayTezUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>GPay ॲप उघडा</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {googlePayError && (
              <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{googlePayError}</span>
              </div>
            )}

            {/* QR & UTR verification */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-xl shadow-md border border-blue-400 shrink-0 relative">
                <img 
                  src={gpayQrCodeUrl} 
                  alt="Google Pay QR Code" 
                  className="w-24 h-24 rounded-md object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-6 h-6 rounded-full bg-white border border-blue-500 flex items-center justify-center p-0.5 shadow-md">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1 flex-1 text-xs">
                <label className="block text-[11px] font-bold text-slate-300">
                  Google Pay पावतीतील १२ अंकी UTR टाका:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    maxLength={22}
                    value={gpayUtrInput}
                    onChange={(e) => {
                      setGpayUtrInput(e.target.value);
                      setGpayUtrError(null);
                    }}
                    placeholder="उदा. 425612345678"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-blue-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isVerifyingGpayUtr || !gpayUtrInput.trim()}
                    onClick={handleVerifyGooglePayUtr}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-lg transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
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
                  <div className="text-[11px] text-red-300 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{gpayUtrError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* UPI Screen */}
        {paymentTab === 'upi' && (
          <div className="bg-slate-800/60 border border-amber-500/30 rounded-2xl p-3 space-y-2.5">
            {/* Bank / PhonePe Header */}
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 rounded-xl border border-purple-500/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                  पे
                </div>
                <div>
                  <div className="text-xs font-black text-white leading-tight">
                    {merchantName}
                  </div>
                  <div className="text-[9px] text-slate-400">
                    PhonePe / सर्व UPI ॲप्स समर्थित
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-bold text-purple-300">Verified</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-xl shadow-md border border-amber-400 shrink-0 relative">
                <img 
                  src={qrCodeImgUrl} 
                  alt="UPI QR Code" 
                  className="w-28 h-28 rounded-md object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-6 h-6 rounded-full bg-purple-700 border border-white flex items-center justify-center text-white text-[10px] font-black shadow-md">
                    पे
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 flex-1 text-xs">
                {/* Primary UPI ID */}
                <div className="flex items-center justify-between gap-1 bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700">
                  <div className="truncate">
                    <span className="text-[8px] text-slate-400 uppercase block">PhonePe UPI ID</span>
                    <span className="font-mono text-[11px] font-bold text-amber-300 truncate">{merchantUpiId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded hover:bg-amber-500/30 flex items-center gap-0.5 shrink-0"
                  >
                    {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUpi ? 'कॉपी!' : 'कॉपी'}</span>
                  </button>
                </div>

                {/* Secondary UPI ID */}
                {secondaryUpiId && (
                  <div className="flex items-center justify-between gap-1 bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800">
                    <div className="truncate">
                      <span className="text-[8px] text-slate-400 block">पर्यायी ID:</span>
                      <span className="font-mono text-[10px] text-slate-300 truncate">{secondaryUpiId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopySecondaryUpi}
                      className="text-[9px] text-slate-400 hover:text-white flex items-center gap-0.5 shrink-0"
                    >
                      {copiedSecondaryUpi ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>{copiedSecondaryUpi ? 'कॉपी!' : 'कॉपी'}</span>
                    </button>
                  </div>
                )}

                <a
                  href={upiPayUrl}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all shadow-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>PhonePe / UPI उघडा (₹{selectedPack.price})</span>
                </a>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-slate-700/60">
              <div className="text-[11px] text-slate-300 font-bold">
                पेमेंट झाल्यावर १२-अंकी UPI UTR नंबर टाका:
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  maxLength={22}
                  value={utrInput}
                  onChange={(e) => {
                    setUtrInput(e.target.value);
                    setUtrError(null);
                  }}
                  placeholder="उदा. 425619384912"
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={isVerifyingUtr || !utrInput.trim()}
                  onClick={handleVerifyUtr}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  {isVerifyingUtr ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>पुष्टी करा</span>
                </button>
              </div>
              {utrError && (
                <div className="text-[11px] text-red-300 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{utrError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Notice */}
        {successMessage && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>सुरक्षित व अस्सल पेमेंट गेटवे</span>
          </div>
          <span className="text-amber-400 font-semibold">१००% सुरक्षित व्यवहार</span>
        </div>

      </div>
    </div>
  );
};
