export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone: string;
}

export interface Car {
    id: number;
    registration_number: string;
    brand: string;
    model: string;
    year: number;
    status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'UNAVAILABLE';
    status_display: string;
    is_available: boolean;
    created_at: string;
    updated_at: string;
}

export interface Reservation {
    id: number;
    user: number;
    user_detail: User;
    car: number;
    car_detail: Car;
    start_date: string;
    end_date: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    purpose: string;
    created_at: string;
    updated_at: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    phone?: string;
}
