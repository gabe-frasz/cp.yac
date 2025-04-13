import { User } from "@/app/entities";
import type { UserRepository } from "@/app/repositories";

interface CreateUserUseCaseRequest {
  email: string;
}

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: CreateUserUseCaseRequest) {
    const { email } = request;
    const user = new User({ email });
    await this.userRepository.createUser(user);
  }
}
