<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\EmailVerificationCode;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationCodeMail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * ÉTAPE 1: Afficher le formulaire d'email
     */
    public function create(): Response
    {
        return Inertia::render('Auth/RegisterStep1', [
            'status' => session('status'),
        ]);
    }

    /**
     * Envoyer le code de vérification
     */
    public function sendVerificationCode(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
        ]);

        // Supprimer les anciens codes
        EmailVerificationCode::where('email', $request->email)->delete();

        // Générer un code à 6 chiffres
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Créer le code
        EmailVerificationCode::create([
            'email' => $request->email,
            'code' => $code,
            'expires_at' => now()->addMinutes(15),
        ]);

        // Envoyer l'email avec le code
        Mail::to($request->email)->send(new VerificationCodeMail($code));

        // Stocker l'email en session
        session(['registration_email' => $request->email]);

        return redirect()->route('register.verify')
            ->with('status', 'Un code de vérification a été envoyé à votre adresse email.');
    }

    /**
     * ÉTAPE 2: Afficher le formulaire de vérification
     */
    public function showVerificationForm(): Response
    {
        if (!session()->has('registration_email')) {
            return redirect()->route('register');
        }

        return Inertia::render('Auth/RegisterStep2', [
            'email' => session('registration_email'),
            'status' => session('status'),
        ]);
    }

    /**
     * Vérifier le code
     */
    public function verifyCode(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $email = session('registration_email');
        
        if (!$email) {
            return redirect()->route('register');
        }

        // Vérifier le code
        $verificationCode = EmailVerificationCode::valid($email, $request->code)->first();

        if (!$verificationCode) {
            return back()->withErrors([
                'code' => 'Code invalide ou expiré.',
            ]);
        }

        // Marquer le code comme utilisé
        $verificationCode->update(['is_used' => true]);

        // Marquer l'email comme vérifié en session
        session(['email_verified' => true]);

        return redirect()->route('register.complete')
            ->with('status', 'Email vérifié avec succès !');
    }

    /**
     * ÉTAPE 3: Afficher le formulaire complet
     */
    public function showCompleteForm(): Response
    {
        if (!session()->has('registration_email') || !session('email_verified')) {
            return redirect()->route('register');
        }

        return Inertia::render('Auth/RegisterStep3', [
            'email' => session('registration_email'),
            'status' => session('status'),
        ]);
    }

    /**
     * ÉTAPE 4: Créer le compte
     */
    public function store(Request $request): RedirectResponse
    {
        if (!session()->has('registration_email') || !session('email_verified')) {
            return redirect()->route('register');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Récupérer l'email de la session
        $email = session('registration_email');
        
        // Créer l'utilisateur
        $user = User::create([
            'name' => $request->name,
            'email' => $email,
            'password' => Hash::make($request->password),
            'email_verified_at' => now(), // Email déjà vérifié via code
        ]);

        // Nettoyer la session
        session()->forget(['registration_email', 'email_verified']);
        
        event(new Registered($user));
        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * Renvoyer le code
     */
    public function resendCode(): RedirectResponse
    {
        $email = session('registration_email');
        
        if (!$email) {
            return redirect()->route('register');
        }

        // Supprimer les anciens codes
        EmailVerificationCode::where('email', $email)->delete();

        // Générer un nouveau code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        EmailVerificationCode::create([
            'email' => $email,
            'code' => $code,
            'expires_at' => now()->addMinutes(15),
        ]);

        // Renvoyer l'email
        Mail::to($email)->send(new VerificationCodeMail($code));

        return back()->with('status', 'Un nouveau code a été envoyé à votre adresse email.');
    }
}