const express = require('express');
const router = express.Router();
const path = require('path');

router.use(express.json())

router.get('/', (req, res) => {
    res.send('Welcome to the Collab space');
});

router.get('/:roomid', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

module.exports = router;