"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importOrderRouting = exports.exportOrderRouting = void 0;
var Spinner = require('cli-spinner').Spinner;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = require('path').join(nconf_1.default.get('data') || './data', 'order-routing.jsonl');
let appsClient, orderRoutingExport;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    orderRoutingExport = require('./clients/order-routing-export-import')(appsClient);
}
const removeUserInfo = (routing) => {
    for (let route of routing.routes) {
        route.creatorUsername = '';
        route.updaterUsername = '';
    }
    for (let group of routing.groups) {
        group.creatorUsername = '';
        group.updaterUsername = '';
    }
    return routing;
};
const generateOrderRouting = async (tenantID, siteID, orderRouting) => {
    try {
        await orderRoutingExport.import({ tenantID, siteID }, { body: orderRouting });
        console.log('Successfully imported order routing');
    }
    catch (error) {
        console.error('Error in adding order routing', error.originalError.message);
    }
};
const getOrderRoutingConfig = async ({ tenantID, siteID, environmentID }) => {
    try {
        const orderRoutingConfig = await orderRoutingExport.export({
            tenantID,
            siteID,
            environmentID,
        });
        return orderRoutingConfig;
    }
    catch (error) {
        console.error('unable to fetch order routing', error);
    }
};
async function exportOrderRouting() {
    var spinner = new Spinner('exporting order routing.. %s');
    spinner.start();
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    const config = await getOrderRoutingConfig({
        tenantID: appsClient.tenant,
        siteID: appsClient.site,
        environmentID: 1,
    });
    await stream.write(config);
    spinner.stop(true);
    console.log('order routing exported');
}
exports.exportOrderRouting = exportOrderRouting;
async function importOrderRouting() {
    var spinner = new Spinner('importing order routing.. %s');
    spinner.start();
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let orderRouting of dataStream) {
        const { tenant, site } = orderRoutingExport.context;
        await generateOrderRouting(tenant, site, removeUserInfo(orderRouting));
    }
    spinner.stop(true);
    console.log('order routing imported');
}
exports.importOrderRouting = importOrderRouting;
//# sourceMappingURL=orderRouting.js.map