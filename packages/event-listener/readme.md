# Energy Web Foundation: Event Listener

## Warning

This repository/package is not designed for productive usage. Instead it should be used for demonstration and learning purposes.

## How to use

Edit your root .env file to the following properties:

**REQUIRED**
- `EVENT_LISTENER_PRIV_KEY` variable that contains the private key to the root `.env` file. Event listener will use this private key to perform transactions on-chain.

**OPTIONAL** (necessary for e-mail notifications)
- `MANDRILL_API_KEY` - API key generated in Mandrill (mandrill.com)
- `EMAIL_FROM` - E-mail from which you want to send email addresses
- `EMAIL_REPLY_TO` - E-mail to which we the users would be able to reply

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
