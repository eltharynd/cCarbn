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
exports.Storeable = void 0;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var command_1 = require("../../db/models/command");
var mongo_1 = require("../../db/mongo");
var message_1 = require("../message");
var RGX_USER = /\@\w+(\s|$)/gi;
//@user replaces with user sending the message
var RGX_EVAL = /\$eval\(.+\)(\s|$)/gi;
var RGX_RAND = /\$((rand)|(rnd))\d+/gi;
var FORMAT_ERROR = 'This command is formatted wrong... Please check your spelling or consult the documentation...';
var Storeable = /** @class */ (function (_super) {
    __extends(Storeable, _super);
    function Storeable(client) {
        var _this = _super.call(this, client) || this;
        _this.commands = [];
        _this._fetch = function () { return __awaiter(_this, void 0, void 0, function () {
            var buffer, _i, buffer_1, c, command, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, command_1.Command.find({ userId: this.iClient.userId })];
                    case 1:
                        buffer = _d.sent();
                        _i = 0, buffer_1 = buffer;
                        _d.label = 2;
                    case 2:
                        if (!(_i < buffer_1.length)) return [3 /*break*/, 5];
                        c = buffer_1[_i];
                        command = c.toJSON();
                        _a = command;
                        _c = (_b = this.client).onMessage;
                        return [4 /*yield*/, this._generateListener(command)];
                    case 3:
                        _a.listener = _c.apply(_b, [_d.sent()]);
                        this.commands.push(command);
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        //TODO implement mods only commands
        _this.command = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var buffer, edit, name_1, exists, targets, ev, rand, index, parameters, _i, targets_1, i, _a, ev_1, i, _b, rand_1, i, result, listener, name_2, exists, command, found, found, printables, buffer, strings_1, i, _loop_1, i;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!/^!((command)|(cmd)) ((add)|(save)|(edit)|(delete)|(show)|(answer)|(source)) .+$/i.test(message)) return [3 /*break*/, 15];
                        if (!msg.userInfo.isMod && !msg.userInfo.isBroadcaster) {
                            this.client.say(channel, "/me Only mods can edit commands...");
                            return [2 /*return*/];
                        }
                        buffer = message.replace(/^!command /i, '').replace(/^!cmd /i, '');
                        if (!(buffer.startsWith('add') || buffer.startsWith('save') || buffer.startsWith('edit'))) return [3 /*break*/, 6];
                        edit = buffer.startsWith('edit') ? true : false;
                        buffer = buffer.replace('add ', '').replace('save ', '').replace('edit ', '');
                        name_1 = buffer.match(/^\!*\w+ /i);
                        if (!name_1) {
                            this.client.say(channel, "/me ".concat(FORMAT_ERROR));
                            return [2 /*return*/];
                        }
                        name_1 = name_1[0].replace(' ', '');
                        buffer = buffer.replace(/^\!*\w+ /i, '');
                        return [4 /*yield*/, command_1.Command.findOne({ userId: mongo_1.Mongo.ObjectId(this.iClient.userId), command: name_1 })];
                    case 1:
                        exists = _c.sent();
                        if (!edit && exists) {
                            this.client.say(channel, "/me This command already exists... If you want to modify it please use '!cmd edit' instead, if you're not sure what the command is atm you can always use '!cmd source'");
                            return [2 /*return*/];
                        }
                        targets = buffer.match(new RegExp(RGX_USER));
                        ev = buffer.match(new RegExp(RGX_EVAL));
                        rand = buffer.match(new RegExp(RGX_RAND));
                        index = 0;
                        parameters = [];
                        if (targets)
                            for (_i = 0, targets_1 = targets; _i < targets_1.length; _i++) {
                                i = targets_1[_i];
                                parameters.push(i.replace(' ', ''));
                                buffer = buffer.replace(i, "{{".concat(index++, "}} "));
                            }
                        if (ev)
                            for (_a = 0, ev_1 = ev; _a < ev_1.length; _a++) {
                                i = ev_1[_a];
                                parameters.push(i.replace(/\s$/, ''));
                                buffer = buffer.replace(i, "{{".concat(index++, "}} "));
                            }
                        if (rand)
                            for (_b = 0, rand_1 = rand; _b < rand_1.length; _b++) {
                                i = rand_1[_b];
                                parameters.push(i.replace('rand', 'rnd'));
                                buffer = buffer.replace(i, "{{".concat(index++, "}}"));
                            }
                        if (!exists) return [3 /*break*/, 3];
                        exists.command = name_1;
                        exists.answer = buffer;
                        exists.params = parameters;
                        exists.source = message;
                        exists.mods = null;
                        return [4 /*yield*/, exists.save()];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        exists = new command_1.Command({
                            userId: this.iClient.userId,
                            command: name_1,
                            answer: buffer,
                            params: parameters,
                            source: message,
                            mods: null
                        });
                        return [4 /*yield*/, exists.save()];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        result = exists.toJSON();
                        this.commands.push(result);
                        listener = this._generateListener(exists);
                        result.listener = this.client.onMessage(listener);
                        this.client.say(channel, "/me Successfully ".concat(edit ? 'edited' : 'added new', " command..."));
                        return [3 /*break*/, 14];
                    case 6:
                        if (!buffer.startsWith('delete')) return [3 /*break*/, 10];
                        buffer = buffer.replace('delete ', '');
                        name_2 = buffer.match(/^\!*\w+(\s|$)/i);
                        if (!name_2) {
                            this.client.say(channel, "/me ".concat(FORMAT_ERROR));
                            return [2 /*return*/];
                        }
                        name_2 = name_2[0].replace(' ', '');
                        return [4 /*yield*/, command_1.Command.findOne({ userId: this.iClient.userId, command: name_2 })];
                    case 7:
                        exists = _c.sent();
                        if (!exists) {
                            this.client.say(channel, "/me This command doesn't exist...");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, (0, rxjs_1.from)(this.commands)
                                .pipe((0, operators_1.filter)(function (c) { return c.command === name_2; }), (0, operators_1.take)(1))
                                .toPromise()];
                    case 8:
                        command = _c.sent();
                        if (command.listener)
                            command.listener.unbind();
                        return [4 /*yield*/, command_1.Command.deleteOne({ userId: this.iClient.userId, command: name_2 })];
                    case 9:
                        _c.sent();
                        this.commands.splice(this.commands.indexOf(command), 1);
                        this.client.say(channel, "/me Successfully deleted command...");
                        return [3 /*break*/, 14];
                    case 10:
                        if (!buffer.startsWith('show')) return [3 /*break*/, 12];
                        buffer = buffer.replace('show ', '').replace('answer ', '');
                        return [4 /*yield*/, command_1.Command.findOne({ userId: this.iClient.userId, command: buffer })];
                    case 11:
                        found = _c.sent();
                        if (found)
                            this.client.say(channel, "/me Here's the answer for command \"".concat(buffer, "\": `").concat(found.answer, "`"));
                        else
                            this.client.say(channel, "/me I couldn't find such command...");
                        return [3 /*break*/, 14];
                    case 12:
                        if (!buffer.startsWith('source')) return [3 /*break*/, 14];
                        buffer = buffer.replace('source ', '');
                        return [4 /*yield*/, command_1.Command.findOne({ userId: this.iClient.userId, command: buffer })];
                    case 13:
                        found = _c.sent();
                        if (found)
                            this.client.say(channel, "/me Here's the source for command \"".concat(buffer, "\": `").concat(found.source, "`"));
                        else
                            this.client.say(channel, "/me I couldn't find such command...");
                        _c.label = 14;
                    case 14: return [3 /*break*/, 17];
                    case 15:
                        if (!/!commands/.test(message)) return [3 /*break*/, 17];
                        return [4 /*yield*/, (0, rxjs_1.from)(this.commands)
                                .pipe((0, operators_1.map)(function (v, i) {
                                return v.command;
                            }), (0, operators_1.toArray)())
                                .toPromise()
                            //TODO check if message length > 500
                        ];
                    case 16:
                        printables = _c.sent();
                        //TODO check if message length > 500
                        if (!printables || printables.length < 1)
                            this.client.say(channel, "/me No commands saved yet...");
                        else {
                            buffer = "/me There's the current commands: '".concat(printables.join("', '"), "'.");
                            if (buffer.length <= message_1.MAX_CHAT_MESSAGE_LENGTH) {
                                this.client.say(channel, buffer);
                            }
                            else {
                                strings_1 = ["/me There's the current commands: "];
                                for (i = 0; i < printables.length; i++) {
                                    if (strings_1[strings_1.length - 1].length + printables[i].length + 3 > message_1.MAX_CHAT_MESSAGE_LENGTH) {
                                        strings_1.push("'".concat(printables[i], "'"));
                                    }
                                    else {
                                        strings_1[strings_1.length - 1] = strings_1[strings_1.length - 1] + " '".concat(printables[i], "'");
                                    }
                                }
                                _loop_1 = function (i) {
                                    setTimeout(function () {
                                        _this.client.say(channel, strings_1[i]);
                                    }, 500 * (i + 1));
                                };
                                for (i = 0; i < strings_1.length; i++) {
                                    _loop_1(i);
                                }
                            }
                        }
                        _c.label = 17;
                    case 17: return [2 /*return*/];
                }
            });
        }); };
        _this._generateListener = function (command) {
            return function (channel, user, message, msg) {
                var tester = command.command;
                if (new RegExp('^' + tester, 'i').test(message) && (!command.mods || msg.userInfo.isMod || msg.userInfo.isBroadcaster)) {
                    if (_this._timeout(10, tester === '!pp' ? tester + user : tester))
                        return;
                    var answer = command.answer;
                    var inputs_1 = message.replace("".concat(command.command, " "), '').split(' ');
                    var shift = function () {
                        if (inputs_1.length < 1)
                            throw new Error();
                        return inputs_1.shift();
                    };
                    try {
                        for (var i = 0; i < command.params.length; i++) {
                            var p = command.params[i];
                            if (new RegExp(RGX_USER).test(p)) {
                                answer = answer.replace("{{".concat(i, "}}"), /@user/gi.test(p) ? "@".concat(msg.userInfo.displayName) : inputs_1.length === 1 && /@\w+/ ? p : shift());
                            }
                            else if (new RegExp(RGX_EVAL).test(p)) {
                                answer = answer.replace("{{".concat(i, "}}"), "".concat(eval(p.replace(/^\$eval\(/, '').replace(/\)$/, ''))));
                            }
                            else if (new RegExp(RGX_RAND).test(p)) {
                                var num = parseInt(p.replace("$rnd", ''));
                                answer = answer.replace("{{".concat(i, "}}"), "".concat(Math.floor(Math.random() * ++num)));
                            }
                        }
                        _this.client.say(channel, "/me ".concat(answer));
                    }
                    catch (e) {
                        _this.client.say(channel, "/me This command requires more parameters...");
                    }
                }
            };
        };
        _this.confirmation = false;
        _this.flush = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var _i, _a, c;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!/^!cmd flush$/i.test(message)) return [3 /*break*/, 4];
                        if (!!msg.userInfo.isBroadcaster) return [3 /*break*/, 1];
                        this.client.say(channel, "/me Only the streamer can flush all commands from db... ");
                        return [3 /*break*/, 4];
                    case 1:
                        if (!this.confirmation) return [3 /*break*/, 3];
                        return [4 /*yield*/, command_1.Command.deleteMany({ userId: this.iClient.userId })];
                    case 2:
                        _b.sent();
                        for (_i = 0, _a = this.commands; _i < _a.length; _i++) {
                            c = _a[_i];
                            if (c.listener)
                                this.client.removeMessageListener(c.listener);
                        }
                        this.commands = [];
                        this.client.say(channel, "/me Oooohkay boss... deleted everything... I hope you know what you're doing...");
                        this.confirmation = false;
                        return [3 /*break*/, 4];
                    case 3:
                        this.client.say(channel, "/me This command will delete EVERY command you ever saved... They are NOT recoverable... If you're sure about this enter the same command again within 10 seconds...");
                        this.confirmation = true;
                        setTimeout(function () {
                            _this.confirmation = false;
                        }, 10000);
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        _this._fetch();
        _this._init();
        return _this;
    }
    return Storeable;
}(message_1.Message));
exports.Storeable = Storeable;
//# sourceMappingURL=storeable.js.map