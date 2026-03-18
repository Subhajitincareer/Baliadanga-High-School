import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 10, // ১০ জন ভার্চুয়াল ইউজার
  duration: '30s', // ৩০ সেকেন্ড ধরে চলবে
};

export default function () {
  http.get('http://localhost:5000/api/auth/subhajit@test.com'); // আপনার API
  sleep(1);
}