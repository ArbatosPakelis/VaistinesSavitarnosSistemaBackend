const request = require('supertest');
const app = require('../app');

let auth = [];

beforeAll(async() => {
    const payload = {
        username: "kazkas1",
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
    it('should return an 401 code', async () => {
        const res = (await request(app).get('/api/v1/orders/getOrder/2')
        .set('Content-Type', 'application/json'));
        expect(res.statusCode).toEqual(401);
    });
});

describe('GET /getOrder/:id working', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).get('/api/v1/orders/getOrder/2')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(200);
    });
});

describe('GET /getOrder/:id not found', () => {
    it('should return an 404 code', async () => {
        const res = (await request(app).get('/api/v1/orders/getOrder/99999')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(404);
    });
});

describe('GET /getAllOrders/:id no token', () => {
    it('should return an 401 code', async () => {
        const res = (await request(app).get('/api/v1/orders/getAllOrders/1')
        .set('Content-Type', 'application/json'));
        expect(res.statusCode).toEqual(401);
    });
});

describe('GET /getAllOrders/:id working', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).get('/api/v1/orders/getAllOrders/1')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(200);
    });
});

describe('GET /getAllOrders/:id not found', () => {
    it('should return an 404 code', async () => {
        const res = (await request(app).get('/api/v1/orders/getAllOrders/99999')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(404);
    });
});


describe('GET /getProductList/:id no token', () => {
    it('should return an 401 code', async () => {
        const res = (await request(app).get('/api/v1/orders/getProductList/1')
        .set('Content-Type', 'application/json'));
        expect(res.statusCode).toEqual(401);
    });
});

describe('GET /getProductList/:id working', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).get('/api/v1/orders/getProductList/1')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(200);
    });
});

describe('GET /getProductList/:id not found', () => {
    it('should return an 404 code', async () => {
        const res = (await request(app).get('/api/v1/orders/getProductList/99999')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(404);
    });
});

describe('POST /calibrate/:id no token', () => {
    it('should return an 401 code', async () => {
        const res = (await request(app).post('/api/v1/orders/calibrate/1')
        .set('Content-Type', 'application/json'));
        expect(res.statusCode).toEqual(401);
    });
});

describe('POST /calibrate/:id working', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).post('/api/v1/orders/calibrate/1')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(200);
    });
});

describe('POST /addProduct/:id/:basketId working', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).post('/api/v1/orders/addProduct/4/6')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(200);
    });
});

describe('POST /addProduct/:id/:basketId no token', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).post('/api/v1/orders/addProduct/4/6')
        .set('Content-Type', 'application/json'));

        expect(res.statusCode).toEqual(401);
    });
});



describe('PUT /updateProductAmount/:id/:operation working subtraction', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).put('/api/v1/orders/updateProductAmount/7/1')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toBe(200 || 403);
    });
});

describe('PUT /updateProductAmount/:id/:operation working addition', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).put('/api/v1/orders/updateProductAmount/7/2')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toBe(200 || 403);
    });
});

describe('PUT /updateProductAmount/:id/:operation no token', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).put('/api/v1/orders/updateProductAmount/7/2')
        .set('Content-Type', 'application/json'));

        expect(res.statusCode).toEqual(401);
    });
});

describe('GET /checkValidity/:id complete order', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).get('/api/v1/orders/checkValidity/2')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(200);
        expect(res.body.age).toEqual(true);
    });
});

describe('GET /checkValidity/:id new order', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).get('/api/v1/orders/checkValidity/5')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(200);
        expect(res.body.age).toEqual(false);
    });
});

describe('GET /checkValidity/:id not found', () => {
    it('should return an 404 code', async () => {
        const res = (await request(app).get('/api/v1/orders/checkValidity/99999')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(404);
    });
});

describe('GET /checkValidity/:id no token', () => {
    it('should return an 401 code', async () => {
        const res = (await request(app).get('/api/v1/orders/checkValidity/2')
        .set('Content-Type', 'application/json'));

        expect(res.statusCode).toEqual(401);
    });
});

describe('POST /calcelOrder/:id cancel already canceled order', () => {
    it('should return an 403 code', async () => {
        const res = (await request(app).post('/api/v1/orders/calcelOrder/15')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(403);
    });
});

describe('POST /calcelOrder/:id cancel already canceled order', () => {
    it('should return an 404 code', async () => {
        const res = (await request(app).post('/api/v1/orders/calcelOrder/99999')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(404);
    });
});

describe('POST /applyDiscounts/:id working', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).post('/api/v1/orders/applyDiscounts/5')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toBe(403 || 200);
    });
});

describe('POST /applyDiscounts/:id not found', () => {
    it('should return an 404 code', async () => {
        const res = (await request(app).post('/api/v1/orders/applyDiscounts/99999')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(404);
    });
});

describe('PUT /updateOrder/:id/:state working', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).put('/api/v1/orders/updateOrder/6/Naujas')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(200);
    });
});

describe('PUT /updateOrder/:id/:state not found', () => {
    it('should return an 404 code', async () => {
        const res = (await request(app).put('/api/v1/orders/updateOrder/9999/Naujas')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(404);
    });
});

describe('PUT /updateOrder/:id/:state no token', () => {
    it('should return an 401 code', async () => {
        const res = (await request(app).put('/api/v1/orders/updateOrder/6/Naujas')
        .set('Content-Type', 'application/json'));

        expect(res.statusCode).toEqual(401);
    });
});

describe('PUT /updateLimit/:id/:limit working', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).put('/api/v1/orders/updateLimit/9/5')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(200);
    });
});

describe('PUT /updateLimit/:id/:limit not found', () => {
    it('should return an 404 code', async () => {
        const res = (await request(app).put('/api/v1/orders/updateLimit/9999/5')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(404);
    });
});

describe('PUT /updateLimit/:id/:limit no token', () => {
    it('should return an 401 code', async () => {
        const res = (await request(app).put('/api/v1/orders/updateLimit/9/5')
        .set('Content-Type', 'application/json'));

        expect(res.statusCode).toEqual(401);
    });
});

describe('POST /resupply working', () => {
    it('should return an 200 code', async () => {
        const res = (await request(app).post('/api/v1/orders/resupply')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken)
        .send({ 
            list: [ { id: 1, amount: 2 }, { id: 2, amount: 2 } ]}));

        expect(res.statusCode).toEqual(200);
    });
});

describe('DELETE /deleteProduct/:id not found', () => {
    it('should return an 404 code', async () => {
        const res = (await request(app).delete('/api/v1/orders/deleteProduct/99999')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + auth.accessToken));

        expect(res.statusCode).toEqual(404);
    });
});