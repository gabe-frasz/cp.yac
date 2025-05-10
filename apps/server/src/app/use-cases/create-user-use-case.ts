import { User } from "@/app/entities";
import type { UserRepository } from "@/app/repositories";

interface Request {
  email: string;
  username: string;
}

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: Request) {
    const { email, username } = request;
    const user = new User({ email, username });
    await this.userRepository.create(user);
  }
}
