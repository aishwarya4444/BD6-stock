let request = require('supertest');
let { app, getStocks, addTrade } = require('../index.js');

let http = require("http");
let server;

jest.mock("../index.js", ()=> ({
    ...jest.requireActual("../index.js"),
    getStocks: jest.fn(),
    addTrade: jest.fn(),
}));

beforeAll((done) => {
    server = http.createServer(app);
    server.listen(3001, done);
});

afterAll((done) => {
    server.close(done)
});

describe('Stock Trading API', () => {
    // Test 1: Get All Stocks
    test('GET /stocks should return all stocks', async () => {
        const response = await request(app).get('/stocks');
        expect(response.status).toBe(200);
        expect(response.body.stocks.length).toEqual(3);
    });

    // Test 2: Get Stock by Ticker
    test('GET /stocks/:ticker should return specific stock', async () => {
        const response = await request(app).get('/stocks/AAPL');
        expect(response.status).toBe(200);
        expect(response.body.stock.ticker).toBe('AAPL');
    });

    // Test 3: Add New Trade
    test('POST /trades/new should add a new trade', async () => {
        const newTrade = {
            stockId: 1,
            quantity: 15,
            tradeType: 'buy',
            tradeDate: '2024-08-08'
        };

        const response = await request(app)
        .post('/trades/new')
        .send(newTrade);
        
        expect(response.status).toBe(201);
        expect(response.body.trade).toMatchObject(newTrade);
    });

    // Test 4: Error Handling for Invalid Ticker
    test('GET /stocks/:ticker should return 404 for invalid ticker', async () => {
        const response = await request(app).get('/stocks/INVALID');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Stock not found' });
    });

    // Test 5: Input Validation for Add Trade
    test('POST /trades/new should validate input', async () => {
        const invalidTrade = {
            stockId: 'invalid',
            quantity: -1,
            tradeType: 'invalid',
            tradeDate: 'invalid-date'
        };

        const response = await request(app)
        .post('/trades/new')
        .send(invalidTrade);
        
        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([
            'Invalid stockId',
            'Invalid quantity',
            'Invalid tradeType',
            'Invalid tradeDate format'
        ]));
    });

    // Test 6: Mock getStocks Function
    test('getStocks function should be called correctly', async () => {
        const mockStocks = [
            { stockId: 1, ticker: 'AAPL', companyName: 'Apple Inc.', price: 150.75 },
            { stockId: 2, ticker: 'GOOGL', companyName: 'Alphabet Inc.', price: 2750.1 },
            { stockId: 3, ticker: 'TSLA', companyName: 'Tesla, Inc.', price: 695.5 },
          ];
        getStocks.mockResolvedValue(mockStocks);

        const response = await request(app).get('/stocks');
        expect(response.body.stocks).toMatchObject(mockStocks);
    });

    // Test 7: Mock Add Trade Function (Async)
    test('addTrade function should work correctly', async () => {
        const newTrade = {
            stockId: 1,
            quantity: 15,
            tradeType: 'buy',
            tradeDate: '2024-08-08'
        };

        const expectedTrade = { tradeId: 4, ...newTrade };
        addTrade.mockResolvedValue(expectedTrade);

        const response = await request(app)
            .post('/trades/new')
            .send(newTrade);

        expect(response.status).toBe(201);
        expect(response.body.trade).toMatchObject(newTrade);
    });
});