import express, { Application, NextFunction, Request, Response } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import path from 'path';

import { Sqlite3Helper } from './db/sqlite3';

import { HealthcheckController } from './controllers/healthcheck';
import { UserController } from './controllers/user';
import { UserService } from './services/user';
import { UserRepository } from './repositories/user';
import { errorHandler } from './middlewares/error-handler';


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

const openApiDoc = path.join(__dirname, '..', 'docs', 'openapi.yaml');

// setup application routes with controllers
async function setupRoutes(app: Application) {
    const {
        healthcheckController,
        userController
    } = await init();

    app.get('/spec', express.static(openApiDoc));
    app.use('/', healthcheckController.getRouter());
    app.use('/', userController.getRouter());
}

export async function setupApp(port: string): Promise<express.Application> {
    const app = express();
    app.set('port', port)
    app.use(express.json({ limit: '5mb', type: 'application/json' }))
    app.use(express.urlencoded({extended: true}));

    app.use(
        OpenApiValidator.middleware({
          apiSpec: openApiDoc,
          validateRequests: true,
          validateResponses: true,
        }),
    );

    await setupRoutes(app);

    app.use(errorHandler);

    return app;
}
