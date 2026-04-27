/**
 * AIChatWidget - Luna IA Consultora de Vendas
 * Drawer lateral futurista com avatar, auto-redirect e FAB pulsante "digitando".
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
const AUTO_POPUP_DELAY = 60 * 1000; // 1 min — aparece pulsando "digitando"
const TEASER_DURATION = 8 * 1000;  // 8s mostrando "digitando" antes de exibir balão
const BUBBLE_VISIBLE_DURATION = 5 * 1000; // 5s mostrando balão da mensagem
const AUTO_POPUP_MESSAGE = "Olá! 👋 Sou a Luna, consultora aqui da loja. Posso te ajudar a achar o produto ideal? Temos letreiros neon, displays, crachás e muito mais! ✨";
const REDIRECT_REGEX = /\[REDIRECT:(\/[^\]\s]+)\]/i;

export function AIChatWidget() {
  const navigate = useNavigate();
  const {
    aiAssistantEnabled,
    aiAssistantName,
    aiAssistantGreeting,
    aiAssistantAvatar,
    companyName,
  } = useSiteSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false); // FAB exibe gif "digitando"
  const [showBubble, setShowBubble] = useState(false); // Balão da mensagem acima do FAB
  const [hasUnread, setHasUnread] = useState(false);   // Badge de notificação no ícone
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inicializa saudação
  useEffect(() => {
    if (aiAssistantGreeting && messages.length === 0) {
      setMessages([{ role: 'assistant', content: aiAssistantGreeting }]);
    }
  }, [aiAssistantGreeting, messages.length]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Auto-popup com teaser "digitando" -> abre drawer
  useEffect(() => {
    if (!aiAssistantEnabled || hasAutoOpened) return;
    if (sessionStorage.getItem('luna_chat_interacted')) {
      setHasAutoOpened(true);
      return;
    }
    const teaserTimer = setTimeout(() => {
      if (isOpen || hasAutoOpened) return;
      setShowTeaser(true);
      const openTimer = setTimeout(() => {
        if (!isOpen) {
          setShowTeaser(false);
          setIsOpen(true);
          setHasAutoOpened(true);
          sessionStorage.setItem('luna_chat_interacted', 'true');
          setMessages(prev => [...prev, { role: 'assistant', content: AUTO_POPUP_MESSAGE }]);
        }
      }, TEASER_DURATION);
      return () => clearTimeout(openTimer);
    }, AUTO_POPUP_DELAY);
    return () => clearTimeout(teaserTimer);
  }, [aiAssistantEnabled, hasAutoOpened, isOpen]);

  const handleOpenChat = useCallback(() => {
    setIsOpen(true);
    setShowTeaser(false);
    sessionStorage.setItem('luna_chat_interacted', 'true');
  }, []);

  const handleLinkClick = useCallback((href: string) => {
    const isInternal = href.startsWith('/') || href.includes('lovable.app') || href.includes('localhost');
    if (isInternal) {
      let path = href;
      if (href.includes('://')) {
        try { path = new URL(href).pathname; } catch { /* noop */ }
      }
      navigate(path);
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  }, [navigate]);

  // Detecta tag [REDIRECT:/path] e navega após exibir aviso
  const handleAutoRedirect = useCallback((content: string): string => {
    const match = content.match(REDIRECT_REGEX);
    if (!match) return content;
    const path = match[1];
    const cleaned = content.replace(REDIRECT_REGEX, '').trim();
    toast.success('🚀 Te levando para a página...', { description: `Redirecionando para ${path}` });
    setTimeout(() => navigate(path), 1500);
    return cleaned;
  }, [navigate]);

  if (!aiAssistantEnabled) return null;

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';
    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });
      if (!response.ok || !response.body) throw new Error('Failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, nl);
          textBuffer = textBuffer.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const c = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (c) {
              assistantContent += c;
              setMessages(prev => {
                const u = [...prev];
                u[u.length - 1] = { role: 'assistant', content: assistantContent };
                return u;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Pós-processa redirect
      const cleaned = handleAutoRedirect(assistantContent);
      if (cleaned !== assistantContent) {
        setMessages(prev => {
          const u = [...prev];
          u[u.length - 1] = { role: 'assistant', content: cleaned };
          return u;
        });
      }
    } catch (e) {
      console.error('Chat error:', e);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente ou fale conosco no WhatsApp 💬' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const Avatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
    return (
      <div className={cn(
        sizes[size],
        'rounded-full bg-gradient-to-br from-primary via-purple-500 to-cyan-400 p-[2px] flex-shrink-0 shadow-[0_0_15px_hsl(var(--primary)/0.5)]'
      )}>
        <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
          {aiAssistantAvatar ? (
            <img src={aiAssistantAvatar} alt={aiAssistantName} className="w-full h-full object-cover rounded-full" />
          ) : (
            <Bot className={cn(size === 'sm' ? 'h-4 w-4' : 'h-5 w-5', 'text-primary')} />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* FAB — pulsa e mostra "digitando" no teaser */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-28 sm:bottom-24 right-4 sm:right-6 z-[60] flex items-end gap-2"
          >
            {/* Bolha "digitando" no teaser */}
            <AnimatePresence>
              {showTeaser && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  className="mb-2 mr-1 bg-background border border-primary/40 rounded-2xl rounded-br-sm px-4 py-3 shadow-2xl shadow-primary/30 flex items-center gap-2 max-w-[200px]"
                >
                  <span className="text-xs text-foreground font-medium">{aiAssistantName} digitando</span>
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
              onClick={handleOpenChat}
              aria-label="Abrir Luna assistente"
              className="relative group"
            >
              {/* Pulso ao redor */}
              <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-cyan-400 blur-lg opacity-60 group-hover:opacity-90 transition-opacity" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary via-purple-600 to-cyan-500 p-[2px] shadow-2xl">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                  {aiAssistantAvatar ? (
                    <img src={aiAssistantAvatar} alt={aiAssistantName} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Sparkles className="h-7 w-7 text-primary" />
                  )}
                </div>
                {/* Indicador online */}
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background animate-pulse" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer lateral futurista */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay sutil só mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[59] bg-black/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none sm:pointer-events-none"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 32 }}
              className={cn(
                'fixed z-[60] flex flex-col overflow-hidden',
                // Mobile: lateral 88% da tela; Desktop: drawer 420px à direita
                'top-0 right-0 h-[100dvh] w-[88vw] max-w-[420px]',
                'bg-gradient-to-b from-[hsl(250_30%_8%)] via-[hsl(260_25%_10%)] to-[hsl(250_30%_6%)]',
                'border-l border-primary/30 shadow-[0_0_60px_hsl(var(--primary)/0.4)]'
              )}
            >
              {/* Glow background decorativo */}
              <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl" />

              {/* Header */}
              <div className="relative px-4 py-4 border-b border-primary/20 bg-gradient-to-r from-primary/20 via-purple-600/10 to-cyan-500/10 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar size="lg" />
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                      {aiAssistantName}
                      <Zap className="h-3.5 w-3.5 text-cyan-400" />
                    </h3>
                    <p className="text-[11px] text-cyan-300/80 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Online • {companyName}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mensagens */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 relative luna-scroll">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('flex gap-2 items-end', message.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      {message.role === 'assistant' && <Avatar size="sm" />}
                      <div
                        className={cn(
                          'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-lg',
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-purple-600 text-white rounded-br-sm shadow-primary/40'
                            : 'bg-white/5 backdrop-blur-md border border-white/10 text-white/95 rounded-bl-sm'
                        )}
                      >
                        <div className="prose prose-sm max-w-none prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                          <ReactMarkdown
                            components={{
                              a: ({ href, children }) => (
                                <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); if (href) handleLinkClick(href); }}
                                  className="text-cyan-300 hover:text-cyan-200 underline font-semibold cursor-pointer inline"
                                >
                                  {children}
                                </button>
                              ),
                              p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                              strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                              ul: ({ children }) => <ul className="list-disc pl-4 my-1">{children}</ul>,
                              li: ({ children }) => <li className="my-0.5">{children}</li>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white/80" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-end">
                      <Avatar size="sm" />
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Input */}
              <div className="relative p-3 border-t border-primary/20 bg-black/30 backdrop-blur-xl">
                <div className="flex gap-2 items-center">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Pergunte qualquer coisa..."
                    disabled={isLoading}
                    className="flex-1 bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:ring-primary rounded-full"
                  />
                  <Button
                    onClick={sendMessage}
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
    </>
  );
}
