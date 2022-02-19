import { NextFunction, Request, Response, Router } from "express";
import { CreateUserRequest, User } from "./../entities/user";
import { IUserService } from "./../services/user";

export class UserController {
    private userService: IUserService;

    private router: Router;

    constructor (userService: IUserService) {
        this.userService = userService;

        this.router = Router();
        this.router.post('/users', this.createUser.bind(this))
    }

    getRouter() {
        return this.router;
    }
    
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const createUserRequest: CreateUserRequest = req.body;

            const createUserResponse: User = await this.userService.createUser(createUserRequest);

            res.status(201).json(createUserResponse);
        } catch(err) {
            next(err);
        }
    }
}

