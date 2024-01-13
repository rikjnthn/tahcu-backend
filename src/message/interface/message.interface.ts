export interface MessageType {
  id: string;
  message: string;
  group_id: string;
  sender_id: string;
  receiver_id: string;
  sent_at: Date;
  updated_at: Date;
}
