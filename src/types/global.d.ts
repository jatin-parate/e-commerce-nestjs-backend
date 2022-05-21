import { User as AppUser } from 'src/users/entities/user';

export {};

declare global {
  type Optional<T> = T | undefined;
}

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends AppUser {}

    interface Request {
      user?: User;
    }
  }
}
