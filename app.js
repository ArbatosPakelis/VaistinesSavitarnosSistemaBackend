const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
const usersRouter = require("./routes/usersRouter");
const orderRouter = require("./routes/ordersRouter");
const allowedOrigin = 'https://auto-pharma-frontend-ce37c0f84f86.herokuapp.com';
// const allowedOrigin = 'http://localhost:3000';
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
}));

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/', (req, res) => {
    res.status(400).json({"message":"your API works !"});
});

module.exports = app;