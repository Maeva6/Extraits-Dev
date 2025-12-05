import { useState } from 'react';
import logo from './assets/icons/logo.svg';
import background from './assets/images/bg-login.jpg';
import { Link, router } from '@inertiajs/react';

export default function RegisterStep3({ email, status }) {
    const [form, setForm] = useState({
        name: '',
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
        
        // Effacer l'erreur du champ modifié
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        
        // Calculer la force du mot de passe
        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        
        // Longueur minimale
        if (password.length >= 8) strength += 1;
        
        // Contient des lettres minuscules
        if (/[a-z]/.test(password)) strength += 1;
        
        // Contient des lettres majuscules
        if (/[A-Z]/.test(password)) strength += 1;
        
        // Contient des chiffres
        if (/\d/.test(password)) strength += 1;
        
        // Contient des caractères spéciaux
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

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case 0: return 'Très faible';
            case 1: return 'Faible';
            case 2: return 'Moyen';
            case 3: return 'Bon';
            case 4: return 'Fort';
            case 5: return 'Très fort';
            default: return '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await router.post('/register/complete', form);
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: 'Une erreur est survenue lors de la création du compte' });
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
                    <h1 className="text-2xl font-bold text-gray-900">Complétez votre profil</h1>
                    <p className="text-gray-600 mt-2">Étape 3/3 : Dernières informations</p>
                </div>

                {/* Barre de progression */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-full border-2 border-black text-black flex items-center justify-center text-sm font-bold">
                        1
                    </div>
                    <div className="h-1 w-12 bg-black"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-black text-black flex items-center justify-center text-sm font-bold">
                        2
                    </div>
                    <div className="h-1 w-12 bg-black"></div>
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                        3
                    </div>
                </div>

                {/* Messages d'état */}
                {status && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm text-center">{status}</p>
                    </div>
                )}

                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm text-center">{errors.general}</p>
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nom complet */}
                    <div>
                        <label htmlFor="name" className="block font-semibold mb-2 text-gray-800">
                            Nom complet
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Jean Dupont"
                            required
                            disabled={loading}
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Mot de passe */}
                    <div>
                        <label htmlFor="password" className="block font-semibold mb-2 text-gray-800">
                            Mot de passe
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
                                    <span className="text-xs text-gray-600">Force du mot de passe :</span>
                                    <span className={`text-xs font-medium ${
                                        passwordStrength <= 1 ? 'text-red-600' :
                                        passwordStrength <= 2 ? 'text-orange-600' :
                                        passwordStrength <= 3 ? 'text-yellow-600' :
                                        'text-green-600'
                                    }`}>
                                        {getPasswordStrengthText()}
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
                        
                        <ul className="text-xs text-gray-500 mt-2 space-y-1">
                            <li className="flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${form.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                Au moins 8 caractères
                            </li>
                            <li className="flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(form.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                Une lettre minuscule
                            </li>
                            <li className="flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(form.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                Une lettre majuscule
                            </li>
                            <li className="flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(form.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                Un chiffre
                            </li>
                        </ul>
                    </div>

                    {/* Confirmation mot de passe */}
                    <div>
                        <label htmlFor="password_confirmation" className="block font-semibold mb-2 text-gray-800">
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
                            <div className={`mt-2 text-sm ${form.password === form.password_confirmation ? 'text-green-600' : 'text-red-600'}`}>
                                {form.password === form.password_confirmation 
                                    ? '✅ Les mots de passe correspondent' 
                                    : '❌ Les mots de passe ne correspondent pas'
                                }
                            </div>
                        )}
                    </div>

                    {/* Bouton de création */}
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
                                Création en cours...
                            </span>
                        ) : (
                            "Créer mon compte"
                        )}
                    </button>
                </form>

                {/* Liens */}
                <div className="pt-4 border-t border-gray-100">
                    <Link 
                        href="/register/verify" 
                        className="text-yellow-600 hover:underline text-sm font-medium flex items-center justify-center"
                    >
                        ← Retour à la vérification
                    </Link>
                </div>

                {/* Informations de sécurité */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Vos informations sont sécurisées
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            Votre mot de passe est crypté de manière sécurisée
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            Votre email a été vérifié et confirmé
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            Vos données personnelles sont protégées
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            Nous ne partagerons jamais vos informations
                        </li>
                    </ul>
                </div>

                {/* Note finale */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-blue-800 text-sm text-center">
                        🎉 Vous êtes à un clic de rejoindre Extraits Cameroun !
                    </p>
                </div>
            </div>
        </div>
    );
}