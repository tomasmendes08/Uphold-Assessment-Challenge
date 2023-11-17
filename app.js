const axios = require('axios');
const currencyPair = 'BTC-USD';
const API_URL = 'https://api.uphold.com/v0/ticker/';

// Get the current price of BTC-USD
async function getCurrentPrice() {
    try {
        const response = await axios.get(`${API_URL}${currencyPair}`);
        return response.data.ask;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Main function that checks oscillations of 0.01% or higher on the BTC-USD rate every 5000 ms
async function main() {
    let lastPrice = null;
    while (true) {
        let currentPrice = await getCurrentPrice();
        if(lastPrice === null) lastPrice = currentPrice;
        else if((Math.abs(lastPrice - currentPrice))/lastPrice * 100 >= 0.01){
            console.log('Alert! BTC-USD oscillation detected.\nLast price: ' + lastPrice + '\nCurrent price: ' + currentPrice + '\nPercentage change: ' + Math.abs(lastPrice - currentPrice)/lastPrice * 100 + '%\n');
            lastPrice = currentPrice;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

main();



