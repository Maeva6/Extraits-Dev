<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Réinitialisation de mot de passe - Extraits Cameroun</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f9fafb;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .email-header {
            background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        
        .email-header p {
            margin: 10px 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        
        .email-content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            color: #1f2937;
        }
        
        .message {
            margin-bottom: 25px;
            color: #4b5563;
            line-height: 1.7;
        }
        
        .reset-button-container {
            text-align: center;
            margin: 35px 0;
        }
        
        .reset-button {
            background: #D4AF37;
            color: white;
            padding: 16px 36px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(212, 175, 55, 0.3);
        }
        
        .reset-button:hover {
            background: #B8860B;
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(212, 175, 55, 0.4);
        }
        
        .url-container {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            word-break: break-all;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #4b5563;
            border-left: 4px solid #D4AF37;
        }
        
        .url-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
        }
        
        .warning-section {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .warning-title {
            color: #92400e;
            font-weight: bold;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 16px;
        }
        
        .warning-content {
            color: #92400e;
            line-height: 1.6;
        }
        
        .instructions {
            background: #f0f9ff;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .instructions-title {
            color: #0369a1;
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .instructions-list {
            margin: 0;
            padding-left: 20px;
            color: #0369a1;
        }
        
        .instructions-list li {
            margin-bottom: 8px;
        }
        
        .email-footer {
            background: #111827;
            padding: 30px;
            text-align: center;
            color: #9ca3af;
            font-size: 14px;
        }
        
        .email-footer p {
            margin: 8px 0;
        }
        
        .footer-links {
            margin: 15px 0;
        }
        
        .footer-link {
            color: #D4AF37;
            text-decoration: none;
            margin: 0 12px;
            transition: color 0.3s ease;
        }
        
        .footer-link:hover {
            color: #ffffff;
            text-decoration: underline;
        }
        
        .company-name {
            color: #D4AF37;
            font-weight: bold;
        }
        
        @media (max-width: 600px) {
            .email-container {
                border-radius: 0;
            }
            
            .email-header, .email-content {
                padding: 30px 20px;
            }
            
            .reset-button {
                padding: 14px 28px;
                font-size: 15px;
                width: 100%;
            }
            
            .email-footer {
                padding: 25px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Extraits Cameroun</h1>
            <p>Réinitialisation de mot de passe</p>
        </div>
        
        <div class="email-content">
            <div class="greeting">
                Bonjour{{ $userName ? ' ' . $userName : '' }},
            </div>
            
            <div class="message">
                <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte <strong>Extraits Cameroun</strong>.</p>
                <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            </div>
            
            <div class="reset-button-container">
                <a href="{{ $resetUrl }}" class="reset-button">
                    🔐 Réinitialiser mon mot de passe
                </a>
            </div>
            
            <div class="message">
                <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
            </div>
            
            <div class="url-container">
                <span class="url-label">Lien de réinitialisation :</span>
                {{ $resetUrl }}
            </div>
        </div>
    </div>
</body>
</html>