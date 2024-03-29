export class CustomError extends Error {
    public error_code: string;
    public context: object;

    constructor(error_code: string, message: string, context: object) {
        super();

        this.error_code = error_code;
        this.message = message;
        this.context = context;
    }
}

export enum SqliteErrorCode {
    SQLITE_CONSTRAINT_UNIQUE = 'SQLITE_CONSTRAINT_UNIQUE',
    SQLITE_CONSTRAINT_FOREIGNKEY = 'SQLITE_CONSTRAINT_FOREIGNKEY'
}

export const ErrorCodeMapToHttpStatus: { [key: string]: number } = {
    API_VALIDATION_ERROR: 400,
    REQUEST_FORBIDDEN_ERROR: 403,
    DATA_NOT_FOUND: 404,
    DUPLICATE_ERROR: 409,
    SERVER_ERROR: 500
};

export enum ErrorCodes {
    API_VALIDATION_ERROR = 'API_VALIDATION_ERROR',
    REQUEST_FORBIDDEN_ERROR = 'REQUEST_FORBIDDEN_ERROR',
    DATA_NOT_FOUND = 'DATA_NOT_FOUND',
    DUPLICATE_ERROR = 'DUPLICATE_ERROR',
    SERVER_ERROR = 'SERVER_ERROR'
}
