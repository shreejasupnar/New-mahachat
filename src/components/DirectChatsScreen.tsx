import React, { useState, useEffect } from 'react';
import { UserProfile, db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { MessageCircle, Search, ArrowRight, UserPlus } from 'lucide-react';

interface DirectChatsScreenProps {
  currentUserProfile: UserProfile | null;
  onExploreDistricts: () => void;
}

export const DirectChatsScreen: React.FC<DirectChatsScreenProps> = ({
  currentUserProfile,
  onExploreDistricts
}) => {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Strictly query real direct chats from Firestore
  useEffect(() => {
    if (!currentUserProfile) {
      setLoading(false);
      return;
    }

    try {
      const chatsRef = collection(db, 'directChats');
      const q = query(chatsRef, where('participants', 'array-contains', currentUserProfile.uid));

      const unsub = onSnapshot(q, (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setChats(list);
        setLoading(false);
      }, (err) => {
        console.warn('Direct chats listener:', err);
        setLoading(false);
      });

      return () => unsub();
    } catch (e) {
      setLoading(false);
    }
  }, [currentUserProfile]);

  return (
    <div id="chats-screen" className="flex-1 flex flex-col bg-slate-100 min-h-screen pb-24 select-none">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between shadow-xs">
        <div>
          <h1 className="text-lg font-black text-slate-900 leading-tight">चॅट्स (Direct Chats)</h1>
          <p className="text-[11px] text-slate-500 font-medium">तुमची वैयक्तिक संभाषणे</p>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-4 max-w-md mx-auto w-full flex flex-col">
        {chats.length === 0 ? (
          /* Honest Empty State - STRICT PROMPT REQUIREMENT: "अजून कोणतीही चॅट नाही." */
          <div className="my-auto flex flex-col items-center justify-center text-center px-4 py-12 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-base">
                अजून कोणतीही चॅट नाही.
              </h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                जिल्हा चॅट रूममध्ये सहभागी व्हा, नवीन मित्रांशी बोला आणि वैयक्तिक संभाषण सुरू करा.
              </p>
            </div>

            <button
              id="empty-chats-explore-button"
              type="button"
              onClick={onExploreDistricts}
              className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>जिल्हा चॅट रूम्स पहा</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center gap-3 cursor-pointer hover:border-blue-300"
              >
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                  {chat.title?.slice(0, 1) || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-800 truncate">{chat.title || 'मित्र'}</div>
                  <div className="text-xs text-slate-500 truncate">{chat.lastMessage || 'नवीन संभाषण'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
