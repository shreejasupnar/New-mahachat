import { Router, Request, Response } from 'express';
import { handleLiveKitToken } from './livekitToken';

export const liveRouter = Router();

// 1. LiveKit Token Minter
liveRouter.post('/token', handleLiveKitToken);

// 2. Health & Status
liveRouter.get('/status', (_req: Request, res: Response) => {
  const hasApiKey = !!process.env.LIVEKIT_API_KEY?.trim();
  const hasApiSecret = !!process.env.LIVEKIT_API_SECRET?.trim();
  const rawUrl = process.env.LIVEKIT_URL?.trim() || '';
  const hasUrl = !!rawUrl;
  const hasLiveKit = hasApiKey && hasApiSecret && hasUrl;

  res.json({
    status: 'ok',
    featureLive: process.env.FEATURE_LIVE === 'true' || true,
    hasLiveKit,
    details: {
      hasApiKey,
      hasApiSecret,
      hasUrl,
      maskedUrl: rawUrl ? (rawUrl.length > 20 ? rawUrl.slice(0, 16) + '...' : rawUrl) : null,
    },
    timestamp: Date.now()
  });
});

// 3. PK Battle Transitions & Authority Endpoint
liveRouter.post('/pk-transitions', (req: Request, res: Response) => {
  try {
    const { action, battleId, durationSeconds, hostAScore, hostBScore } = req.body;
    const serverNow = Date.now();
    const duration = durationSeconds || 300;

    if (action === 'calculate_end') {
      const endsAt = serverNow + duration * 1000;
      return res.json({
        success: true,
        serverTime: serverNow,
        endsAt,
        durationSeconds: duration,
      });
    }

    if (action === 'validate_winner') {
      let winner = 'draw';
      if (hostAScore > hostBScore) winner = 'hostA';
      else if (hostBScore > hostAScore) winner = 'hostB';
      return res.json({
        success: true,
        winner,
        serverTime: serverNow,
      });
    }

    return res.json({
      success: true,
      action,
      battleId,
      serverTime: serverNow,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'PK transition error' });
  }
});

