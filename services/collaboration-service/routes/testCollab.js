import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const testRouter = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

testRouter.use(express.json())

testRouter.get('/redirect', (req, res) => {
    res.send('Welcome to the Collab space');
});

testRouter.post('/redirect', (req, res) => {
    const {roomId, userId, questionId} = req.body
    res.status(200).json({message: 'Verification complete. Allow entry. ' ,
                            roomId : roomId, 
                            userId : userId,
                            questionId:questionId})
})

testRouter.get('/:roomid', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

export default testRouter