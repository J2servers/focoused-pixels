import type { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';

export type SetConfig = React.Dispatch<React.SetStateAction<WhyChooseUsConfig>>;

export interface TabProps {
  config: WhyChooseUsConfig;
  setConfig: SetConfig;
}
