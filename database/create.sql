DROP TABLE IF EXISTS alert;
DROP TABLE IF EXISTS currency_pair;

-- Create the 'currency_pair' table
CREATE TABLE currency_pair (
   currency_pair_id serial PRIMARY KEY,
   pair_name VARCHAR(16) UNIQUE NOT NULL
);

-- Create the 'alert' table
CREATE TABLE alert(
   alert_id serial PRIMARY KEY,
   currency_pair_id INTEGER REFERENCES currency_pair(currency_pair_id),
   old_price FLOAT NOT NULL,
   new_price FLOAT NOT NULL,
   bot_price_oscillation_percentage FLOAT NOT NULL,
   bot_fetch_interval INTEGER NOT NULL,
   created_on TIMESTAMP NOT NULL
);

