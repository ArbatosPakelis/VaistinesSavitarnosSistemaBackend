const {orders, order_products, product_cards, prescriptions, confirmations, remaining_goods, users} = require("../models");
const catchAsync = require("../utils/catchAsync");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const auth = require('./authenticationController');
const axios = require("axios");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getOrder = catchAsync(async (req, res, next) => {
    const authResult = await auth.authenticateAccessToken(req, res, next);
    if(req.error !== undefined) return res.status(req.error).json({"message": "token expired or invalid"});

    const userT = req.user;
    if(userT == undefined)
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


    const checkoutList = await users.findAll({ where: { user_types_fk: [1, 2], adresses_fk: userT.location}});
    if (!checkoutList || Array.isArray(checkoutList) && checkoutList.length < 1)
    {
        res.status(404).json({
            "message":"this location doesn't have any checkouts added yet"
        }).send();
    }
  
    res.status(200).json({
        checkouts:checkoutList,
        order: order,
        order_products: products,
        product_cards: cards
    });
});


exports.getAllOrders = catchAsync(async (req, res, next) => {
    const authResult = await auth.authenticateAccessToken(req, res, next);
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
    });
});

exports.getProductList = catchAsync(async (req, res, next) => {
    const authResult = await auth.authenticateAccessToken(req, res, next);
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
    });
});

exports.calibrate = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const authResult = await auth.authenticateAccessToken(req, res, next);
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

exports.addProduct = catchAsync(async (req, res, next) => {
    const authResult = await auth.authenticateAccessToken(req, res, next);
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

    const { id, basketId } = req.params;
    let basketID = basketId;
    
    const good = await remaining_goods.findOne({ where: { id: id}});
    if(!good)
    {
        return res.status(404).json({"message": "product not found"}).send();
    }

    if(basketId <= 0)
    {
        const order = await orders.create({
            price: good.price,
            state: "Naujas",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            users_fk:  userT.sub,
            adresses_fk: userT.location
        });
        basketID = order.id;
    }
    else
    {
        const order = await orders.findOne({ where: { id: basketID}})
        if(!order)
        {
            return res.status(404).json({"message": "order not found"}).send();
        }
        const updatedOrder = await orders.update({
            price:parseFloat(order.price)+parseFloat(good.price)
        }, { where: { id: basketID } });
    }

    const productCheck = await order_products.findOne({ where: { orders_fk: basketID, product_cards_fk: good.product_cards_fk}})
    let product;
    if(!productCheck){
        const newProduct = await order_products.create({
            amount: 1,
            price: good.price,
            discount: 0,
            orders_fk: basketID,
            product_cards_fk: good.product_cards_fk,
            remaining_goods_fk: good.id
        });
        product = newProduct;
    }
    else
    {
        const updateProduct = await order_products.update({
            amount: productCheck.amount+1,
        }, { where: { id: productCheck.id}});
        product = updateProduct;
    }
    const updateGood = await remaining_goods.update({
        amount:good.amount-1
    }, { where: { id: id}});


    res.status(200).json({
        basketId: basketID,
        product: product
    });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const authResult = await auth.authenticateAccessToken(req, res, next);
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

    const { id } = req.params;

    const product = await order_products.findOne({ where: { id: id}})
    if(!product){
        return res.status(404).json({"message": "order product not found"}).send();
    }
    
    const good = await remaining_goods.findOne({ where: { id: product.remaining_goods_fk}});
    if(!good)
    {
        return res.status(404).json({"message": "remaining goods not found"}).send();
    }

    const order = await orders.findOne({ where: { id: product.orders_fk}});
    if(!order)
    {
        return res.status(404).json({"message": "order not found"}).send();
    }

    const updatedOrder = await orders.update({
        price:parseFloat(order.price)-(parseFloat(product.price)*parseInt(product.amount))
    }, { where: { id: order.id } });

    const updatedGood = await remaining_goods.update({
        amount:parseInt(good.amount)+parseInt(product.amount)
    }, { where: { id: good.id } });

    const deleteProduct = await order_products.destroy({ where: { id: product.id}})

    res.status(200).json({
        results: Boolean(deleteProduct)
    });
});

exports.updateProductAmount = catchAsync(async (req, res, next) => {
    const authResult = await auth.authenticateAccessToken(req, res, next);
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

    const { id, operation } = req.params;

    const product = await order_products.findOne({ where: { id: id}})
    if(!product){
        return res.status(404).json({"message": "order product not found"}).send();
    }

    const goods = await remaining_goods.findOne({ where: { id: product.remaining_goods_fk}})
    if(!goods){
        return res.status(404).json({"message": "remaining goods not found"}).send();
    }

    const order = await orders.findOne({ where: { id: product.orders_fk}})
    if(!order){
        return res.status(404).json({"message": "order not found"}).send();
    }

    if(operation == 1 && parseInt(product.amount) > 1)
    {
        const updateProduct = await order_products.update({
            amount: parseInt(product.amount)-1,
        }, { where: { id: id}});

        const updateGood = await remaining_goods.update({
            amount: parseInt(goods.amount)+1,
        }, { where: { id: goods.id}});

        const updateOrder = await orders.update({
            price: parseFloat(order.price)-parseFloat(product.price),
        }, { where: { id: order.id}});

        res.status(200).json({
            message:"successful subtraction"
        });
    }
    else if(operation == 2 && parseInt(goods.amount) > 0)
    {
        const updateProduct = await order_products.update({
            amount: parseInt(product.amount)+1,
        }, { where: { id: id}});

        const updateGood = await remaining_goods.update({
            amount: parseInt(goods.amount)-1,
        }, { where: { id: goods.id}});

        const updateOrder = await orders.update({
            price: parseFloat(order.price)+parseFloat(product.price),
        }, { where: { id: order.id}});

        res.status(200).json({
            message:"successful addition"
        });
    }
    else
    {
        res.status(403).json({
            message:"can't do this operation"
        });
    }
});

exports.payment = catchAsync(async (req, res, next) => {
    const authResult = await auth.authenticateAccessToken(req, res, next);
    if(req.error !== undefined) return res.status(req.error).json({"message": "token expired or invalid"});

    const userT = req.user;
    if(userT == undefined)
    {
        return res.status(401).json({"message": "token expired"}).send();
    }
    if(userT.role != 1 && userT.role != 2 ||
      Date.now() >= new Date(userT.expire))
    {
        return res.status(401).json({"message": "user invalid"}).send();
    }

    const {id} =  req.params;

    const products = await order_products.findAll({ where: {orders_fk:id}})
    
    const productCardPairs = [];

    for (const product of products) {
        const hold = await product_cards.findOne({ where: { id: product.product_cards_fk } });
        productCardPairs.push({
            product: product,
            card: hold
        });
    }
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: productCardPairs.map(item => {
                return {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: item.card.name,
                        },
                        unit_amount: parseInt(parseFloat(item.product.price)*100)
                    },
                    quantity: item.product.amount,
                }
            }),
            success_url:`${process.env.FRONTEND_URL}basket?success=true`,
            cancel_url:`${process.env.FRONTEND_URL}basket?success=false`
        });
        res.status(200).json({
            session: session.url
        });
    }
    catch(e) {
        res.status(500).json({ error: e.message});
    }
});


exports.paymentCompletion = catchAsync(async (req, res, next) => {
    res.status(200).json({
        message:"success"
    });
});