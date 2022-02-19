import { CreateUserRequest, User } from 'src/entities/user';
import { IUserRepository } from 'src/repositories/user';

export interface IUserService {
  createUser(createUserRequest: CreateUserRequest): Promise<User>;
}

export class UserService implements IUserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async createUser(createUserRequest: CreateUserRequest): Promise<User> {
    return await this.userRepository.insertAndReturn(createUserRequest);
  }
}
