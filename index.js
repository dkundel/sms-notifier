const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const models = require('./models');
const { SubscribersRouter } = require('./routes/subscribers');
const { SmsRouter } = require('./routes/sms');
const config = require('./config');

const app = express();
const PORT = process.env.PORT || 3000;

const auth = require('./auth');

app.use(bodyParser.json({})) 
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res, next) => {
  res.render('index', { message: '' });
});

app.use('/subscribers', SubscribersRouter);
app.use('/sms', SmsRouter);

models.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`SERVER IS LISTENING ON PORT ${PORT}`);
  });
})