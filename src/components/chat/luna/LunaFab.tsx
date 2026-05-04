import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AUTO_POPUP_MESSAGE } from './types';

interface Props {
  name: string;
  avatarUrl?: string;
  showTeaser: boolean;
  showBubble: boolean;
  hasUnread: boolean;
  onOpen: () => void;
}

export function LunaFab({ name, avatarUrl, showTeaser, showBubble, hasUnread, onOpen }: Props) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-28 sm:bottom-24 right-4 sm:right-6 z-[60] flex flex-col items-end gap-2"
    >
      <AnimatePresence>
        {showBubble && (
          <motion.div
            key="luna-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="max-w-[260px] sm:max-w-[300px]"
          >
            <button
              type="button"
              onClick={onOpen}
              className="w-full text-left bg-gradient-to-br from-[hsl(250_30%_12%)] to-[hsl(260_28%_10%)] border border-primary/40 rounded-2xl rounded-br-sm px-4 py-3 shadow-2xl shadow-primary/40 cursor-pointer hover:scale-[1.02] transition-transform"
              aria-label="Abrir conversa com Luna"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-cyan-300">{name}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </div>
              <p className="text-xs text-white/95 leading-snug">{AUTO_POPUP_MESSAGE}</p>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTeaser && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="bg-background border border-primary/40 rounded-2xl rounded-br-sm px-4 py-3 shadow-2xl shadow-primary/30 flex items-center gap-2"
          >
            <span className="text-xs text-foreground font-medium">{name} digitando</span>
            <div className="flex gap-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpen}
        aria-label="Abrir Luna assistente"
        className="relative group"
      >
        <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-cyan-400 blur-lg opacity-60 group-hover:opacity-90 transition-opacity" />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary via-purple-600 to-cyan-500 p-[2px] shadow-2xl">
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <Sparkles className="h-7 w-7 text-primary" />
            )}
          </div>
          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background animate-pulse" />
        </div>
        <AnimatePresence>
          {hasUnread && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 border-2 border-background text-white text-[11px] font-bold flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse"
              aria-label="1 mensagem não lida"
            >
              1
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
