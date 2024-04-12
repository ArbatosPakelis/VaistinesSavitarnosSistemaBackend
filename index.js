const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
const db = require("./models");
const usersRouter = require("./routes/usersRouter");
const orderRouter = require("./routes/ordersRouter");

const allowedOrigin = 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

const { Sequelize } = require('sequelize');
const config = require("./config/config.json");
const sequelize = new Sequelize(config.development);

db.sequelize.sync().then(() => {
    console.log('Tables created successfully!');
 }).catch((error) => {
    console.error('Unable to create tables : ', error);
 });

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/', (req, res) => {
    res.json({"message":"your API works !"});
});


const PORT = process.env.PORT || 5000;
console.log('Creating port');
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});