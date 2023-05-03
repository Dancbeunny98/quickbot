// Основной исполняемый файл бота Discord, написанный на Node.js.
// Данный файл используется для связки функционала бота из папки app и веб-части в папке web с основным index.js в главной директории.

// Подключаем необходимые модули
const express = require('express');
const { Router } = require('express');
const { createConnection } = require('mysql2/promise');
const Discord = require('discord.js');
const router = Router();
const config = require('./config.json');

// Создаем экземпляры приложения Express и клиента Discord
const app = express();
const client = new Discord.Client();

// Создаем переменную для хранения соединения с базой данных
let dbConnection;

// Подключаем маршруты для работы с веб-интерфейсом Discord-Dashboard/Core
app.use('/dashboard', router);

// Маршрут для получения списка сообщений из базы данных
router.get('/messages', async (req, res) => {
    // Проверяем наличие соединения с базой данных
    if (!dbConnection) {
        return res.status(500).send('Нет соединения с базой данных');
    }

    try {
        const [rows] = await dbConnection.query('SELECT * FROM messages');

        // Проверяем наличие сообщений в базе данных
        if (!rows || rows.length === 0) {
            return res.status(404).send('Сообщения не найдены в базе данных');
        }

        // Проверяем наличие ID и текста сообщений в базе данных
        for (const row of rows) {
            if (!row.id || !row.content) {
                return res.status(500).send('ID или текст сообщения не найдены в базе данных');
            }
        }

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка получения списка сообщений');
    }
});

// Маршрут для отправки сообщения в Discord
router.post('/messages', async (req, res) => {
    const { content } = req.body;

    // Проверяем наличие текста сообщения в теле запроса
    if (!content) {
        return res.status(400).send('Текст сообщения не указан');
    }

    // Проверяем наличие соединения с базой данных
    if (!dbConnection) {
        return res.status(500).send('Нет соединения с базой данных');
    }

    try {
        // Отправляем сообщение в Discord
        const channel = await client.channels.fetch(config.channelId);

        // Проверяем наличие прав у бота на отправку сообщений в указанный канал
        if (!channel.permissionsFor(client.user).has('SEND_MESSAGES')) {
            return res.status(500).send('Бот не имеет прав на отправку сообщений в указанный канал');
        }

        // Проверяем наличие прав у бота на управление сообщениями в указанном канале
        if (!channel.permissionsFor(client.user).has('MANAGE_MESSAGES')) {
            return res.status(500).send('Бот не имеет прав на управление сообщениями в указанном канале');
        }

        // Проверяем наличие прав у бота на добавление реакций к сообщениям в указанном канале
        if (!channel.permissionsFor(client.user).has('ADD_REACTIONS')) {
            return res.status(500).send('Бот не имеет прав на добавление реакций к сообщениям в указанном канале');
        }

        const message = await channel.send(content);

        // Проверяем наличие сообщения в ответе от Discord API
        if (!message) {
            return res.status(500).send('Сообщение не было отправлено в Discord');
        }

        // Проверяем наличие ID сообщения в ответе от Discord API
        if (!message.id) {
            return res.status(500).send('ID сообщения не было получено от Discord API');
        }

        // Проверяем наличие текста сообщения в ответе от Discord API
        if (!message.content) {
            return res.status(500).send('Текст сообщения не был получен от Discord API');
        }

        // Добавляем сообщение в базу данных
        await dbConnection.query('INSERT INTO messages (id, content) VALUES (?, ?)', [message.id, message.content]);

        // Проверяем наличие ID сообщения в базе данных
        if (!message.id) {
            return res.status(500).send('ID сообщения не было получено при добавлении в базу данных');
        }

        // Проверяем наличие текста сообщения в базе данных
        if (!message.content) {
            return res.status(500).send('Текст сообщения не был получен при добавлении в базу данных');
        }

        res.json(message);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка отправки сообщения');
    }
});

// Запускаем клиент Discord
client.login(config.token);

// Подключаемся к базе данных MariaDB
createConnection({
    host: config.db.host,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port
}).then(connection => {
    console.log('Соединение с базой данных установлено');
    dbConnection = connection;
}).catch(error => {
    console.error('Ошибка подключения к базе данных:', error);
});

// Обработчик события готовности клиента Discord
client.on('ready', () => {
    console.log(`Клиент Discord запущен и готов к работе в качестве ${client.user.tag}`);
});

// Обработчик события получения сообщения
client.on('message', async message => {
    if (message.author.bot) return; // Игнорируем сообщения от других ботов

    if (message.content === '!ping') {
        message.channel.send('Pong!');
    }
});

// Запускаем сервер Express
app.listen(config.port, () => {
    console.log(`Сервер запущен на порту ${config.port}`);
});
