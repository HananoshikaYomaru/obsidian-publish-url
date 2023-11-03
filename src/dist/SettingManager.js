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
exports.DEFAULT_SETTING = exports.MySettingManager = exports.nodeSize = void 0;
var AsyncQueue_1 = require("@/util/AsyncQueue");
var SettingsSchemas_1 = require("@/SettingsSchemas");
var createNotice_1 = require("@/util/createNotice");
var State_1 = require("@/util/State");
// the setting of slider
exports.nodeSize = {
    min: 1,
    max: 10,
    step: 0.1,
    "default": 3
};
// export type GraphSetting = Exclude<SavedSetting["setting"], undefined>;
var corruptedMessage = "The setting is corrupted. You will not be able to save the setting. Please backup your data.json, remove it and reload the plugin. Then migrate your old setting back.";
/**
 * @remarks the setting will not keep the temporary setting. It will only keep the saved settings.
 */
var MySettingManager = /** @class */ (function () {
    /**
     * @remarks don't forget to call `loadSettings` after creating this class
     */
    function MySettingManager(plugin) {
        this.setting = new State_1.State(exports.DEFAULT_SETTING);
        this.asyncQueue = new AsyncQueue_1.AsyncQueue();
        /**
         * whether the setting is loaded successfully
         */
        this.isLoaded = false;
        this.plugin = plugin;
    }
    /**
     * this function will update the setting and save it to the json file. But it is still a sync function.
     * You should always use this function to update setting
     */
    MySettingManager.prototype.updateSettings = function (updateFunc) {
        // update the setting first
        updateFunc(this.setting);
        // save the setting to json
        this.asyncQueue.push(this.saveSettings.bind(this));
        // return the updated setting
        return this.setting.value;
    };
    MySettingManager.prototype.getSettings = function () {
        return this.setting.value;
    };
    /**
     * load the settings from the json file
     */
    MySettingManager.prototype.loadSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var loadedData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.plugin.loadData()];
                    case 1:
                        loadedData = (_a.sent());
                        console.log("loaded: ", loadedData);
                        if (!!loadedData) return [3 /*break*/, 3];
                        this.setting.value = exports.DEFAULT_SETTING;
                        this.isLoaded = true;
                        return [4 /*yield*/, this.saveSettings()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.setting.value];
                    case 3:
                        result = SettingsSchemas_1.SettingSchema.safeParse(loadedData);
                        // the data schema is wrong or the data is corrupted, then we need to initialize the data
                        if (!result.success) {
                            createNotice_1.createNotice(corruptedMessage);
                            console.warn("parsed loaded data failed", result.error.flatten());
                            this.isLoaded = false;
                            this.setting.value = exports.DEFAULT_SETTING;
                            return [2 /*return*/, this.setting.value];
                        }
                        console.log("parsed loaded data successfully");
                        this.setting.value = result.data;
                        return [2 /*return*/, this.setting.value];
                }
            });
        });
    };
    /**
     * save the settings to the json file
     */
    MySettingManager.prototype.saveSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isLoaded) {
                            result = SettingsSchemas_1.SettingSchema.safeParse(this.setting.value);
                            if (!result.success) {
                                createNotice_1.createNotice(corruptedMessage);
                                console.warn("parsed loaded data failed", result.error.flatten());
                                return [2 /*return*/];
                            }
                            this.isLoaded = true;
                            console.log("parsed loaded data successfully");
                        }
                        return [4 /*yield*/, this.plugin.saveData(this.setting.value)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MySettingManager;
}());
exports.MySettingManager = MySettingManager;
exports.DEFAULT_SETTING = {
    test: "test"
};
