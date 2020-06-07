const io = require('socket.io');

const port = 8888;
const server = io.listen(port);

class User {
    constructor(nickname, socketId) {
        this.nickname = nickname;
        this.socketId = socketId;
    }
}

const users = new Map();

server.on('connection', socket => {
    console.log('New connection: ', socket.id);

    socket.on('message', message => {
        if (users.has(socket.id)) {
            server.emit('message', `${users.get(socket.id).nickname}: ${message}`);
        }
    });

    socket.on('login', nickname => {
        const activeUsers = []
        users.forEach(user => {
            activeUsers.push(user.nickname);
        });
        socket.emit('loggedIn', activeUsers);
        users.set(socket.id, new User(nickname, socket.id));
        server.emit('userConnected', nickname);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected: ', socket.id);
        if (users.has(socket.id)) {
            socket.broadcast.emit('userDisconnected', users.get(socket.id).nickname);
            users.delete(socket.id);
        }
    });
});
