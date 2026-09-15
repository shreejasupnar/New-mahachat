export interface RazorpayOrderResponse {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  isLive: boolean;
  notice?: string;
  error?: string;
}

export interface RazorpayVerificationResponse {
  success: boolean;
  verified: boolean;
  paymentId?: string;
  orderId?: string;
  error?: string;
}

/**
 * Loads the official Razorpay Checkout SDK script dynamically if not present
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
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
 * Calls backend API to create a Razorpay order
 */
export async function createRazorpayOrder(params: {
  planId: string;
  amount: number;
  userId: string;
  planName: string;
}): Promise<RazorpayOrderResponse> {
  const res = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'पेमेंट ऑर्डर तयार करता आली नाही.');
  }

  return data;
}

/**
 * Calls backend API to verify Razorpay signature securely
 */
export async function verifyRazorpayPayment(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
  isLive: boolean;
}): Promise<RazorpayVerificationResponse> {
  const res = await fetch('/api/razorpay/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'पेमेंट सही पडताळणी अयशस्वी झाली.');
  }

  return data;
}
