'use strict';

const { Router } = require('express');
const { Subscriber } = require('../models');

const SUBSCRIBE_COMMAND = 'subscribe';
const UNSUBSCRIBE_COMMAND = 'unsubscribe';

const MESSAGE_INVALID_COMMAND = `Hi!
Thanks for messaging us! Valid commands are:
- subscribe
- unsubscribe
We will then keep you up-to-date!
`;

const MESSAGE_THANKS_SUBSCRIBING = `Thanks for subscribing!
We will keep you up-to-date!
If you want to stop receiving messages write 'unsubscribe'.
`;

const MESSAGE_UNSUBSCRIBING = `Sorry to see you leave!
If you want to start receiving messages again, just write:
'subscribe'!
`;

class Sms {
  incomingNews(req, res, next) {
    let { Body, From, To } = req.body;

    if (this.isSubscribeCommand(Body) || this.isUnsubscribeCommand(Body)) {
      Subscriber.upsert({
        phoneNumber: From,
        subscribed: this.isSubscribeCommand(Body)
      }).then(sub => {
        res.type('text/plain');
        if (this.isSubscribeCommand(Body)) {
          res.send(MESSAGE_THANKS_SUBSCRIBING);
        } else {
          res.send(MESSAGE_UNSUBSCRIBING);
        }
      });
    } else {
      res.type('text/plain').send(MESSAGE_INVALID_COMMAND);
    }
  }

  isSubscribeCommand(message) {
    let cleanedUpMessage = message.toLowerCase().trim();
    return cleanedUpMessage === SUBSCRIBE_COMMAND;
  }

  isUnsubscribeCommand(message) {
    let cleanedUpMessage = message.toLowerCase().trim();
    return cleanedUpMessage === UNSUBSCRIBE_COMMAND;
  }
}

const sms = new Sms();
const SmsRouter = Router();
SmsRouter.post('/', function (req, res, next) {
  sms.incomingNews(req, res, next);
});

module.exports = { Sms, SmsRouter };