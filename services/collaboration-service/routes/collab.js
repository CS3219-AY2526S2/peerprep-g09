import express from 'express'
import path from 'path'
import roomGuard from '../middleware/roomGuard.js';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.json())

router.get('/redirect', (req, res) => {
    res.send('Welcome to the Collab space');
});

router.post('/redirect', roomGuard, (req, res) => {
    res.status(200).json({message: 'Verification complete. Allow entry. ' ,
                            roomId : roomId, 
                            userId : userId})
})

router.get('/:roomid', roomGuard, (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

export default router