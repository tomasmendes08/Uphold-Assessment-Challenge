
# Uphold - Bot Assessment Challenge

  

**Challenge**: Utilize the Uphold API to develop a proficient bot capable of providing timely alerts regarding price oscillations on a specific currency pair.

  

## Requirements

  

- Docker

  

- docker-compose

  

## Bot Configuration



| **Argument**                 | **Function**                                                    | **Value**                                                                  | **Default** |
|------------------------------|-----------------------------------------------------------------|----------------------------------------------------------------------------|-------------|
| CURRENCY_PAIRS               | Specify currency pairs for which  bot alerts should be received | Pairs available at Uphold API  separated by comma (e.g. "BTC-USD,ETH-USD") | BTC-USD     |
| PRICE_OSCILLATION_PERCENTAGE | Specify bot's price oscillation  percentage                     | Integer (percentage)                                                       | 0.01        |
| FETCH_INTERVAL               | Specify data retrieval interval  from Uphold API                | Float (milliseconds)                                                       | 5000        |

  

## Bot program (bot & database)

  

### Build docker images

  

Firstly, build *bot* and *database* images:

  

```

docker-compose build

```

  

### Run docker containers

  

Run *bot* and *database* containers with default arguments:

  

```

docker-compose up

```

  

Run *bot* and *database* containers with custom arguments:

  

```

CURRENCY_PAIRS=currency_pairs PRICE_OSCILLATION_PERCENTAGE=price_oscillation_percentage FETCH_INTERVAL=fetch_interval docker-compose up

```

  

Stop containers:

  

```

docker-compose down \\stop both containers

docker-compose down bot \\stop bot container (e.g to run other bot)

```

  

## Database

  

 - Every time a bot is created it is added to the *postgres* database
   with its configuration.
 - Alerts are also stored in the database.

  

### Access database

  

Enter docker *database* container terminal:

  

```

docker exec -it uphold-assessment-challenge-database-1 bash

```

  

Enter *postgres* terminal:

  

```

psql -U user -d bot_database

```

  

## Considerations

  

- The bot keeps alerting the user every time it notices that the price variation exceeded the oscillation percentage value

- A .env file was not created to facilitate the program's running.