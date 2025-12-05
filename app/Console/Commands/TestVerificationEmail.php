<?php

namespace App\Console\Commands;

use App\Mail\VerificationCodeMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestVerificationEmail extends Command
{
    /**
     * Le nom et la signature de la commande.
     *
     * @var string
     */
    protected $signature = 'test:verification-email {email}';

    /**
     * Description de la commande.
     *
     * @var string
     */
    protected $description = 'Test l\'envoi d\'email de vérification';

    /**
     * Exécuter la commande.
     *
     * @return int
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info("Envoi d'un email de test à: $email");
        
        try {
            Mail::to($email)->send(new VerificationCodeMail('123456'));
            $this->info('✅ Email envoyé avec succès !');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('❌ Erreur: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}