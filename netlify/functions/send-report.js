// Función 2: Su única misión es enviar el email transaccional con el reporte.
exports.handler = async function(event) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    const { name, email, htmlReport } = JSON.parse(event.body);
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': BREVO_API_KEY },
            body: JSON.stringify({
                sender: { name: 'Gustavo Franco', email: 'hola@gustavofranco.cl' },
                to: [{ email: email, name: name }],
                subject: 'Su Diagnóstico de Inversión Inmobiliaria',
                htmlContent: htmlReport
            })
        });
        return { statusCode: 200, body: JSON.stringify({ message: "Email enviado" }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Error al enviar email.' }) };
    }
};
