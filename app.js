const axios = require('axios');
const config = require('./config');

// Get the current price of currencyPair
async function getCurrentPrice(currencyPair) {
    try {
        const response = await axios.get(`${config.API_URL}${currencyPair}`);
        return parseFloat(response.data.ask);
    } catch (error) {
        console.log("Error -> " + error.response.data.code + ': ' + error.response.data.message);
    }
}

// Function that checks oscillations on the currencyPair rate (higher or equal than priceOscillationPercentage) every delimited time (fetchInterval)
async function checkOscillations(currencyPairs, priceOscillationPercentage, fetchInterval) {
    let lastPrices = {};
    console.log('Checking oscillations...\n');

    const intervalId = setInterval(async () => {
        const promises = currencyPairs.map(async (currencyPair) => {
            const currentPrice = await getCurrentPrice(currencyPair);
            return { currencyPair, currentPrice };
        });

        const results = await Promise.all(promises);

        results.forEach(({ currencyPair, currentPrice }) => {
            if (!lastPrices[currencyPair]) {
                lastPrices[currencyPair] = currentPrice;
            } else {
                const percentageChange = (Math.abs(lastPrices[currencyPair] - currentPrice)) / lastPrices[currencyPair] * 100;
                if (percentageChange >= priceOscillationPercentage) {
                    console.log(`Alert! ${currencyPair} oscillation detected.`);
                    console.log(`Last price: ${lastPrices[currencyPair]}`);
                    console.log(`Current price: ${currentPrice}`);
                    console.log(`Percentage change: ${percentageChange}%\n`);
                    lastPrices[currencyPair] = currentPrice;
                }
            }
        });
    }, fetchInterval);
}

async function main() {
    const args = process.argv.slice(2);

    let currencyPairs = args[0];
    if (!currencyPairs) {
        console.log('No currency pairs provided. Using default currency pair: ' + config.DEFAULT_CURRENCY_PAIR);
        currencyPairs = config.DEFAULT_CURRENCY_PAIR;
    } else {
        currencyPairs = currencyPairs.split(',').map(pair => pair.trim().toUpperCase());
    }

    let priceOscillationPercentage = parseFloat(args[1]);
    if (isNaN(priceOscillationPercentage) || priceOscillationPercentage < config.MINIMUM_PRICE_OSCILLATION_PERCENTAGE || priceOscillationPercentage > config.MAXIMUM_PRICE_OSCILLATION_PERCENTAGE) {
        console.log('No price oscillation percentage provided or percentage is not valid. Valid values between [0.001, 10]%. Using default price oscillation percentage: ' + config.DEFAULT_PRICE_OSCILLATION_PERCENTAGE);
        priceOscillationPercentage = config.DEFAULT_PRICE_OSCILLATION_PERCENTAGE;
    }

    let fetchInterval = parseInt(args[2]);
    if (isNaN(fetchInterval) || fetchInterval < config.MINIMUM_FETCH_INTERVAL || fetchInterval > config.MAXIMUM_FETCH_INTERVAL) {
        console.log('No fetch interval provided or interval is not valid. Valid interval between [1000; 60000]ms. Using default fetch interval: ' + config.DEFAULT_FETCH_INTERVAL);
        fetchInterval = config.DEFAULT_FETCH_INTERVAL;
    }

    console.log(`Currency Pairs: ${currencyPairs}`);
    console.log(`Price Oscillation Percentage: ${priceOscillationPercentage}`);
    console.log(`Fetch Interval: ${fetchInterval}`);

    await checkOscillations(currencyPairs, priceOscillationPercentage, fetchInterval);
}


main();



