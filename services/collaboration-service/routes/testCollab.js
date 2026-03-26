const express = require('express');
const testRouter = express.Router();
const path = require('path');

testRouter.use(express.json())

testRouter.get('/:roomid', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

module.exports = testRouter;