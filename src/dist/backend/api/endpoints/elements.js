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
exports.ElementsRoutes = void 0;
var elements_1 = require("../../db/models/elements");
var express_1 = require("../express");
var auth_1 = require("./auth");
var mongo_1 = require("../../db/mongo");
var rxjs_1 = require("rxjs");
var uuid = require('uuid');
var ElementsRoutes = /** @class */ (function () {
    function ElementsRoutes() {
    }
    ElementsRoutes.attach = function () {
        var _this = this;
        express_1.Api.endpoints.route('/api/elements/:userId')
            .get(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var elements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, elements_1.Elements.findOne({ userId: mongo_1.Mongo.ObjectId(req.params.userId) })];
                    case 1:
                        elements = _a.sent();
                        if (!!elements) return [3 /*break*/, 4];
                        return [4 /*yield*/, elements_1.Elements.create({ userId: mongo_1.Mongo.ObjectId(req.params.userId), json: [] })];
                    case 2:
                        elements = _a.sent();
                        return [4 /*yield*/, elements.save()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        res.send(elements.json);
                        return [2 /*return*/];
                }
            });
        }); })
            .post(auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var element, userElements, elements, found;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        element = req.body;
                        return [4 /*yield*/, elements_1.Elements.findOne({ userId: mongo_1.Mongo.ObjectId(req.params.userId) })];
                    case 1:
                        userElements = _a.sent();
                        if (!!userElements) return [3 /*break*/, 3];
                        return [4 /*yield*/, elements_1.Elements.create({ userId: mongo_1.Mongo.ObjectId(req.params.userId), json: [] })];
                    case 2:
                        userElements = _a.sent();
                        _a.label = 3;
                    case 3:
                        elements = userElements.json;
                        if (!element._id) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, rxjs_1.from)(elements).pipe((0, rxjs_1.filter)(function (e) { return e._id === element._id; }), (0, rxjs_1.take)(1)).toPromise()];
                    case 4:
                        found = _a.sent();
                        _a.label = 5;
                    case 5:
                        if (found) {
                            element._id = found._id ? found._id : uuid.v4();
                            elements[elements.indexOf(found)] = element;
                        }
                        else {
                            element._id = uuid.v4();
                            elements.push(element);
                        }
                        userElements.json = elements;
                        return [4 /*yield*/, userElements.save()];
                    case 6:
                        _a.sent();
                        res.send(element._id);
                        return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.route('/api/elements/:userId/:elementId')
            .delete(auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userElements, elements, found, _i, elements_2, e, removed, _a, _b, event_1, fileName;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, elements_1.Elements.findOne({ userId: mongo_1.Mongo.ObjectId(req.params.userId) })];
                    case 1:
                        userElements = _c.sent();
                        if (!!userElements) return [3 /*break*/, 3];
                        return [4 /*yield*/, elements_1.Elements.create({ userId: mongo_1.Mongo.ObjectId(req.params.userId), json: [] })];
                    case 2:
                        userElements = _c.sent();
                        _c.label = 3;
                    case 3:
                        elements = userElements.json;
                        for (_i = 0, elements_2 = elements; _i < elements_2.length; _i++) {
                            e = elements_2[_i];
                            if (e._id === req.params.elementId) {
                                found = e;
                                break;
                            }
                        }
                        removed = elements.splice(elements.indexOf(found), 1);
                        userElements.json = elements;
                        return [4 /*yield*/, userElements.save()];
                    case 4:
                        _c.sent();
                        res.send({});
                        if (!(removed.length > 0)) return [3 /*break*/, 8];
                        _a = 0, _b = removed[0].events;
                        _c.label = 5;
                    case 5:
                        if (!(_a < _b.length)) return [3 /*break*/, 8];
                        event_1 = _b[_a];
                        if (!event_1.src) return [3 /*break*/, 7];
                        fileName = event_1.src.replace(/^.+\//g, '');
                        return [4 /*yield*/, express_1.Api.unlink(fileName, req.params.userId)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        _a++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
    };
    return ElementsRoutes;
}());
exports.ElementsRoutes = ElementsRoutes;
//# sourceMappingURL=elements.js.map