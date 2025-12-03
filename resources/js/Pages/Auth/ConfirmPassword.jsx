import { Head, useForm, Link } from '@inertiajs/react';

// Même fond et logo que les autres pages d’auth
import background from './assets/images/bg-login.jpg';     // ou Bg-Verifyemail.svg si tu préfères
import logo from './assets/icons/logo.svg';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat px-4"
            style={{
                backgroundImage: `url(${background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            {/* Carte principale */}
            <div className="bg-white bg-opacity-95 w-full max-w-md p-8 md:p-10 rounded-2xl shadow-2xl text-center space-y-8 backdrop-blur-sm">

                {/* Logo */}
                <div className="flex justify-center">
                    <img src={logo} alt="Extraits de Parfum" className="h-20 md:h-24" />
                </div>

                {/* Titre + explication */}
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Confirmez votre identité
                    </h2>
                    <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed px-4">
                        Pour des raisons de sécurité, veuillez saisir votre mot de passe actuel avant de continuer.
                    </p>
                </div>

                {/* Formulaire */}
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-yellow-500 focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600 focus:outline-none transition"
                            placeholder="Votre mot de passe actuel"
                            required
                            autoFocus
                        />
                        {errors.password && (
                            <p className="text-red-600 text-sm mt-2 text-left">{errors.password}</p>
                        )}
                    </div>

                    {/* Bouton noir → hover jaune */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-black hover:bg-yellow-700 text-white font-bold py-4 rounded-lg transition duration-300 disabled:opacity-60 text-lg"
                    >
                        {processing ? 'Vérification...' : 'Confirmer et continuer'}
                    </button>

                    {/* Lien de retour */}
                    <div className="pt-4">
                        <Link
                            href={route('dashboard')}
                            className="text-sm md:text-base text-yellow-600 hover:text-yellow-700 underline font-medium"
                        >
                            ← Retour au tableau de bord
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}