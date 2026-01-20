import { useEffect, useState } from "react";
import { reservationService } from "./reservationService";
import type {Reservation} from "../../types";
import { Link } from "react-router-dom";

export default function ReservationList() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        reservationService
            .getAll()
            .then(setReservations)
            .catch(() =>
                setError("Impossible de charger vos réservations")
            );
    }, []);

    return (
        <div>
            <h1>Mes réservations</h1>

            <Link to="/reservations/new">Nouvelle réservation</Link>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <ul>
                {reservations.map((r) => (
                    <li key={r.id}>
                        {r.car_detail.brand} {r.car_detail.model} :{" "}
                        {r.start_date} → {r.end_date}
                    </li>
                ))}
            </ul>
        </div>
    );
}
