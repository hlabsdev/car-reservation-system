import {useState, useEffect} from 'react';
import {reservationService} from './reservationService';
import type {Reservation} from '../../types';
import {format} from 'date-fns';
import {fr} from 'date-fns/locale';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import axios from "axios";

export default function ReservationList() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await reservationService.getAll();
            setReservations(data);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.detail || 'Impossible de charger vos réservations.');
            } else {
                setError('Une erreur inattendue est survenue.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
            return;
        }

        try {
            await reservationService.cancel(id);
            // On rafraîchit la liste après l'annulation
            await fetchReservations();
        } catch (err) {
            // Remplacement de 'any' par le guard Axios
            if (axios.isAxiosError(err)) {
                alert(err.response?.data?.error || err.response?.data?.detail || 'Impossible d\'annuler la réservation.');
            } else {
                alert('Une erreur inattendue est survenue.');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            PENDING: 'En attente',
            CONFIRMED: 'Confirmée',
            CANCELLED: 'Annulée',
            COMPLETED: 'Terminée',
        };
        return labels[status] || status;
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd MMM yyyy HH:mm', {locale: fr});
    };

    if (isLoading) return <LoadingSpinner/>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Mes Réservations</h1>

            {error && <ErrorMessage message={error}/>}

            {reservations.length === 0 ? (
                <div className="card text-center py-12">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                    <p className="mt-4 text-gray-500">Vous n'avez aucune réservation.</p>
                    <a href="/cars" className="btn btn-primary mt-4 inline-block">
                        Réserver un véhicule
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {reservations.map((reservation) => (
                        <div key={reservation.id} className="card">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {reservation.car_detail.brand} {reservation.car_detail.model}
                                        </h3>
                                        <span
                                            className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                                                reservation.status
                                            )}`}
                                        >
                      {getStatusLabel(reservation.status)}
                    </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <svg
                                                className="w-5 h-5 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                />
                                            </svg>
                                            <span className="font-mono">
                        {reservation.car_detail.registration_number}
                      </span>
                                        </div>

                                        <div className="flex items-center">
                                            <svg
                                                className="w-5 h-5 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span>
                        <strong>Début:</strong> {formatDate(reservation.start_date)}
                      </span>
                                        </div>

                                        <div className="flex items-center">
                                            <svg
                                                className="w-5 h-5 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span>
                        <strong>Fin:</strong> {formatDate(reservation.end_date)}
                      </span>
                                        </div>

                                        {reservation.purpose && (
                                            <div className="mt-3 pt-3 border-t">
                                                <p className="text-gray-700">
                                                    <strong>Motif:</strong> {reservation.purpose}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {reservation.status === 'CONFIRMED' && (
                                    <button
                                        onClick={() => handleCancel(reservation.id)}
                                        className="btn btn-danger text-sm"
                                    >
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}