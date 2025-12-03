import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, Link } from '@inertiajs/react';

// Importe ton fond et ton logo (même que sur la page Login)
import background from './assets/images/forgot-password.jpg';
import logo from './assets/icons/logo.svg';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center px-4"
            style={{ backgroundImage: `url(${background})` }}
        >
            {/* Carte principale */}
            <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-2xl space-y-8">

                {/* Logo centré */}
                <div className="flex justify-center">
                    <img src={logo} alt="Extraits de Parfum" className="h-20" />
                </div>

                {/* Titre */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Mot de passe oublié ?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Pas de souci ! Indiquez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>
                </div>

                {/* Message de succès */}
                {status && (
                    <div className="text-center text-sm font-medium text-green-600 bg-green-50 py-3 px-4 rounded-md">
                        {status}
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                            Adresse email
                        </label>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm placeholder-yellow-500 focus:border-yellow-600 focus:ring-yellow-600"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    {/* Bouton noir comme sur Login */}
                    <PrimaryButton
                        className="w-full bg-black hover:bg-yellow-700 text-white font-bold py-3 rounded-md transition duration-300 disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                    </PrimaryButton>
                </form>

                {/* Lien de retour */}
                <div className="text-center mt-6">
                    <Link
                        href={route('login')}
                        className="text-yellow-600 hover:text-yellow-700 font-medium text-sm underline"
                    >
                        ← Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
}