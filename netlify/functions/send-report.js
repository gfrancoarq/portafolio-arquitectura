// Función 2: Ahora usa una Plantilla Transaccional de Brevo.
exports.handler = async function(event) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    const { name, email, htmlReport } = JSON.parse(event.body);
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    // **IMPORTANTE**: Reemplace el '0' con el ID de su nueva plantilla.
    const TEMPLATE_ID = 0; 

    try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': BREVO_API_KEY },
            body: JSON.stringify({
                to: [{ email: email, name: name }],
                templateId: TEMPLATE_ID,
                params: {
                    "NOMBRE": name,
                    "CUERPO_DEL_REPORTE": htmlReport
                }
            })
        });
        return { statusCode: 200, body: JSON.stringify({ message: "Email enviado" }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Error al enviar email.' }) };
    }
};
