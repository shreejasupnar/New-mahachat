import { Request, Response } from 'express';
import { AccessToken } from 'livekit-server-sdk';

export async function handleLiveKitToken(req: Request, res: Response): Promise<void> {
  try {
    const { roomName, identity, name, role } = req.body;

    if (!roomName || !identity) {
      res.status(400).json({ error: 'roomName and identity are required' });
      return;
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    // If LiveKit credentials are not configured, return mock credentials
    if (!apiKey || !apiSecret || !livekitUrl) {
      res.json({
        token: `mock_live_token_${identity}_${Date.now()}`,
        livekitUrl: '',
        isMock: true,
        roomName,
        identity,
        expiresIn: 600
      });
      return;
    }

    let cleanLivekitUrl = livekitUrl.trim();
    if (cleanLivekitUrl.startsWith('https://')) {
      cleanLivekitUrl = 'wss://' + cleanLivekitUrl.slice(8);
    } else if (cleanLivekitUrl.startsWith('http://')) {
      cleanLivekitUrl = 'ws://' + cleanLivekitUrl.slice(7);
    } else if (!cleanLivekitUrl.startsWith('wss://') && !cleanLivekitUrl.startsWith('ws://')) {
      cleanLivekitUrl = 'wss://' + cleanLivekitUrl;
    }

    const canPublish = role === 'host' || role === 'guest';
    const at = new AccessToken(apiKey.trim(), apiSecret.trim(), {
      identity,
      name: name || identity,
      ttl: '2h',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    res.json({
      token,
      livekitUrl: cleanLivekitUrl,
      isMock: false,
      roomName,
      identity,
      expiresIn: 7200
    });
  } catch (error: any) {
    console.error('Error generating LiveKit token:', error);
    res.status(500).json({ error: error.message || 'Failed to generate token' });
  }
}
