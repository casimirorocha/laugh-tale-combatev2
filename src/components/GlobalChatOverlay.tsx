import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Users, AlertCircle, Sparkles, MessageCircleCode, Volume2, Smile } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  role: 'Legend' | 'Challenger' | 'Warlord' | 'Navy' | 'Developer';
  message: string;
  timestamp: string;
  isMe?: boolean;
}

// Preset lobby coordinating simulated messages
const MOCK_MESSAGES: Array<{ sender: string; role: 'Legend' | 'Challenger' | 'Warlord' | 'Navy' | 'Developer'; avatar: string; message: string }> = [
  { sender: 'WhitebeardFans', role: 'Legend', avatar: '🧔', message: 'Is Whitebeard S-tier? His earthquakes break block!' },
  { sender: 'Gear5Lover', role: 'Challenger', avatar: '🍖', message: 'Luffy G5 giant stomp has insane hitboxes but high start-up frames.' },
  { sender: 'ZoroOnly', role: 'Warlord', avatar: '⚔️', message: 'Anyone down for a 3v3 match? I will host in East Blue server 2.' },
  { sender: 'BigNewsMorgans', role: 'Developer', avatar: '📰', message: 'Balance patch notes coming tonight! Luffy G5 Climax damage adjusted.' },
  { sender: 'AkainuMagma', role: 'Navy', avatar: '🌋', message: 'Absolute Justice brooks no delay. Ready to melt your defense.' },
  { sender: 'NamiBounty', role: 'Challenger', avatar: '🍊', message: 'Looking for a crew partner. Need a strong swordsman.' },
  { sender: 'TrafalgarGuy', role: 'Warlord', avatar: '🐯', message: 'Room... Shambles! Katakuri counter frame is crazy in training mode.' },
  { sender: 'KatakuriDoughnut', role: 'Legend', avatar: '🍩', message: 'Future sight dodge can avoid ultimate moves. Learn the timing guys!' },
  { sender: 'HancockQueen', role: 'Legend', avatar: '🐍', message: 'Custom character balance needs a tiny tweak. Light attributes are OP.' },
  { sender: 'KizaruSpeedy', role: 'Navy', avatar: '✨', message: 'Anyone wants to get kicked at the speed of light? Match room 45.' },
];

const OP_EMOTES = [
  { char: '👒', label: 'Luffy' },
  { char: '🍖', label: 'Meat!' },
  { char: '⚔️', label: 'Zoro' },
  { char: '🏴‍☠️', label: 'Pirate' },
  { char: '🔥', label: 'Ace' },
  { char: '⚡', label: 'Enel' },
  { char: '✨', label: 'Kizaru' },
  { char: '⚓', label: 'Navy' },
  { char: '🍊', label: 'Nami' },
  { char: '🍩', label: 'Katakuri' },
  { char: '🐯', label: 'Law' },
  { char: '🐍', label: 'Hancock' },
  { char: '🌋', label: 'Akainu' },
  { char: '🧊', label: 'Aokiji' },
  { char: '👊', label: 'Haki' },
  { char: '👑', label: 'Haki' },
];

