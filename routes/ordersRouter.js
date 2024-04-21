const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/getOrder/:id', orderController.getOrder);
router.get('/getAllOrders/:id', orderController.getAllOrders);
router.get('/getProductList/:id', orderController.getProductList);
router.post('/calibrate/:id', orderController.calibrate);
router.post('/addProduct/:id/:basketId', orderController.addProduct);
router.delete('/deleteProduct/:id', orderController.deleteProduct);
router.put('/updateProductAmount/:id/:operation', orderController.updateProductAmount);
router.post('/payment/:id', orderController.payment);
router.post('/paymentCompletion/:id', orderController.paymentCompletion);
module.exports = router;