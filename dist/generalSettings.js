"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportGeneralSettings = exports.importGeneralSettings = void 0;
var Spinner = require('cli-spinner').Spinner;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = require('path').join(nconf_1.default.get('data') || './data', 'general-settings.jsonl');
let appsClient, generalSettingsClient;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    generalSettingsClient =
        require('mozu-node-sdk/clients/commerce/settings/generalSettings')(appsClient);
}
const updateSettings = async (settings) => {
    try {
        const updatedSettings = await generalSettingsClient.updateGeneralSettings(null, {
            body: settings,
        });
        console.log('general settings updated');
    }
    catch (error) {
        console.error(error);
    }
};
async function importGeneralSettings() {
    var spinner = new Spinner('importing general settings.. %s');
    spinner.start();
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let generalSettings of dataStream) {
        updateSettings(generalSettings);
    }
    spinner.stop();
    console.log('general settings imported');
}
exports.importGeneralSettings = importGeneralSettings;
async function exportGeneralSettings() {
    var spinner = new Spinner('exporting general settings.. %s');
    spinner.start();
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    const settings = await generalSettingsClient.getGeneralSettings();
    await stream.write(settings);
    stream.end();
    spinner.stop(true);
    console.log('general settings exported');
}
exports.exportGeneralSettings = exportGeneralSettings;
//# sourceMappingURL=generalSettings.js.map