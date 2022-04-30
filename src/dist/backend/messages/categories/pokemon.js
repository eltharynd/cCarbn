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
exports.Pokemon = void 0;
var axios_1 = require("axios");
var message_1 = require("../message");
var Pokemon = /** @class */ (function (_super) {
    __extends(Pokemon, _super);
    function Pokemon(iClient) {
        var _this = _super.call(this, iClient) || this;
        _this.evolution = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var pokemon, data, error_1, chain, process_1, text, i, pokemon_1, j, pokemon2, k, pokemon3, l, pokemon4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(/^!evo [\w\s]+/i.test(message) || /^!evol [\w\s]+/i.test(message) || /^!evolution [\w\s]+/i.test(message) || /^!evolve [\w\s]+/i.test(message))) return [3 /*break*/, 6];
                        pokemon = message.replace(/^!\w+ /, '').toLowerCase();
                        data = void 0;
                        if (pokemon === 'rockruff' || pokemon === ' lycanroc') {
                            this.client.say(channel, "/me listen, it's compilcated... just check this shit out https://bulbapedia.bulbagarden.net/wiki/Rockruff_(Pok%C3%A9mon)#Evolution");
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get("https://pokeapi.co/api/v2/pokemon-species/".concat(pokemon.replace(' ', '-')))];
                    case 2:
                        data = (_a.sent()).data;
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.client.say(channel, "/me Sorry I couldn't find that pokemon... check your spelling bitch!");
                        return [2 /*return*/];
                    case 4:
                        if (!data || !data.id) {
                            this.client.say(channel, "/me Sorry I couldn't find that pokemon... check your spelling bitch!");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, axios_1.default.get("".concat(data.evolution_chain.url))];
                    case 5:
                        chain = (_a.sent()).data.chain;
                        process_1 = function (pokemon) {
                            var _a, _b;
                            var text = '';
                            var details = pokemon.evolution_details[pokemon.evolution_details.length - 1];
                            text += " evolves into ".concat(pokemon.species.name.toUpperCase());
                            if (details.min_level > 0)
                                text += " at lvl ".concat(details.min_level);
                            if (details.item)
                                text += " by using ".concat(details.item.name.toUpperCase());
                            if (((_a = details.trigger) === null || _a === void 0 ? void 0 : _a.name) === 'trade')
                                text += " from trading";
                            if (((_b = details.trigger) === null || _b === void 0 ? void 0 : _b.name) === 'spin')
                                text += " from spinning around";
                            if (details.trade_species)
                                text += " with a ".concat(details.trade_species.name.toUpperCase());
                            if (details.held_item)
                                text += " while holding ".concat(details.held_item.name.toUpperCase());
                            if (details.min_happiness)
                                text += " from high happiness";
                            if (details.min_affection)
                                text += " from high affection";
                            if (details.turn_upside_down)
                                text += " while holding your console upside down";
                            if (details.min_beauty)
                                text += " from high beauty";
                            if (details.needs_overworld_rain)
                                text += " only when raining";
                            if (details.time_of_day)
                                text += " only during the ".concat(details.time_of_day);
                            if (details.known_move)
                                text += " whilst knowing ".concat(details.known_move.name.toUpperCase());
                            if (details.location)
                                text += " when in the ".concat(details.location.name.toUpperCase());
                            if (details.known_move_type)
                                text += " whilst knowing a ".concat(details.known_move_type.name.toUpperCase(), " move");
                            if (details.relative_physical_stats !== null)
                                text += " only when ".concat(details.relative_physical_stats > 0 ? 'ATT>SPA' : details.relative_physical_stats < 0 ? 'SPA>ATT' : 'ATT=SPA');
                            return text;
                        };
                        text = chain.species.name.toUpperCase();
                        if (chain.evolves_to.length > 0) {
                            for (i = 0; i < chain.evolves_to.length; i++) {
                                pokemon_1 = chain.evolves_to[i];
                                text += process_1(pokemon_1);
                                for (j = 0; j < pokemon_1.evolves_to.length; j++) {
                                    pokemon2 = pokemon_1.evolves_to[j];
                                    text += process_1(pokemon2);
                                    for (k = 0; k < pokemon2.evolves_to.length; k++) {
                                        pokemon3 = pokemon2.evolves_to[k];
                                        text += process_1(pokemon3);
                                        for (l = 0; l < pokemon3.evolves_to.length; l++) {
                                            pokemon4 = pokemon3.evolves_to[l];
                                            text += process_1(pokemon4);
                                        }
                                    }
                                }
                                if (i >= 0 && i < chain.evolves_to.length - 1)
                                    text += ' or it';
                            }
                        }
                        else
                            text += " does not evolve.";
                        this.client.say(channel, "/me ".concat(text).replace(/\n/g, ''));
                        return [3 /*break*/, 7];
                    case 6:
                        if (/^!evo/i.test(message)) {
                            this.client.say(channel, "/me You didn't specify a pokemon to look up for... You piece of shit...");
                        }
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        _this.weakness = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var pokemon, data, error_2, weaknesses, _i, _a, t, _b, _c, weakness, _d, weaknesses_1, w, _e, _f, key, relation, multiplier, _g, relation_1, type, ordered, _h, _j, key, weakString, resistString, immuneString, _k, ordered_1, type;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        if (!/^!weak [\w\s]+/i.test(message)) return [3 /*break*/, 9];
                        pokemon = message.replace(/^!weak /, '');
                        data = void 0;
                        if (pokemon === 'joe') {
                            this.client.say(channel, "/me joe mama is weak to [PHYSICAL_EXERCISE] unless it's also [SLEEPING_WITH_CHAT]. Awkward");
                            return [2 /*return*/];
                        }
                        _l.label = 1;
                    case 1:
                        _l.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get("https://pokeapi.co/api/v2/pokemon/".concat(pokemon.replace(' ', '-')))];
                    case 2:
                        data = (_l.sent()).data;
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _l.sent();
                        this.client.say(channel, "/me Sorry I couldn't find that pokemon... check your spelling bitch!");
                        return [2 /*return*/];
                    case 4:
                        if (!data || !data.types) {
                            this.client.say(channel, "/me Sorry I couldn't find that pokemon... check your spelling bitch!");
                            return [2 /*return*/];
                        }
                        weaknesses = [];
                        _i = 0, _a = data.types;
                        _l.label = 5;
                    case 5:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        t = _a[_i];
                        _c = (_b = weaknesses).push;
                        return [4 /*yield*/, axios_1.default.get(t.type.url)];
                    case 6:
                        _c.apply(_b, [(_l.sent()).data]);
                        _l.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8:
                        weakness = {};
                        for (_d = 0, weaknesses_1 = weaknesses; _d < weaknesses_1.length; _d++) {
                            w = weaknesses_1[_d];
                            for (_e = 0, _f = Object.keys(w.damage_relations); _e < _f.length; _e++) {
                                key = _f[_e];
                                if (/_from/.test(key)) {
                                    relation = w.damage_relations[key];
                                    multiplier = key === 'double_damage_from' ? 2 : key === 'half_damage_from' ? 0.5 : key === 'no_damage_from' ? 0 : 1;
                                    for (_g = 0, relation_1 = relation; _g < relation_1.length; _g++) {
                                        type = relation_1[_g];
                                        weakness[type.name] = weakness.hasOwnProperty(type.name) ? +weakness[type.name] * multiplier : multiplier;
                                    }
                                }
                            }
                        }
                        ordered = [];
                        for (_h = 0, _j = Object.keys(weakness); _h < _j.length; _h++) {
                            key = _j[_h];
                            ordered.push({ type: key, multiplier: weakness[key] });
                        }
                        ordered = ordered.sort(function (a, b) {
                            return b.multiplier - a.multiplier;
                        });
                        weakString = '';
                        resistString = '';
                        immuneString = '';
                        for (_k = 0, ordered_1 = ordered; _k < ordered_1.length; _k++) {
                            type = ordered_1[_k];
                            if (type.multiplier === 4) {
                                weakString += "4x[".concat(type.type.toUpperCase(), "] ");
                            }
                            if (type.multiplier === 2) {
                                weakString += "2x[".concat(type.type.toUpperCase(), "] ");
                            }
                            if (type.multiplier === 0.5) {
                                resistString += "1/2[".concat(type.type.toUpperCase(), "] ");
                            }
                            if (type.multiplier === 0.25) {
                                resistString += "1/4[".concat(type.type.toUpperCase(), "] ");
                            }
                            if (type.multiplier === 0) {
                                immuneString += "[".concat(type.type.toUpperCase(), "] ");
                            }
                        }
                        this.client.say(channel, "/me\n                ".concat(data.name.substring(0, 1).toUpperCase()).concat(data.name.substring(1), " typings is: [").concat(data.types[0].type.name.toUpperCase(), "]").concat(data.types.length > 1 ? "[".concat(data.types[1].type.name.toUpperCase(), "]") : '', ".\n                It has the following weaknesses: ").concat(weakString.length > 0 ? weakString : 'None! Get Fucked!', " -\n                And the following resistances: ").concat(resistString.length > 0 ? resistString : 'None! Just hit him!', "\n                ").concat(immuneString.length > 0 ? " - But watch out cause he's immune to: ".concat(immuneString) : '', "\n            ").replace(/\n/g, ''));
                        return [3 /*break*/, 10];
                    case 9:
                        if (/^!weak/i.test(message)) {
                            this.client.say(channel, "/me You didn't specify a pokemon to look up for... You piece of shit...");
                        }
                        _l.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        }); };
        _this.move = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var move, data, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!/^!move [\w\s]+/i.test(message)) return [3 /*break*/, 5];
                        if ((0, message_1.filterParameters)(message).length == 0) {
                            this.client.say(channel, "/me You didn't specify a move to look up for... You piece of shit...");
                            return [2 /*return*/];
                        }
                        move = message.replace(/^!move /, '').toLowerCase();
                        data = void 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get("https://pokeapi.co/api/v2/move/".concat(move.replace(' ', '-')))];
                    case 2:
                        data = (_a.sent()).data;
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        this.client.say(channel, "/me Sorry I couldn't find that move... check your spelling bitch!");
                        return [2 /*return*/];
                    case 4:
                        if (!data || !data.type) {
                            this.client.say(channel, "/me Sorry I couldn't find that move... check your spelling bitch!");
                            return [2 /*return*/];
                        }
                        this.client.say(channel, "/me ".concat(move.substring(0, 1).toUpperCase()).concat(move.substring(1), " is a [").concat(data.type.name.toUpperCase(), "] ").concat(data.damage_class.name.toUpperCase(), " move").concat(data.accuracy ? " with ".concat(data.accuracy, "% accuracy") : '', ". It has ").concat(data.power ? data.power : 0, " power and ").concat(data.pp ? data.pp : 0, " pp. Its description reads: ").concat(data.flavor_text_entries[0].flavor_text.replace(/\n/g, ' '), ". ").concat(data.priority !== 0 ? "It also has PRIORITY of ".concat(data.priority, ".") : '').replace(/\n/g, ''));
                        return [3 /*break*/, 6];
                    case 5:
                        if (/^!move/i.test(message)) {
                            this.client.say(channel, "/me You didn't specify a move to look up for... You piece of shit...");
                        }
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        _this.nature = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var nature, data, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!/^!nature [\w\s]+/i.test(message)) return [3 /*break*/, 5];
                        if ((0, message_1.filterParameters)(message).length == 0) {
                            this.client.say(channel, "/me You didn't specify a move to look up for... You piece of shit...");
                            return [2 /*return*/];
                        }
                        nature = message.replace(/^!nature /, '').toLowerCase();
                        data = void 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get("https://pokeapi.co/api/v2/nature/".concat(nature.replace(' ', '-')))];
                    case 2:
                        data = (_a.sent()).data;
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        this.client.say(channel, "/me Sorry I couldn't find that nature... check your spelling bitch!");
                        return [2 /*return*/];
                    case 4:
                        if (!data || !data.decreased_stat) {
                            this.client.say(channel, "/me Sorry I couldn't find that nature... check your spelling bitch!");
                            return [2 /*return*/];
                        }
                        this.client.say(channel, "/me pokemon with a ".concat(nature.toUpperCase(), " nature have increased ").concat(data.increased_stat.name.toUpperCase(), " and decreased ").concat(data.decreased_stat.name.toUpperCase()).replace(/\n/g, ''));
                        return [3 /*break*/, 6];
                    case 5:
                        if (/^!nature/i.test(message)) {
                            this.client.say(channel, "/me You didn't specify a nature to look up for... You piece of shit...");
                        }
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        _this.ability = function (channel, user, message, msg) { return __awaiter(_this, void 0, void 0, function () {
            var ability, data, error_5, text, _i, _a, f, ability, data, error_6, text, _b, _c, f;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!/^!ability [\w\s]+/i.test(message)) return [3 /*break*/, 5];
                        if ((0, message_1.filterParameters)(message).length == 0) {
                            this.client.say(channel, "/me You didn't specify a move to look up for... You piece of shit...");
                            return [2 /*return*/];
                        }
                        ability = message.replace(/^!ability /, '').toLowerCase();
                        data = void 0;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get("https://pokeapi.co/api/v2/ability/".concat(ability.replace(' ', '-')))];
                    case 2:
                        data = (_d.sent()).data;
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _d.sent();
                        this.client.say(channel, "/me Sorry I couldn't find that ability... check your spelling bitch!");
                        return [2 /*return*/];
                    case 4:
                        if (!data || !data.flavor_text_entries) {
                            this.client.say(channel, "/me Sorry I couldn't find that ability... check your spelling bitch!");
                            return [2 /*return*/];
                        }
                        text = void 0;
                        for (_i = 0, _a = data.effect_entries; _i < _a.length; _i++) {
                            f = _a[_i];
                            if (f.language.name === 'en') {
                                text = f.effect.replace(/\n/g, ' ');
                                break;
                            }
                        }
                        this.client.say(channel, "/me ".concat(ability.substring(0, 1).toUpperCase()).concat(ability.substring(1), " ability: ").concat(data.flavor_text_entries[0].flavor_text.replace(/\n/g, ' '), ". To have more detailed info use '!ability+ ").concat(ability, "'").replace(/\n/g, ''));
                        return [3 /*break*/, 11];
                    case 5:
                        if (!/^!ability\+ [\w\s]+/i.test(message)) return [3 /*break*/, 10];
                        if ((0, message_1.filterParameters)(message).length == 0) {
                            this.client.say(channel, "/me You didn't specify a move to look up for... You piece of shit...");
                            return [2 /*return*/];
                        }
                        ability = message.replace(/^!ability\+ /, '').toLowerCase();
                        data = void 0;
                        _d.label = 6;
                    case 6:
                        _d.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, axios_1.default.get("https://pokeapi.co/api/v2/ability/".concat(ability.replace(' ', '-')))];
                    case 7:
                        data = (_d.sent()).data;
                        return [3 /*break*/, 9];
                    case 8:
                        error_6 = _d.sent();
                        this.client.say(channel, "/me Sorry I couldn't find that ability... check your spelling bitch!");
                        return [2 /*return*/];
                    case 9:
                        if (!data || !data.flavor_text_entries) {
                            this.client.say(channel, "/me Sorry I couldn't find that ability... check your spelling bitch!");
                            return [2 /*return*/];
                        }
                        text = void 0;
                        for (_b = 0, _c = data.effect_entries; _b < _c.length; _b++) {
                            f = _c[_b];
                            if (f.language.name === 'en') {
                                text = f.effect.replace(/\n/g, ' ');
                                break;
                            }
                        }
                        this.client.say(channel, "/me ".concat(text).replace(/\n/g, ''));
                        return [3 /*break*/, 11];
                    case 10:
                        if (/^!ability/i.test(message)) {
                            this.client.say(channel, "/me You didn't specify a ability to look up for... You piece of shit...");
                        }
                        _d.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        }); };
        _this._init();
        return _this;
    }
    return Pokemon;
}(message_1.Message));
exports.Pokemon = Pokemon;
//# sourceMappingURL=pokemon.js.map