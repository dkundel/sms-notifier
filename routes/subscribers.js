'use strict';

const { Router } = require('express');

const { Subscriber } = require('../models');
const auth = require('../auth');

const LookupsClient = require('twilio').LookupsClient;
const lookupClient = new LookupsClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const ERROR_TEXT = 'We were unable to change your status right now. Please try again later.'
const UNSUBSCRIBE_TEXT = `You were successfully unsubscribed from this service.`
const NOTFOUND_TEXT = 'We could not find you in our database. You are therefore already unsubscribed!'

class Subscribers {
  get(req, res, next) {
    res.render('subscribers', { message: '', isError: false });
  }

  create(req, res, next) {
    let { phoneNumber } = req.body;
    this.addNumber(phoneNumber).then(sub => {
      res.send({ data: sub });
    });
  }

  bulkAdd(req, res, next) {
    let { numbers } = req.body;
    numbers = numbers.split(',');

    numbers = numbers.filter(number => {
      //TODO: Improve phone number verification
      return number.trim().indexOf('+') === 0;
    })

    let promises = numbers.map((...args) => {
      return this.addNumber(...args);
    });

    Promise.all(promises).then(() => {
      res.render('subscribers', { message: `Added ${numbers.length} new numbers to the database`, isError: false });
    }).catch(err => {
      res.render('subscribers', { isError: true, message: err.message });
    });
  }

  addNumber(phoneNumber) {
    phoneNumber = this.sanitizeNumber(phoneNumber);
    return this.verifyNumber(phoneNumber).then(num => {
      if (num === 'invalid') {
        return Promise.resolve(null);
      }
      return Subscriber.findOrCreate({ where: { phoneNumber }, defaults: { subscribed: true }});
    });
  }

  verifyNumber(phoneNumber) {
    return new Promise((resolve, reject) => {
      lookupClient.phoneNumbers(phoneNumber).get((err, info) => {
        if (err && err.status === 404) {
          resolve('invalid');
          return;
        }
        resolve(phoneNumber);
      });
    });
  }

  sanitizeNumber(phoneNumber) {
    return '+' + phoneNumber.trim().replace(/\D/gi, '');
  }

  toggleSubscribe(req, res, next) {
    let number = this.sanitizeNumber(req.params.number);

    Subscriber.findOne({
      phoneNumber: number
    }).then(sub => {
      if (sub) {
        sub.subscribed = false;

        sub.save().then(sub => {
          res.render('unsubscribe', { message: UNSUBSCRIBE_TEXT, isError: false });
        }).catch(err => {
          res.render('unsubscribe', { message: ERROR_TEXT, isError: true });
        });
      } else {
        res.render('unsubscribe', { message: NOTFOUND_TEXT, isError: false })
      }
    }).catch(err => {
      res.render('unsubscribe', { message: ERROR_TEXT, isError: true });
    });
  }
}

const subscribers = new Subscribers();
const SubscribersRouter = Router();
SubscribersRouter.get('/', auth, subscribers.get);
SubscribersRouter.post('/', auth, subscribers.create);
SubscribersRouter.post('/bulk', auth, function (...args) {
  subscribers.bulkAdd(...args);
});
SubscribersRouter.get('/unsubscribe/:number', function (...args) {
  subscribers.toggleSubscribe(...args);
});

module.exports = { Subscribers, SubscribersRouter };