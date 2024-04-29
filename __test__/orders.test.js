const request = require('supertest');
const express = require('express');
const app = require('../app');

let auth = [];

beforeAll(async() => {
    const payload = {
        username: "kazkas",
        password: "Kazkas@1" 
    };
    const res = await request(app).post('/api/v1/users/login')
    .set('Content-Type', 'application/json')
    .send(payload);
    auth = {
        "accessToken": res.body.accessToken,
        "refreshToken": res.body.refreshToken,
        "role": res.body.role,
        "id": res.body.id,
        "pharmacy": res.body.pharmacy,
        "basketId": res.body.basketId
    }
});
  
//   afterAll(() => {
//     server.close(done);
//   });

describe('GET /getOrder/:id no token', () => {
    it('401', async () => {
        const res = (await request(app).get('/api/v1/orders/getOrder/1')
        .set('Content-Type', 'application/json'));
        expect(res.statusCode).toEqual(401);
    });
});

describe('GET /getOrder/:id working', () => {
    it('should return an order data', async () => {
        const res = (await request(app).get('/api/v1/orders/getOrder/1')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(200);
    });
});

describe('GET /getOrder/:id not found', () => {
    it('should return an order data', async () => {
        const res = (await request(app).get('/api/v1/orders/getOrder/99999')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(404);
    });
});

describe('GET /getAllOrders/:id no token', () => {
    it('401', async () => {
        const res = (await request(app).get('/api/v1/orders/getAllOrders/1')
        .set('Content-Type', 'application/json'));
        expect(res.statusCode).toEqual(401);
    });
});

describe('GET /getAllOrders/:id working', () => {
    it('should return an order data', async () => {
        const res = (await request(app).get('/api/v1/orders/getAllOrders/1')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(200);
    });
});

describe('GET /getAllOrders/:id not found', () => {
    it('should return an order data', async () => {
        const res = (await request(app).get('/api/v1/orders/getAllOrders/99999')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(404);
    });
});


describe('GET /getProductList/:id no token', () => {
    it('401', async () => {
        const res = (await request(app).get('/api/v1/orders/getProductList/1')
        .set('Content-Type', 'application/json'));
        expect(res.statusCode).toEqual(401);
    });
});

describe('GET /getProductList/:id working', () => {
    it('should return an order data', async () => {
        const res = (await request(app).get('/api/v1/orders/getProductList/1')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(200);
    });
});

describe('GET /getProductList/:id not found', () => {
    it('should return an order data', async () => {
        const res = (await request(app).get('/api/v1/orders/getProductList/99999')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(404);
    });
});

describe('GET /calibrate/:id no token', () => {
    it('401', async () => {
        const res = (await request(app).get('/api/v1/orders/calibrate/1')
        .set('Content-Type', 'application/json'));
        expect(res.statusCode).toEqual(401);
    });
});

describe('GET /calibrate/:id working', () => {
    it('should return an order data', async () => {
        const res = (await request(app).get('/api/v1/orders/calibrate/1')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(200);
    });
});
