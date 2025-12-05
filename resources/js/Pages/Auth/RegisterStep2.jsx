import { useState, useEffect, useRef } from 'react';
import logo from './assets/icons/logo.svg';
import background from './assets/images/bg-login.jpg';
import { Link, router } from '@inertiajs/react';

export default function RegisterStep2({ email, status }) {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [hiddenInput, setHiddenInput] = useState('');
    const hiddenInputRef = useRef(null);
    const inputsRef = useRef([]);

    // Timer pour renvoyer le code
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    // Focus sur le premier champ au chargement
    useEffect(() => {
        if (inputsRef.current[0]) {
            inputsRef.current[0].focus();
        }
    }, []);

    // Mettre à jour le champ caché quand le code change
    useEffect(() => {
        setHiddenInput(code.join(''));
    }, [code]);

    // Gérer la saisie normale dans les champs
    const handleCodeChange = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            // Passer au champ suivant automatiquement
            if (value && index < 5) {
                inputsRef.current[index + 1]?.focus();
            }
            
            // Effacer les erreurs
            if (error) setError('');
        }
    };

    // Gérer le keydown
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    // Gérer le coller sur le champ caché
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const numbers = pastedText.replace(/\D/g, '');
        
        if (numbers.length >= 6) {
            const newCode = numbers.slice(0, 6).split('');
            setCode(newCode);
            
            // Focus sur le dernier champ
            if (inputsRef.current[5]) {
                inputsRef.current[5].focus();
            }
            
            // Vérifier automatiquement après un court délai
            setTimeout(() => {
                if (!loading) {
                    handleVerify(e);
                }
            }, 300);
        }
    };

    // Vérifier le code
    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        
        const fullCode = code.join('');

        setLoading(true);
        setError('');

        try {
            await router.post('/register/verify', { code: fullCode });
        } catch (err) {
            setError(err.response?.data?.errors?.code || 'Code invalide ou expiré');
            // Réinitialiser en cas d'erreur
            setCode(['', '', '', '', '', '']);
            if (inputsRef.current[0]) {
                inputsRef.current[0].focus();
            }
        } finally {
            setLoading(false);
        }
    };

    // Renvoyer le code
    const handleResend = async () => {
        if (!canResend || loading) return;

        setLoading(true);
        try {
            await router.post('/register/resend-code');
            setSuccess('✅ Nouveau code envoyé !');
            setCountdown(60);
            setCanResend(false);
            setError('');
            setCode(['', '', '', '', '', '']);
            if (inputsRef.current[0]) {
                inputsRef.current[0].focus();
            }
        } catch (err) {
            setError('Erreur lors de l\'envoi du code');
        } finally {
            setLoading(false);
        }
    };

    // Gérer le focus sur le champ caché quand on clique sur les cases
    const handleBoxClick = () => {
        if (hiddenInputRef.current) {
            hiddenInputRef.current.focus();
            hiddenInputRef.current.select();
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
                    <h1 className="text-2xl font-bold text-gray-900">Vérifiez votre email</h1>
                    <p className="text-gray-600 mt-2">Étape 2/3 : Entrez le code reçu</p>
                </div>

                {/* Barre de progression */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-full border-2 border-black text-black flex items-center justify-center text-sm font-bold">
                        1
                    </div>
                    <div className="h-1 w-12 bg-black"></div>
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                        2
                    </div>
                    <div className="h-1 w-12 bg-gray-300"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center text-sm font-bold">
                        3
                    </div>
                </div>

                {/* Email vérifié */}
                <div className="bg-yellow-300 border border-yellow-120 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 text-center text-sm">
                        Un code à 6 chiffres a été envoyé à :
                        <span className="font-semibold block mt-1 text-base">{email}</span>
                    </p>
                </div>

                {/* Messages d'état */}
                {status && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm text-center">{status}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm text-center">{success}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Champ caché pour le copier-coller */}
                <input
                    ref={hiddenInputRef}
                    type="text"
                    value={hiddenInput}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 6) {
                            setHiddenInput(value);
                            const newCode = value.split('');
                            const paddedCode = [...newCode, ...Array(6 - newCode.length).fill('')];
                            setCode(paddedCode.slice(0, 6));
                        }
                    }}
                    onPaste={handlePaste}
                    className="absolute opacity-0 w-0 h-0"
                    autoComplete="off"
                />

                {/* Formulaire de code */}
                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label className="block font-semibold mb-4 text-center text-gray-800">
                            Code à 6 chiffres
                        </label>
                        
                        {/* Cases visuelles */}
                        <div 
                            className="flex justify-center space-x-2 mb-4 cursor-text"
                            onClick={handleBoxClick}
                        >
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <div key={index} className="relative">
                                    <input
                                        ref={el => inputsRef.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength="1"
                                        value={code[index]}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onFocus={() => {
                                            if (hiddenInputRef.current) {
                                                hiddenInputRef.current.focus();
                                            }
                                        }}
                                        className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg 
                                                   focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200
                                                   transition duration-200 appearance-none"
                                        disabled={loading}
                                    />
                                </div>
                            ))}
                        </div>

                        <p className="text-sm text-gray-500 text-center">
                            Entrez les 6 chiffres reçus par email
                        </p>
                    </div>

                    {/* Boutons */}
                    <div className="space-y-4">
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
                                    Vérification...
                                </span>
                            ) : (
                                "Vérifier le code"
                            )}
                        </button>

                        {/* Renvoyer le code */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={!canResend || loading}
                                className={`text-sm font-medium ${
                                    canResend 
                                        ? 'text-yellow-600 hover:text-yellow-800' 
                                        : 'text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {canResend ? '↻ Renvoyer le code' : `⏳ Renvoyer dans ${countdown}s`}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Liens */}
                <div className="pt-4 border-t border-gray-100">
                    <Link 
                        href="/register" 
                        className="text-yellow-600 hover:underline text-sm font-medium flex items-center justify-center"
                    >
                        ← Changer d'adresse email
                    </Link>
                </div>

                {/* Conseils */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">💡 Conseils :</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Vérifiez vos spams si vous ne voyez pas l'email</li>
                        <li>• Le code expire dans 15 minutes</li>
                        <li>• Vous pouvez copier-coller le code directement</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}