import { z } from "zod";
import { ulid } from "ulid";

const userPropsSchema = z.object({
  id: z.ulid().optional().default(ulid),
  email: z.email(),
  username: z.string(),
});

export type UserProps = z.infer<typeof userPropsSchema>;
type UserPropsConstructor = z.input<typeof userPropsSchema>;

export class User {
  private props: UserProps;

  constructor(props: UserPropsConstructor) {
    this.props = this.validate(props);
  }

  get id() {
    return this.props.id;
  }

  get email() {
    return this.props.email;
  }

  get username() {
    return this.props.username;
  }

  set username(username: string) {
    this.props.username = username;
  }

  private validate(props: UserPropsConstructor) {
    const { success, error, data } = userPropsSchema.safeParse(props);
    if (!success) throw new Error(z.prettifyError(error));

    return data;
  }
}
