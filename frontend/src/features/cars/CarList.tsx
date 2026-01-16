import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {carService} from './carService';
import type {Car} from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import axios from "axios";

export default function CarList() {
    const [cars, setCars] = useState<Car[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [availableOnly, setAvailableOnly] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCars();
    }, [availableOnly]);

    const fetchCars = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await carService.getAll(availableOnly);
            setCars(data);
        } catch (err) {
            // Remplacement de 'any' par une vérification sécurisée
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.detail || 'Impossible de charger les véhicules.');
            } else {
                setError('Une erreur inattendue est survenue.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return 'bg-green-100 text-green-800';
            case 'IN_USE':
                return 'bg-blue-100 text-blue-800';
            case 'MAINTENANCE':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) return <LoadingSpinner/>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Véhicules Disponibles</h1>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="available-only"
                        checked={availableOnly}
                        onChange={(e) => setAvailableOnly(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="available-only" className="text-sm text-gray-700">
                        Disponibles uniquement
                    </label>
                </div>
            </div>

            {error && <ErrorMessage message={error}/>}

            {cars.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-500">
                        {availableOnly
                            ? 'Aucun véhicule disponible pour le moment.'
                            : 'Aucun véhicule trouvé.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cars.map((car) => (
                        <div
                            key={car.id}
                            className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                            onClick={() => navigate(`/cars/${car.id}/reserve`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {car.brand} {car.model}
                                    </h3>
                                    <p className="text-sm text-gray-500">Année {car.year}</p>
                                </div>
                                <span
                                    className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                                        car.status
                                    )}`}
                                >
                  {car.status_display}
                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
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
                                    <span className="font-mono">{car.registration_number}</span>
                                </div>
                            </div>

                            {car.is_available && (
                                <button className="btn btn-primary w-full mt-4">
                                    Réserver ce véhicule
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}