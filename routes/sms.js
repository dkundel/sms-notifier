'use strict';

const { Router } = require('express');
const twilio = require('twilio');

const client = twilio();

const { Subscriber, History } = require('../models');
const config = require('../config');
const auth = require('../auth');

const twilioGating = twilio.webhook();

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

const MESSAGE_INITAL_SUBSCRIPTION = `Welcome to TOA16!
We have set up this SMS service powered by our friends at Twilio in order to notify you in case of changes to the festival program, or other important announcements. You can unsubscribe from these alerts at any time by following the link within the text. Enjoy the festival!
Unsubscribe by clicking:
https://toa.twilio.rocks/u/`;

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

    Subscriber.findAll({
      where: {
        subscribed: true
      }
    }).then(subs => {
      let messages = subs.map(sub => {
        return this.sendMessage(sub.phoneNumber, message)
      });

      return Promise.all(messages).then(() => {
        return History.create({
          content: message,
          count: messages.length
        }).then(historyEntry => {
          res.render('index', { message: `${messages.length} have been sent!`, content: '', isError: false });
        });
      });
    }).catch(err => {
      res.status(500).render('index', { message: err.message, isError: true, content: '' });
    });
  }

  initialMessage(req, res, next) {
    Subscriber.findAll({
      where: {
        subscribed: true
      }
    }).then(subs => {
      let messages = subs.map(sub => {
        return this.sendMessage(sub.phoneNumber, MESSAGE_INITAL_SUBSCRIPTION + sub.phoneNumber);
      });

      return Promise.all(messages).then(() => {
        return History.create({
          content: MESSAGE_INITAL_SUBSCRIPTION,
          count: messages.length
        }).then(historyEntry => {
          res.redirect(`/?m=${messages.length} have been sent!`);
        });
      });
    }).catch(err => {
      res.status(500).render('index', { message: err.message, isError: true, content: '' });
    });
  }

  concierge(req, res, next) {
    let { From, To, Body } = req.body;

    if (From !== config.concierge.targetNumber) {
      client.sendMessage({
        from: config.concierge.twilioNumber,
        to: config.concierge.targetNumber,
        body: `(${From}) ${Body}
[To Call:
tel://${config.concierge.twilioNumber},${From}]`
      }).then(() => {
        res.send('');
      });
    } else {
      // Format:
      // +49111111111: Message
      let splitIdx = Body.indexOf(':');
      if (splitIdx === -1) {
        res.type('text/plain').send(`The format is:
+491111111111: Message`.trim());
      } else {
        let number = Body.substr(0, splitIdx).trim();
        let content = Body.substr(splitIdx + 1).trim();
        client.sendMessage({
          from: config.concierge.twilioNumber,
          to: number,
          body: content
        });
      }
    }
  }

  sendMessage(to, message) {
    let msg = {
      to: to,
      body: message,
      messaging_service_sid: config.messageServiceId
    };

    if (typeof config.senderId === 'string' && config.senderId.length !== 0) {
      msg.from = config.senderId;
    }
    return client.sendMessage(msg);
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
SmsRouter.post('/initial', auth, function (req, res, next) {
  sms.initialMessage(req, res, next);
});
SmsRouter.post('/', twilioGating, function (req, res, next) {
  sms.incomingNews(req, res, next);
});
SmsRouter.post('/message', auth, function (req, res, next) {
  sms.message(req, res, next);
});
SmsRouter.post('/concierge', twilioGating, function (req, res, next) {
  sms.concierge(req, res, next);
});

module.exports = { Sms, SmsRouter };