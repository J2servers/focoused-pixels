/**
 * AIChatWidget - Assistente virtual com IA
 * 
 * CONFIGURAÇÕES USADAS (Admin > Configurações > IA):
 * - ai_assistant_enabled: Mostrar/ocultar o chatbot
 * - ai_assistant_name: Nome exibido no header do chat
 * - ai_assistant_greeting: Primeira mensagem do assistente
 * - ai_assistant_avatar: Avatar personalizado (ou usa ícone padrão)
 * 
 * FUNCIONALIDADES:
 * - Links clicáveis que navegam internamente (chat permanece aberto)
 * - Auto-popup após 5 minutos oferecendo ajuda
 * - Persistência do estado do chat durante navegação
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
const AUTO_POPUP_DELAY = 5 * 60 * 1000; // 5 minutes in milliseconds
const AUTO_POPUP_MESSAGE = "Olá! 👋 Notei que você está navegando pelo nosso site. Posso ajudar você a encontrar algum produto específico? Temos letreiros neon, crachás, displays QR Code e muito mais! 🛍️";

export function AIChatWidget() {
  const navigate = useNavigate();
  const { 
    aiAssistantEnabled, 
    aiAssistantName, 
    aiAssistantGreeting,
    aiAssistantAvatar,
    companyName 
  } = useSiteSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoPopupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize greeting message from settings
  useEffect(() => {
    if (aiAssistantGreeting && messages.length === 0) {
      setMessages([{ role: 'assistant', content: aiAssistantGreeting }]);
    }
  }, [aiAssistantGreeting, messages.length]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-popup after 5 minutes
  useEffect(() => {
    if (!aiAssistantEnabled || hasAutoOpened) return;

    // Check if user has already interacted with chat in this session
    const hasInteracted = sessionStorage.getItem('luna_chat_interacted');
    if (hasInteracted) {
      setHasAutoOpened(true);
      return;
    }

    autoPopupTimerRef.current = setTimeout(() => {
      if (!isOpen && !hasAutoOpened) {
        setIsOpen(true);
        setHasAutoOpened(true);
        sessionStorage.setItem('luna_chat_interacted', 'true');
        
        // Add proactive message if greeting already exists
        if (messages.length > 0) {
          setMessages(prev => [...prev, { role: 'assistant', content: AUTO_POPUP_MESSAGE }]);
        } else {
          setMessages([{ role: 'assistant', content: AUTO_POPUP_MESSAGE }]);
        }
      }
    }, AUTO_POPUP_DELAY);

    return () => {
      if (autoPopupTimerRef.current) {
        clearTimeout(autoPopupTimerRef.current);
      }
    };
  }, [aiAssistantEnabled, hasAutoOpened, isOpen, messages.length]);

  // Mark as interacted when user opens chat manually
  const handleOpenChat = useCallback(() => {
    setIsOpen(true);
    sessionStorage.setItem('luna_chat_interacted', 'true');
  }, []);

  // Handle internal navigation from links
  const handleLinkClick = useCallback((href: string) => {
    // Check if it's an internal link
    const isInternal = href.startsWith('/') || 
                       href.includes('focoused-pixels.lovable.app') ||
                       href.includes('localhost');
    
    if (isInternal) {
      // Extract the path from the full URL if needed
      let path = href;
      if (href.includes('://')) {
        try {
          const url = new URL(href);
          path = url.pathname;
        } catch {
          path = href;
        }
      }
      
      // Navigate internally - chat stays open
      navigate(path);
    } else {
      // External link - open in new tab
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  }, [navigate]);

  // Don't render if disabled in settings
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
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro. Por favor, tente novamente ou entre em contato pelo WhatsApp.'
        }
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

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenChat}
            className="fixed bottom-24 right-6 z-50 flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-full shadow-lg"
            aria-label="Abrir assistente virtual"
          >
            <Sparkles className="h-5 w-5" />
            <span className="hidden sm:inline font-medium">{aiAssistantName}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-6rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center overflow-hidden">
                  {aiAssistantAvatar ? (
                    <img src={aiAssistantAvatar} alt={aiAssistantName} className="w-full h-full object-cover" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{aiAssistantName} • {companyName}</h3>
                  <p className="text-xs text-primary-foreground/80">Online • Responde na hora</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex gap-2',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {aiAssistantAvatar ? (
                          <img src={aiAssistantAvatar} alt={aiAssistantName} className="w-full h-full object-cover" />
                        ) : (
                          <Bot className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      )}
                    >
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (href) handleLinkClick(href);
                                }}
                                className="text-primary hover:text-primary/80 underline font-medium cursor-pointer inline"
                              >
                                {children}
                              </button>
                            ),
                            p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc pl-4 my-1">{children}</ul>,
                            li: ({ children }) => <li className="my-0.5">{children}</li>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-secondary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 items-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Powered by IA • Para atendimento humano, use o WhatsApp
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
