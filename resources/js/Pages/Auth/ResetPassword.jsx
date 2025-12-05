import { useState } from 'react';
import logo from './assets/icons/logo.svg';
import background from './assets/images/bg-login.jpg';
import { Link, router } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const [form, setForm] = useState({
        token: token,
        email: email || '',
        password: '',
        password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        
        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/\d/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 0: return 'bg-gray-200';
            case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-green-500';
            case 5: return 'bg-green-600';
            default: return 'bg-gray-200';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await router.post('/reset-password', form);
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: 'Une erreur est survenue' });
            }
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
                    <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
                    <p className="text-gray-600 mt-2">Créez un nouveau mot de passe sécurisé</p>
                </div>

                {/* Email */}
                {email && (
                    <div className="bg-yellow-300 border border-yellow-120 rounded-lg p-4 mb-4">
                        <p className="text-yellow-800 text-center text-sm">
                            Réinitialisation pour : 
                            <span className="font-semibold block mt-1">{email}</span>
                        </p>
                    </div>
                )}

                {/* Messages d'erreur */}
                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm text-center">{errors.general}</p>
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email (si non pré-rempli) */}
                    {!email && (
                        <div>
                            <label htmlFor="email" className="block font-semibold mb-2">
                                Adresse email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="exemple@email.com"
                                required
                                disabled={loading}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>
                    )}

                    {/* Mot de passe */}
                    <div>
                        <label htmlFor="password" className="block font-semibold mb-2">
                            Nouveau mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 pr-10 ${
                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Créez un mot de passe sécurisé"
                                required
                                disabled={loading}
                                autoFocus={!email}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                tabIndex="-1"
                            >
                            </button>
                        </div>
                        
                        {/* Force du mot de passe */}
                        {form.password && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600">Force :</span>
                                    <span className="text-xs font-medium">
                                        {passwordStrength <= 1 ? 'Faible' :
                                         passwordStrength <= 2 ? 'Moyen' :
                                         passwordStrength <= 3 ? 'Bon' :
                                         passwordStrength <= 4 ? 'Fort' : 'Très fort'}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirmation */}
                    <div>
                        <label htmlFor="password_confirmation" className="block font-semibold mb-2">
                            Confirmer le mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="password_confirmation"
                                name="password_confirmation"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 pr-10 ${
                                    errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Retapez votre mot de passe"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                tabIndex="-1"
                            >
                            </button>
                        </div>
                        {errors.password_confirmation && (
                            <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
                        )}
                        
                        {/* Vérification correspondance */}
                        {form.password && form.password_confirmation && (
                            <div className={`mt-2 text-sm ${
                                form.password === form.password_confirmation ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {form.password === form.password_confirmation 
                                    ? '✅ Les mots de passe correspondent' 
                                    : '❌ Les mots de passe ne correspondent pas'
                                }
                            </div>
                        )}
                    </div>

                    {/* Bouton */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-black text-white py-3 rounded-md w-full transition duration-300 mt-6 ${
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
                                Réinitialisation...
                            </span>
                        ) : (
                            "Réinitialiser le mot de passe"
                        )}
                    </button>
                </form>

                {/* Liens */}
                <div className="pt-4 border-t border-gray-100 text-center">
                    <Link 
                        href="/login" 
                        className="text-yellow-600 hover:underline text-sm font-medium"
                    >
                        ← Retour à la connexion
                    </Link>
                </div>

                {/* Conseils */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2 text-sm">💡 Conseils :</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                        <li>• Utilisez un mot de passe différent de vos autres comptes</li>
                        <li>• Évitez les informations personnelles (nom, date de naissance)</li>
                        <li>• Mélangez lettres, chiffres et caractères spéciaux</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}