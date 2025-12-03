import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

// Importe les mêmes assets que Login / ForgotPassword / ResetPassword
import background from './assets/images/bg-register.jpeg';
import logo from './assets/icons/logo.svg';

export default function Register() {
    const [passwordErrors, setPasswordErrors] = useState([]);

    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) errors.push("8 caractères minimum");
        if (!/[A-Z]/.test(password)) errors.push("1 majuscule requise");
        if (!/[a-z]/.test(password)) errors.push("1 minuscule requise");
        if (!/[0-9]/.test(password)) errors.push("1 chiffre requis");
        if (!/[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?]/.test(password)) errors.push("1 caractère spécial requis");
        return errors;
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center px-4"
            style={{ backgroundImage: `url(${background})` }}
        >
            {/* Carte principale */}
            <div className="bg-white bg-opacity-95 w-full max-w-md p-8 rounded-lg shadow-2xl space-y-8">

                {/* Logo centré */}
                <div className="flex justify-center">
                    <img src={logo} alt="Extraits de Parfum" className="h-20" />
                </div>

                {/* Titre */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Créez votre compte
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Rejoignez-nous et découvrez nos parfums d’exception.
                    </p>
                </div>

                {/* Formulaire */}
                <form onSubmit={submit} className="space-y-6">

                    {/* Nom complet */}
                    <div>
                        <InputLabel htmlFor="name" value="Nom complet" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm placeholder-yellow-500 focus:border-yellow-600 focus:ring-yellow-600"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    {/* Email */}
                    <div>
                        <InputLabel htmlFor="email" value="Adresse email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm placeholder-yellow-500 focus:border-yellow-600 focus:ring-yellow-600"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    {/* Mot de passe */}
                    <div>
                        <InputLabel htmlFor="password" value="Mot de passe" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm placeholder-yellow-500 focus:border-yellow-600 focus:ring-yellow-600"
                            autoComplete="new-password"
                            onChange={(e) => {
                                setData('password', e.target.value);
                                setPasswordErrors(validatePassword(e.target.value));
                            }}
                            required
                        />
                        {/* Validation en temps réel */}
                        {passwordErrors.length > 0 && (
                            <ul className="mt-2 text-xs text-red-600 list-disc list-inside space-y-1">
                                {passwordErrors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        )}
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
                            required
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    {/* Bouton + lien */}
                    <div className="flex items-center justify-between">
                        <Link
                            href={route('login')}
                            className="text-sm text-yellow-600 hover:text-yellow-700 underline font-medium"
                        >
                            Déjà inscrit ?
                        </Link>

                        <PrimaryButton
                            className="bg-black hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 disabled:opacity-50"
                            disabled={processing}
                        >
                            {processing ? 'Création...' : "S'inscrire"}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}