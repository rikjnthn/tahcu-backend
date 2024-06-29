export interface UserPayloadType {
  id: string;
  user_id: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

export type AuthReturnType = [string, string];
