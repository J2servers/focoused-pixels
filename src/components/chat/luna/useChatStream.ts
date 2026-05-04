import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChatMessage, CHAT_URL, REDIRECT_REGEX } from './types';
import { logger } from '@/lib/logger';

export function useChatStream(initialMessages: ChatMessage[] = []) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const handleAutoRedirect = useCallback((content: string): string => {
    const match = content.match(REDIRECT_REGEX);
    if (!match) return content;
    const path = match[1];
    const cleaned = content.replace(REDIRECT_REGEX, '').trim();
    toast.success('🚀 Te levando para a página...', { description: `Redirecionando para ${path}` });
    setTimeout(() => navigate(path), 1500);
    return cleaned;
  }, [navigate]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: ChatMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
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

      const cleaned = handleAutoRedirect(assistantContent);
      if (cleaned !== assistantContent) {
        setMessages(prev => {
          const u = [...prev];
          u[u.length - 1] = { role: 'assistant', content: cleaned };
          return u;
        });
      }
    } catch (e) {
      logger.error('lunaChat', 'Chat error:', e);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente ou fale conosco no WhatsApp 💬' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, handleAutoRedirect]);

  return { messages, setMessages, isLoading, sendMessage };
}
