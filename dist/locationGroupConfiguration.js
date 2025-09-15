"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importAllLocationGroupConfigurations = exports.exportAllLocationGroupConfigurations = void 0;
const path_1 = __importDefault(require("path"));
var Spinner = require('cli-spinner').Spinner;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = path_1.default.join(nconf_1.default.get('data') || './data', 'location-group-configurations.jsonl');
let appsClient, locationGroups, locationConfigClient;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    locationGroups = require('./clients/location-groups')(appsClient);
    locationConfigClient = require('./clients/location-group-configuration')(appsClient);
}
const getLocationGroupConfiguration = async (locationGroupCode) => {
    try {
        const locationGroupConfig = await locationConfigClient.getLocationGroupConfiguration({
            locationGroupCode,
        });
        console.log('successfully fetched location group config for', locationGroupCode);
        return locationGroupConfig;
    }
    catch (error) {
        console.error('error fetching location group configuration', error);
    }
};
const generateLocationGroupConfiguration = async (locationGroupConfiguration) => {
    try {
        await locationConfigClient.setLocationGroupConfiguration({ locationGroupCode: locationGroupConfiguration.locationGroupCode }, { body: locationGroupConfiguration });
        console.log('Successfully added location group');
    }
    catch (error) {
        console.error('Error in adding location group', error.originalError.message);
    }
};
async function* exportLocationGroups() {
    let page = 0;
    while (true) {
        let ret = await locationGroups.getGroups({
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
async function exportAllLocationGroupConfigurations() {
    var spinner = new Spinner('exporting location groups.. %s');
    spinner.start();
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    for await (let item of exportLocationGroups()) {
        const config = await getLocationGroupConfiguration(item.locationGroupCode);
        if (config) {
            delete config['auditInfo'];
            await stream.write(config);
        }
    }
    spinner.stop(true);
    console.log('location groups exported');
}
exports.exportAllLocationGroupConfigurations = exportAllLocationGroupConfigurations;
async function importAllLocationGroupConfigurations() {
    var spinner = new Spinner('importing location groups.. %s');
    spinner.start();
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let locationGroupConfiguration of dataStream) {
        locationGroupConfiguration.tenantId = locationConfigClient.tenant;
        locationGroupConfiguration.siteId = locationConfigClient.site;
        await generateLocationGroupConfiguration(locationGroupConfiguration);
    }
    spinner.stop(true);
    console.log('location groups exported');
}
exports.importAllLocationGroupConfigurations = importAllLocationGroupConfigurations;
// export async function deleteAllLocations() {
//   let dataStream = createJsonLFileStream(dataFilePath);
//   for await (let locationDetail of dataStream) {
//     await deleteLocation(locationDetail);
//   }
// }
//# sourceMappingURL=locationGroupConfiguration.js.map