
const testLogin = async () => {
    try {
const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' })
        });
const data = await response.json();
if (response.status === 401) {
} else {
}

    } catch (error) {
}
};

testLogin();
