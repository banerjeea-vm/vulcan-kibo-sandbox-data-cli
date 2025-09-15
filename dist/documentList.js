"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAllDocumentLists = exports.importAllDocumentLists = exports.deleteAllDocumentLists = void 0;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = require('path').join(nconf_1.default.get('data') || './data', 'document-lists.jsonl');
let appsClient, documentList;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    documentList = require('mozu-node-sdk/clients/content/documentList')(appsClient);
}
//function for creating documentType
const createDocumentList = async (documentListData) => {
    try {
        await documentList.createDocumentList(documentListData);
    }
    catch (error) {
        console.error('Error in creating DocumentList', error.originalError.message);
        if (error.originalError.statusCode === 500 && nconf_1.default.get('upsert')) {
            try {
                await documentList.updateDocumentList({ documentListName: documentListData.listFQN }, documentListData);
            }
            catch (updateError) {
                console.error('Error while updating documentlist', updateError.originalError.message);
            }
        }
    }
};
//below function will clean the data , delete document
const deleteDocumentList = async (documentListData) => {
    try {
        await documentList.deleteDocumentList({
            documentListName: documentListData.listFQN,
        });
    }
    catch (deleteError) {
        console.error('Error while cleaning , deleting document', deleteError.originalError.message);
    }
};
async function* exportDocLists() {
    let page = 0;
    while (true) {
        let ret = await documentList.getDocumentLists({
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
async function deleteAllDocumentLists() {
    initClients();
    for await (let item of exportDocLists()) {
        await deleteDocumentList(item);
    }
}
exports.deleteAllDocumentLists = deleteAllDocumentLists;
async function importAllDocumentLists() {
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let item of dataStream) {
        if (item.scopeType === 'Tenant') {
            item.scopeId = parseInt(documentList.context.tenant);
        }
        await createDocumentList(item);
    }
}
exports.importAllDocumentLists = importAllDocumentLists;
async function exportAllDocumentLists() {
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    for await (let item of exportDocLists()) {
        if (item.namespace === 'mozu') {
            continue;
        }
        ['auditInfo'].forEach((key) => delete item[key]);
        await stream.write(item);
    }
}
exports.exportAllDocumentLists = exportAllDocumentLists;
//# sourceMappingURL=documentList.js.map