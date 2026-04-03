const express = require('express');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const users = new Map(); // familyCode → { role, socket }

io.on('connection', (socket) => {
  console.log('Клиент подключился:', socket.id);

  socket.on('register-child', (data) => {
    users.set(data.familyCode, { role: 'CHILD', socket });
    console.log(`Ребёнок зарегистрирован с кодом: ${data.familyCode}`);
  });

  socket.on('register-parent', (data) => {
    users.set(data.familyCode, { role: 'PARENT', socket });
    console.log(`Родитель зарегистрирован с кодом: ${data.familyCode}`);
  });

  socket.on('location-response', (data) => {
    // Отправляем локацию всем родителям с этим кодом семьи
    for (let [code, user] of users) {
      if (user.role === 'PARENT' && code === data.familyCode) {
        user.socket.emit('location-response', data);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Клиент отключился');
  });
});

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO сервер запущен на порту ${PORT}`);
});
