const {orders, order_products, product_cards, prescriptions, confirmations, remaining_goods, users} = require("../models");
const catchAsync = require("../utils/catchAsync");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const auth = require('./authenticationController');
const axios = require("axios");


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
    const checkoutList = await users.findAll({ where: { user_types_fk: 1, adresses_fk: id}});
    if (!orderList || Array.isArray(orderList) && orderList.length < 1)
    {
        return res.status(404).json({
            "message":"this location doesn't have any orders yet"
        }).send();
    }

    if (!checkoutList || Array.isArray(checkoutList) && checkoutList.length < 1)
    {
        return res.status(404).json({
            "message":"this location doesn't have any checkouts added yet"
        }).send();
    }

    res.status(200).json({
        orders:orderList,
        checkouts:checkoutList
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

exports.calibrate = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    auth.authenticateAccessToken(req, res, next);
    if(req.error !== undefined) return res.status(req.error).json({"message": "token expired or invalid"});

    const userT = req.user;

    if(userT === undefined)
    {
        return res.status(401).json({"message": "token expired"}).send();
    }

    if(userT.role !== 2 || id != userT.location ||
      Date.now() >= new Date(userT.expire))
    {
        return res.status(401).json({"message": "user invalid"}).send();
    }

    const response = await axios.get(
        `http://localhost:5001/api/v1/getContent`
    );
    const cards = response.data.product_cards;
    const goods = response.data.remaining_goods;
    if(!cards || !goods)
    {
        res.status(404).json({
            message: "data was not found"
        });
    }

    for ( let index = 0; index < cards.length; index++) {
        const duplicate1 = await product_cards.findOne({ where: { name: cards[index].name}})
        // if element exist don't add it
        let hold;
        if(!duplicate1){

            const newCard = await product_cards.create({
                name: cards[index].name,
                manufacturer: cards[index].manufacturer,
                dosage_form: cards[index].dosage_form,
                product_type: cards[index].product_type,
                packaging: cards[index].packaging,
                minimal_age: cards[index].minimal_age,
            })
            hold = newCard;
        }
        
        // if goods match add goods
        const medicine = duplicate1?.name || hold.name; // current medicine name
        let medicineID;
        cards.forEach(element => { // find current medicine id from json
            if(element.name === medicine)
            {
                medicineID = element.id;
            }
        });

        for( const goodElement of goods)
        {
            if(medicineID && medicineID === goodElement.product_cards_fk) // find which remaining_good belongs to the card
            {
                const duplicate2 = await remaining_goods.findOne({ where: { product_cards_fk: duplicate1?.id || hold.id, adresses_fk: id}})

                if(!duplicate2)
                {
                    const newGood = await remaining_goods.create({
                        amount: goodElement.amount,
                        price: goodElement.price,
                        shortage_point:0,
                        product_cards_fk: duplicate1?.id || hold.id,
                        adresses_fk: id
                    })
                }
            }
        };
    }
    res.status(200).json({
        message: "operation successful"
    });
});