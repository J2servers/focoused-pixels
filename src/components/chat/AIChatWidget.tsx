/**
 * AIChatWidget - Luna IA Consultora de Vendas
 * Orquestrador: combina FAB, drawer, stream de IA e auto-popup.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { LunaFab } from './luna/LunaFab';
import { LunaDrawer } from './luna/LunaDrawer';
import { useChatStream } from './luna/useChatStream';
import { useAutoPopup } from './luna/useAutoPopup';
import { AUTO_POPUP_MESSAGE } from './luna/types';

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
  const { messages, setMessages, isLoading, sendMessage } = useChatStream();

  // Inicializa saudação
  useEffect(() => {
    if (aiAssistantGreeting && messages.length === 0) {
      setMessages([{ role: 'assistant', content: aiAssistantGreeting }]);
    }
  }, [aiAssistantGreeting, messages.length, setMessages]);

  const queueAutoMessage = useCallback(() => {
    setMessages(prev => [...prev, { role: 'assistant', content: AUTO_POPUP_MESSAGE }]);
  }, [setMessages]);

  const { showTeaser, showBubble, hasUnread, dismiss } = useAutoPopup({
    enabled: aiAssistantEnabled,
    isOpen,
    onMessageQueued: queueAutoMessage,
  });

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    dismiss();
  }, [dismiss]);

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

  if (!aiAssistantEnabled) return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <LunaFab
            name={aiAssistantName}
            avatarUrl={aiAssistantAvatar}
            showTeaser={showTeaser}
            showBubble={showBubble}
            hasUnread={hasUnread}
            onOpen={handleOpen}
          />
        )}
      </AnimatePresence>

      <LunaDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        name={aiAssistantName}
        avatarUrl={aiAssistantAvatar}
        companyName={companyName}
        messages={messages}
        isLoading={isLoading}
        onSend={sendMessage}
        onLinkClick={handleLinkClick}
      />
    </>
  );
}
