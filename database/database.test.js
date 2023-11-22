const { connectToDatabase, insertBot, insertAlert, getBotById } = require('./database');
const { Client } = require('pg');

jest.mock('pg');

describe('Database functions', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = new Client();
    jest.spyOn(mockClient, 'connect').mockResolvedValue();
    jest.spyOn(mockClient, 'query').mockResolvedValue({ rows: [] });
    jest.spyOn(mockClient, 'end').mockResolvedValue();
    jest.mock('pg', () => ({ Client: jest.fn(() => mockClient) }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('insertBot inserts a bot', async () => {
    const mockBotId = 1;
    mockClient.query.mockResolvedValueOnce({ rows: [{ bot_id: mockBotId }] });

    const botId = await insertBot(mockClient, 'BTC-USD', 0.02, 4000);

    expect(botId).toBe(mockBotId);
    expect(mockClient.query).toHaveBeenCalledWith({
      text: 'INSERT INTO bot (currency_pairs, price_oscillation_percentage, fetch_interval) VALUES ($1, $2, $3) RETURNING bot_id',
      values: ['BTC-USD', 0.02, 4000],
    });
  });

  test('insertAlert inserts an alert', async () => {
    const mockAlert = {
      created_on: new Date(),
      currency_pair: 'BTC-USD',
      old_price: 100,
      new_price: 110,
      percentage_change: 10,
      bot_id: 1,
    };
    mockClient.query.mockResolvedValueOnce({ rows: [mockAlert] });

    const result = await insertAlert(mockClient, mockAlert.created_on, mockAlert.currency_pair, mockAlert.old_price, mockAlert.new_price, mockAlert.percentage_change, mockAlert.bot_id);

    expect(result).toEqual(mockAlert);
    expect(mockClient.query).toHaveBeenCalledWith({
      text: 'INSERT INTO alert (created_on, currency_pair, old_price, new_price, percentage_change, bot_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      values: [mockAlert.created_on, mockAlert.currency_pair, mockAlert.old_price, mockAlert.new_price, mockAlert.percentage_change, mockAlert.bot_id],
    });
  });

  test('getBotById retrieves a bot by ID', async () => {
    const mockBot = { bot_id: 1, currency_pairs: 'BTC-USD', price_oscillation_percentage: 0.02, fetch_interval: 4000 };
    mockClient.query.mockResolvedValueOnce({ rows: [mockBot] });

    const result = await getBotById(mockClient, 1);

    expect(result).toEqual(mockBot);
    expect(mockClient.query).toHaveBeenCalledWith({
      text: 'SELECT * FROM bot WHERE bot_id = $1',
      values: [1],
    });
  });
});
