import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/Login";
import CarList from "./features/cars/CarList";
import ReservationList from "./features/reservations/ReservationList";
import ReservationForm from "./features/reservations/ReservationForm";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    path="/cars"
                    element={
                        <ProtectedRoute>
                            <CarList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/reservations"
                    element={
                        <ProtectedRoute>
                            <ReservationList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/reservations/new"
                    element={
                        <ProtectedRoute>
                            <ReservationForm />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/cars" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
