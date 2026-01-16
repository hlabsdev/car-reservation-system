import api from '../../utils/api';
import type {Car} from '../../types';

export const carService = {
    async getAll(availableOnly?: boolean): Promise<Car[]> {
        const params = availableOnly ? {available: 'true'} : {};
        const response = await api.get<Car[]>('/cars/', {params});
        return response.data;
    },

    async getById(id: number): Promise<Car> {
        const response = await api.get<Car>(`/cars/${id}/`);
        return response.data;
    },

    async checkAvailability(
        carId: number,
        startDate: string,
        endDate: string
    ): Promise<{ available: boolean; reason?: string }> {
        const response = await api.get(`/cars/${carId}/availability/`, {
            params: {start_date: startDate, end_date: endDate},
        });
        return response.data;
    },
};