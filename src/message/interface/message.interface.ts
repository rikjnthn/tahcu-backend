export interface MessageType {
  id: string;
  message: string;
  contact_id?: string;
  group_id?: string;
  sender: {
    username: string;
  };
  sender_id: string;
  sent_at: Date;
  updated_at: Date;
}
