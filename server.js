const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-call', () => {
    // Notify all users about the new user
    socket.broadcast.emit('user-joined', socket.id);

    // Send the list of all users to the new user
    const users = Array.from(io.sockets.sockets.keys()).filter(id => id !== socket.id);
    socket.emit('all-users', users);
  });

  socket.on('offer', (data) => {
    io.to(data.to).emit('offer', { from: socket.id, offer: data.offer });
  });

  socket.on('answer', (data) => {
    io.to(data.to).emit('answer', { from: socket.id, answer: data.answer });
  });

  socket.on('ice-candidate', (data) => {
    io.to(data.to).emit('ice-candidate', { from: socket.id, candidate: data.candidate });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    socket.broadcast.emit('user-disconnected', socket.id);
  });
});

server.listen(3000, '0.0.0.0', () => {
  console.log("Server running on http://0.0.0.0:3000");
});
