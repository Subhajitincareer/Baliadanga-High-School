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
        console.log('Connected to Database');
        
        const Announcement = mongoose.model('Announcement', announcementSchema);
        
        // 1. Total count
        console.time('Count Query Time');
        const count = await Announcement.countDocuments({ isActive: true });
        console.timeEnd('Count Query Time');
        console.log(`Total Active Announcements: ${count}`);

        // 2. Fetch all raw timing
        console.time('Fetch All Query Time');
        const all = await Announcement.find({ isActive: true }).sort({ createdAt: -1 }).lean();
        console.timeEnd('Fetch All Query Time');
        
        // 3. Payload size
        const payloadStr = JSON.stringify(all);
        const payloadMb = (Buffer.byteLength(payloadStr, 'utf8') / (1024 * 1024)).toFixed(2);
        console.log(`Payload Size: ${payloadMb} MB`);

        // 4. Sample largest documents
        all.sort((a, b) => Buffer.byteLength(JSON.stringify(b)) - Buffer.byteLength(JSON.stringify(a)));
        console.log('\nTop 3 Largest Announcements:');
        for (let i = 0; i < Math.min(3, all.length); i++) {
            const doc = all[i];
            const sizeKb = (Buffer.byteLength(JSON.stringify(doc)) / 1024).toFixed(2);
            console.log(`- Title: "${doc.title}", Size: ${sizeKb} KB`);
            // Check for large strings
            if (doc.attachments && doc.attachments.length > 0) {
                console.log(`  Attachments URL length: ${doc.attachments[0].url ? doc.attachments[0].url.length : 0} chars`);
            }
            if (doc.pdf_url) {
                 console.log(`  pdf_url length: ${typeof doc.pdf_url === 'string' ? doc.pdf_url.length : JSON.stringify(doc.pdf_url).length} chars`);
            }
            if (doc.content) {
                console.log(`  Content length: ${doc.content.length} chars`);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

benchmark();
