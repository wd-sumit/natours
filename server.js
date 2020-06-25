/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('Uncaught Exception! Shutting down...');
    console.log(err);
    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE_URL.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => { console.log('Connected to Database') });

// Start Server
const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log('Listening to the server');
});

process.on('unhandledRejection', err => {
    console.log('name:', err.name, 'message:', err.message);
    console.log('Unhandled Rejection! Shutting down...');
    server.close(() => {
        process.exit(1);
    });
});


