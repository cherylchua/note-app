export interface CreateUserRequest {
    first_name: string;
    last_name: string;
    email: string;
}

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
    updated_at: string;
}
