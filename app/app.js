//Основной исполняемый файл бота Discord написанный на node.js.
//Данный Файл используется для связки функционала бота из папки app и веб-части в папке web с основным index,js в главной дирректории

// app.js

const express = require('express');
const { Router } = require('express');
const { Message } = require('discord.js');
const router = Router();

const app = express();

app.use('/dashboard', router);

router.get('/messages', (req, res) => {
    res.send('Get messages');
});

router.post('/messages', (req, res) => {
    res.send('Post message');
});

module.exports = app;