import {useState, type FormEvent} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {authService} from './authService';
import ErrorMessage from '../../components/ErrorMessage';
import axios from 'axios';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
        setError('Les mots de passe ne correspondent pas.');
        return;
    }

    setIsLoading(true);
    try {
        await authService.register(formData);
        navigate('/login', {
            state: { message: 'Compte créé avec succès. Vous pouvez maintenant vous connecter.' }
        });
    } catch (err) {
        // Remplacement de 'any' par une vérification de type sécurisée
        if (axios.isAxiosError(err)) {
            const errors = err.response?.data;
            if (errors && typeof errors === 'object') {
                // Formatage des erreurs typiques de Django REST Framework
                const errorMessages = Object.entries(errors)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`)
                    .join(', ');
                setError(errorMessages);
            } else {
                setError('Une erreur est survenue lors de l\'inscription.');
            }
        } else {
            setError('Une erreur réseau ou serveur est survenue.');
        }
    } finally {
        setIsLoading(false);
    }
};

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Créer un compte
                    </h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <ErrorMessage message={error}/>}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Nom d'utilisateur *
                            </label>
                            <input
                                type="text"
                                name="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="input mt-1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="input mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Prénom *
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    required
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="input mt-1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nom *
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    required
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="input mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="input mt-1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Mot de passe *
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={8}
                                value={formData.password}
                                onChange={handleChange}
                                className="input mt-1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Confirmer le mot de passe *
                            </label>
                            <input
                                type="password"
                                name="password_confirm"
                                required
                                value={formData.password_confirm}
                                onChange={handleChange}
                                className="input mt-1"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full"
                    >
                        {isLoading ? 'Inscription...' : 'S\'inscrire'}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">
                            Déjà un compte ? Se connecter
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}