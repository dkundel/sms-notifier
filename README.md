# SMS Notification System
An SMS notification system using Twilio for Berlin Tech Open Air. 

It contains broadcasting as well as a separate concierge service that allows you to configure a special number that will be forwarded to one central number so you don't have to hand out your own.

## Deploying to Heroku

```
heroku create
git push heroku master
heroku open
```

Alternatively, you can deploy your own copy of the app using this button:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Deploying locally
### 1. Clone the repo:
```sh
git clone git@github.com/dkundel/sms-notifier.git
cd sms-notifier
```

### 2. Fill out fields in config.js

### 3. Install dependencies
```sh
npm install
```

### 4. Start server:
```sh
npm start
```
