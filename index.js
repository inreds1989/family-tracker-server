const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

console.log("✅ Socket.IO сервер запущен");

io.on('connection', (socket) => {
    console.log(`🔌 Клиент подключился: ${socket.id}`);

    // Регистрация родителя
    socket.on('register-parent', (data) => {
        const { familyCode } = data;
        if (!familyCode) return;

        socket.join(familyCode);
        console.log(`👨 Родитель присоединился к комнате: ${familyCode}`);
    });

    // Регистрация ребёнка
    socket.on('register-child', (data) => {
        const { familyCode } = data;
        if (!familyCode) return;

        socket.join(familyCode);
        console.log(`👦 Ребёнок присоединился к комнате: ${familyCode}`);
    });

    // Получение локации от ребёнка и отправка всем в комнате (включая родителей)
    socket.on('location-response', (data) => {
        const { familyCode, latitude, longitude, accuracy, role } = data;

        if (!familyCode || role !== "CHILD") return;

        console.log(`📍 Получена локация от ребёнка (${familyCode}): ${latitude}, ${longitude}`);

        // Отправляем локацию всем участникам комнаты (родителям)
        io.to(familyCode).emit('location-response', {
            familyCode,
            latitude,
            longitude,
            accuracy: accuracy || 0,
            timestamp: Date.now()
        });
    });

    socket.on('disconnect', () => {
        console.log(`❌ Клиент отключился: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
