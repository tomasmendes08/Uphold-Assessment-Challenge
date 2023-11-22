-- Drop tables if they exist
DROP TABLE IF EXISTS bot, alert;

-- Create the 'bot' table
CREATE TABLE bot (
    bot_id serial PRIMARY KEY,
    currency_pairs TEXT[] NOT NULL,
    price_oscillation_percentage FLOAT NOT NULL,
    fetch_interval INTEGER NOT NULL
);

-- Create the 'alert' table
CREATE TABLE alert (
   alert_id serial PRIMARY KEY,
   created_on TIMESTAMP WITH TIME ZONE NOT NULL,
   currency_pair TEXT NOT NULL,
   old_price FLOAT NOT NULL,
   new_price FLOAT NOT NULL,
   percentage_change FLOAT NOT NULL,
   bot_id INTEGER REFERENCES bot(bot_id)
);
