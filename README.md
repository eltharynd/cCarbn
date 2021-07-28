# GETTING STARTED

In order to get started you will need to create two json files in the root folder (where package.json is) containing your twitch app user and oauth credentials, and your mongodb connection string, as these cannot be included in the git for obvious reasons...

## CREATE THE NECESSARY CREDENTIALS FILES WITH THE SETUP
Run the following to install all nodes packages that come included for convenience
```
npm install
```
Run
 ```
npm run init
 ```
and input the data required

# RUN ON A DEVELOPMENT ENVIRONMENT
Run the following to install all nodes packages that come included for convenience
```
npm install
```

Note that you could install some of this globally, specifically typescript and nodemon so feel free to edit your package.json if you prefer

Open two different terminals, run this on the first to compile typescript in watch mode, so that every edit will recompile the files
```
tsc -w
```
Run this on the second to run your app and have nodemon reload it every time a file gets updated by tsc
```
nodemon dist/index.js
```
