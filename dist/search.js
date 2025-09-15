"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAllSearch = exports.importAllSearch = void 0;
var Spinner = require('cli-spinner').Spinner;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = require('path').join(nconf_1.default.get('data') || './data', 'search.jsonl');
let appsClient, searchClient;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    let Client = require('mozu-node-sdk/client');
    let constants = Client.constants;
    let searchClientFactory = Client.sub({
        getSearchSchemaDefinitions: Client.method({
            method: constants.verbs.GET,
            url: '{+tenantPod}api/commerce/catalog/admin/searchSchema/definition'
        }),
        updateSearchSchemaDefinitions: Client.method({
            method: constants.verbs.PUT,
            url: '{+tenantPod}api/commerce/catalog/admin/searchSchema/definition/{language}'
        }),
        getSearchSchemaSynonyms: Client.method({
            method: constants.verbs.GET,
            url: '{+tenantPod}api/commerce/catalog/admin/searchSchema/synonyms'
        }),
        updateSearchSchemaSynonyms: Client.method({
            method: constants.verbs.POST,
            url: '{+tenantPod}api/commerce/catalog/admin/searchSchema/synonyms/reload'
        }),
        getSearchSettings: Client.method({
            method: constants.verbs.GET,
            url: '{+tenantPod}api//commerce/catalog/admin/search/settings'
        }),
        addSearchSettings: Client.method({
            method: constants.verbs.POST,
            url: '{+tenantPod}api//commerce/catalog/admin/search/settings'
        }),
        updateSearchSettings: Client.method({
            method: constants.verbs.PUT,
            url: '{+tenantPod}api//commerce/catalog/admin/search/settings/{name}'
        })
    });
    searchClient = searchClientFactory(appsClient);
}
async function importAllSearch() {
    var spinner = new Spinner('importing search settings.. %s');
    spinner.start();
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let searchSetting of dataStream) {
        for (let definition of searchSetting.schemaDefinitions) {
            await searchClient.updateSearchSchemaDefinitions({ language: definition.language }, { body: definition });
        }
        await searchClient.updateSearchSchemaSynonyms({}, { body: searchSetting.schemaSynonyms });
        const currentSearchSettings = await searchClient.getSearchSettings();
        for (let configuration of searchSetting.searchSettings.items) {
            if (currentSearchSettings.items.find((e) => e.settingsName == configuration.settingsName)) {
                // It already exists, do an update
                searchClient.updateSearchSettings({ name: configuration.settingsName }, { body: configuration });
            }
            else {
                // Settings does not exist, POST it
                searchClient.addSearchSettings({}, { body: configuration });
            }
        }
    }
    spinner.stop();
    console.log('search imported');
}
exports.importAllSearch = importAllSearch;
async function exportAllSearch() {
    var spinner = new Spinner('exporting search.. %s');
    spinner.start();
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    const schemaDefinitions = await searchClient.getSearchSchemaDefinitions();
    const schemaSynonyms = await searchClient.getSearchSchemaSynonyms();
    const searchSettings = await searchClient.getSearchSettings();
    stream.write({
        schemaDefinitions: schemaDefinitions,
        schemaSynonyms: schemaSynonyms,
        searchSettings: searchSettings,
    });
    stream.end();
    spinner.stop(true);
    console.log('search settings exported');
}
exports.exportAllSearch = exportAllSearch;
//# sourceMappingURL=search.js.map