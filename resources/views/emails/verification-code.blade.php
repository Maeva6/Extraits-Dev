<!DOCTYPE html>
<html>
<head>
    <title>Code de vérification - Extraits Cameroun</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #eab750ff; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .code { 
            font-size: 32px; 
            font-weight: bold; 
            letter-spacing: 8px;
            text-align: center; 
            margin: 20px 0;
            color: #eab750ff;
        }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Extraits Cameroun- Vérification de mot de passe</h1>
        </div>
        
        <div class="content">
            <h2>Vérification de votre adresse email</h2>
            
            <p>Bonjour,</p>
            
            <p>Vous avez demandé à créer un compte sur Extraits cameroun.</p>
            
            <p>Utilisez le code suivant pour vérifier votre adresse email :</p>
            
            <div class="code">
                {{ $code }}
            </div>
            
            <p>Ce code est valide pendant <strong>{{ $expires_in }}</strong>.</p>
            
            <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
        </div>
        
        <div class="footer">
            <p>© {{ date('Y') }}  Extraits cameroun. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>