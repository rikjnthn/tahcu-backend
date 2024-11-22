import { Socket } from 'socket.io';

export interface AuthSocket extends Socket {
  user: {
    user_id: string;
  };
}

export type MessageWsMiddlewareType = (
  req: AuthSocket,
  next: (err?: Error) => void,
) => void;
