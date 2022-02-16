import express from 'express';

const app = express();
const port = 3000;

app.get('/healthcheck', (req, res) => {
  res.send('All good!');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
hjgjh;
