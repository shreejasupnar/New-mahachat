/**
 * Google Pay Web API Types & SDK Loader
 */

export interface GooglePayConfigResponse {
  configured: boolean;
  merchantId: string;
  merchantName: string;
  merchantUpiId: string;
  environment: 'PRODUCTION' | 'TEST';
  mcc: string;
}

export interface GooglePayOrderSession {
  success: boolean;
  orderId: string;
  transactionRef: string;
  amount: number;
  currency: string;
  merchantId: string;
  merchantName: string;
  merchantUpiId: string;
  tezDeepLink: string;
  upiDeepLink: string;
  error?: string;
}

export interface GooglePayVerificationResponse {
  success: boolean;
  verified: boolean;
  transactionId?: string;
  orderId?: string;
  error?: string;
}

/**
 * Loads the official Google Pay Web SDK dynamically if not already loaded
 */
export function loadGooglePayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).google?.payments?.api?.PaymentsClient) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://pay.google.com/gp/p/js/pay.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Calls backend API to get Google Pay Merchant configuration
 */
export async function getGooglePayConfig(): Promise<GooglePayConfigResponse> {
  try {
    const res = await fetch('/api/googlepay/config');
    const data = await res.json();
    return data;
  } catch {
    return {
      configured: true,
      merchantId: '',
      merchantName: 'IndusInd Bank - 3213',
      merchantUpiId: '7620363213@ybl',
      environment: 'PRODUCTION',
      mcc: '5812'
    };
  }
}

/**
 * Calls backend API to create a Google Pay transaction session
 */
export async function createGooglePayOrder(params: {
  planId: string;
  amount: number;
  userId: string;
  planName: string;
}): Promise<GooglePayOrderSession> {
  const res = await fetch('/api/googlepay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Google Pay ऑर्डर सत्र तयार करता आले नाही.');
  }

  return data;
}

/**
 * Calls backend API to verify Google Pay transaction or reference
 */
export async function verifyGooglePayPayment(params: {
  orderId: string;
  transactionRef: string;
  amount: number;
  userId: string;
  paymentToken?: any;
  utrNumber?: string;
}): Promise<GooglePayVerificationResponse> {
  const res = await fetch('/api/googlepay/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Google Pay पेमेंट पडताळणी अयशस्वी झाली.');
  }

  return data;
}
