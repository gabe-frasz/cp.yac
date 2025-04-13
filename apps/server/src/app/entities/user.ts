import { z } from "zod";

const userPropsSchema = z.object({
  id: z
    .string()
    .optional()
    .transform((id) => id ?? Math.random().toString()),
  email: z.string().email(),
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

  validate(props: UserPropsConstructor) {
    const { success, error, data } = userPropsSchema.safeParse(props);
    if (!success) throw new Error(error.message);

    return data;
  }
}
