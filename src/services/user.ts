import { CreateUserRequest, User } from "src/entities/user";

export interface IUserService {
    createUser(createUserRequest: CreateUserRequest): Promise<User>;
}