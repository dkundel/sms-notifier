'use strict';

const { Router } = require('express');

const { Subscriber } = require('../models');
const auth = require('../auth');

class Subscribers {
  get(req, res, next) {
    Subscriber.findAll().then(subs => {
      res.send({ data: subs });
    });
  }

  create(req, res, next) {
    let { phoneNumber } = req.body;
    Subscriber.create({ phoneNumber, subscribed: true }).then(sub => {
      res.send({ data: sub });
    });
  }
}

const subscribers = new Subscribers();
const SubscribersRouter = Router();
SubscribersRouter.get('/', auth, subscribers.get);
SubscribersRouter.post('/', auth, subscribers.create);

module.exports = { Subscribers, SubscribersRouter };