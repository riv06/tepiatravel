// Test de registro directo
const testRegistration = async () => {
    try {
        console.log('🧪 Probando registro...');

        const response = await fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName: 'Usuario Test',
                email: `test${Date.now()}@example.com`,
                password: 'password123'
            })
        });

        console.log('📥 Status:', response.status);
        const data = await response.json();
        console.log('📦 Data:', data);

        if (response.ok) {
            console.log('✅ REGISTRO EXITOSO!');
        } else {
            console.log('❌ ERROR:', data.error);
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
};

testRegistration();
