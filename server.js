const Comment = require('./models/comment')
const express = require('express');
const dbConnect = require('./db')
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static('public'));
dbConnect();
app.use(express.json())

// Routes
app.post('/api/comments', (req, res) => {
    const comment = new Comment({
        username: req.body.userName,
        comment: req.body.comment
    })
    comment.save().then(response => {
        res.send(response)
    })
})

app.get('/api/comments', (req, res) => {
    Comment.find().then(function (comments) {
        res.send(comments)
    })
})

const server = app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

let io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log(`New connection ${socket.id}`);
    // Receive Event
    socket.on('comment', (data) => {
        console.log(data);
        data.time = Date();
        // {username: 'name', comment: 'comment', time:'time'}
        socket.broadcast.emit('comment', data);
    })

    // Typing...
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    })
});