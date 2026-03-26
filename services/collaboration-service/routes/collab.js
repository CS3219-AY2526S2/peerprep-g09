const express = require('express');
const router = express.Router();
const path = require('path');
const roomGuard = require('../middleware/roomGuard');

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

module.exports = router;