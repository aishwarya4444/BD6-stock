const express = require('express');
const { resolve } = require('path');
let cors = require('cors');

const app = express();
const port = 3010;

app.use(express.static('static'));
app.use(express.json());
app.use(cors());

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

let stocks = [
  { stockId: 1, ticker: 'AAPL', companyName: 'Apple Inc.', price: 150.75 },
  { stockId: 2, ticker: 'GOOGL', companyName: 'Alphabet Inc.', price: 2750.1 },
  { stockId: 3, ticker: 'TSLA', companyName: 'Tesla, Inc.', price: 695.5 },
];

let trades = [
  {
    tradeId: 1,
    stockId: 1,
    quantity: 10,
    tradeType: 'buy',
    tradeDate: '2024-08-07',
  },
  {
    tradeId: 2,
    stockId: 2,
    quantity: 5,
    tradeType: 'sell',
    tradeDate: '2024-08-06',
  },
  {
    tradeId: 3,
    stockId: 3,
    quantity: 7,
    tradeType: 'buy',
    tradeDate: '2024-08-05',
  },
];

function getStocks() {
  return stocks;
}

app.get('/stocks', (req, res) => {
  try {
    const stocks = getStocks();
    res.json({ stocks: stocks });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

function getStockByTicker(ticker) {
  return stocks.find((stock) => stock.ticker === ticker);
}

app.get('/stocks/:ticker', (req, res) => {
  try {
    const stock = getStockByTicker(req.params.ticker);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json({ stock });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

function addTrade(tradeData) {
  const newTrade = {
    tradeId: trades.length + 1,
    ...tradeData,
  };
  trades.push(newTrade);
  return newTrade;
}

function validateTradeInput(trade) {
  const errors = [];
  if (!trade.stockId || typeof trade.stockId !== 'number') {
    errors.push('Invalid stockId');
  }
  if (
    !trade.quantity ||
    typeof trade.quantity !== 'number' ||
    trade.quantity <= 0
  ) {
    errors.push('Invalid quantity');
  }
  if (!trade.tradeType || !['buy', 'sell'].includes(trade.tradeType)) {
    errors.push('Invalid tradeType');
  }
  if (!trade.tradeDate || !/^\d{4}-\d{2}-\d{2}$/.test(trade.tradeDate)) {
    errors.push('Invalid tradeDate format');
  }
  return errors;
}

app.post('/trades/new', (req, res) => {
  try {
    const validationErrors = validateTradeInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const stock = stocks.find((s) => s.stockId === req.body.stockId);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const newTrade = addTrade(req.body);
    res.status(201).json({ trade: newTrade });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
