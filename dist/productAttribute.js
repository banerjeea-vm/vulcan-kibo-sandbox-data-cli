"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAllProductAttributes = exports.importAllProductAttributes = exports.deleteAllProductAttributes = void 0;
const path_1 = __importDefault(require("path"));
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = path_1.default.join(nconf_1.default.get('data') || './data', 'product-attributes.jsonl');
let appsClient, productAttributeMethods;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    productAttributeMethods =
        require('mozu-node-sdk/clients/commerce/catalog/admin/attributedefinition/attribute')(appsClient);
}
//function for creating productAttributes
const generateProductAttribute = async (productAttributeData) => {
    try {
        await productAttributeMethods.addAttribute(productAttributeData);
        console.log('Successfully added productAttribute');
    }
    catch (error) {
        console.error('Error in adding productAttribute', error.originalError.message);
        if (error.originalError.statusCode === 409 && nconf_1.default.get('upsert')) {
            try {
                await productAttributeMethods.updateAttribute({ attributeFQN: productAttributeData.attributeFQN }, { body: productAttributeData });
                console.log('Updated productAttribute Successfully');
            }
            catch (updateError) {
                console.error('Error while updating productAttribute', updateError.originalError.message);
            }
        }
    }
};
//below function will clean the data , delete productAttribute
const deleteProductAttribute = async (productAttributeData) => {
    try {
        await productAttributeMethods.deleteAttribute({
            attributeFQN: productAttributeData.attributeFQN,
        });
        console.log('Successfully deleted productAttribute');
    }
    catch (deleteError) {
        console.error('Error while cleaning , deleting productAttribute', deleteError.originalError.message);
    }
};
async function* exportProductAttributes() {
    let page = 0;
    while (true) {
        let ret = await productAttributeMethods.getAttributes({
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
async function deleteAllProductAttributes() {
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let productAttributeDetail of dataStream) {
        await deleteProductAttribute(productAttributeDetail);
    }
}
exports.deleteAllProductAttributes = deleteAllProductAttributes;
async function importAllProductAttributes() {
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let productAttributeDetail of dataStream) {
        await generateProductAttribute(productAttributeDetail);
    }
}
exports.importAllProductAttributes = importAllProductAttributes;
async function exportAllProductAttributes() {
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    for await (let item of exportProductAttributes()) {
        ['auditInfo'].forEach((key) => delete item[key]);
        await stream.write(item);
    }
}
exports.exportAllProductAttributes = exportAllProductAttributes;
//# sourceMappingURL=productAttribute.js.map