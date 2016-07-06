# sms-notifier
An SMS notification system using Twilio for Berlin Tech Open Air

## Deploy local
### 1. Clone the repo:
```sh
git clone git@github.com/dkundel/sms-notifier.git
cd sms-notifier
```

### 2. Copy Config
```sh
copy _config.js config.js
```

### 3. Fill out fields in config.js

### 4. Install dependencies
```sh
npm install
```

### 5. Start server:
```sh
npm start
```

## Deploying to Heroku

```
heroku create
git push heroku master
heroku open
```

Alternatively, you can deploy your own copy of the app using this button:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)