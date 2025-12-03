import { Head, Link, useForm } from '@inertiajs/react';
import background from './assets/images/Bg-Verifyemail.svg';
import logo from './assets/icons/logo.svg';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat px-4"
            style={{
                backgroundImage: `url(${background})`,
                // LES 3 LIGNES MAGIQUES POUR MOBILE
                backgroundSize: 'cover',           // L'image couvre tout l'écran
                backgroundPosition: 'center center', // Toujours bien centrée
                backgroundAttachment: 'fixed',     // Fixe le fond sur mobile (effet pro)
            }}
        >
            {/* Carte principale */}
            <div className="bg-white bg-opacity-95 w-full max-w-md p-8 md:p-10 rounded-2xl shadow-2xl text-center space-y-8 backdrop-blur-sm">
                
                {/* Logo */}
                <div className="flex justify-center">
                    <img src={logo} alt="Extraits de Parfum" className="h-20 md:h-24" />
                </div>

                {/* Titre */}
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Vérifiez votre adresse email
                    </h2>
                    <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed px-2">
                        Merci pour votre inscription !<br />
                        Avant de commencer, veuillez cliquer sur le lien que nous venons de vous envoyer par email pour activer votre compte.
                    </p>
                </div>

                {/* Message de succès */}
                {status === 'verification-link-sent' && (
                    <div className="bg-green-50 text-green-700 py-3 px-6 rounded-lg text-sm font-medium">
                        Un nouveau lien de vérification vient d’être envoyé !
                    </div>
                )}

                {/* Bouton + Déconnexion */}
                <form onSubmit={submit} className="space-y-6">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-black hover:bg-yellow-700 text-white font-bold py-4 rounded-lg transition duration-300 disabled:opacity-60 text-lg"
                    >
                        {processing ? 'Envoi en cours...' : 'Renvoyer l’email'}
                    </button>

                    <div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-sm md:text-base text-yellow-600 hover:text-yellow-700 underline font-medium"
                        >
                            Se déconnecter
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}