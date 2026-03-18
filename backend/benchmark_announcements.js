import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
const mongoURI = process.env.MONGO_URI;

const announcementSchema = new mongoose.Schema({
    title: String,
    content: String,
    attachments: [{
        filename: String,
        url: String, // Might contain base64
        size: Number,
        mimetype: String
    }],
    pdf_url: mongoose.Schema.Types.Mixed,
    pdfFile: mongoose.Schema.Types.Mixed
}, { strict: false });

async function benchmark() {
    try {
        await mongoose.connect(mongoURI);
const Announcement = mongoose.model('Announcement', announcementSchema);
        
        // 1. Total count
const count = await Announcement.countDocuments({ isActive: true });


        // 2. Fetch all raw timing
const all = await Announcement.find({ isActive: true }).sort({ createdAt: -1 }).lean();
// 3. Payload size
        const payloadStr = JSON.stringify(all);
        const payloadMb = (Buffer.byteLength(payloadStr, 'utf8') / (1024 * 1024)).toFixed(2);
// 4. Sample largest documents
        all.sort((a, b) => Buffer.byteLength(JSON.stringify(b)) - Buffer.byteLength(JSON.stringify(a)));
for (let i = 0; i < Math.min(3, all.length); i++) {
            const doc = all[i];
            const sizeKb = (Buffer.byteLength(JSON.stringify(doc)) / 1024).toFixed(2);
// Check for large strings
            if (doc.attachments && doc.attachments.length > 0) {
}
            if (doc.pdf_url) {
}
            if (doc.content) {
}
        }

        await mongoose.disconnect();
    } catch (err) {
}
}

benchmark();
