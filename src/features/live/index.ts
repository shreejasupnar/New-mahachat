// Feature Flag and Entry Point for MahaChat Live Streaming

export function isLiveFeatureEnabled(): boolean {
  // Respect VITE_FEATURE_LIVE environment flag
  const flag = (import.meta as any).env?.VITE_FEATURE_LIVE ?? (import.meta as any).env?.FEATURE_LIVE;
  if (flag === 'false' || flag === false) {
    return false;
  }
  return true;
}

export * from './config/liveConfig';
export * from './routes';
