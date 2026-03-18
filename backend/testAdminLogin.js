
const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/admin-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@school.com',
                password: 'adminpassword123'
            })
        });

        const data = await response.json();

    } catch (error) {
}
};

testLogin();
