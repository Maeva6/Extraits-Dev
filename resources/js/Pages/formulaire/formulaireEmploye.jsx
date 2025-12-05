import { useState } from 'react';
import { router } from '@inertiajs/react';
import Navbar from '../components/navBar';

export default function CreateEmploye() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employe'
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
        
        // Effacer l'erreur quand l'utilisateur tape
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleCancel = () => {
        router.visit('/employes/admin');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // ✅ Utilisez l'URL directe au lieu de route('users.store')
        router.post('/admin/users', user, {
            onSuccess: () => {
                setUser({ 
                    name: '', 
                    email: '', 
                    password: '',
                    role: 'employe' 
                });
                setIsSubmitting(false);
                // Le message de succès sera affiché via la redirection
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
                console.log('Erreurs de validation:', errors);
            },
            preserveScroll: true
        });
    };

    return (
        <div className="min-h-screen">
            <div className="flex">
                <div className="w-0 lg:w-[15px] bg-red"></div>

                <div className="max-w-4xl mx-auto p-6 rounded-lg min-h-screen w-full lg:ml-[220px]">
                    <h1 className="text-2xl font-bold mb-6">Ajouter un employé</h1>
                    
                    <form onSubmit={handleSubmit}>
                        {/* Nom complet */}
                        <div className="mb-6">
                            <label className="block text-m font-medium text-gray-700 mb-1">
                                Nom complet<span className='text-red-500'> *</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={user.name}
                                onChange={handleChange}
                                placeholder="Entrer le nom complet..."
                                className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
                                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="mb-6">
                            <label className="block text-m font-medium text-gray-700 mb-1">
                                Adresse email <span className='text-red-500'> *</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                                placeholder="email@exemple.com"
                                className={`w-full p-3 border rounded-md ${
                                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Champ rôle caché */}
                        <input type="hidden" name="role" value="employe" />

                        {/* Affichage du rôle (lecture seule) */}
                        <div className="mb-6">
                            <label className="block text-m font-medium text-gray-700 mb-1">Rôle</label>
                            <input
                                type="text"
                                value="Employé"
                                className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                                readOnly
                            />
                        </div>

                        {/* Mot de passe */}
                        <div className="mb-6">
                            <label className="block text-m font-medium text-gray-700 mb-1">
                                Mot de passe <span className='text-red-500'> *</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={user.password}
                                onChange={handleChange}
                                placeholder="Minimum 8 caractères"
                                className={`w-full p-3 border rounded-md ${
                                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                required
                                minLength="8"
                            />
                            {errors.password && (
                                <div className="text-red-500 text-sm mt-1">
                                    {Array.isArray(errors.password) 
                                        ? errors.password.join(', ') 
                                        : errors.password
                                    }
                                </div>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                Le mot de passe doit contenir au moins 8 caractères
                            </p>
                        </div>

                        {/* Affichage des erreurs générales */}
                        {errors.message && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-700 font-medium">Erreur</p>
                                <p className="text-red-600">{errors.message}</p>
                            </div>
                        )}

                        {/* Boutons */}
                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Annuler
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#C4A235] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Création...
                                    </>
                                ) : (
                                    'Enregistrer'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}