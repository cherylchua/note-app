import { Request, Response, NextFunction } from "express";
import { ErrorCodeMapToHttpStatus, ErrorCodes } from "../utils/error";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log({error: err});
    
    if (err.error_code) {
        return res.status(ErrorCodeMapToHttpStatus[err.error_code]).json({
            message: err.message,
            error_code: err.error_code,
        });
    }

    // Error thrown by express-openapi-validator
    if (err.errors && err.errors[0]) {
        return res.status(err.status).json({
            message: err.message,
            error_code: ErrorCodes.API_VALIDATION_ERROR,
            errors: err.errors
        });
    }

    return res.status(err.status || 500).json({
        message: 'Internal server error',
        error_code: ErrorCodes.SERVER_ERROR,
    });

}
