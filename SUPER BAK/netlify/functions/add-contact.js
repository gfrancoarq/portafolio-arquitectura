// Función 1: Su única misión es añadir un contacto a la lista.
exports.handler = async function(event) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    const { name, email } = JSON.parse(event.body);
    const LIST_ID = 3; 
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    try {
        await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': BREVO_API_KEY },
            body: JSON.stringify({ email: email, attributes: { 'NOMBRE': name }, listIds: [LIST_ID] })
        });
        return { statusCode: 200, body: JSON.stringify({ message: "Contacto agregado" }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Error al agregar contacto.' }) };
    }
};
