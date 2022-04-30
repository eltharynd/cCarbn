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
exports.Api = void 0;
var express = require("express");
require('express-async-errors');
var http_1 = require("http");
var cors = require("cors");
var bodyParser = require("body-parser");
var __1 = require("..");
var auth_1 = require("./endpoints/auth");
var user_1 = require("./endpoints/user");
var elements_1 = require("./endpoints/elements");
var mongo_1 = require("../db/mongo");
var upload_usage_1 = require("../db/models/upload-usage");
var multer = require("multer");
var tts_1 = require("../external/tts");
var Readable = require('stream').Readable;
var Api = /** @class */ (function () {
    function Api() {
        var _this = this;
        Api.upload = multer({ storage: multer.memoryStorage() }).single('file');
        Api.endpoints = express();
        Api.endpoints.use(cors({
            origin: '*',
            optionsSuccessStatus: 200,
        }));
        Api.endpoints.use(bodyParser.json());
        Api.endpoints.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        });
        Api.endpoints.use(function (err, req, res, next) {
            if (res.headersSent)
                return next(err);
            res.status(500).send({ message: 'Unspecified internal error', details: err.message });
            next(err);
        });
        Api.server = (0, http_1.createServer)(Api.endpoints);
        Api.server.listen(__1.PORT);
        auth_1.Auth.attach();
        user_1.User.attach();
        elements_1.ElementsRoutes.attach();
        Api.endpoints.route('/api/uploads/:userId/:filename')
            .post(auth_1.authMiddleware, Api.upload, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var autoIndexing, file, readStream, plain, extension, i, found;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        autoIndexing = req.headers['autoindexing'] === 'true';
                        file = req.file;
                        readStream = Readable.from(file.buffer);
                        plain = req.params.filename.replace(/\.[^.]+$/gi, '');
                        extension = req.params.filename.replace(plain + '.', '');
                        i = 0;
                        return [4 /*yield*/, mongo_1.Mongo.Upload.findOne({ filename: req.params.filename, 'metadata.userId': mongo_1.Mongo.ObjectId(req.params.userId) })];
                    case 1:
                        found = _a.sent();
                        if (!found) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!!autoIndexing) return [3 /*break*/, 3];
                                            return [4 /*yield*/, upload_usage_1.UploadUsage.remove({ fileId: found._id })];
                                        case 1:
                                            _a.sent();
                                            return [4 /*yield*/, mongo_1.Mongo.Upload.unlink({ _id: found._id }, function (error, unlink) {
                                                    if (error)
                                                        reject(error);
                                                    else
                                                        resolve(unlink);
                                                })];
                                        case 2:
                                            _a.sent();
                                            return [3 /*break*/, 6];
                                        case 3:
                                            if (!found) return [3 /*break*/, 5];
                                            return [4 /*yield*/, mongo_1.Mongo.Upload.findOne({ filename: "".concat(plain, "-").concat(++i, ".").concat(extension), 'metadata.userId': mongo_1.Mongo.ObjectId(req.params.userId) })];
                                        case 4:
                                            found = _a.sent();
                                            return [3 /*break*/, 3];
                                        case 5:
                                            resolve(found);
                                            _a.label = 6;
                                        case 6: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, mongo_1.Mongo.Upload.write({
                            filename: "".concat(plain).concat(i > 0 ? "-".concat(i) : '', ".").concat(extension),
                            metadata: { userId: mongo_1.Mongo.ObjectId(req.params.userId), },
                            contentType: file.mimetype
                        }, readStream, function (error, f) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (error)
                                            return [2 /*return*/, res.status(500).send()];
                                        return [4 /*yield*/, upload_usage_1.UploadUsage.create({
                                                fileId: f._id,
                                                usages: 1
                                            })];
                                    case 1:
                                        _a.sent();
                                        res.send({
                                            //url: /image\//.test(file.mimetype) ? `uploads/${req.params.userId}/${file.originalname}` : null
                                            url: "uploads/".concat(req.params.userId, "/").concat(plain).concat(i > 0 ? "-".concat(i) : '', ".").concat(extension)
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); })
            .get(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var found, readStream, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mongo_1.Mongo.Upload.findOne({ filename: req.params.filename, 'metadata.userId': mongo_1.Mongo.ObjectId(req.params.userId) })];
                    case 1:
                        found = _a.sent();
                        if (!found)
                            return [2 /*return*/, res.status(404).send()];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, mongo_1.Mongo.Upload.read({ _id: found._id })];
                    case 3:
                        readStream = _a.sent();
                        if (!readStream)
                            return [2 /*return*/, res.status(404).send()];
                        res.set({
                            'content-type': found.contentType,
                            'Last-modified': found.updatedAt.toUTCString()
                        });
                        readStream.on("data", function (chunk) {
                            res.write(chunk);
                        });
                        readStream.on("end", function () {
                            res.status(200).end();
                        });
                        readStream.on("error", function (err) {
                            console.error(err);
                            res.status(500).send(err);
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        console.error(e_1);
                        return [2 /*return*/, res.status(500).send()];
                    case 5: return [2 /*return*/];
                }
            });
        }); })
            .delete(auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var found;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mongo_1.Mongo.Upload.findOne({ filename: req.params.filename, metadata: { userId: mongo_1.Mongo.ObjectId(req.params.userId) } })];
                    case 1:
                        found = _a.sent();
                        if (!found)
                            return [2 /*return*/, res.status(404).send()];
                        return [4 /*yield*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                var usage;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            usage = upload_usage_1.UploadUsage.findOne({ fileId: found._id });
                                            if (!(+usage.usages > 1)) return [3 /*break*/, 2];
                                            usage.usages = +usage.usages - 1;
                                            return [4 /*yield*/, usage.save()];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 4];
                                        case 2: return [4 /*yield*/, upload_usage_1.UploadUsage.remove({ fileId: found._id })];
                                        case 3:
                                            _a.sent();
                                            _a.label = 4;
                                        case 4:
                                            mongo_1.Mongo.Upload.unlink({ _id: found._id }, function (error, unlink) {
                                                if (error)
                                                    reject(error);
                                                else
                                                    resolve(unlink);
                                            });
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        res.send({});
                        return [2 /*return*/];
                }
            });
        }); });
        Api.endpoints.get('/api/uploads/:userId/link/:filename', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var found, usages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mongo_1.Mongo.Upload.findOne({ filename: req.params.filename, 'metadata.userId': mongo_1.Mongo.ObjectId(req.params.userId) })];
                    case 1:
                        found = _a.sent();
                        if (!found)
                            return [2 /*return*/, res.status(404).send()];
                        return [4 /*yield*/, upload_usage_1.UploadUsage.findOne({ fileId: found._id })];
                    case 2:
                        usages = _a.sent();
                        if (!!usages) return [3 /*break*/, 4];
                        return [4 /*yield*/, upload_usage_1.UploadUsage.create({
                                fileId: found._id,
                                usages: 1
                            })];
                    case 3:
                        usages = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        usages.usages = +usages.usages + 1;
                        _a.label = 5;
                    case 5: return [4 /*yield*/, usages.save()];
                    case 6:
                        _a.sent();
                        res.send({});
                        return [2 /*return*/];
                }
            });
        }); });
        Api.endpoints.get('/api/uploads/:userId/unlink/:filename', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Api.unlink(req.params.filename, req.params.userId, res)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        Api.endpoints.get('/api/tts/:language/:text', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var text, result, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        text = req.params.text.replace(/\&questionmark\;/gi, '?');
                        if (!text || text.length < 1)
                            return [2 /*return*/, res.status(400).send()];
                        _a = req.params.language;
                        switch (_a) {
                            case 'au': return [3 /*break*/, 1];
                            case 'uk': return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, tts_1.TTS.convert(text, tts_1.TTSVoices.au)];
                    case 2:
                        result = _b.sent();
                        return [3 /*break*/, 7];
                    case 3: return [4 /*yield*/, tts_1.TTS.convert(text, tts_1.TTSVoices.uk)];
                    case 4:
                        result = _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, tts_1.TTS.convert(text, tts_1.TTSVoices.us)];
                    case 6:
                        result = _b.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        if (!result)
                            return [2 /*return*/, res.status(500).send()];
                        try {
                            res.set({
                                'content-type': 'audio/mpeg'
                            });
                            result.pipe(res);
                        }
                        catch (e) {
                            console.error(e);
                            return [2 /*return*/, res.status(500).send()];
                        }
                        return [2 /*return*/];
                }
            });
        }); });
        /*     Api.endpoints.get('/api/status', async (req, res) => {
              res.json({ status: 'UP', test: 'working' })
            }) */
        /*     Api.endpoints.get('*', async (req, res) => {
              res.send(`No route specified... but, HEY!!! I'm working!!`)
            }) */
    }
    Api.unlink = function (filename, userId, res) {
        return __awaiter(this, void 0, void 0, function () {
            var found, usages;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mongo_1.Mongo.Upload.findOne({ filename: filename, 'metadata.userId': mongo_1.Mongo.ObjectId(userId) })];
                    case 1:
                        found = _a.sent();
                        if (!found)
                            return [2 /*return*/, res ? res.status(404).send() : null];
                        return [4 /*yield*/, upload_usage_1.UploadUsage.findOne({ fileId: found._id })];
                    case 2:
                        usages = _a.sent();
                        if (!usages)
                            return [2 /*return*/, res ? res.send("Nothing to do!") : null];
                        if (!(+usages.usages <= 1)) return [3 /*break*/, 5];
                        return [4 /*yield*/, upload_usage_1.UploadUsage.deleteOne({ _id: usages._id })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    mongo_1.Mongo.Upload.unlink({ _id: found._id }, function (error, unlink) {
                                        if (error)
                                            reject(error);
                                        else
                                            resolve(unlink);
                                    });
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        usages.usages = +usages.usages - 1;
                        return [4 /*yield*/, usages.save()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        if (res)
                            res.send({});
                        return [2 /*return*/];
                }
            });
        });
    };
    return Api;
}());
exports.Api = Api;
//# sourceMappingURL=express.js.map