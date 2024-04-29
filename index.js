const app = require('./app.js');
const db = require("./models");

const { Sequelize } = require('sequelize');
const config = require("./config/config.json");
const sequelize = new Sequelize(config.development);

db.sequelize.sync().then(() => {
    console.log('Tables created successfully!');
 }).catch((error) => {
    console.error('Unable to create tables : ', error);
 });

const PORT = process.env.PORT || 5000;
console.log('Creating port');
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});