const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app); 
const io = socketIo(server); 

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const dbUrl = "mongodb+srv://tayyab:admin@chatapptest.q4w2a.mongodb.net/chatAppTest?retryWrites=true&w=majority";

// Define Mongoose Model 
const Message = mongoose.model("Message", {
    name: String,
    message: String
});

app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find(); // Fetch messages from MongoDB
        res.send(messages);
    } catch (error) {
        res.status(500).send("Error retrieving messages");
    }
});

app.post('/messages', async (req, res) => {
    try {
        const message = new Message(req.body);
        await message.save(); // Save to MongoDB

        const censored = await Message.findOne({ message: "badword" });

        if (censored) {
            console.log("Censored words found:", censored);
            await Message.deleteOne({ _id: censored.id });
            console.log("Removed censored message");
            return res.status(400).send("Inappropriate content removed")
        }

        io.emit('message', req.body); // Broadcast message using WebSockets
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

    // MongoDB Connection Handling
    mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("✅ MongoDB connected successfully");
    }).catch((error) => {
        console.error("❌ MongoDB connection error:", error);
    });

    // Server Listening
    server.listen(3000, () => {
        console.log("Server is listening on port", server.address().port);
    });

    // Handle WebSocket connections
    io.on('connection', (socket) => {
        console.log("A user connected");
        socket.on('disconnect', () => {
            console.log("A user disconnected");
        });
    });
