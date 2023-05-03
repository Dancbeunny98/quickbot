//Основной исполняемый файл бота Discord написанный на node.js.
//Данный Файл используется для связки функционала бота из папки app и веб-части в папке web с основным index,js в главной дирректории

// app.js

const express = require('express');
const { Router } = require('express');
const { createConnection } = require('mysql2/promise');
const router = Router();
const config = require('./config.json');

const app = express();

// Создаем подключение к базе данных MariaDB
const dbConnection = await createConnection({
    host: config.db.host,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port
});

// Подключаем маршруты для работы с веб-интерфейсом Discord-Dashboard/Core
app.use('/dashboard', router);

// Маршрут для получения списка сообщений из базы данных
router.get('/messages', async (req, res) => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM messages');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка получения списка сообщений');
    }
});

// Маршрут для отправки сообщения в Discord
router.post('/messages', async (req, res) => {
    const { content } = req.body;

    try {
        // Отправляем сообщение в Discord
        const channel = await client.channels.fetch(config.channelId);
        const message = await channel.send(content);

        // Добавляем сообщение в базу данных
        await dbConnection.query('INSERT INTO messages (id, content) VALUES (?, ?)', [message.id, message.content]);
        res.json(message);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка отправки сообщения');
    }
});

module.exports = app;