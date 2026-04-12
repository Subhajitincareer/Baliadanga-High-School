import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 10,
    duration: '30s',
};

export default function () {
    const url = 'http://localhost:5000/api/auth/register'; // আপনার সঠিক রুট
    const payload = JSON.stringify({
        name: 'Test User',
        email: `test${Math.random()}@example.com`, // প্রতিবার ইউনিক ইমেইল যাতে "User already exists" না দেখায়
        password: 'password123',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(url, payload, params); // GET এর বদলে POST ব্যবহার করুন

    check(res, {
        'is status 201 or 200': (r) => r.status === 201 || r.status === 200,
    });

    sleep(1);
}