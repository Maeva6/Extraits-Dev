import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm, Link } from '@inertiajs/react';

// Importe les mêmes assets que sur Login / ForgotPassword
import background from './assets/images/Reset-password.avif';
import logo from './assets/icons/logo.svg';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
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
                        Choisissez un nouveau mot de passe
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Saisissez un mot de passe sécurisé pour finaliser la réinitialisation.
                    </p>
                </div>

                {/* Formulaire */}
                <form onSubmit={submit} className="space-y-6">

                    {/* Email (pré-rempli, en lecture seule) */}
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full bg-gray-50 border-gray-300"
                            autoComplete="username"
                            disabled={true}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    {/* Nouveau mot de passe */}
                    <div>
                        <InputLabel htmlFor="password" value="Nouveau mot de passe" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm placeholder-yellow-500 focus:border-yellow-600 focus:ring-yellow-600"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    {/* Confirmation */}
                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Confirmer le mot de passe" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm placeholder-yellow-500 focus:border-yellow-600 focus:ring-yellow-600"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    {/* Bouton noir → hover jaune */}
                    <PrimaryButton
                        className="w-full bg-black hover:bg-yellow-700 text-white font-bold py-3 rounded-md transition duration-300 disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
                    </PrimaryButton>
                </form>

                {/* Lien retour connexion */}
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