require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send("notification Service is running!");
});

app.listen(process.env.PORT || 4000, () => {
  console.log("User Service started.");
});
