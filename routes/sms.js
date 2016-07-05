'use strict';

const { Router } = require('express');
const twilio = require('twilio');

const client = twilio();

const { Subscriber } = require('../models');
const config = require('../config');
const auth = require('../auth');

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

  message(req, res, next) {
    let { message } = req.body;

    Subscriber.findAll().then(subs => {
      let messages = subs.map(sub => {
        return this.sendMessage(sub.phoneNumber, message)
      });

      Promise.all(messages).then(() => {
        res.render('index', { message: `${messages.length} have been sent!`});
      }).catch(err => {
        res.status(500).render('index', { message: err.message});
      });
    });
  }

  concierge(req, res, next) {
    let { From, To, Body } = req.body;

    if (From !== config.conciergeNumber) {
      client.sendMessage({
        from: config.twilioNumber,
        to: config.conciergeNumber,
        body: `(${From}) ${Body}`
      }).then(() => {
        res.send('');
      });
    } else {
      // Format:
      // +49111111111: Message
      let splitIdx = Body.indexOf(':');
      if (splitIdx === -1) {
        res.type('text/plain').send(`The format is:
Number: Message
        `.trim());
      } else {
        let number = Body.substr(0, splitIdx).trim();
        let content = Body.substr(splitIdx+1).trim();
        client.sendMessage({
          from: config.twilioNumber,
          to: number,
          body: content
        });
      }
    }
  }

  sendMessage(to, message) {
    return client.sendMessage({
      from: 'Twitch',
      to: to,
      body: message
    });
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
SmsRouter.post('/message', auth, function (req, res, next) {
  sms.message(req, res, next);
});
SmsRouter.post('/concierge', function (req, res, next) {
  sms.concierge(req, res, next);
});

module.exports = { Sms, SmsRouter };