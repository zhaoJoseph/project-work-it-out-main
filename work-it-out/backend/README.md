### How to run locally

#### 01. Add .env to backend folder
```
cd work-it-out/backend
```
Add following to .env;
```
ENV=<PORT>
MONGODB_URI=<CONNECTION URL>
```

#### 02. install npm packages
```
npm install
npm run dev
```

### EMV Variables required

#### TWILIO API KEYS:
- TWILIO_AUTH_TOKEN
- TWILIO_ACCOUNT_SID
- TWILIO_SERVICE
- TWILIO_SERVICE_SID

#### GMAIL API KEYS:
- EMAIL_HOST_USER
- CLIENT_ID
- CLIENT_SECRET
- REDIRECT_URI=https://developers.google.com/oauthplayground
- REFRESH_TOKEN