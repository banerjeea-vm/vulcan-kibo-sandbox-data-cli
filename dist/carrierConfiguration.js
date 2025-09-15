"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAllCarrierConfigurations = exports.importAllCarrierConfigurations = void 0;
var Spinner = require('cli-spinner').Spinner;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = require('path').join(nconf_1.default.get('data') || './data', 'carrier-configurations.jsonl');
let appsClient, carrierConfigurationClient;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    carrierConfigurationClient =
        require('mozu-node-sdk/clients/commerce/shipping/admin/carrierConfiguration')(appsClient);
}
const generateCarrierConfiguration = async (carrierConfiguration) => {
    try {
        const response = await carrierConfigurationClient.createConfiguration({ carrierId: carrierConfiguration.id }, {
            body: carrierConfiguration,
        });
        console.log('carrier configuration created');
    }
    catch (error) {
        console.log(error);
        console.error('Error in adding carrier configuration', error.originalError.message);
        if (error.originalError.statusCode === 409 && nconf_1.default.get('upsert')) {
            try {
                await carrierConfigurationClient.updateConfiguration({}, { body: carrierConfiguration });
                console.log('Updated carrier configuration Successfully');
            }
            catch (updateError) {
                console.error('Error while updating carrier configuration', updateError.originalError.message);
            }
        }
    }
};
async function* exportCarrierConfigurations() {
    let page = 0;
    while (true) {
        let ret = await carrierConfigurationClient.getConfigurations({
            startIndex: page * 200,
            pageSize: 200,
        });
        for (const prod of ret.items) {
            yield prod;
        }
        page++;
        if (ret.pageCount <= page) {
            break;
        }
    }
}
async function importAllCarrierConfigurations() {
    var spinner = new Spinner('importing carrier configuration.. %s');
    spinner.start();
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let configuration of dataStream) {
        await generateCarrierConfiguration(configuration);
    }
    spinner.stop();
    console.log('carrier configuration imported');
}
exports.importAllCarrierConfigurations = importAllCarrierConfigurations;
async function exportAllCarrierConfigurations() {
    var spinner = new Spinner('exporting carrier configuration.. %s');
    spinner.start();
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    for await (let configuration of exportCarrierConfigurations()) {
        await stream.write(configuration);
    }
    stream.end();
    spinner.stop(true);
    console.log('carrier configuration exported');
}
exports.exportAllCarrierConfigurations = exportAllCarrierConfigurations;
//# sourceMappingURL=carrierConfiguration.js.map