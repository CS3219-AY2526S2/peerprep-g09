const express = require('express')
const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.send('This is the collab service')
})

app.get('/collab/:roomid', (req, res) => {
    const roomid = req.params.roomid
    res.send('This is the room id' + roomid)
})

const PORT = process.env.PORT || 5008

app.listen(PORT, ()=> {
    console.log('Server listening to port ' + PORT)
})