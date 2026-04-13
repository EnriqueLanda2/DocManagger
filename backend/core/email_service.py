from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

def send_verification_email(user, code):
    
    subject = 'Verifica tu email en DocManager Pro'
    
    context = {
        'user_name': user.first_name or user.username,
        'verification_code': code,
        'app_name': 'DocManager Pro',
    }
    
    html_content = render_verification_email(context)
    text_content = strip_tags(html_content)
    
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.EMAIL_HOST_USER,
        to=[user.email],
    )
    
    email.attach_alternative(html_content, "text/html")
    
    email.send(fail_silently=False)


def render_verification_email(context):
    
    user_name = context.get('user_name', 'Usuario')
    code = context.get('verification_code', '000000')
    
    html = f"""
    <!DOCTYPE html>
    <html lang="es" style="margin: 0; padding: 0;">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 20px;
                text-align: center;
                color: white;
            }}
            .logo {{
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }}
            .header-text {{
                font-size: 14px;
                opacity: 0.9;
            }}
            .content {{
                padding: 40px;
            }}
            .greeting {{
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
                color: #1f2937;
            }}
            .message {{
                font-size: 16px;
                color: #4b5563;
                margin-bottom: 30px;
                line-height: 1.8;
            }}
            .code-container {{
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
                border-left: 4px solid #667eea;
            }}
            .code-label {{
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #6b7280;
                margin-bottom: 12px;
                font-weight: 600;
            }}
            .verification-code {{
                font-size: 36px;
                font-weight: 700;
                letter-spacing: 8px;
                color: #667eea;
                font-family: 'Courier New', monospace;
                margin: 0;
            }}
            .code-info {{
                font-size: 13px;
                color: #6b7280;
                margin-top: 16px;
            }}
            .info-box {{
                background: #f0f9ff;
                border-left: 4px solid #3b82f6;
                padding: 16px;
                border-radius: 8px;
                margin: 30px 0;
                font-size: 14px;
                color: #1e40af;
            }}
            .features {{
                margin: 30px 0;
            }}
            .feature-item {{
                display: flex;
                margin-bottom: 16px;
                align-items: flex-start;
            }}
            .feature-icon {{
                font-size: 20px;
                margin-right: 12px;
                margin-top: 2px;
            }}
            .feature-text {{
                font-size: 14px;
                color: #4b5563;
            }}
            .footer {{
                background: #f9fafb;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
            }}
            .footer-link {{
                color: #667eea;
                text-decoration: none;
            }}
            .button {{
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 14px 32px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin: 20px 0;
            }}
            .divider {{
                height: 1px;
                background: #e5e7eb;
                margin: 30px 0;
            }}
            a {{
                color: #667eea;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">DocManager Pro</div>
                <div class="header-text">Verifica tu cuenta para comenzar</div>
            </div>

            <div class="content">
                <div class="greeting">Bienvenido, {user_name}!</div>

                <div class="message">
                    Gracias por registrarte en <strong>DocManager Pro</strong>. Para proteger tu cuenta y completar el registro, necesitamos verificar tu dirección de correo electrónico.
                </div>

                <div class="code-container">
                    <div class="code-label">Tu código de verificación</div>
                    <div class="verification-code">{code}</div>
                    <div class="code-info">Válido por 30 minutos</div>
                </div>

                <div class="info-box">
                    <strong>Cómo usar este código?</strong><br>
                    Regresa a DocManager Pro, ingresa este código de 6 dígitos en el formulario de verificación y listo!
                </div>

                <div class="features">
                    <div class="feature-item">
                        <div class="feature-text"><strong>Crea documentos</strong> - Organiza tus contenidos de forma segura</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-text"><strong>Colabora en equipo</strong> - Comparte y edita con tu equipo en tiempo real</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-text"><strong>Historial completo</strong> - Accede a todas las versiones de tus documentos</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-text"><strong>Seguridad garantizada</strong> - Tus datos están protegidos</div>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="message" style="font-size: 14px; color: #6b7280;">
                    <strong>Nota de seguridad:</strong> Nunca compartamos códigos de verificación por otros medios. Si no solicitaste este correo, simplemente ignóralo.
                </div>
            </div>

            <div class="footer">
                <p style="margin: 0;">
                    © 2025 DocManager Pro. Todos los derechos reservados.<br>
                    <a href="#" class="footer-link">Centro de ayuda</a> | 
                    <a href="#" class="footer-link">Privacidad</a> | 
                    <a href="#" class="footer-link">Términos de servicio</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html
