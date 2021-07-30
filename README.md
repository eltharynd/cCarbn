# elthabot

elthabot aims to be a powerful Twitch chatbot, Twitch API interface and Browser Source (for OBS or similar) generator.

In other words it's goal is to allow content creators to develop custom commands that are currently not possible with alternatives such as nightbot, as well as to integrate that with events not capturable via chat (hype trains and such) and to allow the creation of dynamic single page web apps (through Angular) that can be controlled based on chat and/or events and can ultimately be used as Browser Sources in OBS and such.

Althought a GUI Dashboard will eventually come, the coolest functionality will always have to be coded ad-hoc so at least some software development skills are necessary.

## ROADMAP

- After the main project is ready and user friendly I will also develop an elgato Stream Deck plugin for it.
- After that's done I will build a one-click cloud installator for non-developers to use this as well, or at least the basic functionalities

## GETTING STARTED

### Prerequisites

Here's a list of prerequisites that you need to have in order to deploy this project. A more detailed eplaination might be included in the future but it does not really concern the scope of this file.

- A domain name with a valid SSL certificate for such domain (**the Twitch app webhook requires the endpoint to be on a Secure domain, on a development server you can setup a reverse proxy to redirect such requests to your local machine**)
- A mongodb instance installed and running (you can create a free one on <https://www.mongodb.com/cloud/atlas/>)
- Having the twitch 2FA enabled is a Twitch developer prerequisite (I believe, if it's not: you should still use that...)

### Setting up a Twitch developer account

You will need to create your own Twitch app for authorization, therefore you are required to enroll (freely) in the Twitch dev program (<https://dev.twitch.tv/>).

Note that whichever account is used to create this app is the account that will actually write to (and read from) chat, so if you want it to be different from your channel account (with which you will still need to log in at some point to authorize the app) you can create a new account with whatever name you like (and is available) and use that instead.

### Creating a Twitch app

After enrolling in the Twitch developer program you need to create a new app, take note of its clientId.

For development, testing or if you are unsure what this does OAuth Redirect URL should be:

`http://localhost:3000`

This is used as an endpoint to authenticate to Twitch. What this means is when you want to generate an access token you can do that via a script that will open Google Chrome (incognito to prevent authenticating with the wrong account via cookies) and listen to the response on that address.

Note that this is unavailable on most production environment, therefore during the process you can chose not to use chrome and input the accessToken yourself (A handy oauth generator link is included).

### Initialization

After doing that you can clone the project (if you havn't done so already):

```bash
git clone https://github.com/eltharynd/elthabot
```

Then you can run the initialization script. This will guide you through a setup to create and fill some `*_credentials.json` files in your root directory where the app will store all the necessary authentication data (for Twitch and mongo) as well as your hostname and SSL certificates paths. Note that these files should **NOT** be publicly accessible and therefore are excluded from the .git and if you want to deploy this project in a different way than what suggested you should make sure they can't be access eternally.

⚠⚠⚠

**NEVER** share your access tokens with anyone.

This app will **NEVER** ask for your twitch password directly.

**NEVER** put your Twitch password anywhere besides the official twitch link form (that's what's going to pop up).

⚠⚠⚠

Install the libraries for the project (and the setup script)

```bash
npm install
```

Now you can run the aforementioned guided setup script

```bash
node init.js
```

Go through the setup project. You can then verify that everything has been saved correctly by checking the `*_credentials.json` files in the root folder.

These `*_credentials.json` files are then stored in mongodb and deleted on first execution.

You are now ready to start developing.

## DEVELOPING ON YOUR LOCAL ENVIRONMENT

There's two main components to run:

- Angular
- The node app

you can look in the `package.json` file for the specifics, but there's two scripts in there made to simplify running these (for both dev and prod).

So you can run these in three different terminals (or terminal tabs in vscode)

```bash
npm run angular
```

```bash
tsc -w -project backend.tsconfig.json
```

```bash
npm run backend
```

At this point all terminals will run and watch the code so that any change in the code will reload the necessary components, which are available at:

- Angular: `http://localhost:4200`
- Backend (express/socket.io): `http://localhost:3000` directly or `http://localhost:4200/api` through angular proxy

Note that there's an extra port listening (3001) for the Twitch API webhooks.
