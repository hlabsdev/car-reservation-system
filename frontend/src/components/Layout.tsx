import type {ReactNode} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">TDL</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">
                  Réservation Véhicules
                </span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/cars"
                                        className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Véhicules
                                    </Link>
                                    <Link
                                        to="/reservations"
                                        className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Mes Réservations
                                    </Link>
                                    <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700">
                      {user?.full_name || user?.username}
                    </span>
                                        <button
                                            onClick={handleLogout}
                                            className="btn btn-secondary text-sm"
                                        >
                                            Déconnexion
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <Link to="/login" className="btn btn-primary">
                                    Connexion
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="bg-gray-800 text-white py-6">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm">
                        © 2026 Togo Data Lab - Système de Réservation de Véhicules
                    </p>
                </div>
            </footer>
        </div>
    );
}