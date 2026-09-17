/**
 * Google Pay Merchant Service
 * Integrates official Google Pay Web API (Pay.js) and direct Google Pay (Tez) Merchant routing.
 */

import {
  loadGooglePayScript,
  getGooglePayConfig,
  createGooglePayOrder,
  verifyGooglePayPayment,
  GooglePayOrderSession
} from '../lib/googlePay';

export interface GooglePayCheckoutOptions {
  planId: string;
  amount: number;
  planName: string;
  description?: string;
  user: {
    uid: string;
    displayName?: string;
    email?: string;
    phoneNumber?: string;
  };
}

export interface GooglePayCheckoutResult {
  verified: boolean;
  orderId: string;
  transactionRef: string;
  method: 'GOOGLE_PAY_WEB' | 'GOOGLE_PAY_APP' | 'GOOGLE_PAY_UPI';
  paymentToken?: any;
}

/**
 * Checks if the user's browser/device supports Google Pay Web API
 */
export async function isGooglePayWebReady(environment: 'PRODUCTION' | 'TEST' = 'PRODUCTION'): Promise<boolean> {
  try {
    const loaded = await loadGooglePayScript();
    if (!loaded || !(window as any).google?.payments?.api?.PaymentsClient) {
      return false;
    }

    const paymentsClient = new (window as any).google.payments.api.PaymentsClient({
      environment
    });

    // Standard Google Pay Web v2 isReadyToPay specification (CARD only, no tokenization in isReadyToPay)
    const isReadyToPayRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          }
        }
      ]
    };

    const res = await paymentsClient.isReadyToPay(isReadyToPayRequest);
    return !!res?.result;
  } catch {
    return false;
  }
}

/**
 * Initiates checkout via official Google Pay Web API or direct mobile Tez app launch
 */
export async function processGooglePayWebCheckout(
  options: GooglePayCheckoutOptions
): Promise<GooglePayCheckoutResult> {
  const config = await getGooglePayConfig();

  // 1. Create order session on server
  const session: GooglePayOrderSession = await createGooglePayOrder({
    planId: options.planId,
    amount: options.amount,
    userId: options.user.uid,
    planName: options.planName
  });

  // On mobile devices, launch the Google Pay (Tez) app directly
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    const deepLink = session.tezDeepLink || session.upiDeepLink;
    if (deepLink) {
      window.location.href = deepLink;
      return {
        verified: false,
        orderId: session.orderId,
        transactionRef: session.transactionRef,
        method: 'GOOGLE_PAY_APP'
      };
    }
  }

  // 2. Desktop Google Pay Web checkout
  const loaded = await loadGooglePayScript();
  if (!loaded || !(window as any).google?.payments?.api?.PaymentsClient) {
    if (session.tezDeepLink) {
      window.location.href = session.tezDeepLink;
      return {
        verified: false,
        orderId: session.orderId,
        transactionRef: session.transactionRef,
        method: 'GOOGLE_PAY_APP'
      };
    }
    throw new Error('Google Pay ॲपद्वारे भरण्यासाठी कृपया दिलेला QR कोड स्कॅन करा किंवा मोबाईलवर उघडा.');
  }

  const paymentsClient = new (window as any).google.payments.api.PaymentsClient({
    environment: config.environment || 'PRODUCTION'
  });

  const paymentDataRequest: any = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA']
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example',
            gatewayMerchantId: config.merchantId || 'googlePayMerchant'
          }
        }
      }
    ],
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: options.amount.toFixed(2),
      currencyCode: 'INR',
      countryCode: 'IN'
    },
    merchantInfo: {
      merchantName: session.merchantName,
      merchantId: config.merchantId || undefined
    }
  };

  try {
    const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);

    // Verify payment on backend
    const verification = await verifyGooglePayPayment({
      orderId: session.orderId,
      transactionRef: session.transactionRef,
      amount: options.amount,
      userId: options.user.uid,
      paymentToken: paymentData
    });

    if (!verification.verified) {
      throw new Error(verification.error || 'Google Pay पेमेंट पडताळणी अयशस्वी');
    }

    return {
      verified: true,
      orderId: session.orderId,
      transactionRef: session.transactionRef,
      method: 'GOOGLE_PAY_WEB',
      paymentToken: paymentData
    };
  } catch (err: any) {
    if (err?.statusCode === 'CANCELED') {
      throw new Error('Google Pay विंडो वापरकर्त्याने बंद केली.');
    }
    // If Web sheet is not supported on this browser or user has no saved card, guide to Tez/UPI
    if (session.tezDeepLink) {
      window.location.href = session.tezDeepLink;
      return {
        verified: false,
        orderId: session.orderId,
        transactionRef: session.transactionRef,
        method: 'GOOGLE_PAY_APP'
      };
    }
    throw new Error('Google Pay ॲपद्वारे भरण्यासाठी खालील QR कोड स्कॅन करा किंवा "Google Pay ॲपमध्ये उघडा" वर टॅप करा.');
  }
}

/**
 * Builds direct Google Pay (Tez) deep-link for instant mobile app opening
 */
export function buildGooglePayTezLink(params: {
  merchantUpiId: string;
  merchantName: string;
  amount: number;
  transactionRef: string;
  note: string;
  mcc?: string;
}): string {
  const query = new URLSearchParams({
    pa: params.merchantUpiId,
    pn: params.merchantName,
    mc: params.mcc || '5812',
    tr: params.transactionRef,
    am: params.amount.toFixed(2),
    cu: 'INR',
    tn: params.note,
    mode: '02'
  });

  return `tez://upi/pay?${query.toString()}`;
}
