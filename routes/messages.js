'use strict';

const { Router } = require('express');

const { History, Draft } = require('../models');

class Messages {
  get(req, res, next) {
    History.findAll().then(messages => {
      res.render('messages', { messages, isDraft: false });
    });
  }

  getDrafts(req, res, next) {
    Draft.findAll().then(messages => {
      res.render('messages', { messages, isDraft: true });
    });
  }

  saveDraft(req, res, next) {
    Draft.create({
      content: req.body.message
    }).then(() => {
      res.redirect('/messages/drafts');
    })
  }
}

const messages = new Messages();
const MessagesRouter = Router();
MessagesRouter.get('/', (...args) => {
  messages.get(...args);
});
MessagesRouter.get('/drafts', (...args) => {
  messages.getDrafts(...args);
});
MessagesRouter.post('/drafts', (...args) => {
  messages.saveDraft(...args);
});

module.exports = { Messages, MessagesRouter };