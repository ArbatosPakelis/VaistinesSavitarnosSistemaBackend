const {orders, order_products, product_cards, prescriptions, confirmations, remaining_goods} = require("../models");
const catchAsync = require("../utils/catchAsync");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const auth = require('./authenticationController');



exports.getOrder = catchAsync(async (req, res, next) => {
    auth.authenticateAccessToken(req, res, next);
    if(req.error !== undefined) return res.status(req.error).json({"message": "token expired or invalid"});

    const userT = req.user;
    if(userT === undefined)
    {
        return res.status(401).json({"message": "token expired"}).send();
    }
    if(userT.role != 1 && userT.role != 2 ||
      Date.now() >= new Date(userT.expire))
    {
        return res.status(401).json({"message": "user invalid"}).send();
    }
    

    const {id} = req.params;
    const order = await orders.findOne({ where: { id: id}});

    if (!order)
    {
        res.status(404).json({
            "message":"order doesn't exist"
        }).send();
    }

    // not your order and you're not an employee
    if(order.users_fk !== undefined && order.users_fk !== userT.sub && userT.role != 2)
    {
        res.status(401).json({
            "message":"can't access not your own orders"
        }).send();
    }

    // products from the order
    const products = await order_products.findAll({ where: {orders_fk:id}})
    
    let cards = [];
    for(const product of products){
        const hold = await product_cards.findOne({ where: {id:product.product_cards_fk}})
        cards.push(hold);
    };
  
    res.status(200).json({
      order: order,
      order_products: products,
      product_cards: cards
    });
});


exports.getAllOrders = catchAsync(async (req, res, next) => {
    auth.authenticateAccessToken(req, res, next);
    if(req.error !== undefined) return res.status(req.error).json({"message": "token expired or invalid"});

    const userT = req.user;
    if(userT === undefined)
    {
        return res.status(401).json({"message": "token expired"}).send();
    }
    if(userT.role != 2 || Date.now() >= new Date(userT.expire))
    {
        return res.status(401).json({"message": "user invalid"}).send();
    }

    const {id} = req.params;
    const orderList = await orders.findAll({ where: { adresses_fk: id}});
    if (!orderList || Array.isArray(orderList) && orderList.length < 1)
    {
        res.status(404).json({
            "message":"this location doesn't have any orders yet"
        }).send();
    }

    res.status(200).json({
        orders:orderList
    }).send();
});

exports.getProductList = catchAsync(async (req, res, next) => {
    auth.authenticateAccessToken(req, res, next);
    if(req.error !== undefined) return res.status(req.error).json({"message": "token expired or invalid"});

    const userT = req.user;
    if(userT === undefined)
    {
        return res.status(401).json({"message": "token expired"}).send();
    }
    if(userT.role != 1 && userT.role != 2 ||
      Date.now() >= new Date(userT.expire))
    {
        return res.status(401).json({"message": "user invalid"}).send();
    }

    const {id} = req.params;
    const goods = await remaining_goods.findAll({ where: { adresses_fk: id}});
    
    let cards = [];
    for(const good of goods){
        const hold = await product_cards.findOne({ where: {id:good.product_cards_fk}})
        cards.push(hold);
    };


    res.status(200).json({
        remaining_goods:goods,
        product_cards:cards
    }).send();
});
