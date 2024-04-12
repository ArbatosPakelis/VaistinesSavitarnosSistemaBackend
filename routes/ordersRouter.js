const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/getOrder/:id', orderController.getOrder);
router.get('/getAllOrders/:id', orderController.getAllOrders);
router.get('/getProductList/:id', orderController.getProductList);
module.exports = router;