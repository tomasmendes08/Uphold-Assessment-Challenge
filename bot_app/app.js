const axios = require('axios');
const constants = require('./constants');
const {connectToDatabase, insertBot, insertAlert, getBotById} = require('../database/database');

// Get the current price of currency pair
async function getCurrentPrice(pair) {
    try {
        const response = await axios.get(`${constants.API_URL}${pair}`);
        return parseFloat(response.data.ask);
    } catch (error) {
        return [error.response.data.code, error.response.data.message];
    }
}

// Function that checks oscillations on the currencyPair ask rate (higher or equal than priceOscillationPercentage) every delimited time (fetchInterval)
async function checkOscillations(client, bot) {
    let lastPrices = {};
    const botConfig = await getBotById(client, bot);
    const currencyPairs = botConfig.currency_pairs
    console.log('Checking oscillations...\n');
    
    setInterval(async () => {
        const promises = currencyPairs.map(async (currencyPair) => {
            const currentPrice = await getCurrentPrice(currencyPair);
            return { currencyPair, currentPrice };
        });

        const results = await Promise.all(promises);

        results.forEach(async ({ currencyPair, currentPrice }) => {
            if (!lastPrices[currencyPair]) {
                lastPrices[currencyPair] = currentPrice;
            } else {
                const percentageChange = (Math.abs(lastPrices[currencyPair] - currentPrice)) / lastPrices[currencyPair] * 100;
                if (percentageChange >= botConfig.price_oscillation_percentage) {
                    const res = await insertAlert(client, new Date(), currencyPair, lastPrices[currencyPair], currentPrice, percentageChange.toFixed(4), botConfig.bot_id);
                    if (res === undefined) {
                        console.log('Failed to insert alert into the database. Terminating program.');
                        process.exit(1);
                    }
                    console.log(`Alert! ${res.currency_pair} oscillation detected.`);
                    console.log(`Created on: ${res.created_on}`);
                    console.log(`Last price: ${res.old_price}`);
                    console.log(`Current price: ${res.new_price}`);
                    console.log(`Percentage change: ${res.percentage_change}%\n`);
                    lastPrices[currencyPair] = currentPrice;
                }
            }
        });
    }, botConfig.fetch_interval);
}

// Main function
async function main() {
    const client = await connectToDatabase();

    const currencyPairs = (process.env.CURRENCY_PAIRS || 'BTC-USD').split(',');
    const priceOscillationPercentage = parseFloat(process.env.PRICE_OSCILLATION_PERCENTAGE || '0.01');
    const fetchInterval = parseInt(process.env.FETCH_INTERVAL || '5000');

    console.log(`\nCurrency Pairs: ${currencyPairs}`);
    console.log(`Price Oscillation Percentage: ${priceOscillationPercentage}`);
    console.log(`Fetch Interval: ${fetchInterval}\n`);

    const botId = await insertBot(client, currencyPairs, priceOscillationPercentage, fetchInterval);
    if (botId === undefined) {
        console.log('Failed to insert bot into the database. Terminating program.');
        process.exit(1);
    }
    
    await checkOscillations(client, botId);
}

main();
