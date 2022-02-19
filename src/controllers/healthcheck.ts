import { Request, Response, Router } from 'express';

export class HealthcheckController {
    private router: Router;

    constructor() {
        this.router = Router();
        this.router.get('/healthcheck', HealthcheckController.getHealthcheckStatus);
    }

    getRouter() {
        return this.router;
    }

    static async getHealthcheckStatus(_: Request, res: Response) {
        return res.status(200).json({ status: 'OK' });
    }
}
