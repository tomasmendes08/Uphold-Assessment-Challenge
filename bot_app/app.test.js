const axios = require('axios');
const { getCurrentPrice, checkOscillations } = require('./app');

jest.mock('axios');

describe('getCurrentPrice', () => {
  it('should return the current price of a currency pair', async () => {
    const mockResponse = {
      data: {
        ask: '100.00',
      },
    };
    axios.get.mockResolvedValue(mockResponse);

    const pair = 'BTC-USD';
    const result = await getCurrentPrice(pair);

    expect(result).toBe(100.00);
  });

  it('should return an error message if the request fails', async () => {
    const mockErrorResponse = {
      response: {
        data: {
          code: 500,
          message: 'Internal Server Error',
        },
      },
    };
    axios.get.mockRejectedValue(mockErrorResponse);

    const pair = 'BTC-USD';
    const result = await getCurrentPrice(pair);

    expect(result).toEqual([500, 'Internal Server Error']);
  });
});

describe('checkOscillations', () => {
  it('should insert an alert into the database when an oscillation is detected', async () => {
    const mockClient = {};
    const mockBot = {
      bot_id: '55',
      currency_pairs: ['BTC-USD'],
      price_oscillation_percentage: 1,
      fetch_interval: 5000,
    };
    const mockGetBotById = jest.fn().mockResolvedValue(mockBot);
    const mockInsertAlert = jest.fn().mockResolvedValue({
      currency_pair: 'BTC-USD',
      created_on: '2022-01-01',
      old_price: 100.00,
      new_price: 101.00,
      percentage_change: '1.00',
      bot_id: '55',
    });

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    const originalSetInterval = global.setInterval;
    global.setInterval = jest.fn().mockImplementation((fn, interval) => {
      fn();
      return originalSetInterval(fn, interval);
    });

    await checkOscillations(mockClient, mockBot.bot_id);

    expect(mockGetBotById).toHaveBeenCalledWith(mockClient, mockBot.bot_id);
    expect(mockInsertAlert).toHaveBeenCalledWith(mockClient, expect.any(Date), 'BTC-USD', 100.00, 101.00, '1.00', mockBot.bot_id);
    expect(consoleLogSpy).toHaveBeenCalledWith('Alert! BTC-USD oscillation detected.');
    expect(consoleLogSpy).toHaveBeenCalledWith('Created on: 2022-01-01');
    expect(consoleLogSpy).toHaveBeenCalledWith('Last price: 100');
    expect(consoleLogSpy).toHaveBeenCalledWith('Current price: 101');
    expect(consoleLogSpy).toHaveBeenCalledWith('Percentage change: 1.00%\n');

    global.setInterval = originalSetInterval;
    consoleLogSpy.mockRestore();
  });
});

