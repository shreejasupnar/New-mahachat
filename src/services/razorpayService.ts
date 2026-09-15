/**
 * Razorpay Payment Gateway Service
 * Handles server-side order session initialization, SDK loading,
 * and server-side cryptographic payment verification (HMAC SHA-256).
 */

export interface CreateOrderParams {
  planId: string;
  amount: number; // in INR (rupees)
  userId: string;
  planName?: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  amount?: number; // in paise
  currency?: string;
  keyId?: string;
  isLive?: boolean;
  error?: string;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  paymentId?: string;
  orderId?: string;
  error?: string;
}

export interface RazorpayCheckoutOptions {
  planId: string;
  amount: number; // in INR
  planName: string;
  description?: string;
  user: {
    uid: string;
    displayName?: string;
    email?: string;
    phoneNumber?: string;
  };
  themeColor?: string;
}

export interface VerifiedCheckoutResult {
  verified: boolean;
  orderId: string;
  paymentId: string;
  signature: string;
}

/**
 * Ensures the official Razorpay Checkout SDK is loaded in the browser
 */
export async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if ((window as any).Razorpay) {
    return true;
  }

  return new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Checks server Razorpay configuration status
 */
export async function getRazorpayConfig(): Promise<{ configured: boolean; keyId: string | null }> {
  try {
    const res = await fetch('/api/razorpay/config');
    return await res.json();
  } catch {
    return { configured: false, keyId: null };
  }
}

/**
 * Initialize an order session on the server
 */
export async function createRazorpayOrderSession(params: CreateOrderParams): Promise<CreateOrderResponse> {
  const res = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId: params.planId,
      amount: params.amount,
      userId: params.userId,
      planName: params.planName || 'MahaChat Coins',
      userEmail: params.userEmail,
      userName: params.userName,
      userPhone: params.userPhone
    })
  });

  const data = await res.json();
  return data;
}

/**
 * Verifies a Razorpay payment on the server using cryptographic HMAC SHA-256
 */
export async function verifyRazorpayPaymentServerSide(params: VerifyPaymentParams): Promise<VerifyPaymentResponse> {
  const res = await fetch('/api/razorpay/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const data = await res.json();
  return data;
}

/**
 * Executes a full real Razorpay checkout flow:
 * 1. Loads SDK
 * 2. Initializes order session on the server
 * 3. Opens the Razorpay modal
 * 4. Cryptographically verifies signature on the server upon completion
 * 5. Returns verified payment credentials
 */
export async function processRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<VerifiedCheckoutResult> {
  // 1. Ensure SDK loaded
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded || !(window as any).Razorpay) {
    throw new Error('Razorpay SDK लोड करण्यात अयशस्वी झाले. कृपया इंटरनेट तपासा.');
  }

  // 2. Initialize Order Session server-side
  const orderSession = await createRazorpayOrderSession({
    planId: options.planId,
    amount: options.amount,
    userId: options.user.uid,
    planName: options.planName,
    userEmail: options.user.email,
    userName: options.user.displayName,
    userPhone: options.user.phoneNumber
  });

  if (!orderSession.success || !orderSession.orderId) {
    throw new Error(orderSession.error || 'Razorpay ऑर्डर सत्र तयार करण्यात अयशस्वी झाले.');
  }

  // 3. Open Razorpay Checkout Modal
  return new Promise((resolve, reject) => {
    const rzpOptions = {
      key: orderSession.keyId,
      amount: orderSession.amount,
      currency: orderSession.currency || 'INR',
      name: 'MahaChat नाणी व VIP',
      description: options.description || options.planName,
      order_id: orderSession.orderId,
      handler: async (response: any) => {
        try {
          // 4. Verify payment server-side with HMAC SHA-256
          const verification = await verifyRazorpayPaymentServerSide({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          if (verification.verified) {
            resolve({
              verified: true,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
          } else {
            reject(new Error(verification.error || 'पेमेंट स्वाक्षरी पडताळणी अयशस्वी झाली.'));
          }
        } catch (err: any) {
          reject(new Error(err.message || 'सर्व्हरवर पेमेंट पडताळणी करताना तांत्रिक अडचण आली.'));
        }
      },
      prefill: {
        name: options.user.displayName || 'MahaChat User',
        email: options.user.email || '',
        contact: options.user.phoneNumber || ''
      },
      theme: {
        color: options.themeColor || '#d97706'
      },
      modal: {
        ondismiss: () => {
          reject(new Error('पेमेंट विंडो वापरकर्त्याने बंद केली (Cancelled)'));
        }
      }
    };

    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.on('payment.failed', (failRes: any) => {
      const msg = failRes?.error?.description || 'बँक किंवा पेमेंट गेटवे कडून व्यवहार नाकारला गेला.';
      reject(new Error(`पेमेंट अयशस्वी: ${msg}`));
    });
    rzp.open();
  });
}
