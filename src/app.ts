import express, { Application } from 'express';

import { Sqlite3Helper } from './db/sqlite3';

import { HealthcheckController } from './controllers/healthcheck';
import { UserController } from './controllers/user';
import { UserService } from './services/user';
import { UserRepository } from './repositories/user';


// initialise dependencies
async function init(){
    const dbConnection = Sqlite3Helper.initialiseConnection();
        
    const userRepository = new UserRepository(dbConnection);
    
    const userService = new UserService(userRepository);
    
    const healthcheckController = new HealthcheckController();
    const userController = new UserController(userService);

    return {
        healthcheckController,
        userController
    }
}

// setup application routes with controllers
async function setupRoutes(app: Application) {
    const {
        healthcheckController,
        userController
    } = await init();

    app.use('/', healthcheckController.getRouter());
    app.use('/', userController.getRouter());
}

export async function setupApp(port: string): Promise<express.Application> {
    const app = express();
    app.set('port', port)
    app.use(express.json({ limit: '5mb', type: 'application/json' }))
    app.use(express.urlencoded({extended: true}));

    await setupRoutes(app);

    return app;
}
