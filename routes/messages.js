'use strict';

const { Router } = require('express');

const { History, Draft } = require('../models');
const auth = require('../auth');

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
MessagesRouter.get('/', auth, (...args) => {
  messages.get(...args);
});
MessagesRouter.get('/drafts', auth, (...args) => {
  messages.getDrafts(...args);
});
MessagesRouter.post('/drafts', auth, (...args) => {
  messages.saveDraft(...args);
});

module.exports = { Messages, MessagesRouter };