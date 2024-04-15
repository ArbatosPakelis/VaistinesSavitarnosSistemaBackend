const {users, blacklist} = require("../models");
const bcrypt = require('bcrypt');
const catchAsync = require("../utils/catchAsync");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const auth = require('./authenticationController');

exports.addUser = catchAsync(async (req, res, next) => {
    const body = req.body;
    let newUser;

    const existingUser = await users.findOne({ where: {username: body.username}});
    try
    {
        const pswd = await bcrypt.hash(body.password, 10);
    
        if(!existingUser) {
            newUser = await users.create({
                username: body.username,
                password: pswd,
                email: body.email,
                status: body.status,
                ForceRelogin: body.ForceRelogin,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                user_types_fk: body.user_types_fk
            })
            res.status(200).json({
                user: newUser,
            });
        }
        else{
            res.status(403).json({
                message: "User like that already exists",
            });
        }
    }
    catch
    {
        res.status(500).send();
    }
});

exports.login = catchAsync(async (req, res, next) => {
    const body = req.body;

    const user = await users.findOne({ where: {username: body.username}});
    if(!user)
    {
        return res.status(404).send();
    }
    if(user.user_types_fk != 1 && user.user_types_fk != 2 && user.user_types_fk != 3)
    {
        return res.status(401).send();
    }
    try
    {
        const correct = bcrypt.compare(body.password, user.password);
        if(correct)
        {
            let updatedUser = await users.update({
                username: user.username,
                password: user.password,
                email: user.email,
                isDeleted: user.isDeleted,
                status: user.status,
                ForceRelogin: false,
                updatedAt: Date.now()
            }, { where: {id :  user.id}})

            var currentTime1 = new Date();
            currentTime1.setMinutes(currentTime1.getMinutes() + 15);
            const userPayload1 = {
                sub: user.id,
                role: user.user_types_fk,
                location: user.adresses_fk,
                created: new Date(),
                expire: currentTime1,
            };

            var currentTime2 = new Date();
            currentTime2.setDate(currentTime2.getDate() + 1);
            const userPayload2 = {
                sub: user.id,
                role: user.user_types_fk,
                created: new Date(),
                expire: currentTime2,
            };

            const accessToken = jwt.sign(
                userPayload1,
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '15m'});

            const refreshToken = jwt.sign(
                userPayload2,
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn: '1d'});

            res.status(200).json({
                accessToken: accessToken,
                refreshToken: refreshToken,
                role: user.user_types_fk,
                id: user.id,
                pharmacy: user.adresses_fk,
                basketId:1
            });
        }
        else
        {
            res.status(401).json({
                message: "Wrong password",
            });
        }
    }
    catch(err)
    {
        res.status(500).json({
            err: err,
        });
    }
});

exports.logout = catchAsync(async (req, res, next) => {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401);
    }

    const existingToken = await blacklist.findOne({ where: { refresh_token: token}});

    if(existingToken !== null) return res.status(403).message("token is blacklisted").send();

    auth.authenticateRefreshToken(req, res, next);

    if(req.error !== undefined) return res.status(req.error).json({"message": "token expired or invalid"});
    const user = req.user;

    if(user.role != 'checkout' && user.role != 'employee' && user.role != 'admin' || Date.now() >= new Date(user.expire)) res.status(401);
    
    let result = await blacklist.create({
        refresh_token:token,
        createdAt:Date.now(),
        updatedAt:Date.now(),
    });

    const existingUser = await users.findOne({ where: {id: user.sub}});
    if(!existingUser) return res.status(403).message("user doesn't exist").send();

    let updatedUser = await users.update({
        username: existingUser.username,
        password: existingUser.password,
        email: existingUser.email,
        status: existingUser.status,
        ForceRelogin: true, // forces user to relog
        updatedAt: Date.now()
    }, { where: {id :  existingUser.id}})

    const updateUser = await users.findOne({ where: {id :  existingUser.id}});

    return res.status(200).json({
        user: updateUser.username,
        ForceRelogin: updateUser.ForceRelogin,
    });
    
});

exports.renewTokens = catchAsync(async (req, res, next) => {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401).send();
    }

    const existingToken = await blacklist.findOne({ where: { refresh_token: token}});
    if(existingToken  != null){
        return res.status(403).json({ message: 'token is blacklisted' }).send();
    }
    auth.authenticateRefreshToken(req, res, next);

    if(req.error !== undefined) return res.status(req.error).json({"message": "token expired or invalid"}).send();
    const user = req.user;
    if(user.role !== 1 && user.role !== 2 && user.role !== 3 || Date.now() >= new Date(user.expire)){
        return res.status(401).send();
    }

    var currentTime1 = new Date();
    currentTime1.setMinutes(currentTime1.getMinutes() + 1);
    const userPayload1 = {
        sub: user.sub,
        role: user.role,
        created: new Date(),
        expire: currentTime1,
    };

    var currentTime2 = new Date();
    currentTime2.setDate(currentTime2.getDate() + 1);
    const userPayload2 = {
        sub: user.sub,
        role: user.role,
        created: new Date(),
        expire: currentTime2,
    };

    const accessToken = jwt.sign(
        userPayload1,
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '15m'});

    const refreshToken = jwt.sign(
        userPayload2,
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '1d'});

    let result = await blacklist.create({
        refresh_token:token,
        createdAt:Date.now(),
        updatedAt:Date.now(),
    });
    return res.status(200).json({
        accessToken: accessToken,
        refreshToken: refreshToken,
    });
});

exports.getAllAccounts = catchAsync(async (req, res, next) => {
    auth.authenticateAccessToken(req, res, next);
    if(req.error !== undefined) return res.status(req.error).json({"message": "token expired or invalid"});

    const userT = req.user;
    if(userT === undefined)
    {
        return res.status(401).json({"message": "token expired"}).send();
    }
    if(userT.role != 3 ||
      Date.now() >= new Date(userT.expire))
    {
        return res.status(401).json({"message": "user invalid"}).send();
    }

    const {id} = req.params;
    const usersList = await users.findAll();
    if (!usersList || Array.isArray(usersList) && usersList.length < 1)
    {
        res.status(404).json({
            "message":"no accounts were found"
        }).send();
    }

    res.status(200).json({
        users:usersList
    }).send();
});