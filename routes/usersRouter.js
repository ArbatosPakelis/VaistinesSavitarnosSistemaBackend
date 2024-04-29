const express = require('express');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.post('/register', usersController.addUser);
router.post('/login', usersController.login);
router.post('/logout', usersController.logout); 
router.post('/tokens', usersController.renewTokens);
router.get('/getAllAccounts', usersController.getAllAccounts);
router.get('/getAccountSettings', usersController.getAccountSettings);
router.put('/updateAccount', usersController.updateAccount);
router.delete('/deleteAccount/:id', usersController.deleteAccount);
module.exports = router;