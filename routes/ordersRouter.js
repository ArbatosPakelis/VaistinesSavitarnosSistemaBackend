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
router.post('/paymentCompletion/:id/:success', orderController.paymentCompletion);
router.post('/utilityOrder/:id', orderController.utilityOrder);
router.get('/checkValidity/:id', orderController.checkValidity);
router.post('/calcelOrder/:id', orderController.calcelOrder);
router.post('/applyDiscounts/:id', orderController.applyDiscounts);
router.put('/updateOrder/:id/:state', orderController.updateOrder);
router.post('/addPrescriptions/:id', orderController.addPrescriptions);
router.put('/updateLimit/:id/:limit', orderController.updateLimit);
router.post('/resupply', orderController.resupply);
module.exports = router;