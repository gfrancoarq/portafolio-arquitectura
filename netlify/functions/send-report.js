// Función corregida para enviar el reporte por email
exports.handler = async (event) => {
    // Validar método HTTP
    if (event.httpMethod !== "POST") {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: "Method Not Allowed" }) 
        };
    }

    try {
        // Parsear el cuerpo de la petición
        const { name, email, htmlReport } = JSON.parse(event.body);
        
        // Validar datos requeridos
        if (!name || !email || !htmlReport) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Faltan datos requeridos: name, email, htmlReport" })
            };
        }

        // Validar email básico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Email inválido" })
            };
        }

        // Obtener API key de variables de entorno
        const BREVO_API_KEY = process.env.BREVO_API_KEY;
        if (!BREVO_API_KEY) {
            console.error("BREVO_API_KEY no está configurada");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Error de configuración del servidor" })
            };
        }

        // Configurar el payload para Brevo
        const emailData = {
            sender: {
                name: "Gustavo Franco Arquitectos",
                email: "hola@gustavofranco.cl"
            },
            to: [
                {
                    email: email,
                    name: name
                }
            ],
            subject: "Su Diagnóstico de Inversión Inmobiliaria",
            htmlContent: htmlReport
        };

        // Enviar email a través de la API de Brevo
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify(emailData)
        });

        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            const errorData = await response.text();
            console.error('Error de Brevo:', response.status, errorData);
            
            return {
                statusCode: response.status,
                body: JSON.stringify({ 
                    error: `Error al enviar email: ${response.status}`,
                    details: errorData
                })
            };
        }

        const result = await response.json();
        console.log('Email enviado exitosamente:', result);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ 
                message: "Email enviado exitosamente",
                messageId: result.messageId 
            })
        };

    } catch (error) {
        console.error("Error en send-report:", error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: "Error interno del servidor",
                details: error.message 
            })
        };
    }
};
