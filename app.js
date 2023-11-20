const axios = require('axios');
const constants = require('./constants');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Get the current price of currencyPair
async function getCurrentPrice(currencyPair) {
    try {
        const response = await axios.get(`${constants.API_URL}${currencyPair}`);
        return parseFloat(response.data.ask);
    } catch (error) {
        console.log("Error -> " + error.response.data.code + ': ' + error.response.data.message);
    }
}

// Function that checks oscillations on the currencyPair rate (higher or equal than priceOscillationPercentage) every delimited time (fetchInterval)
async function checkOscillations(currencyPairs, priceOscillationPercentage, fetchInterval) {
    let lastPrices = {};
    console.log('Checking oscillations...\n');
    console.log(currencyPairs);
    setInterval(async () => {
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

function validateCurrencyPairs(currencyPairs) {
    const currencyPairRegex = /^[A-Z]{3}-[A-Z]{3}(,[A-Z]{3}-[A-Z]{3})*$/;
    return currencyPairRegex.test(currencyPairs);
}

// mainMenu function
async function mainMenu() {
    console.log("*** Welcome to the Uphold Bot ***\n");

    const askCurrencyPairs = async () => {
        return new Promise((resolve) => {
            rl.question('Please enter the currency pairs you want to check separated by comma (e.g. BTC-USD,ETH-USD): ', (currencyPairs) => {
                if (!validateCurrencyPairs(currencyPairs)) {
                    console.log("Invalid currency pairs. Please enter the currency pairs in the correct format (e.g. BTC-USD,ETH-USD).");
                    resolve(askCurrencyPairs()); // Ask for currency pairs again
                } else {
                    resolve(currencyPairs.split(','));
                }
            });
        });
    };

    const askPriceOscillationPercentage = async (currencyPairs) => {
        return new Promise((resolve) => {
            rl.question('Please enter the price oscillation percentage (e.g. 0.01): ', (priceOscillationPercentage) => {
                // Validate priceOscillationPercentage
                if (parseFloat(priceOscillationPercentage) >= constants.MINIMUM_PRICE_OSCILLATION_PERCENTAGE && parseFloat(priceOscillationPercentage) <= constants.MAXIMUM_PRICE_OSCILLATION_PERCENTAGE) {
                    resolve(parseFloat(priceOscillationPercentage));
                } else {
                    console.log(`Invalid price oscillation percentage. Please enter a value between ${constants.MINIMUM_PRICE_OSCILLATION_PERCENTAGE} and ${constants.MAXIMUM_PRICE_OSCILLATION_PERCENTAGE}.`);
                    resolve(askPriceOscillationPercentage(currencyPairs)); // Ask for price oscillation percentage again
                }
            });
        });
    };

    const askFetchInterval = async (priceOscillationPercentage) => {
        return new Promise((resolve) => {
            rl.question('Please enter the fetch interval in milliseconds (e.g. 5000): ', (fetchInterval) => {
                // Validate fetchInterval
                if (parseInt(fetchInterval) >= constants.MINIMUM_FETCH_INTERVAL && parseInt(fetchInterval) <= constants.MAXIMUM_FETCH_INTERVAL) {
                    resolve(parseInt(fetchInterval));
                } else {
                    console.log(`Invalid fetch interval. Please enter a value between ${constants.MINIMUM_FETCH_INTERVAL} and ${constants.MAXIMUM_FETCH_INTERVAL}.`);
                    resolve(askFetchInterval(priceOscillationPercentage)); // Ask for fetch interval again
                }
            });
        });
    };

    const currencyPairs = await askCurrencyPairs();
    const priceOscillationPercentage = await askPriceOscillationPercentage(currencyPairs);
    const fetchInterval = await askFetchInterval(priceOscillationPercentage);

    return { currencyPairs, priceOscillationPercentage, fetchInterval };
}

// Main function
async function main() {
    const { currencyPairs, priceOscillationPercentage, fetchInterval } = await mainMenu();

    console.log(`\nCurrency Pairs: ${currencyPairs}`);
    console.log(`Price Oscillation Percentage: ${priceOscillationPercentage}`);
    console.log(`Fetch Interval: ${fetchInterval}\n`);

    await checkOscillations(currencyPairs, priceOscillationPercentage, fetchInterval);
}

main();
