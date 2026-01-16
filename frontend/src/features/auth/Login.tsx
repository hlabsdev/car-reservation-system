import {useState, type FormEvent} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {useAuth} from './useAuth';
import ErrorMessage from '../../components/ErrorMessage';
import axios from "axios";

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const {login, isLoading} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
        await login(username, password);
        navigate('/cars');
    } catch (err) {
        // Utilisation du type guard d'Axios pour éviter 'any'
        if (axios.isAxiosError(err)) {
            setError(
                err.response?.data?.detail ||
                'Identifiants incorrects. Veuillez réessayer.'
            );
        } else {
            setError('Une erreur inattendue est survenue.');
        }
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">TDL</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Connexion
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Système de Réservation de Véhicules
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <ErrorMessage message={error}/>}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Nom d'utilisateur
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input mt-1"
                                placeholder="Votre nom d'utilisateur"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input mt-1"
                                placeholder="Votre mot de passe"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full"
                        >
                            {isLoading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/register" className="text-sm text-primary-600 hover:text-primary-700">
                            Créer un compte
                        </Link>
                    </div>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium mb-2">Comptes de test:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Admin: <code className="bg-white px-2 py-1 rounded">admin / admin123</code></li>
                        <li>• User: <code className="bg-white px-2 py-1 rounded">kofi / test123</code></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}