import api from '../../utils/api';
import type {LoginCredentials, RegisterData, User} from "../../types";

interface AuthResponse {
    access: string;
    refresh: string;
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login/', credentials);

        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
        }

        return response.data;
    },

    async register(data: RegisterData): Promise<User> {
        const response = await api.post<User>('/users/register/', data);
        return response.data;
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/users/me/');
        return response.data;
    },

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    },
};