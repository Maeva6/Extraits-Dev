<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Personnaliser le mail de réinitialisation de mot de passe
        ResetPassword::toMailUsing(function ($notifiable, $token) {
            $url = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            $expiresIn = config('auth.passwords.'.config('auth.defaults.passwords').'.expire', 60);
            
            return (new \Illuminate\Notifications\Messages\MailMessage)
                ->subject('Réinitialisation de votre mot de passe - Extraits Cameroun')
                ->view('emails.reset-password', [  // Chemin corrigé
                    'userName' => $notifiable->name,
                    'resetUrl' => $url,
                    'expiresIn' => $expiresIn,
                ]);
        });
    }
}