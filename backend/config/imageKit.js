import ImageKit from 'imagekit';
import dotenv from 'dotenv';

dotenv.config();

const initImageKit = () => {
    if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
        console.log('✅ ImageKit configured with environment variables.');
        return new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        });
    } else {
        console.error('❌ CRITICAL: ImageKit environment variables are MISSING.');
        console.error('Please add IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT to backend/.env');

        // Return an object that throws helpful errors when methods are called
        return {
            upload: async () => {
                throw new Error('UPLOAD FAILED: ImageKit keys are missing in backend/.env. Please add them to save real files.');
            },
            deleteFile: async () => {
                throw new Error('DELETE FAILED: ImageKit keys are missing in backend/.env.');
            }
        };
    }
};

const imagekit = initImageKit();

export default imagekit;
