const app = require('./app');
const config = require('./constants');

jest.mock('axios');

const axios = require('axios');
const app = require('./app');

jest.mock('axios');

describe('Bot functionality', () => {
    describe('checkOscillations', () => {
        it('should check oscillations on the currency pair rate', async () => {
            
            const currencyPairs = ['BTC-USD', 'ETH-USD'];
            const priceOscillationPercentage = config.DEFAULT_PRICE_OSCILLATION_PERCENTAGE;
            const fetchInterval = config.DEFAULT_FETCH_INTERVAL;

            // Call the checkOscillations function
            await app.checkOscillations(currencyPairs, priceOscillationPercentage, fetchInterval);

            // Add your assertions here to verify the behavior of the function
        });
    });

    describe('main', () => {
        it('should call the main function', async () => {
            // Mock any necessary dependencies or functions

            // Call the main function
            await app.main();

            // Add your assertions here to verify the behavior of the function
        });
    });
});