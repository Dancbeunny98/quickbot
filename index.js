//Основной исполняемый файл всего проекта Discord написанный на node.js.
//Данный Файл используется для связки функционала бота в папке app и веб-части в папке web.

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