<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestGmailConnection extends Command
{
    protected $signature = 'test:gmail';
    protected $description = 'Test la connexion Gmail';

   public function handle()
{
    $this->info('Test ENVOI RÉEL...');
    
    try {
        // Envoyez à VOUS-MÊME
        Mail::raw('Ceci est un test RÉEL depuis Laravel', function($message) {
            $message->to('gabybryannapani@gmail.com')  // ⬅️ VOTRE EMAIL
                    ->subject('✅ Test RÉEL Laravel');
        });
        
        $this->info('🎉 Email envoyé pour de VRAI !');
        $this->info('Vérifiez votre boîte MAINTENANT');
        
    } catch (\Exception $e) {
        $this->error('❌ ERREUR : ' . $e->getMessage());
    }
}
}