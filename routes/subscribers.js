'use strict';

const { Router } = require('express');

const { Subscriber } = require('../models');
const auth = require('../auth');

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
      number = number.trim();

      //TODO: Improve phone number verification
      return number.indexOf('+') === 0;
    })

    let promises = numbers.map(this.addNumber);

    Promise.all(promises).then(() => {
      res.render('subscribers', { message: `Added ${numbers.length} new numbers to the database`, isError: false });
    }).catch(err => {
      res.render('subscribers', { isError: true, message: err.message });
    });
  }

  addNumber(phoneNumber) {
    return Subscriber.findOrCreate({ where: { phoneNumber }, defaults: { subscribed: true }});
  }
}

const subscribers = new Subscribers();
const SubscribersRouter = Router();
SubscribersRouter.get('/', auth, subscribers.get);
SubscribersRouter.post('/', auth, subscribers.create);
SubscribersRouter.post('/bulk', auth, function (...args) {
  subscribers.bulkAdd(...args);
});

module.exports = { Subscribers, SubscribersRouter };