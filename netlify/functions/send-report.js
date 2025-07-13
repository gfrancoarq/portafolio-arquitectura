// netlify/functions/send-report.js
exports.handler = async function(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ error: "Método no permitido" }) };
    }

    try {
        const { name, email, htmlReport } = JSON.parse(event.body);

        if (!name || !email || !htmlReport) {
            return { statusCode: 400, body: JSON.stringify({ error: "Faltan datos en la petición" }) };
        }

        const BREVO_API_KEY = process.env.BREVO_API_KEY;
        if (!BREVO_API_KEY) {
            console.error("CRITICAL: BREVO_API_KEY no está configurada en las variables de entorno de Netlify.");
            return { statusCode: 500, body: JSON.stringify({ error: "Error de configuración del servidor." }) };
        }

        const emailPayload = {
            sender: { name: 'Arq. Gustavo Franco', email: 'hola@gustavofranco.cl' },
            to: [{ email: email, name: name }],
            subject: 'Su Diagnóstico de Inversión Inmobiliaria',
            htmlContent: htmlReport
        };

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify(emailPayload)
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => response.text());
            console.error("Error desde la API de Brevo:", errorBody);
            return { statusCode: response.status, body: JSON.stringify({ error: "Error al comunicarse con el servicio de email.", details: errorBody }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Email enviado con éxito." })
        };

    } catch (error) {
        console.error("Error inesperado en la función send-report:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error interno del servidor." })
        };
    }
};