export const GlobalChatOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showEmotePicker, setShowEmotePicker] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize with some pre-loaded simulated messages
  useEffect(() => {
    const initial: ChatMessage[] = [];
    const now = new Date();
    for (let i = 0; i < 4; i++) {
      const mock = MOCK_MESSAGES[i];
      const minutesAgo = 4 - i;
      const timeStr = new Date(now.getTime() - minutesAgo * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      initial.push({
        id: `init_${i}`,
        sender: mock.sender,
        avatar: mock.avatar,
        role: mock.role,
        message: mock.message,
        timestamp: timeStr,
      });
    }
    setMessages(initial);
  }, []);

  // Simulate incoming chat messages every 12 to 18 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMsg = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newMsg: ChatMessage = {
        id: `sim_${Date.now()}`,
        sender: randomMsg.sender,
        avatar: randomMsg.avatar,
        role: randomMsg.role,
        message: randomMsg.message,
        timestamp: timeStr,
      };

      setMessages((prev) => [...prev.slice(-39), newMsg]); // Keep last 40 messages

      if (!isOpen) {
        setUnreadCount((count) => count + 1);
        try {
          soundManager.playUiClick(); // Low subtle feedback
        } catch (e) {}
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: `me_${Date.now()}`,
      sender: 'StrawHatHero',
      avatar: '👒',
      role: 'Legend',
      message: inputText.trim(),
      timestamp: timeStr,
      isMe: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setShowEmotePicker(false);
    
    try {
      soundManager.playUiClick();
    } catch (e) {}

    // Simulated reply from someone in 1.5 seconds
    setTimeout(() => {
      const activeReplies = [
        "That's crazy! Let's duel about it in the arena right now.",
        "Add me to your lobby crew!",
        "Nice fight mechanics. Custom build balance looks balanced to me.",
        "Zehahaha! Dreams never die! Bring on the challenge.",
        "Exactly! Marineford stage weather effects make the fight epic."
      ];
      const replySender = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
      const replyTime = new Date();
      const replyTimeStr = replyTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const systemReply: ChatMessage = {
        id: `reply_${Date.now()}`,
        sender: replySender.sender,
        avatar: replySender.avatar,
        role: replySender.role,
        message: activeReplies[Math.floor(Math.random() * activeReplies.length)],
        timestamp: replyTimeStr,
      };

      setMessages((prev) => [...prev, systemReply]);
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    }, 15000);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
    try {
      soundManager.playUiClick();
    } catch (e) {}
  };

  const handleEmoteClick = (emote: string) => {
    setInputText((prev) => prev + emote);
    setShowEmotePicker(false);
    try {
      soundManager.playUiClick();
    } catch (e) {}
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Legend': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Navy': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Warlord': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Developer': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';
    }
  };

  return (
    <div id="global-chat-container" className="fixed bottom-6 right-6 z-[60] font-sans">
      <AnimatePresence>
        {!isOpen ? (
          /* COLLAPSED FLOATING ACTION BUBBLE */
          <motion.button
            key="collapsed_chat"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-500/50 bg-zinc-950 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer focus:outline-none transition-all duration-300"
          >
            <MessageSquare className="h-6 w-6" />
            
            {/* Pulsing unread count badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse">
                {unreadCount}
              </span>
            )}
          </motion.button>
        ) : (
          /* EXPANDED INTERACTIVE CHAT PANEL */
          <motion.div
            key="expanded_chat"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative w-80 sm:w-96 h-[480px] rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-md flex flex-col overflow-hidden"
          >
            {/* HEADER PANEL */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 p-4">
              <div className="flex items-center gap-2">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-sm">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-['Press_Start_2P'] text-[9px] text-zinc-100 tracking-wider">
                    LOBBY CHAT
                  </h4>
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>324 PIRATES ONLINE</span>
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleToggle}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* BALANCE ALERT MARQUEE */}
            <div className="bg-amber-950/20 border-b border-amber-950/40 p-2.5 text-[10px] text-amber-400 font-mono flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <marquee scrollamount="3">
                ⚔️ PATCH UPDATE: Zoro's Climax frame start-up balanced. Join matchmaking room to climb!
              </marquee>
            </div>

            {/* MESSAGE FEED SECTION */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.isMe ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-1.5 mb-1 text-[10px]">
                    <span className="text-sm">{msg.avatar}</span>
                    <span className="font-bold text-zinc-300">{msg.sender}</span>
                    <span className={`px-1.5 py-0.2 rounded border text-[8px] font-mono font-black ${getRoleColor(msg.role)}`}>
                      {msg.role}
                    </span>
                    <span className="text-zinc-600 text-[8px] font-mono">{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-xl px-3.5 py-2 text-xs leading-relaxed font-sans ${
                      msg.isMe
                        ? 'bg-amber-600 text-white rounded-tr-none shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* INTERACTIVE INPUT FORM */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-zinc-800/80 bg-zinc-900/40 p-3 flex items-center gap-2 relative"
            >
              <AnimatePresence>
                {showEmotePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-3 mb-2 p-3 w-[calc(100%-24px)] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-[70] grid grid-cols-8 gap-2"
                  >
                    {OP_EMOTES.map((emote, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleEmoteClick(emote.char)}
                        title={emote.label}
                        className="h-8 w-8 flex items-center justify-center text-lg hover:bg-zinc-800 rounded-lg transition active:scale-90 cursor-pointer"
                      >
                        {emote.char}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={() => setShowEmotePicker(!showEmotePicker)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 transition active:scale-95 duration-200 cursor-pointer ${showEmotePicker ? 'text-amber-400 border-amber-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Smile className="h-5 w-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Discuss balance, coordinate rooms..."
                maxLength={100}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold transition active:scale-95 duration-200 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
