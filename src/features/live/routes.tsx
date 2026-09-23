import React, { useState } from 'react';
import { UserProfile } from '../../lib/firebase';
import { LiveTab } from './components/LiveTab';
import { GoLiveSetup } from './components/GoLiveSetup';
import { LiveRoom } from './components/LiveRoom';
import { LiveMediaProvider, createMediaProvider, LiveKitProvider } from './providers';
import { LiveStream, joinLiveStream, endLiveStream } from './services/streamService';
import { fetchLiveToken } from './services/liveApi';

interface LiveRoutesProps {
  currentUserProfile: UserProfile | null;
  onNavigateHome?: () => void;
  onViewChange?: (view: LiveView) => void;
}

export type LiveView = 'tab' | 'setup' | 'room';

export const LiveRoutes: React.FC<LiveRoutesProps> = ({
  currentUserProfile,
  onViewChange,
}) => {
  const [currentView, setCurrentView] = useState<LiveView>('tab');
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [activeProvider, setActiveProvider] = useState<LiveMediaProvider | null>(null);
  const [isHost, setIsHost] = useState(false);

  const changeView = (view: LiveView) => {
    setCurrentView(view);
    onViewChange?.(view);
  };

  const handleGoLiveClick = () => {
    changeView('setup');
  };

  const handleStreamStarted = (stream: LiveStream, provider: LiveMediaProvider) => {
    setActiveStream(stream);
    setActiveProvider(provider);
    setIsHost(true);
    changeView('room');
  };

  const handleJoinStream = async (stream: LiveStream) => {
    setActiveStream(stream);
    setIsHost(false);

    let viewerProvider: LiveMediaProvider = createMediaProvider();
    const viewerUid = currentUserProfile?.uid || `viewer_${Date.now()}`;
    const viewerName = currentUserProfile?.displayName || 'दर्शक';

    try {
      const tokenResp = await fetchLiveToken(
        stream.livekitRoomName,
        viewerUid,
        viewerName,
        'viewer'
      );

      if (!tokenResp.isMock && tokenResp.livekitUrl && tokenResp.token) {
        const lk = new LiveKitProvider(tokenResp.livekitUrl);
        await lk.connect(stream.livekitRoomName, tokenResp.token, viewerUid);
        viewerProvider = lk;
      } else {
        await viewerProvider.connect(stream.livekitRoomName, tokenResp.token, viewerUid);
      }
    } catch (err) {
      console.warn('Could not connect viewer to LiveKit room:', err);
    }

    setActiveProvider(viewerProvider);

    if (currentUserProfile) {
      await joinLiveStream(stream.id, {
        uid: currentUserProfile.uid,
        displayName: currentUserProfile.displayName,
        photoURL: currentUserProfile.photoURL,
      });
    }

    changeView('room');
  };

  const handleLeaveRoom = () => {
    if (activeProvider) {
      activeProvider.disconnect().catch(() => {});
    }
    if (isHost && activeStream) {
      endLiveStream(activeStream.id).catch(() => {});
    }
    setActiveStream(null);
    setActiveProvider(null);
    setIsHost(false);
    changeView('tab');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950">
      {currentView === 'tab' && (
        <LiveTab
          currentUserProfile={currentUserProfile}
          onGoLive={handleGoLiveClick}
          onJoinStream={handleJoinStream}
        />
      )}

      {currentView === 'setup' && (
        <GoLiveSetup
          currentUserProfile={currentUserProfile}
          onBack={() => changeView('tab')}
          onStreamStarted={handleStreamStarted}
        />
      )}

      {currentView === 'room' && activeStream && activeProvider && (
        <LiveRoom
          streamId={activeStream.id}
          initialStream={activeStream}
          currentUserProfile={currentUserProfile}
          provider={activeProvider}
          isHost={isHost}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  );
};
