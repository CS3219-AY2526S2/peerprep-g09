import express from 'express'
import path from 'path'
import roomGuard from '../middleware/roomGuard.js';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.json())

router.get('/:roomid', roomGuard, (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

export default router
