import TriggerNode from '../nodes/TriggerNode';
import EmailNode from '../nodes/EmailNode';
import WhatsAppNode from '../nodes/WhatsAppNode';
import DelayNode from '../nodes/DelayNode';
import ConditionNode from '../nodes/ConditionNode';
import CheckStatusNode from '../nodes/CheckStatusNode';
import LoopNode from '../nodes/LoopNode';
import ScheduleNode from '../nodes/ScheduleNode';
import UpdateOrderStatusNode from '../nodes/UpdateOrderStatusNode';
import CreateCouponNode from '../nodes/CreateCouponNode';
import HttpWebhookNode from '../nodes/HttpWebhookNode';
import AddTagNode from '../nodes/AddTagNode';
import WaitForEventNode from '../nodes/WaitForEventNode';

export const NODE_TYPES = {
  trigger: TriggerNode, send_email: EmailNode, send_whatsapp: WhatsAppNode,
  delay: DelayNode, condition: ConditionNode, check_status: CheckStatusNode,
  loop: LoopNode, schedule: ScheduleNode, update_order_status: UpdateOrderStatusNode,
  create_coupon: CreateCouponNode, http_webhook: HttpWebhookNode,
  add_tag: AddTagNode, wait_for_event: WaitForEventNode,
};
