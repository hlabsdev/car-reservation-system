// src/features/cars/CarList.tsx
import { useEffect, useState } from "react";
import { carService } from "./carService";
import type {Car} from "../../types";

export default function CarList() {
    const [cars, setCars] = useState<Car[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        carService
            .getAll()
            .then(setCars)
            .catch(() => setError("Impossible de charger les véhicules"));
    }, []);

    return (
        <div>
            <h1>Véhicules</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <ul>
                {cars.map((car) => (
                    <li key={car.id}>
                        {car.brand} {car.model} – {car.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}
