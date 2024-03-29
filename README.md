# cCarbn

cCarbn aims to be a powerful all-in-one Twitch tool to connect **EVERYTHING** a streamer needs.

This includes a chatbot, configurable Browser Sources, discord live notifications etc...

In other words its goal is to allow content creators to develop custom commands that are currently not possible with alternatives, as well as to integrate that with events not capturable via chat (hype trains and such) and to allow the creation of dynamic single page web apps (through Angular) that can be controlled based on chat and/or events and can ultimately be used as Browser Sources in OBS and such to create powerful alerts and viewer engagement tools.

## GETTING STARTED

Just go to [ccarbn.io](https://ccarbn.io), login with your twitch account and follow the instructions.

<br>
<br>
<br>

# DEVELOPMENT / DEPLOYMENT

## PREREQUISITES

Here's a list of prerequisites that you need to have in order to deploy this project. A more detailed eplaination might be included in the future but it does not really concern the scope of this file.

- A domain name with a valid SSL certificate for such domain (**the Twitch app webhook requires the endpoint to be on a Secure domain, on a development server you can setup a reverse proxy to redirect such requests to your local machine**)
- A mongodb instance installed and running (you can create a free one on <https://www.mongodb.com/cloud/atlas/>)
- Having the twitch 2FA enabled is a Twitch developer prerequisite (I believe, if it's not: you should still use that...)

## SETTING UP A TWITCH DEVELOPER ACCOUNT

You will need to create your own Twitch app for authorization, therefore you are required to enroll (freely) in the Twitch dev program (<https://dev.twitch.tv/>).

Note that whichever account is used to create this app is the account that will actually write to (and read from) chat, so if you want it to be different from your channel account (with which you will still need to log in at some point to authorize the app) you can create a new account with whatever name you like (and is available) and use that instead.

## CREATING A TWITCH APP

After enrolling in the Twitch developer program you need to create a new app, take note of its clientId and secret.

For development, testing or if you are unsure what this does OAuth Redirect URL should be:

`http://localhost:4200/auth/token`

This is used as an endpoint to authenticate to Twitch. What this means is when you want to generate an access token you can do that via a script that will open Google Chrome and listen to the response on that address.

Note that this is unavailable on most production environment, therefore during the process you can chose not to use chrome. This will mean you'll have to run the `init.ts` script from your local machine. The credentials will then be saved on the database and be accessible from the production server.

## INITIALIZATION

After doing that you can clone the project (if you havn't done so already):

```bash
git clone https://github.com/eltharynd/cCarbn
```

Install the libraries for the project (and the initialization script)

```bash
npm install
```

Then you can run the initialization script.

```bash
tsc init.ts && node init.js
```

This will guide you through a setup to create and fill some `*_credentials.json` files in your root directory where the app will store all the necessary authentication data (for Twitch and mongo) as well as your hostname and SSL certificates paths (for developing without a reverse proxy setup). Note that these files should **NOT** be publicly accessible and therefore are excluded from the .git and if you want to deploy this project in a different way than what suggested you should make sure they can't be access eternally.

At the end of the process you'll be asked to delete the `twitch_credentials.json` file. This is because the credentials are now stored on your database.

⚠⚠⚠

**NEVER** share your access tokens with anyone.

This app will **NEVER** ask for your twitch password directly.

**NEVER** put your Twitch password anywhere besides the official twitch link form (that's what's going to pop up).

⚠⚠⚠

You are now ready to start developing.

# DEVELOPING ON YOUR LOCAL ENVIRONMENT

## GETTING STARTED

There's two main components to run:

- Angular
- The node app

you can look in the `package.json` file for the specifics, but there's three scripts in there made to simplify running these (for development).

So you can run these in three different terminals (or terminal tabs in vscode)

```bash
npm run angular-dev
```

```bash
npm run backend-dev1
```

```bash
npm run backend-dev2
```

At this point all terminals will run and watch the code so that any change in the code will reload the necessary components, which are available at:

- Angular: `http://localhost:4200`
- Backend (express/socket.io): `http://localhost:3000` directly or `http://localhost:4200/api` through angular proxy

Note that there's an extra port listening (3001) for the Twitch API webhooks.

### TWITCH EVENTSUB LISTENER

In order to receive events from Twitch you need to have a valid certificate and reverse DNS setup.

You're gonna need to put that in the `enpoint_credentials.json`.

You can use the `init.ts` script to simplify that.

## FRONT-END ONLY DEVELOPMENT

In order to work on the front end you can tell angular to connect to the production backend by using the command

```bash
ng serve --prod
```

# SETTING UP YOUR PRODUCTION ENVIRONMENT

## To be written
