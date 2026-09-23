import { LiveMediaProvider } from './LiveMediaProvider';
import { LiveKitProvider } from './LiveKitProvider';
import { MockProvider } from './MockProvider';

export * from './LiveMediaProvider';
export * from './LiveKitProvider';
export * from './MockProvider';

export function createMediaProvider(serverUrl?: string): LiveMediaProvider {
  const livekitUrl = serverUrl || (import.meta as any).env?.VITE_LIVEKIT_URL;
  if (livekitUrl && livekitUrl.trim() !== '') {
    return new LiveKitProvider(livekitUrl.trim());
  }
  return new MockProvider();
}
