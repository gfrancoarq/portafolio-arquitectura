// netlify/functions/send-report.js
exports.handler = async function(event) {
    // 1. Validar el método de la petición
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ error: "Método no permitido" }) };
    }

    try {
        // 2. Parsear los datos del cuerpo de la petición
        const { name, email, htmlReport } = JSON.parse(event.body);

        // 3. Validar que los datos necesarios están presentes
        if (!name || !email || !htmlReport) {
            console.error("Faltan datos en la petición:", { name, email, htmlReport: !!htmlReport });
            return { statusCode: 400, body: JSON.stringify({ error: "Faltan datos en la petición" }) };
        }

        // 4. Obtener la clave API de forma segura
        const BREVO_API_KEY = process.env.BREVO_API_KEY;
        if (!BREVO_API_KEY) {
            console.error("CRITICAL: BREVO_API_KEY no está configurada en las variables de entorno de Netlify.");
            return { statusCode: 500, body: JSON.stringify({ error: "Error de configuración del servidor." }) };
        }

        // 5. Construir el payload para la API de Brevo
        const emailPayload = {
            sender: { name: 'Arq. Gustavo Franco', email: 'hola@gustavofranco.cl' },
            to: [{ email: email, name: name }],
            subject: 'Su Diagnóstico de Inversión Inmobiliaria',
            htmlContent: htmlReport
        };

        // 6. Realizar la llamada a la API de Brevo
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify(emailPayload)
        });

        // 7. Manejar la respuesta de la API de Brevo
        if (!response.ok) {
            const errorBody = await response.json().catch(() => response.text());
            console.error("Error desde la API de Brevo:", errorBody);
            return { statusCode: response.status, body: JSON.stringify({ error: "Error al comunicarse con el servicio de email.", details: errorBody }) };
        }

        // 8. Si todo es exitoso, devolver una respuesta positiva
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Email enviado con éxito." })
        };

    } catch (error) {
        // 9. Manejar cualquier otro error inesperado
        console.error("Error inesperado en la función send-report:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error interno del servidor." })
        };
    }
};
