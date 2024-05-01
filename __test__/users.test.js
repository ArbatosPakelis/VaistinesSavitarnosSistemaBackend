const request = require('supertest');
const app = require('../app');

function generateRandomLetters(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function getLogin()
{
    const payload = {
        username: "kazkas1",
        password: "Kazkas@1" 
    };
    const res = await request(app).post('/api/v1/users/login')
    .set('Content-Type', 'application/json')
    .send(payload);
    const auth = {
        "accessToken": res.body.accessToken,
        "refreshToken": res.body.refreshToken,
        "role": res.body.role,
        "id": res.body.id,
        "pharmacy": res.body.pharmacy,
        "basketId": res.body.basketId
    }
    return auth;
};

async function getAdminLogin()
{
    const payload = {
        username: "kazkas2",
        password: "Kazkas@1" 
    };
    const res = await request(app).post('/api/v1/users/login')
    .set('Content-Type', 'application/json')
    .send(payload);
    const auth = {
        "accessToken": res.body.accessToken,
        "refreshToken": res.body.refreshToken,
        "role": res.body.role,
        "id": res.body.id,
        "pharmacy": res.body.pharmacy,
        "basketId": res.body.basketId
    }
    return auth;
};

describe('POST /login working', () => {
    it('should return an 200 code', async () => {
        const payload = {
            username: "kazkas1",
            password: "Kazkas@1" 
        };
        const res = await request(app).post('/api/v1/users/login')
        .set('Content-Type', 'application/json')
        .send(payload);

        expect(res.statusCode).toEqual(200);
    });
});

describe('POST /login wrong password', () => {
    it('should return an 401 code', async () => {
        const payload = {
            username: "kazkas1",
            password: "Kazk" 
        };
        const res = await request(app).post('/api/v1/users/login')
        .set('Content-Type', 'application/json')
        .send(payload);

        expect(res.statusCode).toEqual(401);
    });
});

describe('POST /logout working', () => {
    it('should return an 200 code', async () => {
        const holdAuth = await getLogin();
        const res = await request(app).post('/api/v1/users/logout')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + holdAuth.refreshToken);

        expect(res.statusCode).toEqual(200);
    });
});

describe('POST /logout no token', () => {
    it('should return an 401 code', async () => {
        const holdAuth = await getLogin();
        const res = await request(app).post('/api/v1/users/logout')
        .set('Content-Type', 'application/json');

        expect(res.statusCode).toEqual(401);
    });
});

describe('POST /tokens working', () => {
    it('should return an 200 code', async () => {
        const holdAuth = await getLogin();
        const res = await request(app).post('/api/v1/users/tokens')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + holdAuth.refreshToken);

        expect(res.statusCode).toEqual(200);
    });
});

describe('POST /tokens no token', () => {
    it('should return an 401 code', async () => {
        const holdAuth = await getLogin();
        const res = await request(app).post('/api/v1/users/tokens')
        .set('Content-Type', 'application/json');

        expect(res.statusCode).toEqual(401);
    });
});

describe('GET /getAllAccounts working', () => {
    it('should return an 200 code', async () => {
        const holdAuth = await getAdminLogin();
        const res = await request(app).get('/api/v1/users/getAllAccounts')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + holdAuth.accessToken);
        expect(res.statusCode).toEqual(200);
    });
});

describe('GET /getAllAccounts no token', () => {
    it('should return an 401 code', async () => {
        const res = await request(app).get('/api/v1/users/getAllAccounts')
        .set('Content-Type', 'application/json');

        expect(res.statusCode).toEqual(401);
    });
});

describe('GET /getAccountSettings working', () => {
    it('should return an 200 code', async () => {
        const holdAuth = await getAdminLogin();
        const res = await request(app).get('/api/v1/users/getAccountSettings')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + holdAuth.accessToken);
        expect(res.statusCode).toEqual(200);
    });
});

describe('GET /getAccountSettings no token', () => {
    it('should return an 401 code', async () => {
        const res = await request(app).get('/api/v1/users/getAccountSettings')
        .set('Content-Type', 'application/json');

        expect(res.statusCode).toEqual(401);
    });
});

describe('POST /register working', () => {
    it('should return an 200 code', async () => {
        const holdAuth = await getAdminLogin();
        const res = await request(app).post('/api/v1/users/register')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + holdAuth.accessToken)
        .send({ 
            username: generateRandomLetters(8),
            password: generateRandomLetters(8),
            email: generateRandomLetters(5)+'@'+generateRandomLetters(5)+'.com',
            status:"working",
            ForceRelogin:false,
            user_types_fk: 2 });
        expect(res.statusCode).toEqual(200);
    });
});

describe('POST /register username taken', () => {
    it('should return an 403 code', async () => {
        const res = await request(app).post('/api/v1/users/register')
        .set('Content-Type', 'application/json')
        .send({ 
            username: "kazkas1",
            password: generateRandomLetters(8),
            email: generateRandomLetters(5)+'@'+generateRandomLetters(5)+'.com',
            status:"working",
            ForceRelogin:false,
            user_types_fk: 2 });

        expect(res.statusCode).toEqual(403);
    });
});

describe('PUT /updateAccount working', () => {
    it('should return an 200 code', async () => {
        const holdAuth = await getAdminLogin();
        const auth = await getLogin();
        const res = await request(app).put('/api/v1/users/updateAccount')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'bearer ' + holdAuth.accessToken)
        .send({
            user:{ 
                username: auth.username,
                password: auth.password,
                email: auth.email,
                status:auth.status,
                ForceRelogin:auth.ForceRelogin,
                user_types_fk: auth.user_types_fk,
                adresses_fk: auth.adress
            }
        });

        console.log(res.error);
        expect(res.statusCode).toEqual(200);
    });
});

describe('PUT /updateAccount no token', () => {
    it('should return an 401 code', async () => {
        const auth = await getLogin();
        const res = await request(app).put('/api/v1/users/updateAccount')
        .set('Content-Type', 'application/json')
        .send({ 
            username: auth.username,
            password: auth.password,
            email: auth.email,
            status:auth.status,
            ForceRelogin:auth.ForceRelogin,
            user_types_fk: auth.user_types_fk,
            adresses_fk: auth.adress});

        expect(res.statusCode).toEqual(401);
    });
});
