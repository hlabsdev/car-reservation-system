import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "./authService";
import axios from "axios";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await authService.login({ username, password });
            navigate("/cars");
        } catch (err) {
            // Le linter appréciera la suppression de ' : any' au profit d'un test de type
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.detail ||
                    "Erreur de connexion. Vérifiez vos identifiants."
                );
            } else {
                setError("Une erreur inattendue est survenue.");
            }
        }
    };

    return (
        <div>
            <h1>Connexion</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nom d’utilisateur</label>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Mot de passe</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
}
