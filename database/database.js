const pg = require('pg');

async function connectToDatabase() {
    const dbConfig = {
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT
    };

    const client = new pg.Client(dbConfig);

    client.connect().then(() => {
        console.log('Connected to database');
    }).catch((err) => {
        console.log("Error connecting to database: " + err);
    });

    return client;
}

async function insertBot(client, currencyPairs, priceOscillationPercentage, fetchInterval) {
    const query = {
        text: 'INSERT INTO bot (currency_pairs, price_oscillation_percentage, fetch_interval) VALUES ($1, $2, $3) RETURNING bot_id',
        values: [currencyPairs, priceOscillationPercentage, fetchInterval]
    };

    try {
        const result = await client.query(query);
        console.log('Bot inserted successfully');
        return result.rows[0].bot_id;
    } catch (err) {
        console.log('Error inserting bot: ' + err);
        return undefined;
    }
}

async function insertAlert(client, createdOn, currencyPair, oldPrice, newPrice, percentageChange, botId) {
    const query = {
        text: 'INSERT INTO alert (created_on, currency_pair, old_price, new_price, percentage_change, bot_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        values: [createdOn, currencyPair, oldPrice, newPrice, percentageChange, botId]
    };

    try {
        const result = await client.query(query);
        console.log('Alert inserted successfully');
        return result.rows[0];
    } catch (err) {
        console.log('Error inserting alert: ' + err);
        return undefined;
    }
}

async function getBotById(client, botId) {
    const query = {
        text: 'SELECT * FROM bot WHERE bot_id = $1',
        values: [botId]
    };

    try {
        const result = await client.query(query);
        return result.rows[0];
    } catch (err) {
        console.log('Error retrieving bot: ' + err);
        return undefined;
    }
}

module.exports = {  connectToDatabase,  
                    insertBot,
                    insertAlert,
                    getBotById
                };
