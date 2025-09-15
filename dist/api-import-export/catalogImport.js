"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importAllCatalogByAPI = void 0;
const fsPromise = __importStar(require("fs/promises"));
const fs_1 = __importDefault(require("fs"));
const stream_1 = require("stream");
const util_1 = __importDefault(require("util"));
const path_1 = __importDefault(require("path"));
const cli_spinner_1 = require("cli-spinner");
const nconf_1 = __importDefault(require("nconf"));
const utilites_1 = require("../utilites");
const profile_1 = require("../profile");
const shared_1 = require("./shared");
const adm_zip_1 = __importDefault(require("adm-zip"));
const node_stream_zip_1 = __importDefault(require("node-stream-zip"));
const csv = __importStar(require("fast-csv"));
// reading archives
const asyncPipeline = util_1.default.promisify(stream_1.pipeline);
nconf_1.default.argv();
let appsClient, importClient, tenantClient;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    importClient = require('../clients/import')(appsClient);
    tenantClient = require('mozu-node-sdk/clients/platform/tenant')(appsClient);
}
const pathSegments = [];
const dataDir = nconf_1.default.get('data') || './data';
if (nconf_1.default.get('exportFile')) {
    pathSegments.push(nconf_1.default.get('exportFile'));
}
else {
    pathSegments.push(dataDir, 'catalog-export.zip');
}
const exportZipPath = path_1.default.join(...pathSegments);
const importZipPath = path_1.default.resolve(dataDir, 'catalog-import.zip');
const importDir = path_1.default.resolve(dataDir, 'catalog-import');
async function upload() {
    try {
        console.log('uploading catalog import file');
        const file = await fsPromise.readFile(importZipPath);
        const response = await importClient.uploadFile({ fileName: 'catalog-import-test.zip' }, { body: file });
        console.log('catalog import file upload complete');
        return response;
    }
    catch (error) {
        console.error(error);
        throw new Error('unable to upload catalog import file');
    }
}
async function createImport(remoteFile, tenant, site, masterCatalog, resources = (0, shared_1.allResources)()) {
    console.log(`creating import job for file id: ${remoteFile.id}`);
    const req = {
        name: 'kibo-ucp-cli-catalog-import',
        domain: 'catalog',
        resources,
        contextOverride: {
            masterCatalog: masterCatalog.id,
            locale: site.localeCode,
            currency: site.countryCode,
            catalog: site.catalogId,
            site: site.id,
        },
        files: [remoteFile],
    };
    return importClient.create(null, { body: req });
}
async function cleanupTemp() {
    await fsPromise.rm(importDir, { recursive: true, force: true });
    await fsPromise.rm(importZipPath, { recursive: true, force: true });
}
async function generateImportZipForKiboContext(masterCatalog, siteCatalog) {
    try {
        console.log('creating creating import zip file.');
        const { name: masterCatalogName } = masterCatalog;
        const { name: siteCatalogName } = siteCatalog;
        const importZip = new adm_zip_1.default();
        const exportZip = new node_stream_zip_1.default.async({ file: exportZipPath });
        const entries = await exportZip.entries();
        for (const entry of Object.values(entries)) {
            const entryStream = await exportZip.stream(entry.name);
            const generatedFile = await generateResourceFile(masterCatalogName, siteCatalogName, entry.name, entryStream);
            // csv parser will not write file if file only contains headers
            // in that case, copy zip entry to output directory to prevent import api errors
            if (!generatedFile.size) {
                await exportZip.extract(entry, generatedFile.path);
            }
            importZip.addLocalFile(generatedFile.path);
        }
        importZip.writeZip(importZipPath);
    }
    catch (error) {
        console.error(error);
        throw new Error('unable to generate kibo import zip from export file');
    }
}
async function generateResourceFile(masterCatalogName, catalogName, fileName, readStream) {
    try {
        const resourceFilePath = path_1.default.join(importDir, fileName);
        (0, utilites_1.createFilesDirIfNotExists)(resourceFilePath);
        const transformCatalogName = (row) => {
            if (row[shared_1.constants.HEADERS.MASTER_CATALOG]) {
                row[shared_1.constants.HEADERS.MASTER_CATALOG] = masterCatalogName;
            }
            if (row[shared_1.constants.HEADERS.CATALOG]) {
                row[shared_1.constants.HEADERS.CATALOG] = catalogName;
            }
            return row;
        };
        const writeStream = fs_1.default.createWriteStream(resourceFilePath);
        await asyncPipeline(readStream, csv.parse({ headers: true }), csv
            .format({
            headers: true,
            rowDelimiter: '\r\n',
            writeHeaders: true,
        })
            .transform(transformCatalogName), writeStream);
        // fast-csv library won't write headers for empty files
        const { size } = await fsPromise.stat(resourceFilePath);
        return { path: resourceFilePath, size };
    }
    catch (error) {
        console.log('unable to write resource file');
        throw error;
    }
}
async function importAllCatalogByAPI() {
    var spinner = new cli_spinner_1.Spinner('importing catalog via api.. %s');
    const updateSpinner = (text) => (spinner.text = `${text}... %s`);
    spinner.start();
    try {
        initClients();
        // check for valid catalog export file
        await (0, utilites_1.isValidZip)(exportZipPath);
        // // fetch tenant / site data
        const tenant = await tenantClient.getTenant({
            tenantId: tenantClient.context.tenant,
        });
        const site = tenant.sites.find((x) => x.id == tenantClient.context.site);
        const masterCatalog = tenant.masterCatalogs.find((x) => x.catalogs.some((y) => y.id == site.catalogId));
        const siteCatalog = masterCatalog.catalogs.find((c) => c.id == site.catalogId);
        if (!siteCatalog) {
            throw new Error('No catalog configured for site');
        }
        updateSpinner('creating catalog-import zip');
        // parse export files, modify catalog names and generate import zip
        await generateImportZipForKiboContext(masterCatalog, siteCatalog);
        //validate zip created
        await (0, utilites_1.isValidZip)(importZipPath);
        // upload import zip to kibo
        updateSpinner('sending catalog-import to kibo');
        const remoteFile = await upload();
        // create kibo import job
        updateSpinner('creating catalog-import job');
        const importJob = await createImport(remoteFile, tenantClient.context.tenant, site, masterCatalog);
        updateSpinner('checking import job status');
        // check kibo import job status
        await (0, shared_1.pollJob)((id) => importClient.get({ id }), importJob.id);
        spinner.stop();
        console.log(`import catalog via api complete`);
    }
    catch (error) {
        console.log('import catalog via api failed');
    }
    finally {
        spinner.stop();
        //await cleanupTemp();
    }
}
exports.importAllCatalogByAPI = importAllCatalogByAPI;
//# sourceMappingURL=catalogImport.js.map