//Основной исполняемый файл всего проекта Discord написанный на node.js.
//Данный Файл используется для связки функционала бота в папке app и веб-части в папке web.

// index.js

const { Client } = require('discord.js');
const { createConnection } = require('mysql2/promise');
const app = require('./app');
const config = require('./config.json');

// Создаем подключение к базе данных MariaDB
const dbConnection = await createConnection({
    host: config.db.host,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port
});

// Создаем экземпляр Discord-клиента
const client = new Client();

// Передаем объект подключения к базе данных в приложение
app.set('dbConnection', dbConnection);

// Подключаемся к Discord API
client.login(config.token);

// Обработчик события готовности бота
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Обработчик события получения сообщения
client.on('message', async (message) => {
    // Проверяем, что сообщение не от бота и начинается с префикса команд (!)
    if (!message.author.bot && message.content.startsWith(config.prefix)) {
        const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        // Ищем файл команды в папке commands
        try {
            const commandFile = require(`./commands/${command}.js`);
            // Выполняем команду, передавая ей аргументы и объект сообщения
            await commandFile.run(client, message, args);
        } catch (err) {
            console.error(err);
            message.reply('Ошибка выполнения команды');
        }
    }
});