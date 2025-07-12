// Esta es nuestra función segura que se ejecuta en el servidor.
exports.handler = async function(event, context) {
    // Solo permitimos que se llame a esta función con el método POST.
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Obtenemos los datos que nos envía el formulario del frontend.
    const { name, email, htmlContent } = JSON.parse(event.body);
    const contactListId = 3; // El ID de su lista en Brevo.

    // Obtenemos la clave API de forma segura desde las variables de entorno del servidor.
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    try {
        // 1. Agregar el contacto a la lista en Brevo.
        await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                email: email,
                attributes: { 'NOMBRE': name },
                listIds: [contactListId]
            })
        });

        // 2. Enviar el email transaccional con el reporte personalizado.
        await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: { name: 'Gustavo Franco', email: 'hola@gustavofranco.cl' },
                to: [{ email: email, name: name }],
                subject: 'Su Diagnóstico de Inversión Inmobiliaria',
                htmlContent: htmlContent
            })
        });

        // Si todo sale bien, devolvemos un mensaje de éxito.
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Email enviado y contacto agregado con éxito" })
        };

    } catch (error) {
        // Si algo falla, devolvemos un error.
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Hubo un error al procesar la solicitud.' })
        };
    }
};
