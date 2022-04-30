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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = exports.authMiddleware = void 0;
var api_1 = require("@twurple/api");
var auth_1 = require("@twurple/auth");
var axios_1 = require("axios");
var tokens_1 = require("../../db/models/tokens");
var user_1 = require("../../db/models/user");
var mongo_1 = require("../../db/mongo");
var socket_1 = require("../../socket/socket");
var chat_1 = require("../../twitch/chat");
var express_1 = require("../express");
var uuid = require("uuid");
var authMiddleware = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var token, user;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                token = ((_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.authorization) ? req.headers.authorization.replace(/^Basic\s/, '') : null;
                if (!!token) return [3 /*break*/, 1];
                res.status(403).send('Missing Authorization Header');
                return [2 /*return*/];
            case 1: return [4 /*yield*/, user_1.User.findOne({ token: { $eq: token } })];
            case 2:
                user = _b.sent();
                if (user) {
                    req.headers.authorization = user.toJSON();
                    req.headers.authorization._id = req.headers.authorization._id.toString();
                    if (!user.admin && req.params.userId && req.params.userId !== req.headers.authorization._id) {
                        res.status(403).send("You don't have permission to access this resource...");
                        return [2 /*return*/];
                    }
                    next();
                }
                _b.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.authMiddleware = authMiddleware;
var Auth = /** @class */ (function () {
    function Auth() {
    }
    Auth.attach = function () {
        var _this = this;
        express_1.Api.endpoints.post('/api/auth/token', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var response, token, userProvider, twitch, tokenInfo, user, registered, helixUser, userToken, helixUser, found, userToken, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.body.code || !req.body.redirect || !req.body.state) {
                            res.status(400).send('Invalid Request');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 19, , 20]);
                        return [4 /*yield*/, axios_1.default.post("\n          https://id.twitch.tv/oauth2/token\n          ?client_id=".concat(mongo_1.Mongo.clientId, "\n          &client_secret=").concat(mongo_1.Mongo.clientSecret, "\n          &code=").concat(req.body.code, "\n          &grant_type=authorization_code\n          &state=").concat(req.body.state, "\n          &redirect_uri=").concat(req.body.redirect).replace(/\s/g, ''))];
                    case 2:
                        response = _a.sent();
                        if (!response.data)
                            throw new Error();
                        token = {
                            accessToken: response.data.access_token,
                            refreshToken: response.data.refresh_token,
                            expiresIn: response.data.expires_in,
                            obtainmentTimestamp: Date.now()
                        };
                        userProvider = new auth_1.RefreshingAuthProvider({
                            clientId: mongo_1.Mongo.clientId,
                            clientSecret: mongo_1.Mongo.clientSecret,
                            onRefresh: function (token) { },
                        }, token);
                        twitch = new api_1.ApiClient({
                            authProvider: userProvider
                        });
                        return [4 /*yield*/, twitch.getTokenInfo()];
                    case 3:
                        tokenInfo = _a.sent();
                        user = {
                            twitchId: tokenInfo.userId,
                            twitchName: tokenInfo.userName
                        };
                        return [4 /*yield*/, user_1.User.findOne({ twitchId: user.twitchId })];
                    case 4:
                        registered = _a.sent();
                        if (!!registered) return [3 /*break*/, 8];
                        return [4 /*yield*/, twitch.users.getUserById(user.twitchId)];
                    case 5:
                        helixUser = _a.sent();
                        if (helixUser)
                            user.twitchPic = helixUser.profilePictureUrl;
                        registered = new user_1.User(user);
                        registered.token = "".concat(uuid.v4());
                        return [4 /*yield*/, registered.save()];
                    case 6:
                        _a.sent();
                        token.userId = registered._id;
                        userToken = new tokens_1.UserToken(token);
                        return [4 /*yield*/, userToken.save()];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 18];
                    case 8: return [4 /*yield*/, twitch.users.getUserById(user.twitchId)];
                    case 9:
                        helixUser = _a.sent();
                        if (!helixUser) return [3 /*break*/, 11];
                        registered.twitchPic = helixUser.profilePictureUrl;
                        return [4 /*yield*/, registered.save()];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11:
                        if (!(registered.twitchName !== helixUser.displayName)) return [3 /*break*/, 13];
                        registered.twitchName = helixUser.displayName;
                        return [4 /*yield*/, registered.save()];
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13: return [4 /*yield*/, tokens_1.UserToken.findOne({ userId: registered._id })];
                    case 14:
                        found = _a.sent();
                        if (!found) return [3 /*break*/, 16];
                        token.userId = registered._id;
                        found.overwrite(token);
                        return [4 /*yield*/, found.save()];
                    case 15:
                        _a.sent();
                        return [3 /*break*/, 18];
                    case 16:
                        token.userId = registered._id;
                        userToken = new tokens_1.UserToken(token);
                        return [4 /*yield*/, userToken.save()];
                    case 17:
                        _a.sent();
                        _a.label = 18;
                    case 18:
                        socket_1.Socket.io.emit(req.body.state, {
                            _id: registered._id,
                            name: registered.twitchName,
                            token: registered.token,
                            picture: registered.twitchPic
                        });
                        res.send('token saved');
                        return [3 /*break*/, 20];
                    case 19:
                        err_1 = _a.sent();
                        console.error(err_1);
                        socket_1.Socket.io.emit(req.body.state, err_1);
                        res.status(500).send('Could not verify authentication code with twitch');
                        return [3 /*break*/, 20];
                    case 20: return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.post('/api/auth/resume', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var user, registered, twitch, helixUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = req.body;
                        if (!user) {
                            res.status(400).send('Bad Request');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, user_1.User.findOne({ token: { $eq: req.body.token } })];
                    case 1:
                        registered = _a.sent();
                        if (!!registered) return [3 /*break*/, 2];
                        res.status(401).send('Could not resume session...');
                        return [3 /*break*/, 6];
                    case 2:
                        twitch = new api_1.ApiClient({
                            authProvider: chat_1.Chat.defaultUserProvider
                        });
                        return [4 /*yield*/, twitch.users.getUserById(registered.twitchId)];
                    case 3:
                        helixUser = _a.sent();
                        if (!helixUser) return [3 /*break*/, 5];
                        registered.twitchPic = helixUser.profilePictureUrl;
                        return [4 /*yield*/, registered.save()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        res.send({
                            _id: registered._id,
                            name: registered.twitchName,
                            token: registered.token,
                            picture: registered.twitchPic
                        });
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        }); });
    };
    return Auth;
}());
exports.Auth = Auth;
//# sourceMappingURL=auth.js.map