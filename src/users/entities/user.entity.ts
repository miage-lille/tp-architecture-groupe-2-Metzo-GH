import { Entity } from 'src/shared/entity';

type UserProps = {
  id: string;
  email: string;
  password: string;
};
export class User extends Entity<UserProps> {}
