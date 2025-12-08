
const testLogin = async () => {
    try {
        console.log('Testing Login Endpoint...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' })
        });

        console.log(`Response Status: ${response.status}`);
        const data = await response.json();
        console.log('Response Data:', data);

        if (response.status === 401) {
            console.log('SUCCESS: Server is reachable and handled auth correctly (401 Expected).');
        } else {
            console.log('WARNING: Unexpected status code.');
        }

    } catch (error) {
        console.error('FAILED TO FETCH:', error);
    }
};

testLogin();
