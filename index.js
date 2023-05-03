//Основной исполняемый файл проекта Discord написанный на node.js.
//Данный Файл используется для связки функционала бота, таких как ready в app/events/ файле ready.js, команды в папке app/commands/ и остальной функционал в папке app, а веб-часть в папке web.
//Про Управление настройками написано в config.json и app/database/database.js
// index.js

const { Client } = require('discord.js');
const config = require('./config.json');
const app = require('./app');

const client = new Client();

client.login(config.token);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', (message) => {
    if (message.content === 'ping') {
        message.reply('Pong!');
    }
});

app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});