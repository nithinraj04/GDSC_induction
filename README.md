# URL shortener

(http://shorturl.bvdfb8h6g3cxeyhk.centralindia.azurecontainer.io/)

## Project Description

A simple Node.js application built using Express and Mongoose, that enables users to shorten very long URLs. This application uses a local caching solution to avoid frequent database calls. Some key features include

- **Monetization**: Every 10th request to a shortURL will be redirected to an advertisement.

- **Rate limiter**: Each shortURL has a daily limit, which can be specified as in the config file.

- **DB cache**: An LRU cache has been implemented between the application and database to limit the number of database call, which in turn improves the performance of the application

- **Leaderboard**: Top 100 URLs (based on hit count) will be stored locally and can the statistics will be available for access.


## Usage

### Prerequisites

Make sure you have Node installed. Clone this repository and run the following command to install dependencies. 
``` bash
npm install
```

### Environment variables

This project depends on some environment variables. If you are running this project locally, create a `.env` file at the root for these variables. 

``` bash
MONGODB_URI=
DAILY_LIMIT=
```
Daily limit is the number of daily access requests that can be made to each shortURL

### Running the server

Run the following command:
```bash
npm start
```

## Functionalities

### ShortURL creation
- `POST /shorten`
- `body: { longURL: " " }`


### Retrieving the original URL
- `GET /redir/:shortURL`

### Viewing top `n` URLS
- `GET /top/:n`


**BONUS**: See the advertisement page *in browser*
