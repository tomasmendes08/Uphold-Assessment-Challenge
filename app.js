const axios = require('axios');
const constants = require('./constants');

// Get the current price of BTC-USD
async function getCurrentPrice(currencyPair) {
    try {
        const response = await axios.get(`${constants.API_URL}${currencyPair}`);
        return parseFloat(response.data.ask);
    } catch (error) {
        console.error(error);
    }
}

// Function that checks oscillations on the currencyPair rate (higher or equal than priceOscillationPercentage) every delimited time (fetchInterval)
async function checkOscillations(currencyPair, priceOscillationPercentage, fetchInterval) {
    let lastPrice = null;
    console.log('Checking oscillations...\n');
    
    const intervalId = setInterval(async () => {
        let currentPrice = await getCurrentPrice(currencyPair);
        if (lastPrice === null) {
            lastPrice = currentPrice;
        } else if ((Math.abs(lastPrice - currentPrice)) / lastPrice * 100 >= priceOscillationPercentage) {
            console.log('Alert! BTC-USD oscillation detected.\nLast price: ' + lastPrice + '\nCurrent price: ' + currentPrice + '\nPercentage change: ' + Math.abs(lastPrice - currentPrice) / lastPrice * 100 + '%\n');
            lastPrice = currentPrice;
        }
    }, fetchInterval);
    
}

async function main() {
    const args = process.argv.slice(2);
    
    let currencyPair = args[0];
    if (currencyPair === undefined) {
        console.log('No currency pair provided. Using default currency pair: ' + constants.DEFAULT_CURRENCY_PAIR);
        currencyPair = constants.DEFAULT_CURRENCY_PAIR;
    }
    
    let priceOscillationPercentage = parseFloat(args[1]);
    if (isNaN(priceOscillationPercentage) || priceOscillationPercentage < constants.MINIMUM_PRICE_OSCILLATION_PERCENTAGE || priceOscillationPercentage > constants.MAXIMUM_PRICE_OSCILLATION_PERCENTAGE) {
        console.log('No price oscillation percentage provided or percentage is not valid. Using default price oscillation percentage: ' + constants.DEFAULT_PRICE_OSCILLATION_PERCENTAGE);
        priceOscillationPercentage = constants.DEFAULT_PRICE_OSCILLATION_PERCENTAGE;
    }
    
    let fetchInterval = parseInt(args[2]);
    if(isNaN(fetchInterval) || fetchInterval < constants.MINIMUM_FETCH_INTERVAL || fetchInterval > constants.MAXIMUM_FETCH_INTERVAL){
        console.log('No fetch interval provided or interval is not valid. Using default fetch interval: ' + constants.DEFAULT_FETCH_INTERVAL);
        fetchInterval = constants.DEFAULT_FETCH_INTERVAL;
    }
    
    console.log(`Currency Pair: ${currencyPair}`);
    console.log(`Price Oscillation Percentage: ${priceOscillationPercentage}`);
    console.log(`Fetch Interval: ${fetchInterval}`);

    await checkOscillations(currencyPair, priceOscillationPercentage, fetchInterval);
}

main();



