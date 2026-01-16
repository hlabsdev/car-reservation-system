import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { carService } from "../cars/carService";
import { reservationService } from "./reservationService";
import type {Car} from "../../types";
import axios from "axios";

export default function ReservationForm() {
    const [cars, setCars] = useState<Car[]>([]);
    const [carId, setCarId] = useState<number | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        carService.getAll(true).then(setCars);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await reservationService.create({
                car_id: carId!,
                start_date: startDate,
                end_date: endDate,
            });
            navigate("/reservations");
        } catch (err) {
            // Validation du type pour satisfaire ESLint et TypeScript
            if (axios.isAxiosError(err)) {
                // On récupère le message d'erreur spécifique du backend Django
                setError(
                    err.response?.data?.error ||
                    err.response?.data?.detail ||
                    "Erreur lors de la création de la réservation"
                );
            } else {
                setError("Une erreur inattendue est survenue");
            }
        }
    };

    return (
        <div>
            <h1>Nouvelle réservation</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Véhicule</label>
                    <select onChange={(e) => setCarId(Number(e.target.value))} required>
                        <option value="">---</option>
                        {cars.map((car) => (
                            <option key={car.id} value={car.id}>
                                {car.brand} {car.model}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Date début</label>
                    <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Date fin</label>
                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Créer</button>
            </form>
        </div>
    );
}
