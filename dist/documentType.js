"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAllDocumentTypes = exports.importAllDocumentTypes = exports.deleteAllDocumentTypes = void 0;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = require('path').join(nconf_1.default.get('data') || './data', 'document-types.jsonl');
let appsClient, documentType;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    documentType = require('mozu-node-sdk/clients/content/documentType')(appsClient);
}
//function for creating documentType
const createDocumentType = async (documentTypeData) => {
    try {
        await documentType.createDocumentType(documentTypeData);
        console.log('Successfully created document');
    }
    catch (error) {
        console.error('Error in creating Document', error.originalError.message);
        if (error.originalError.statusCode === 409 && nconf_1.default.get('upsert')) {
            try {
                await documentType.updateDocumentType({ documentTypeName: documentTypeData.name }, documentTypeData);
                console.log('Updated DocumentType Successfully');
            }
            catch (updateError) {
                console.error('Error while updating document', updateError.originalError.message);
            }
        }
    }
};
async function* exportDocTypes() {
    let page = 0;
    while (true) {
        let ret = await documentType.getDocumentTypes({
            startIndex: page * 200,
            pageSize: 200,
        });
        for (const item of ret.items) {
            yield item;
        }
        page++;
        if (ret.pageCount <= page) {
            break;
        }
    }
}
async function deleteAllDocumentTypes() {
    //na
}
exports.deleteAllDocumentTypes = deleteAllDocumentTypes;
async function importAllDocumentTypes() {
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let documentTypeData of dataStream) {
        await createDocumentType(documentTypeData);
    }
}
exports.importAllDocumentTypes = importAllDocumentTypes;
async function exportAllDocumentTypes() {
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    for await (let item of exportDocTypes()) {
        ['auditInfo'].forEach((key) => delete item[key]);
        if (item.namespace === 'mozu') {
            continue;
        }
        await stream.write(item);
    }
}
exports.exportAllDocumentTypes = exportAllDocumentTypes;
//# sourceMappingURL=documentType.js.map