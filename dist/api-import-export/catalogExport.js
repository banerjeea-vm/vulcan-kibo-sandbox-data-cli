"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAllCatalogByAPI = void 0;
const fs_1 = __importDefault(require("fs"));
const isomorphic_fetch_1 = __importDefault(require("isomorphic-fetch"));
const stream_1 = require("stream");
const util_1 = __importDefault(require("util"));
const cli_spinner_1 = require("cli-spinner");
const nconf_1 = __importDefault(require("nconf"));
const profile_1 = require("../profile");
const shared_1 = require("./shared");
const path_1 = __importDefault(require("path"));
const streamPipeline = util_1.default.promisify(stream_1.pipeline);
nconf_1.default.argv();
let appsClient, exportClient, tenantClient;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    exportClient = require('../clients/export')(appsClient);
    tenantClient = require('mozu-node-sdk/clients/platform/tenant')(appsClient);
}
const dataFilePath = path_1.default.join(nconf_1.default.get('data') || './data', 'catalog-export.zip');
async function download(exportResponse) {
    const fileRes = exportResponse.files.find((x) => x.fileType == 'export');
    if (!fileRes) {
        throw new Error('export  not found');
    }
    const linkRes = await exportClient.generateExportLink({
        id: fileRes.id,
        hourDuration: 24,
    });
    const s3Res = await (0, isomorphic_fetch_1.default)(linkRes);
    if (!s3Res.ok)
        throw new Error(`unexpected response ${s3Res.statusText}`);
    await streamPipeline(s3Res.body, fs_1.default.createWriteStream(dataFilePath));
    console.log(`saved export to ${dataFilePath}`);
}
async function createExport(tenantId, site, masterCatalog, resources = (0, shared_1.allResources)()) {
    try {
        const req = {
            resources,
            name: 'kibo-ucp-cli-catalog-export',
            domain: 'catalog',
            tenant: tenantId,
            contextOverride: {
                masterCatalog: masterCatalog.id,
                locale: site.localeCode,
                currency: site.countryCode,
                catalog: site.catalogId,
                site: site.id,
            },
        };
        return exportClient.create(null, { body: req });
    }
    catch (error) {
        console.error('error exporting catalog via catalog', error);
        throw new Error(error.message);
    }
}
async function exportAllCatalogByAPI() {
    var spinner = new cli_spinner_1.Spinner('exporting catalog via api.. %s');
    spinner.start();
    try {
        initClients();
        const tenant = await tenantClient.getTenant({
            tenantId: tenantClient.context.tenant,
        });
        const site = tenant.sites.find((x) => x.id == tenantClient.context.site);
        const masterCatalog = tenant.masterCatalogs.find((x) => x.catalogs.some((y) => y.id == site.catalogId));
        const exportJob = await createExport(tenantClient.context.tenant, site, masterCatalog);
        const jobResult = await (0, shared_1.pollJob)((id) => exportClient.get({ id }), exportJob.id);
        await download(jobResult);
    }
    catch (error) {
        console.error(error);
    }
    spinner.stop();
    console.log(`export catalog via api complete`);
}
exports.exportAllCatalogByAPI = exportAllCatalogByAPI;
//# sourceMappingURL=catalogExport.js.map