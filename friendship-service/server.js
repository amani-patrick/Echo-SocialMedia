require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const friendsRouter = require('./routes/friends');
const authenticate = require('./middleware/auth')

const app = express();

app.use(express.json());


const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/friendship-service';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', () =>
  console.log('MongoDB connected for friendship-service')
);

app.use('/api/friends', friendsRouter);


app.get('/health', (req, res) => res.send('OK'));

module.exports = app;


if (require.main === module) {
  const PORT = process.env.PORT || 6000;
  app.listen(PORT, () => {
    console.log('Friendship Service started on port', PORT);
  });
}
