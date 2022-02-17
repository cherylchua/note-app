import express from 'express';
import knex from 'knex';
import config from './db/knexfile';

const app = express();
const port = 3000;

app.get('/healthcheck', (req, res) => {
  res.send('All good!');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

//initialize knex
const connection = knex(config['development'])