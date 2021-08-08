"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs = require('fs');
var exit = require('process').exit;
var auth_1 = require("@twurple/auth");
var api_1 = require("@twurple/api");
var Mongoose = require("mongoose");
var open = require("open");
var user_1 = require("./src/backend/db/models/user");
var settings_1 = require("./src/backend/db/models/settings");
var tokens_1 = require("./src/backend/db/models/tokens");
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var createServer = require('http').createServer;
var axios = require('axios')["default"];
var uuid = require('uuid');
var rl = (require('readline')).createInterface({
    input: process.stdin,
    output: process.stdout
});
function questionSync(query) {
    return new Promise(function (resolve) {
        console.log('\x1b[36m');
        rl.question(query + '\n', function (ans) {
            if (/^quit$/.test(ans)) {
                console.log('\x1b[31m%s\x1b[0m', 'Initialization process ended by user...');
                exit();
            }
            resolve(ans);
        });
    });
}
var prepareCredentials = function () { return __awaiter(void 0, void 0, void 0, function () {
    var twitch, mongo, clientId, clientSecret, mConnection;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                try {
                    twitch = JSON.parse('' + fs.readFileSync('twitch_credentials.json'));
                }
                catch (e) {
                    fs.copyFileSync('src/assets/twitch_template.json', 'twitch_credentials.json');
                    twitch = JSON.parse('' + fs.readFileSync('twitch_credentials.json'));
                }
                try {
                    mongo = JSON.parse('' + fs.readFileSync('mongo_credentials.json'));
                }
                catch (e) {
                    fs.copyFileSync('src/assets/mongo_template.json', 'mongo_credentials.json');
                    mongo = JSON.parse('' + fs.readFileSync('mongo_credentials.json'));
                }
                return [4 /*yield*/, questionSync("Enter the twitch app clientId (https://dev.twitch.tv/console/apps):")];
            case 1:
                clientId = _a.sent();
                if (clientId)
                    twitch.clientId = clientId;
                return [4 /*yield*/, questionSync("Enter the twitch app clientSecret (https://dev.twitch.tv/console/apps):")];
            case 2:
                clientSecret = _a.sent();
                if (clientSecret)
                    twitch.clientSecret = clientSecret;
                return [4 /*yield*/, questionSync("Enter the mongo connection string:")];
            case 3:
                mConnection = _a.sent();
                if (mConnection)
                    mongo.connection = mConnection;
                fs.writeFileSync('twitch_credentials.json', JSON.stringify(twitch, null, 4));
                fs.writeFileSync('mongo_credentials.json', JSON.stringify(mongo, null, 4));
                console.log('\x1b[33m%s\x1b[0m', "Configuration successfully saved.");
                return [2 /*return*/];
        }
    });
}); };
var getOauth = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve) { return __awaiter(void 0, void 0, void 0, function () {
                var twitch, app, server, scopes, oauthString;
                return __generator(this, function (_a) {
                    twitch = JSON.parse('' + fs.readFileSync('twitch_credentials.json'));
                    console.log('\x1b[33m%s\x1b[0m', "Attempting to get access token...");
                    app = express();
                    app.use(cors({
                        origin: '*',
                        optionsSuccessStatus: 200
                    }));
                    app.use(bodyParser.json());
                    app.get('/auth/token', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                        var code, response;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    code = (_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.code;
                                    return [4 /*yield*/, axios.post(("\n                https://id.twitch.tv/oauth2/token\n                ?client_id=" + twitch.clientId + "\n                &client_secret=" + twitch.clientSecret + "\n                &code=" + code + "\n                &grant_type=authorization_code\n                &redirect_uri=http://localhost:4200/auth/token").replace(/\s/g, ''))];
                                case 1:
                                    response = _b.sent();
                                    resolve(response.data);
                                    res.status(200).send('Done extracting the token');
                                    server.close();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    server = createServer(app);
                    server.listen(4200);
                    scopes = [
                        'bits:read',
                        'channel:edit:commercial',
                        'channel:manage:broadcast',
                        'channel:manage:polls',
                        'channel:manage:predictions',
                        'channel:manage:redemptions',
                        'channel:manage:schedule',
                        'channel:read:hype_train',
                        'channel:read:polls',
                        'channel:read:predictions',
                        'channel:read:redemptions',
                        'channel:read:subscriptions',
                        'clips:edit',
                        'moderation:read',
                        'user:edit',
                        'user:manage:blocked_users',
                        'user:read:blocked_users',
                        'user:read:broadcast',
                        'user:read:follows',
                        'user:read:subscriptions',
                        'channel:moderate',
                        'chat:edit',
                        'chat:read',
                        'whispers:read',
                        'whispers:edit'
                    ];
                    oauthString = ("https://id.twitch.tv/oauth2/authorize\n            ?client_id=" + twitch.clientId + "\n            &redirect_uri=http://localhost:4200/auth/token\n            &response_type=code\n            &force_verify=true\n            &scope=" + scopes.join('+'))
                        .replace(/\s/g, '');
                    open(oauthString, { app: { name: 'chrome' } });
                    return [2 /*return*/];
                });
            }); })];
    });
}); };
var init = function () { return __awaiter(void 0, void 0, void 0, function () {
    var answer_1, answer, endpoint, hostname, crt, key, data, twitch, mongo_1, token, connected, userProvider, client, tokenInfo, user, existed, admin, userToken, clientToken;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Initialization process starting...");
                console.log('\x1b[33m%s\x1b[0m', "Enter 'quit' anytime to cancel the initialization...");
                console.log('\x1b[33m%s\x1b[0m', "Leave a field empty to just skip it and manually configure it later...");
                if (!(fs.existsSync('twitch_credentials.json') || fs.existsSync('mongo_credentials.json'))) return [3 /*break*/, 5];
                return [4 /*yield*/, questionSync("An initialization already exists... Would you like to reinitialize elthabot's credentials? (y/n)")];
            case 1:
                answer_1 = _a.sent();
                if (!/y/gi.test(answer_1)) return [3 /*break*/, 3];
                return [4 /*yield*/, prepareCredentials()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                console.log('\x1b[33m%s\x1b[0m', "Using existing credentials...");
                _a.label = 4;
            case 4: return [3 /*break*/, 7];
            case 5:
                fs.copyFileSync('src/assets/twitch_template.json', 'twitch_credentials.json');
                fs.copyFileSync('src/assets/mongo_template.json', 'mongo_credentials.json');
                return [4 /*yield*/, prepareCredentials()];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7: return [4 /*yield*/, questionSync("Would you like to setup domain and certificates? (y/n)")];
            case 8:
                answer = _a.sent();
                if (!/y/gi.test(answer)) return [3 /*break*/, 15];
                if (!fs.existsSync('endpoint_credentials.json')) return [3 /*break*/, 10];
                return [4 /*yield*/, questionSync("An initialization already exists... Would you like to reinitialize it? (y/n)")];
            case 9:
                answer = _a.sent();
                if (/y/gi.test(answer))
                    fs.copyFileSync('src/assets/endpoint_template.json', 'endpoint_credentials.json');
                return [3 /*break*/, 11];
            case 10:
                fs.copyFileSync('src/assets/endpoint_template.json', 'endpoint_credentials.json');
                _a.label = 11;
            case 11:
                endpoint = JSON.parse('' + fs.readFileSync('endpoint_credentials.json'));
                return [4 /*yield*/, questionSync("Enter the hostname for the client listener:")];
            case 12:
                hostname = _a.sent();
                if (hostname)
                    endpoint.hostname = hostname;
                return [4 /*yield*/, questionSync("Enter the path to the SSL certificate:")];
            case 13:
                crt = _a.sent();
                if (crt)
                    endpoint.crt = crt;
                return [4 /*yield*/, questionSync("Enter the path to the SSL key:")];
            case 14:
                key = _a.sent();
                if (key)
                    endpoint.key = key;
                fs.writeFileSync('endpoint_credentials.json', JSON.stringify(endpoint, null, 4));
                console.log('\x1b[33m%s\x1b[0m', "Endpoint configuration successfully saved.");
                return [3 /*break*/, 16];
            case 15:
                console.log('\x1b[33m%s\x1b[0m', "Using existing endpoint config...");
                _a.label = 16;
            case 16: return [4 /*yield*/, questionSync("Would you like to generate a new oauth? (y/n)")];
            case 17:
                answer = _a.sent();
                if (!/y/gi.test(answer)) return [3 /*break*/, 38];
                return [4 /*yield*/, questionSync("Can the host device open chrome? (y/n)")];
            case 18:
                answer = _a.sent();
                if (!/y/gi.test(answer)) return [3 /*break*/, 36];
                return [4 /*yield*/, getOauth()];
            case 19:
                data = _a.sent();
                if (!data) return [3 /*break*/, 34];
                twitch = JSON.parse('' + fs.readFileSync('twitch_credentials.json'));
                mongo_1 = JSON.parse('' + fs.readFileSync('mongo_credentials.json'));
                token = {
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    expiresIn: data.expires_in,
                    obtainmentTimestamp: Date.now(),
                    secret: uuid.v4()
                };
                return [4 /*yield*/, new Promise(function (resolve) {
                        Mongoose.connect(mongo_1.connection, { useNewUrlParser: true, useUnifiedTopology: true });
                        Mongoose.connection.on('error', function (error) { console.error(error); resolve(false); });
                        Mongoose.connection.once('open', function () { return resolve(true); });
                    })];
            case 20:
                connected = _a.sent();
                if (!connected) return [3 /*break*/, 32];
                userProvider = new auth_1.RefreshingAuthProvider({
                    clientId: twitch.clientId,
                    clientSecret: twitch.clientSecret,
                    onRefresh: function (token) { }
                }, token);
                client = new api_1.ApiClient({
                    authProvider: userProvider
                });
                return [4 /*yield*/, client.getTokenInfo()];
            case 21:
                tokenInfo = _a.sent();
                user = {
                    twitchId: tokenInfo.userId,
                    twitchName: tokenInfo.userName
                };
                return [4 /*yield*/, user_1.User.findOne({ twitchId: user.twitchId })];
            case 22:
                existed = _a.sent();
                if (!existed) return [3 /*break*/, 25];
                return [4 /*yield*/, tokens_1.UserToken.deleteOne({ userId: existed._id })];
            case 23:
                _a.sent();
                return [4 /*yield*/, settings_1.Settings.deleteOne({ userId: existed._id })];
            case 24:
                _a.sent();
                _a.label = 25;
            case 25: return [4 /*yield*/, user_1.User.deleteOne({ admin: true })];
            case 26:
                _a.sent();
                admin = new user_1.User(user);
                admin.admin = true;
                return [4 /*yield*/, admin.save()];
            case 27:
                _a.sent();
                token.userId = admin._id;
                userToken = new tokens_1.UserToken(token);
                return [4 /*yield*/, userToken.save()];
            case 28:
                _a.sent();
                return [4 /*yield*/, tokens_1.ClientToken.deleteMany()];
            case 29:
                _a.sent();
                clientToken = new tokens_1.ClientToken({
                    userId: token.userId,
                    clientId: twitch.clientId,
                    clientSecret: twitch.clientSecret
                });
                return [4 /*yield*/, clientToken.save()];
            case 30:
                _a.sent();
                console.log('\x1b[33m%s\x1b[0m', "Tokens saved to mongodb...");
                return [4 /*yield*/, questionSync("Do you wanna delete the twitch_credentials.json file? (y/n)")];
            case 31:
                answer = _a.sent();
                if (/y/gi.test(answer)) {
                    fs.unlinkSync('twitch_credentials.json');
                    console.log('\x1b[33m%s\x1b[0m', "Deleted twitch_credentials.json...");
                }
                return [3 /*break*/, 33];
            case 32:
                console.log('\x1b[31m%s\x1b[0m', 'Could not connect to mongodb... Please check your credentials...');
                _a.label = 33;
            case 33: return [3 /*break*/, 35];
            case 34:
                console.log('\x1b[31m%s\x1b[0m', 'Could not retrieve a token... Please check your credentials...');
                _a.label = 35;
            case 35: return [3 /*break*/, 37];
            case 36:
                console.log('\x1b[33m%s\x1b[0m', "Unfortunately there is no way to get a chat user token without confirming from the browser... You will have to upload your token manually... ");
                _a.label = 37;
            case 37: return [3 /*break*/, 39];
            case 38:
                console.log('\x1b[33m%s\x1b[0m', "Using existing oauth...");
                _a.label = 39;
            case 39:
                console.log('\x1b[33m%s\x1b[0m', "Initialization process is over... Shutting down...");
                exit();
                return [2 /*return*/];
        }
    });
}); };
init();
