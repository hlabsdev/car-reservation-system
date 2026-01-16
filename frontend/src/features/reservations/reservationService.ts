import api from '../../utils/api';
import type {Reservation} from '../../types';

interface CreateReservationData {
    car_id: number;
    start_date: string;
    end_date: string;
    purpose?: string;
}

export const reservationService = {
    async getAll(): Promise<Reservation[]> {
        const response = await api.get<Reservation[]>('/reservations/');
        return response.data;
    },

    async getById(id: number): Promise<Reservation> {
        const response = await api.get<Reservation>(`/reservations/${id}/`);
        return response.data;
    },

    async create(data: CreateReservationData): Promise<Reservation> {
        const response = await api.post<Reservation>('/reservations/', data);
        return response.data;
    },

    async cancel(id: number): Promise<Reservation> {
        const response = await api.post<Reservation>(`/reservations/${id}/cancel/`);
        return response.data;
    },
};