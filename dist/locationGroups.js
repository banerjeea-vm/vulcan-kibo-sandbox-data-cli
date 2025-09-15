"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importAllLocationGroups = exports.exportAllLocationGroups = void 0;
var Spinner = require('cli-spinner').Spinner;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = require('path').join(nconf_1.default.get('data') || './data', 'location-groups.jsonl');
let appsClient, locationGroupsClient;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    locationGroupsClient = require('./clients/location-groups')(appsClient);
}
const generateLocationGroup = async (locationGroup) => {
    try {
        await locationGroupsClient.createGroup(null, { body: locationGroup });
        console.log('Successfully added location group');
    }
    catch (error) {
        if (error.originalError.statusCode === 409 && nconf_1.default.get('upsert')) {
            try {
                console.log('update location group ', locationGroup.locationGroupId);
                await locationGroupsClient.updateGroup({ locationGroupCode: locationGroup.locationGroupId }, { body: locationGroup });
                console.log('update location group Successfully');
            }
            catch (updateError) {
                console.error('Error while updating location group', updateError.originalError.message);
            }
        }
        else {
            console.error('Error in adding location group', error.originalError.message);
        }
    }
};
async function* exportLocationGroups() {
    let page = 0;
    while (true) {
        let ret = await locationGroupsClient.getGroups({
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
async function exportAllLocationGroups() {
    var spinner = new Spinner('exporting location groups.. %s');
    spinner.start();
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    for await (let item of exportLocationGroups()) {
        ['auditInfo'].forEach((key) => delete item[key]);
        await stream.write(item);
    }
    spinner.stop(true);
    console.log('location groups exported');
}
exports.exportAllLocationGroups = exportAllLocationGroups;
async function importAllLocationGroups() {
    var spinner = new Spinner('importing location groups.. %s');
    spinner.start();
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let locationGroup of dataStream) {
        locationGroup.siteIds = [locationGroupsClient.context.site];
        await generateLocationGroup(locationGroup);
    }
    spinner.stop(true);
    console.log('location groups exported');
}
exports.importAllLocationGroups = importAllLocationGroups;
// export async function deleteAllLocations() {
//   let dataStream = createJsonLFileStream(dataFilePath);
//   for await (let locationDetail of dataStream) {
//     await deleteLocation(locationDetail);
//   }
// }
//# sourceMappingURL=locationGroups.js.map