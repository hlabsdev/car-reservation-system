// frontend/src/App.tsx
import {useEffect} from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useAuth} from './features/auth/useAuth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import CarList from './features/cars/CarList';
import ReservationForm from './features/reservations/ReservationForm';
import ReservationList from './features/reservations/ReservationList';

const queryClient = new QueryClient();

function App() {
    const {fetchUser, isAuthenticated} = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchUser();
        }
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>

                    <Route
                        path="/"
                        element={
                            <Layout>
                                <Navigate to="/cars" replace/>
                            </Layout>
                        }
                    />

                    <Route
                        path="/cars"
                        element={
                            <Layout>
                                <ProtectedRoute>
                                    <CarList/>
                                </ProtectedRoute>
                            </Layout>
                        }
                    />

                    <Route
                        path="/cars/:carId/reserve"
                        element={
                            <Layout>
                                <ProtectedRoute>
                                    <ReservationForm/>
                                </ProtectedRoute>
                            </Layout>
                        }
                    />

                    <Route
                        path="/reservations"
                        element={
                            <Layout>
                                <ProtectedRoute>
                                    <ReservationList/>
                                </ProtectedRoute>
                            </Layout>
                        }
                    />

                    <Route path="*" element={<Navigate to="/cars" replace/>}/>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;