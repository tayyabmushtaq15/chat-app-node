const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

var app = express();
var server = http.createServer(app); // ✅ FIX: Create HTTP server correctly
var io = socketIo(server); // ✅ FIX: Pass `server` to `socket.io`

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const dbUrl = "mongodb+srv://tayyab:admin@chatapptest.q4w2a.mongodb.net/chatAppTest?retryWrites=true&w=majority";
//mongodb+srv://tayyab:<db_password>@chatapptest.q4w2a.mongodb.net/?retryWrites=true&w=majority&appName=chatAppTest

var messages = [
    { name: 'Tayyab', message: 'Hello' },
    { name: 'Halen', message: 'Hi, How are you' }
];

app.get('/messages', (req, res) => {
    res.send(messages);
});

app.post('/messages', (req, res) => {
    console.log(req.body);
    messages.push(req.body);
    io.emit('message', req.body); // ✅ Broadcast message using WebSockets
    res.sendStatus(200);
});

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ MongoDB connected successfully");
}).catch((error) => {
    console.error("❌ MongoDB connection error:", error);
});


// ✅ FIX: Use `server.listen()` instead of `http.listen()`
server.listen(3000, () => {
    console.log("Server is listening on port", server.address().port);
});

// ✅ Handle WebSocket connections
io.on('connection', (socket) => {
    console.log("A user connected");
    socket.on('disconnect', () => {
        console.log("A user disconnected");
    });
});
