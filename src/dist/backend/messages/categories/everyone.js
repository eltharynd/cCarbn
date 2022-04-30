"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Everyone = void 0;
var axios_1 = require("axios");
var message_1 = require("../message");
var Everyone = /** @class */ (function (_super) {
    __extends(Everyone, _super);
    function Everyone(iClient) {
        var _this = _super.call(this, iClient) || this;
        _this.timeout = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.settings.everyone.timeout.enabled) return [3 /*break*/, 4];
                        if (!message.match(new RegExp('!' + this.settings.everyone.timeout.command, 'i'))) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.timeout(channel, user, 1, "!".concat(this.settings.everyone.timeout.command, " command"))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        if (e_1 === 'bad_timeout_broadcaster' && this.settings.everyone.timeout.streamer.reply)
                            this.client.say(channel, this._replace(this.settings.everyone.timeout.streamer.message, user));
                        else if (e_1 === 'bad_timeout_self' && this.settings.everyone.timeout.self.reply)
                            this.client.say(channel, this._replace(this.settings.everyone.timeout.self.message, user));
                        else if (e_1 === 'bad_timeout_moderator' && this.settings.everyone.timeout.mod.reply)
                            this.client.say(channel, this._replace(this.settings.everyone.timeout.mod.message, user));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        _this.pantsGrabBackToCakeums = function (channel, user, message, msg) {
            if (/cakeums/i.test(user) && /PantsGrab$/i.test(message)) {
                _this.client.say(channel, "/me @".concat(msg.userInfo.displayName, " no u nouCHEER"));
                setTimeout(function () {
                    _this.client.say(channel, "/me @".concat(msg.userInfo.displayName, " also PantsGrab"));
                }, 750);
            }
            else if (/!cakeums/gi.test(message) || /!cake/gi.test(message) || /!haley/gi.test(message)) {
                _this.client.say(channel, "/me @cakeums PantsGrab");
            }
        };
        _this.andreJeron = function (channel, user, message, msg) {
            if (/^!andre/i.test(message) || /^!jeron/i.test(message) || /^!jf0rce/i.test(message)) {
                if (_this._timeout(10))
                    return;
                var timeout_1 = 750;
                _this.client.say(channel, "/me I\u2019ve known Andre a long time. Too long. He\u2019s a bit full of himself- why do you think he never wears a shirt. His craftsmanship is poor- I can buy his weapon smith box and do just as good of a job myself. He price gouges. ");
                setTimeout(function () {
                    _this.client.say(channel, "/me He charges 800 for a damn titanite shard. 800 human souls for a ROCK- when I can easily get one from the frail and decrepit hollows that he\u2019s got protecting his workshop. The man is charging 20000 human souls for a key to a door, when there\u2019s a perfectly good back way that provides a scenic route AND doesn\u2019t have killer trees blocking the path. ");
                    setTimeout(function () {
                        _this.client.say(channel, "/me Cake is right in her decision, Andre is the reason the world is falling to crumbles. He\u2019s essentially the bezos of souls. Open your eyes people");
                        setTimeout(function () {
                            _this.client.say(channel, "/me tho this is necessary for the run, I have to say I really do not agree with this.... RIP andre");
                        }, 1500);
                    }, timeout_1);
                }, timeout_1);
            }
        };
        _this.time = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var par, data, e_2, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!/^!time \w+/i.test(message)) return [3 /*break*/, 10];
                        par = message.replace(/^!time [\w\s\/]+/i, '');
                        data = void 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get("http://worldtimeapi.org/api/timezone/".concat(par))];
                    case 2:
                        data = (_a.sent()).data;
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        if (!(data && data.abbreviation)) return [3 /*break*/, 5];
                        this.client.say(channel, "/me I've found time for timezone ".concat(data.abbreviation, " do be ").concat(data.datetime.slice(11, 16)));
                        return [2 /*return*/];
                    case 5:
                        if (!(data && data.length && data.length > 0)) return [3 /*break*/, 6];
                        this.client.say(channel, "/me I've found multiple results... try one of the following: ".concat(data[0], ", ").concat(data[1], ", ").concat(data[2], ", ..."));
                        return [2 /*return*/];
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, axios_1.default.get("http://worldtimeapi.org/api/timezone/".concat(par.replace(/ /g, '_')))];
                    case 7:
                        data = (_a.sent()).data;
                        return [3 /*break*/, 9];
                    case 8:
                        e_3 = _a.sent();
                        return [3 /*break*/, 9];
                    case 9:
                        if (data && data.abbreviation) {
                            this.client.say(channel, "/me I've found time for timezone ".concat(data.abbreviation, " do be ").concat(data.datetime.slice(11, 16)));
                            return [2 /*return*/];
                        }
                        else if (data && data.length && data.length > 0) {
                            this.client.say(channel, "/me I've found multiple results... try one of the following: ".concat(data[0], ", ").concat(data[1], ", ").concat(data[2], ", ..."));
                            return [2 /*return*/];
                        }
                        else {
                            this.client.say(channel, "/me I could not find that timezone... try something like '!time CET' (Central European Time, uncle sam....)");
                        }
                        _a.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        }); };
        //TODO refactor into it's own thing
        _this.voters = {};
        _this.birds = {};
        _this.voting = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var bird, who, winner_1, tier_1, votes_1, total_1, _i, _a, key, item, winner, tier, votes, total, _b, _c, key, item, string, _d, _e, key;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!/^!vote \w+$/.test(message)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, message_1.filterParameters)(message)];
                    case 1:
                        bird = (_f.sent())[0].toLowerCase();
                        who = user.toLowerCase();
                        if (this.voters[who]) {
                            this.birds[bird] = Math.max(0, (this.birds[bird] ? +this.birds[bird] : 0) + 1);
                            this.birds[this.voters[who]] = Math.max(0, (this.birds[this.voters[who]] ? +this.birds[this.voters[who]] : 0) - 1);
                            this.client.say(channel, "/me ".concat(msg.userInfo.displayName, " changed his previous vote to frick '").concat(this.voters[who], "', he now wants to frick '").concat(bird, "' instead"));
                            this.voters[who] = bird;
                        }
                        else {
                            this.birds[bird] = (this.birds[bird] ? +this.birds[bird] : 0) + 1;
                            this.voters[who] = bird;
                            this.client.say(channel, "/me ".concat(msg.userInfo.displayName, " voted to frick '").concat(bird, "'."));
                        }
                        votes_1 = 0;
                        total_1 = 0;
                        for (_i = 0, _a = Object.keys(this.birds); _i < _a.length; _i++) {
                            key = _a[_i];
                            item = this.birds[key];
                            total_1 += this.birds[key];
                            if (item > votes_1) {
                                winner_1 = key;
                                tier_1 = null;
                                votes_1 = item;
                            }
                            else if (item === votes_1) {
                                tier_1 = key;
                            }
                        }
                        if (tier_1) {
                            setTimeout(function () {
                                _this.client.say(channel, "/me '".concat(winner_1, "' and '").concat(tier_1, "' are currently tied on top to be fricked next. They've got a total of ").concat(votes_1, " votes winning with a ").concat((Math.floor((votes_1 / total_1) * 100) / 100) * 100, "%. What should we do if they end up tied? frick em both?"));
                            }, 1000);
                        }
                        else {
                            setTimeout(function () {
                                _this.client.say(channel, "/me '".concat(winner_1, "' is currently on top to be fricked next. It's got a total of ").concat(votes_1, " votes winning with a ").concat((Math.floor((votes_1 / total_1) * 100) / 100) * 100, "%."));
                            }, 1000);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        if (/^!votereset$/.test(message) && (msg.userInfo.isMod || msg.userInfo.isBroadcaster)) {
                            this.client.say(channel, "/me votes have been reset.");
                            this.voters = {};
                            this.birds = {};
                        }
                        else if (/^!votestatus$/.test(message)) {
                            if (Object.keys(this.voters).length < 1) {
                                this.client.say(channel, "/me there are currently no votes.... prick!");
                                return [2 /*return*/];
                            }
                            winner = void 0;
                            tier = void 0;
                            votes = 0;
                            total = 0;
                            for (_b = 0, _c = Object.keys(this.birds); _b < _c.length; _b++) {
                                key = _c[_b];
                                item = this.birds[key];
                                total += this.birds[key];
                                if (item > votes) {
                                    winner = key;
                                    tier = null;
                                    votes = item;
                                }
                                else if (item === votes) {
                                    tier = key;
                                }
                            }
                            if (tier) {
                                this.client.say(channel, "/me '".concat(winner, "' and '").concat(tier, "' are currently tied on top to be fricked next. They've got a total of ").concat(votes, " votes winning with a ").concat((Math.floor((votes / total) * 100) / 100) * 100, "%. What should we do if they end up tied? frick em both?"));
                            }
                            else {
                                this.client.say(channel, "/me '".concat(winner, "' is currently on top to be fricked next. It's got a total of ").concat(votes, " votes winning with a ").concat((Math.floor((votes / total) * 100) / 100) * 100, "%."));
                            }
                        }
                        else if (/^!votelist/i.test(message)) {
                            if (Object.keys(this.voters).length < 1) {
                                this.client.say(channel, "/me there are currently no votes.... prick!");
                                return [2 /*return*/];
                            }
                            string = void 0;
                            for (_d = 0, _e = Object.keys(this.birds); _d < _e.length; _d++) {
                                key = _e[_d];
                                if (string)
                                    string += ', ';
                                else
                                    string = '';
                                string += "".concat(key, ": ").concat(this.birds[key]);
                            }
                            this.client.say(channel, "/me Here's the current casts: ".concat(string));
                        }
                        else if (/^!vote/i.test(message)) {
                            this.client.say(channel, "/me You can cast your votes by typing '!vote YOUR_VOTE' or check status with '!votestatus'");
                        }
                        _f.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        _this.justice = function (channel, user, message, msg) {
            if (/!justice/.test(message)) {
                if (_this._timeout(20))
                    return;
                _this.client.say(channel, "I have brought peace, freedom, justice, and security to my new empire.");
                setTimeout(function () {
                    _this.client.say(channel, "Your new empire?");
                    setTimeout(function () {
                        _this.client.say(channel, "Don't make me kill you.");
                        setTimeout(function () {
                            _this.client.say(channel, "Anakin, my allegiance is to the Republic, to Democracy!");
                            setTimeout(function () {
                                _this.client.say(channel, "If you are not with me, then you are my enemy.");
                                setTimeout(function () {
                                    _this.client.say(channel, "Only a Sith deals in absolutes. I will do what I must.");
                                    setTimeout(function () {
                                        _this.client.say(channel, "You will try.");
                                    }, 3500);
                                }, 2500);
                            }, 2500);
                        }, 2500);
                    }, 1500);
                }, 7000);
            }
        };
        _this.eightBall = function (channel, user, message, msg) {
            if (/!8ball/i.test(message)) {
                var samples = [
                    'As I see it, yes.',
                    'Ask again later.',
                    'Better not tell you now.',
                    'Cannot predict now.',
                    'Concentrate and ask again.',
                    "Don't count on it.",
                    'It is certain.',
                    'It is decidedly so.',
                    'Most likely.',
                    'My reply is no.',
                    'My sources say no.',
                    'Outlook not so good.',
                    'Outlook good.',
                    'Reply hazy, try again.',
                    'Signs point to yes.',
                    'Very doubtful.',
                    'Without a doubt.',
                    'Yes.',
                    'Yes - definitely.',
                    'You may rely on it.',
                ];
                _this.client.say(channel, "/me @".concat(msg.userInfo.displayName, " ").concat(samples[Math.floor(Math.random() * samples.length)]));
            }
        };
        _this.dadjokes = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var facts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!/^!hitusup/i.test(message)) return [3 /*break*/, 2];
                        if (this._timeout(5))
                            return [2 /*return*/];
                        return [4 /*yield*/, axios_1.default.get("https://icanhazdadjoke.com/", {
                                headers: {
                                    Accept: 'application/json',
                                },
                            })];
                    case 1:
                        facts = (_a.sent()).data;
                        if (facts)
                            this.client.say(channel, "/me ".concat(facts.joke));
                        else
                            this.client.say(channel, "/me I'm trying to get some cool dad jokes but this dudes aren't answering... I suppose that's what you get with free APIs");
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        _this.darkjokes = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var result_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!/^!dark/i.test(message)) return [3 /*break*/, 2];
                        if (this._timeout(5))
                            return [2 /*return*/];
                        return [4 /*yield*/, axios_1.default.get("https://v2.jokeapi.dev/joke/Dark" + '?blacklistFlags=religious,political,racist,sexist', {
                                headers: {
                                    Accept: 'application/json',
                                },
                            })];
                    case 1:
                        result_1 = (_a.sent()).data;
                        if (result_1 && result_1.joke) {
                            this.client.say(channel, "/me ".concat(result_1.joke));
                        }
                        else if (result_1 && result_1.setup) {
                            this.client.say(channel, "/me ".concat(result_1.setup));
                            setTimeout(function () {
                                _this.client.say(channel, "/me ".concat(result_1.delivery));
                            }, 5000);
                        }
                        else
                            this.client.say(channel, "/me I'm trying to get some cool dark jokes but this dudes aren't answering... I suppose that's what you get with free APIs");
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        _this._init();
        return _this;
    }
    return Everyone;
}(message_1.Message));
exports.Everyone = Everyone;
//# sourceMappingURL=everyone.js.map