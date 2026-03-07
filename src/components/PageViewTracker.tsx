import { useTrackPageView } from '@/hooks/usePageViews';

export function PageViewTracker() {
  useTrackPageView();
  return null;
}
