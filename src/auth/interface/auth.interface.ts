export interface UserPayloadType {
  id: string;
  user_id: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

export interface AuthReturnType {
  tahcu_authToken: string;
  CSRF_TOKEN: string;
}
