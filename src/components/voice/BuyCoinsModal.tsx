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
import { processRazorpayCheckout } from '../../services/razorpayService';

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
  const [paymentTab, setPaymentTab] = useState<'upi' | 'razorpay'>('upi');
  const [merchantUpiId, setMerchantUpiId] = useState('7620363213@ybl');
  const [secondaryUpiId, setSecondaryUpiId] = useState('7620363213-2@ybl');
  const [merchantName, setMerchantName] = useState('IndusInd Bank - 3213');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedSecondaryUpi, setCopiedSecondaryUpi] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [razorpayError, setRazorpayError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/payment/config')
      .then(res => res.json())
      .then(data => {
        if (data.upiId) setMerchantUpiId(data.upiId);
        if (data.upiSecondaryId) setSecondaryUpiId(data.upiSecondaryId);
        if (data.upiName) setMerchantName(data.upiName);
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

  // Real Razorpay Checkout powered by server-side initialized order & HMAC verification service
  const handleRazorpayPurchase = async () => {
    setLoadingRazorpay(true);
    setRazorpayError(null);

    try {
      const verifiedResult = await processRazorpayCheckout({
        planId: selectedPack.id,
        amount: selectedPack.price,
        planName: `${selectedPack.coins} महा कॉईन्स रिचार्ज`,
        description: `वॉईस रूम्स आणि भेटवस्तूसाठी नाणी`,
        user: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          phoneNumber: currentUser.phoneNumber
        },
        themeColor: '#f97316'
      });

      const currentCoins = Number(currentUser.coins) || 0;
      const newBalance = currentCoins + selectedPack.coins;
      await updateDoc(doc(db, 'users', currentUser.uid), { coins: newBalance });
      
      await setDoc(doc(db, 'recharges', verifiedResult.paymentId), {
        id: verifiedResult.paymentId,
        userId: currentUser.uid,
        packageId: selectedPack.id,
        inrPrice: selectedPack.price,
        coinsGranted: selectedPack.coins,
        paymentMethod: 'RAZORPAY',
        transactionRef: verifiedResult.paymentId,
        razorpayOrderId: verifiedResult.orderId,
        razorpayPaymentId: verifiedResult.paymentId,
        createdAt: new Date().toISOString(),
        status: 'completed'
      });

      onCoinsUpdated(newBalance);
      setSuccessMessage(`🎉 अभिनंदन! +${selectedPack.coins} कॉईन्स यशस्वीपणे जमा झाले आहेत!`);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setRazorpayError(err.message || 'Razorpay सुरू करताना अडचण आली.');
    } finally {
      setLoadingRazorpay(false);
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
                  setRazorpayError(null);
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

        {/* Tabs: UPI vs Razorpay */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setPaymentTab('upi');
              setRazorpayError(null);
            }}
            className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
              paymentTab === 'upi'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>थेट UPI / QR कोड</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentTab('razorpay');
              setUtrError(null);
            }}
            className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
              paymentTab === 'razorpay'
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 ring-1 ring-blue-400'
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span>Razorpay ऑनलाइन</span>
          </button>
        </div>

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

        {/* Razorpay Screen */}
        {paymentTab === 'razorpay' && (
          <div className="bg-slate-800/60 border border-blue-500/30 rounded-2xl p-3 space-y-2.5">
            <div className="text-xs text-slate-300">
              क्रेडिट / डेबिट कार्ड किंवा नेटबँकिंग द्वारे त्वरित पेमेंट करा.
            </div>

            {razorpayError && (
              <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span>{razorpayError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentTab('upi');
                      setRazorpayError(null);
                    }}
                    className="block text-amber-400 font-bold underline mt-1"
                  >
                    थेट UPI पर्याय वापरा
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={loadingRazorpay}
              onClick={handleRazorpayPurchase}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loadingRazorpay ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>प्रक्रिया सुरू आहे...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>₹{selectedPack.price} चे ऑनलाइन पेमेंट करा</span>
                </>
              )}
            </button>
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
