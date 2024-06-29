export interface ContactType {
  id: string;
  user_id: string;
  friends_id: string;
  user: {
    username: string;
    email: string;
  };
  friends: {
    username: string;
    email: string;
  };
}
