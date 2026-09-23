export interface LiveTokenResponse {
  token: string;
  livekitUrl: string;
  isMock: boolean;
  roomName: string;
  identity: string;
  expiresIn: number;
}

export interface LiveStatusResponse {
  status: string;
  featureLive: boolean;
  hasLiveKit: boolean;
  details?: {
    hasApiKey: boolean;
    hasApiSecret: boolean;
    hasUrl: boolean;
    maskedUrl?: string | null;
  };
  timestamp: number;
}

export async function checkLiveStatus(): Promise<LiveStatusResponse> {
  try {
    const res = await fetch('/api/live/status');
    if (!res.ok) {
      return { status: 'ok', featureLive: true, hasLiveKit: false, timestamp: Date.now() };
    }
    return await res.json();
  } catch (err) {
    return { status: 'ok', featureLive: true, hasLiveKit: false, timestamp: Date.now() };
  }
}

export async function fetchLiveToken(
  roomName: string, 
  identity: string, 
  name?: string, 
  role: 'host' | 'guest' | 'viewer' = 'viewer'
): Promise<LiveTokenResponse> {
  const response = await fetch('/api/live/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomName, identity, name, role }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch live token');
  }

  return response.json();
}
