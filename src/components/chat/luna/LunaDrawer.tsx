import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ChatMessage } from './types';
import { LunaAvatar } from './LunaAvatar';
import { LunaMessageList } from './LunaMessageList';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  avatarUrl?: string;
  companyName: string;
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => void;
  onLinkClick: (href: string) => void;
}

export function LunaDrawer({
  isOpen, onClose, name, avatarUrl, companyName,
  messages, isLoading, onSend, onLinkClick,
}: Props) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[59] bg-black/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none sm:pointer-events-none"
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className={cn(
              'fixed z-[60] flex flex-col overflow-hidden',
              'top-0 right-0 h-[100dvh] w-[88vw] max-w-[420px]',
              'bg-gradient-to-b from-[hsl(250_30%_8%)] via-[hsl(260_25%_10%)] to-[hsl(250_30%_6%)]',
              'border-l border-primary/30 shadow-[0_0_60px_hsl(var(--primary)/0.4)]'
            )}
          >
            <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl" />

            <div className="relative px-4 py-4 border-b border-primary/20 bg-gradient-to-r from-primary/20 via-purple-600/10 to-cyan-500/10 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LunaAvatar size="lg" name={name} avatarUrl={avatarUrl} />
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                    {name}
                    <Zap className="h-3.5 w-3.5 text-cyan-400" />
                  </h3>
                  <p className="text-[11px] text-cyan-300/80 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online • {companyName}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <LunaMessageList
              messages={messages}
              isLoading={isLoading}
              name={name}
              avatarUrl={avatarUrl}
              onLinkClick={onLinkClick}
            />

            <div className="relative p-3 border-t border-primary/20 bg-black/30 backdrop-blur-xl">
              <div className="flex gap-2 items-center">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Pergunte qualquer coisa..."
                  disabled={isLoading}
                  className="flex-1 bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:ring-primary rounded-full"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="rounded-full bg-gradient-to-br from-primary to-cyan-500 hover:opacity-90 shadow-lg shadow-primary/40"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-white/40 text-center mt-2">
                ✨ IA Luna • Atendimento humano via WhatsApp
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
