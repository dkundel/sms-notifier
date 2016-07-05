'use strict';

const Router = require('express').Router;
const { Subscriber } = require('../models');

class Subscribers {
  get(req, res, next) {
    Subscriber.findAll().then(subs => {
      res.send({ data: subs });
    });
  }

  create(req, res, next) {
    console.log(req.body);
    let { phoneNumber } = req.body;
    Subscriber.create({ phoneNumber, subscribed: true }).then(sub => {
      res.send({data: sub});
    });
  }
}

const subscribers = new Subscribers();
const SubscribersRouter = Router();
SubscribersRouter.get('/', subscribers.get);
SubscribersRouter.post('/', subscribers.create);

module.exports = { Subscribers, SubscribersRouter };