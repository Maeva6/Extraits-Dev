<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;

    public function __construct($code)
    {
        $this->code = $code;
    }

    public function build()
    {
        return $this->subject('Votre code de vérification - Extraits Cameroun')
                    ->view('emails.verification-code')
                    ->with([
                        'code' => $this->code,
                        'expires_in' => '15 minutes',
                    ]);
    }
}