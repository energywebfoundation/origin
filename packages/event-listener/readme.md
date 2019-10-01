# Energy Web Foundation: Event Listener

## Warning

This repository/package is not designed for productive usage. Instead it should be used for demonstration and learning purposes.

## How to use

### Configuration

Create a `.env.prod` file in the root of the package with the following contents:

**.env.prod**
```
UI_BASE_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3035"
WEB3="http://localhost:8550"
MANDRILL_API_KEY="REPLACE_WITH_YOUR_API_KEY"
EMAIL_FROM="no-reply@example.com"
EMAIL_REPLY_TO="reply-to@example.com"
```

### Run

From the root of the monorepo, run the following commands in two separate terminals:
1. `yarn run:origin`
2. `yarn run:event-listener`

The listener is now running and will react to every event that might occur on the blockchain.

## About 

Event listeners listen to events on the blockchain and react accordingly.

Components of this repo:
1. **Event Service**
    - Contains and manages starting/stopping multiple listeners
2. **Listener**
    - A listener is a custom component that 
3. **Email service and adapters**
    - Adapters for different email services