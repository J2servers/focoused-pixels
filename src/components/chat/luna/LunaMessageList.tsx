import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { ChatMessage } from './types';
import { LunaAvatar } from './LunaAvatar';

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  name: string;
  avatarUrl?: string;
  onLinkClick: (href: string) => void;
}

export function LunaMessageList({ messages, isLoading, name, avatarUrl, onLinkClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 relative luna-scroll">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex gap-2 items-end', message.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {message.role === 'assistant' && <LunaAvatar size="sm" name={name} avatarUrl={avatarUrl} />}
            <div className={cn(
              'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-lg',
              message.role === 'user'
                ? 'bg-gradient-to-br from-primary to-purple-600 text-white rounded-br-sm shadow-primary/40'
                : 'bg-white/5 backdrop-blur-md border border-white/10 text-white/95 rounded-bl-sm'
            )}>
              <div className="prose prose-sm max-w-none prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); if (href) onLinkClick(href); }}
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
            <LunaAvatar size="sm" name={name} avatarUrl={avatarUrl} />
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
