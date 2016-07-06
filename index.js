const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const models = require('./models');
const { MessagesRouter } = require('./routes/messages');
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

app.use(auth);

app.locals.concierge = config.concierge;
app.locals.senderId = config.senderId;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));

app.get('/', (req, res, next) => {
  res.render('index', { message: '', content: req.query.content || '', isError: false });
});

app.use('/messages', MessagesRouter);
app.use('/subscribers', SubscribersRouter);
app.use('/sms', SmsRouter);

models.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`SERVER IS LISTENING ON PORT ${PORT}`);
  });
})