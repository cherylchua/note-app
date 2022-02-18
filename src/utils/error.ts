export class CustomError extends Error {
    public error_code: string;
    public context: object;

    constructor (error_code: string, message: string, context: object) {
        super();

        this.error_code = error_code;
        this.message = message;
        this.context = context;
    }
}

export enum SqliteErrorCode {
    SQLITE_CONSTRAINT_UNIQUE = 'SQLITE_CONSTRAINT_UNIQUE'
}