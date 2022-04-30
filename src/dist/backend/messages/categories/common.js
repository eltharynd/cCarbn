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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Common = void 0;
var axios_1 = require("axios");
var message_1 = require("../message");
var Common = /** @class */ (function (_super) {
    __extends(Common, _super);
    function Common(iClient) {
        var _this = _super.call(this, iClient) || this;
        _this.hug = function (channel, user, message, msg) {
            if (/^!hug [\@a-zA-Z0-9][a-zA-Z0-9]*/i.test(message)) {
                _this.client.say(channel, "/me @".concat(user, " hugs @").concat((0, message_1.filterParameters)(message)[0].replace('@', ''), " then lowkey licks their cheek!"));
            }
        };
        _this.tuck = function (channel, user, message, msg) {
            if (/^!tuck [\@a-zA-Z0-9][a-zA-Z0-9]*/i.test(message)) {
                _this.client.say(channel, "/me @".concat(user, " tucks @").concat((0, message_1.filterParameters)(message)[0].replace('@', ''), " in their bed! Good Night you PogChamp!"));
            }
        };
        _this.greetings = function (channel, user, message, msg) {
            if (/cCarbn/i.test(message) && (/hi/i.test(message) || /hey/i.test(message) || /hello/i.test(message) || /what's up/i.test(message) || /o\//i.test(message))) {
                var custom = [
                    "@".concat(user, " What's up bud? Nice to see you, hope you're doing fine..."),
                    "@".concat(user, " Hey!!"),
                    "@".concat(user, " Heya bud"),
                    "@".concat(user, " Sup dude"),
                    "@".concat(user, " Hello my friend"),
                    "@".concat(user, " Nice to see you o/"),
                    "@".concat(user, " hey it's been a while, how's things?"),
                    "Oh look, it's @".concat(user, " again... great"),
                    "@".concat(user, " sup? here to chill a bit as well?"),
                    "I was just thinking about you @".concat(user, "!!! D: D: D:"),
                ];
                var options = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
                    "@".concat(user, " this is ACTUALLY funny cause my server just got a 0 on a Math.random which is pretty fucking incredible if you ask me... I didn't even think this was ever gonna happen ngl...")
                ], custom, true), custom, true), custom, true), custom, true), custom, true), custom, true), custom, true), custom, true), custom, true), custom, true), [
                    "@".concat(user, " this is ACTUALLY funny cause my server just got a 1 on a Math.random which is pretty fucking incredible if you ask me... I didn't even think this was ever gonna happen ngl..."),
                ], false);
                _this.client.say(channel, options[Math.floor(Math.random() * options.length)]);
            }
        };
        _this.simp = function (channel, user, message, msg) {
            if (/ simp /i.test(message) || / simp[\?\!]/.test(message) || / simp$/.test(message) || / simping /.test(message) || / simping$/.test(message)) {
                if (_this._timeout(10))
                    return;
                _this.client.say(channel, "/me @".concat(user, " We don't use that language over here..."));
            }
        };
        _this.F = function (channel, user, message, msg) {
            if (/^F$/i.test(message)) {
                if (_this._timeout(20 * 60))
                    return;
                _this.client.say(channel, "/me F");
            }
        };
        _this.quote = function (channel, user, message, msg) {
            if (/^\^$/.test(message)) {
                if (_this._timeout(20 * 60))
                    return;
                _this.client.say(channel, "/me ^^");
            }
        };
        _this.cats = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var facts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!/!cat/i.test(message)) return [3 /*break*/, 2];
                        if (this._timeout(5))
                            return [2 /*return*/];
                        return [4 /*yield*/, axios_1.default.get("https://cat-fact.herokuapp.com/facts")];
                    case 1:
                        facts = (_a.sent()).data;
                        if (facts && facts.length > 0)
                            this.client.say(channel, "/me ".concat(facts[Math.floor(Math.random() * facts.length)].text));
                        else
                            this.client.say(channel, "/me I'm trying to get some cool cat facts but this dudes aren't answering... I suppose that's what you get with free APIs");
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        _this.dogs = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var facts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!/!dog/i.test(message)) return [3 /*break*/, 2];
                        if (this._timeout(5))
                            return [2 /*return*/];
                        return [4 /*yield*/, axios_1.default.get("https://dog-facts-api.herokuapp.com/api/v1/resources/dogs/all")];
                    case 1:
                        facts = (_a.sent()).data;
                        if (facts && facts.length > 0)
                            this.client.say(channel, "/me ".concat(facts[Math.floor(Math.random() * facts.length)].fact));
                        else
                            this.client.say(channel, "/me I'm trying to get some cool dog facts but this dudes aren't answering... I suppose that's what you get with free APIs");
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        _this._init();
        return _this;
    }
    return Common;
}(message_1.Message));
exports.Common = Common;
//# sourceMappingURL=common.js.map