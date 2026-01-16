import {useState, useEffect, type FormEvent} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {carService} from '../cars/carService';
import {reservationService} from './reservationService';
import type {Car} from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import axios from "axios";

export default function ReservationForm() {
    const {carId} = useParams<{ carId: string }>();
    const navigate = useNavigate();

    const [car, setCar] = useState<Car | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        purpose: '',
    });

    useEffect(() => {
        if (carId) {
            fetchCar();
        }
    }, [carId]);

    const fetchCar = async () => {
        setIsLoading(true);
        setError(''); // Optionnel : réinitialise l'erreur avant de commencer
        try {
            const data = await carService.getById(Number(carId));
            setCar(data);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.detail || 'Impossible de charger les informations du véhicule.');
            } else {
                setError('Une erreur inattendue est survenue.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const startDate = new Date(formData.start_date).toISOString();
            const endDate = new Date(formData.end_date).toISOString();

            await reservationService.create({
                car_id: Number(carId),
                start_date: startDate,
                end_date: endDate,
                purpose: formData.purpose,
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/reservations');
            }, 2000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const errorMsg = err.response?.data?.error ||
                    err.response?.data?.detail ||
                    'Une erreur est survenue lors de la réservation.';
                setError(errorMsg);
            } else {
                setError('Une erreur inattendue est survenue.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (isLoading) return <LoadingSpinner/>;

    if (!car) {
        return (
            <div className="card">
                <ErrorMessage message="Véhicule introuvable."/>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <button
                    onClick={() => navigate('/cars')}
                    className="text-primary-600 hover:text-primary-700 flex items-center"
                >
                    <svg
                        className="w-5 h-5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Retour aux véhicules
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mt-4">
                    Réserver un véhicule
                </h1>
            </div>

            <div className="card">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {car.brand} {car.model}
                        </h2>
                        <p className="text-gray-600">{car.registration_number}</p>
                        <p className="text-sm text-gray-500 mt-1">Année {car.year}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
            {car.status_display}
          </span>
                </div>

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 font-medium">
                            ✅ Réservation créée avec succès ! Redirection...
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-6">
                        <ErrorMessage message={error}/>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date et heure de début *
                        </label>
                        <input
                            type="datetime-local"
                            name="start_date"
                            required
                            value={formData.start_date}
                            onChange={handleChange}
                            className="input"
                            min={new Date().toISOString().slice(0, 16)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            La réservation doit commencer dans le futur
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date et heure de fin *
                        </label>
                        <input
                            type="datetime-local"
                            name="end_date"
                            required
                            value={formData.end_date}
                            onChange={handleChange}
                            className="input"
                            min={formData.start_date || new Date().toISOString().slice(0, 16)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Motif de la mission *
                        </label>
                        <textarea
                            name="purpose"
                            required
                            value={formData.purpose}
                            onChange={handleChange}
                            rows={4}
                            className="input"
                            placeholder="Décrivez brièvement le motif de votre déplacement..."
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">
                            ℹ️ Informations importantes
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>La réservation sera confirmée immédiatement</li>
                            <li>Assurez-vous que les dates ne chevauchent pas une réservation existante</li>
                            <li>Vous pourrez annuler votre réservation si nécessaire</li>
                        </ul>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/cars')}
                            className="btn btn-secondary flex-1"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || success}
                            className="btn btn-primary flex-1"
                        >
                            {isSubmitting ? 'Réservation en cours...' : 'Confirmer la réservation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}