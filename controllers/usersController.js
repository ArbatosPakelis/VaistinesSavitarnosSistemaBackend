const {users, Tokens} = require("../models");
const bcrypt = require('bcrypt');
const catchAsync = require("../utils/catchAsync");
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
                isDeleted: body.isDeleted,
                status: body.status,
                ForceRelogin: body.ForceRelogin,
                createdAt: Date.now(),
                updatedAt: Date.now()
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
    if(user.status != "employee" && user.status != "admin")
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
                role: user.status,
                created: new Date(),
                expire: currentTime1,
            };

            var currentTime2 = new Date();
            currentTime2.setDate(currentTime2.getDate() + 1);
            const userPayload2 = {
                sub: user.id,
                role: user.status,
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
                role: user.status,
                id: user.id
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