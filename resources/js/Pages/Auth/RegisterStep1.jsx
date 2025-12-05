import React, { useState } from "react";
import logo from './assets/icons/logo.svg';
import background from './assets/images/bg-login.jpg';
import { router, Link } from '@inertiajs/react';

export default function RegisterStep1({ status }) {
    const [data, setData] = useState({
        email: '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await router.post('/register/send-code', data);
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: "Erreur lors de l'envoi du code." });
            }
        } finally {
            setProcessing(false);
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
                    <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
                    <p className="text-gray-600 mt-2">Étape 1/3 : Vérifiez votre adresse email</p>
                </div>

                {/* Messages d'état */}
                {status && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm text-center">{status}</p>
                    </div>
                )}

                {errors.general && (
                    <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded">
                        {errors.general}
                    </div>
                )}

                {/* Formule de progression */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                        1
                    </div>
                    <div className="h-1 w-12 bg-gray-300"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center text-sm font-bold">
                        2
                    </div>
                    <div className="h-1 w-12 bg-gray-300"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center text-sm font-bold">
                        3
                    </div>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block font-semibold mb-1">
                            Adresse email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={data.email}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            placeholder="exemple@email.com"
                            required
                            disabled={processing}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                            Vous recevrez un code de vérification par email
                        </p>
                    </div>

                    {/* Bouton d'action */}
                    <button
                        type="submit"
                        disabled={processing}
                        className={`bg-black text-white py-3 rounded-md w-full transition duration-300 ${
                            processing ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-700"
                        }`}
                    >
                        {processing ? "Envoi en cours..." : "Envoyer le code"}
                    </button>
                </form>

                {/* Liens */}
                <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
                    <Link 
                        href="/login" 
                        className="text-yellow-600 hover:underline font-medium"
                    >
                        Déjà un compte ?
                    </Link>
                    
                    <Link 
                        href="/forgot-password" 
                        className="text-yellow-600 hover:underline font-medium"
                    >
                        Mot de passe oublié ?
                    </Link>
                </div>

                {/* Étapes détaillées */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3">Comment ça marche :</h3>
                    <div className="space-y-2">
                        <div className="flex items-start">
                            <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                                1
                            </div>
                            <span className="text-gray-600">Entrez votre adresse email</span>
                        </div>
                        <div className="flex items-start">
                            <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                                2
                            </div>
                            <span className="text-gray-600">Recevez un code de vérification</span>
                        </div>
                        <div className="flex items-start">
                            <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                                3
                            </div>
                            <span className="text-gray-600">Entrez le code pour vérifier</span>
                        </div>
                        <div className="flex items-start">
                            <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                                4
                            </div>
                            <span className="text-gray-600">Complétez votre inscription</span>
                        </div>
                    </div>
                </div>

                {/* Note de sécurité */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-blue-800 text-sm text-center">
                        🔒 Vos informations sont sécurisées et ne seront jamais partagées
                    </p>
                </div>
            </div>
        </div>
    );
}