import { useState } from 'react';
import logo from './assets/icons/logo.svg';
import background from './assets/images/bg-login.jpg';
import { Link, router } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await router.post('/forgot-password', { email });
            setEmail(''); // Réinitialiser le champ après succès
        } catch (err) {
            setError(err.response?.data?.errors?.email || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center px-4"
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg space-y-6 mt-10 mb-10">
                {/* Logo */}
                <div className="flex justify-center">
                    <img src={logo} alt="Logo" className="h-16" />
                </div>

                {/* Titre */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
                    <p className="text-gray-600 mt-2">
                        Entrez votre email pour recevoir un lien de réinitialisation
                    </p>
                </div>

                {/* Message de statut (uniquement celui de Laravel) */}
                {status && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm text-center">Un lien de réinitialisation a été envoyé à votre email</p>
                    </div>
                )}

                {/* Message d'erreur */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block font-semibold mb-2">
                            Adresse email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            placeholder="exemple@email.com"
                            required
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    {/* Bouton */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-black text-white py-3 rounded-md w-full transition duration-300 ${
                            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-700"
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg 
                                    className="animate-spin h-5 w-5 mr-2" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24"
                                >
                                    <circle 
                                        className="opacity-25" 
                                        cx="12" 
                                        cy="12" 
                                        r="10" 
                                        stroke="currentColor" 
                                        strokeWidth="4"
                                    ></circle>
                                    <path 
                                        className="opacity-75" 
                                        fill="currentColor" 
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Envoi en cours...
                            </span>
                        ) : (
                            "Envoyer le lien de réinitialisation"
                        )}
                    </button>
                </form>

                {/* Liens */}
                <div className="pt-4 border-t border-gray-100 text-center space-y-3">
                    <Link 
                        href="/login" 
                        className="text-yellow-600 hover:underline text-sm font-medium block"
                    >
                        ← Retour à la connexion
                    </Link>
                    
                    <Link 
                        href="/register" 
                        className="text-yellow-600 hover:underline text-sm font-medium block"
                    >
                        Pas encore de compte ? S'inscrire
                    </Link>
                </div>

                {/* Informations */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2 text-sm">ℹ️ Comment ça marche :</h3>
                    <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside pl-2">
                        <li>Entrez votre email ci-dessus</li>
                        <li>Recevez un lien de réinitialisation par email</li>
                        <li>Cliquez sur le lien dans l'email</li>
                        <li>Créez un nouveau mot de passe</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}