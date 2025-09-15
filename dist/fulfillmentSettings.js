"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportFulfillmentSettings = exports.importFulfillmentSettings = void 0;
var Spinner = require('cli-spinner').Spinner;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = require('path').join(nconf_1.default.get('data') || './data', 'fulfillment-settings.jsonl');
let appsClient, fulfillmentSettingsClient;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    let Client = require('mozu-node-sdk/client');
    let constants = Client.constants;
    let fulfillmentSettingsFactory = Client.sub({
        getFulfillmentSettings: Client.method({
            method: constants.verbs.GET,
            url: '{+tenantPod}api/commerce/settings/fulfillment/fulfillmentsettings'
        }),
        updateFulfillmentSettings: Client.method({
            method: constants.verbs.PUT,
            url: '{+tenantPod}api/commerce/settings/fulfillment/fulfillmentsettings'
        }),
    });
    fulfillmentSettingsClient = new fulfillmentSettingsFactory(appsClient);
}
const updateSettings = async (settings) => {
    try {
        const updatedSettings = await fulfillmentSettingsClient.updateFulfillmentSettings(null, {
            body: settings,
        });
        console.log('fulfillment settings updated');
    }
    catch (error) {
        console.error(error);
    }
};
async function importFulfillmentSettings() {
    var spinner = new Spinner('importing fulfillment settings.. %s');
    spinner.start();
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let fulfillmentSettings of dataStream) {
        updateSettings(fulfillmentSettings);
    }
    spinner.stop();
    console.log('fulfillment settings imported');
}
exports.importFulfillmentSettings = importFulfillmentSettings;
async function exportFulfillmentSettings() {
    var spinner = new Spinner('exporting fulfillment settings.. %s');
    spinner.start();
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    const settings = await fulfillmentSettingsClient.getFulfillmentSettings();
    await stream.write(settings);
    stream.end();
    spinner.stop(true);
    console.log('fulfillment settings exported');
}
exports.exportFulfillmentSettings = exportFulfillmentSettings;
//# sourceMappingURL=fulfillmentSettings.js.map