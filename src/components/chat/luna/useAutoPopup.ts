import { useEffect, useState } from 'react';
import { AUTO_POPUP_DELAY, BUBBLE_VISIBLE_DURATION, TEASER_DURATION } from './types';

interface Params {
  enabled: boolean;
  isOpen: boolean;
  onMessageQueued: () => void;
}

export function useAutoPopup({ enabled, isOpen, onMessageQueued }: Params) {
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!enabled || hasAutoOpened) return;
    if (sessionStorage.getItem('luna_chat_interacted')) {
      setHasAutoOpened(true);
      return;
    }
    const teaserTimer = setTimeout(() => {
      if (isOpen || hasAutoOpened) return;
      setShowTeaser(true);
      const bubbleTimer = setTimeout(() => {
        if (isOpen) return;
        setShowTeaser(false);
        setShowBubble(true);
        setHasUnread(true);
        setHasAutoOpened(true);
        onMessageQueued();
        const hideBubbleTimer = setTimeout(() => setShowBubble(false), BUBBLE_VISIBLE_DURATION);
        return () => clearTimeout(hideBubbleTimer);
      }, TEASER_DURATION);
      return () => clearTimeout(bubbleTimer);
    }, AUTO_POPUP_DELAY);
    return () => clearTimeout(teaserTimer);
  }, [enabled, hasAutoOpened, isOpen, onMessageQueued]);

  const dismiss = () => {
    setShowTeaser(false);
    setShowBubble(false);
    setHasUnread(false);
    sessionStorage.setItem('luna_chat_interacted', 'true');
  };

  return { showTeaser, showBubble, hasUnread, dismiss };
}
