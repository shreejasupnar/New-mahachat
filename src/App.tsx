import React, { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { 
  subscribeToAuthUser, 
  updateUserPresence, 
  signOutUser,
  type UserProfile 
} from './lib/firebase';
import { MAHARASHTRA_DISTRICTS } from './data/districts';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { RegistrationModal } from './components/RegistrationModal';
import { HomeScreen } from './components/HomeScreen';
import { DistrictsScreen } from './components/DistrictsScreen';
import { DistrictChatRoom } from './components/DistrictChatRoom';
import { VoiceRoom } from './components/VoiceRoom';
import { VoiceRoomsListScreen } from './components/VoiceRoomsListScreen';
import { DirectChatsScreen } from './components/DirectChatsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { PremiumStoreScreen } from './components/premium/PremiumStoreScreen';
import { VipCenterScreen } from './components/vip/VipCenterScreen';
import { RechargeModal } from './components/vip/RechargeModal';
import { VipLevelUpModal } from './components/vip/VipLevelUpModal';
import { GameZoneHomeScreen } from './gamezone/components/GameZoneHomeScreen';
import { BottomNavigation, NavTab } from './components/BottomNavigation';
import { NotificationsModal } from './components/NotificationsModal';
import { LiveRoutes, isLiveFeatureEnabled } from './features/live';
import { WifiOff, Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App navigation state
  const [hasSeenSplash, setHasSeenSplash] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [liveSubView, setLiveSubView] = useState<'tab' | 'setup' | 'room'>('tab');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [activeVoiceDistrictId, setActiveVoiceDistrictId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [isOnlineNetwork, setIsOnlineNetwork] = useState(navigator.onLine);

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => setIsOnlineNetwork(true);
    const handleOffline = () => setIsOnlineNetwork(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to real Firebase Auth and User Profile
  useEffect(() => {
    const unsub = subscribeToAuthUser((user, profile) => {
      setCurrentUser(user);
      setUserProfile(profile);
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  // Presence heartbeat: update lastActive every 30s while logged in
  useEffect(() => {
    if (!currentUser) return;

    // Send initial active status
    updateUserPresence(currentUser.uid, true, userProfile?.district);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateUserPresence(currentUser.uid, true, userProfile?.district);
      }
    }, 30000);

    const handleUnload = () => {
      updateUserPresence(currentUser.uid, false);
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [currentUser?.uid, userProfile?.district]);

  // Loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
        <p className="text-sm font-semibold tracking-wider text-blue-200">
          MahaChat सुरू होत आहे...
        </p>
      </div>
    );
  }

  // 1. Splash Screen
  if (!hasSeenSplash) {
    return <SplashScreen onStart={() => setHasSeenSplash(true)} />;
  }

  // 2. Authentication Screen
  if (!currentUser) {
    return <AuthScreen />;
  }

  // 3. First-time Registration & District Selection (Mandatory)
  if (!userProfile || !userProfile.district) {
    return (
      <RegistrationModal
        user={currentUser}
        existingProfile={userProfile}
        onComplete={() => {
          // Profile saved, state will update reactively via Firestore listener
        }}
      />
    );
  }

  // Find active district object if opened
  const activeDistrictObj = selectedDistrictId
    ? MAHARASHTRA_DISTRICTS.find((d) => d.id === selectedDistrictId)
    : null;

  const activeVoiceDistrictObj = activeVoiceDistrictId
    ? MAHARASHTRA_DISTRICTS.find((d) => d.id === activeVoiceDistrictId)
    : null;

  return (
    <div className="min-h-screen bg-slate-200 text-slate-800 flex justify-center font-sans antialiased">
      {/* Mobile-first centered viewport constraint for desktop */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative overflow-x-hidden">
        {/* Network offline warning banner */}
        {!isOnlineNetwork && (
          <div className="sticky top-0 z-50 bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-md">
            <WifiOff className="w-4 h-4" />
            <span>इंटरनेट कनेक्शन बंद आहे. कृपया नेटवर्क तपासा.</span>
          </div>
        )}

        {/* View Routing */}
        {activeVoiceDistrictObj ? (
          /* District Voice Room (Screen 6) */
          <VoiceRoom
            district={activeVoiceDistrictObj}
            currentUserProfile={userProfile}
            onBack={() => setActiveVoiceDistrictId(null)}
            onOpenChat={() => {
              setSelectedDistrictId(activeVoiceDistrictObj.id);
              setActiveVoiceDistrictId(null);
            }}
            onOpenGameZone={() => {
              setActiveVoiceDistrictId(null);
              setSelectedDistrictId(null);
              setActiveTab('gamezone');
            }}
          />
        ) : activeDistrictObj ? (
          /* District Real-time Chat Room (Screen 5) */
          <DistrictChatRoom
            district={activeDistrictObj}
            currentUserProfile={userProfile}
            onBack={() => setSelectedDistrictId(null)}
            onOpenVoiceRoom={(districtId) => {
              setActiveVoiceDistrictId(districtId);
            }}
            onOpenGameZone={() => {
              setSelectedDistrictId(null);
              setActiveVoiceDistrictId(null);
              setActiveTab('gamezone');
            }}
          />
        ) : (
          /* Main Tab Views */
          <>
            {activeTab === 'home' && (
              <HomeScreen
                currentUserProfile={userProfile}
                onSelectDistrict={(id) => setSelectedDistrictId(id)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenNotifications={() => setShowNotifications(true)}
                onOpenVoiceRoom={(id) => setActiveVoiceDistrictId(id)}
              />
            )}

            {activeTab === 'districts' && (
              <DistrictsScreen
                onBack={() => setActiveTab('home')}
                onSelectDistrict={(id) => setSelectedDistrictId(id)}
                onSelectVoiceRoom={(id) => setActiveVoiceDistrictId(id)}
              />
            )}

            {activeTab === 'voice' && (
              <VoiceRoomsListScreen
                currentUserProfile={userProfile}
                onSelectVoiceRoom={(id) => setActiveVoiceDistrictId(id)}
                onExploreDistricts={() => setActiveTab('districts')}
              />
            )}

            {activeTab === 'gamezone' && (
              <GameZoneHomeScreen
                currentUser={currentUser}
                userCoins={userProfile?.coins || 0}
                onUpdateCoins={(newBalance) => {
                  if (userProfile) {
                    setUserProfile({ ...userProfile, coins: newBalance });
                  }
                }}
                onOpenRecharge={() => setShowRechargeModal(true)}
                onBack={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'chats' && (
              <DirectChatsScreen
                currentUserProfile={userProfile}
                onExploreDistricts={() => setActiveTab('districts')}
              />
            )}

            {activeTab === 'live' && isLiveFeatureEnabled() && (
              <LiveRoutes
                currentUserProfile={userProfile}
                onNavigateHome={() => setActiveTab('home')}
                onViewChange={(view) => setLiveSubView(view)}
              />
            )}

            {activeTab === 'vip' && (
              <VipCenterScreen
                currentUser={userProfile}
                onBack={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'premium' && (
              <PremiumStoreScreen
                currentUser={userProfile}
                onBack={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileScreen
                profile={userProfile}
                onBack={() => setActiveTab('home')}
                onOpenVipCenter={() => setActiveTab('vip')}
                onSignOut={async () => {
                  await signOutUser();
                  setHasSeenSplash(false);
                }}
              />
            )}

            {/* Bottom Navigation matching Mockup Screens 3, 4, 7 (hidden during immersive live broadcast/setup) */}
            {!(activeTab === 'live' && liveSubView !== 'tab') && (
              <BottomNavigation
                activeTab={activeTab}
                onChangeTab={(tab) => {
                  setActiveTab(tab);
                  setSelectedDistrictId(null);
                  setActiveVoiceDistrictId(null);
                  if (tab !== 'live') {
                    setLiveSubView('tab');
                  }
                }}
              />
            )}
          </>
        )}

        {/* Notifications Modal */}
        <NotificationsModal
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />

        {/* Recharge Modal when opened from Game Zone or elsewhere */}
        {userProfile && (
          <RechargeModal
            isOpen={showRechargeModal}
            currentUser={userProfile}
            onClose={() => setShowRechargeModal(false)}
          />
        )}
      </div>
    </div>
  );
}
