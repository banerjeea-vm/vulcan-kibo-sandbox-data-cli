"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAllProductTypes = exports.importAllProductTypes = exports.deleteAllProductTypes = void 0;
const path_1 = __importDefault(require("path"));
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = path_1.default.join(nconf_1.default.get('data') || './data', 'product-types.jsonl');
let appsClient, productTypeMethods;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    productTypeMethods =
        require('mozu-node-sdk/clients/commerce/catalog/admin/attributedefinition/productType')(appsClient);
}
//function for creating productType
const generateProductType = async (productTypeData) => {
    try {
        await productTypeMethods.addProductType(productTypeData);
        console.log('Successfully added productType');
    }
    catch (error) {
        console.error('Error in adding productType', error.originalError.message);
        if (error.originalError.statusCode === 409 && nconf_1.default.get('upsert')) {
            try {
                await productTypeMethods.updateProductType({ productTypeId: productTypeData.id }, { body: productTypeData });
                console.log('Updated productType Successfully');
            }
            catch (updateError) {
                console.error('Error while updating productType', updateError.originalError.message);
            }
        }
    }
};
//below function will clean the data , delete productType
const deleteProductType = async (productTypeData) => {
    try {
        await productTypeMethods.deleteProductType({
            productTypeId: productTypeData.id,
        });
        console.log('Successfully deleted productType');
    }
    catch (deleteError) {
        console.error('Error while cleaning , deleting productType', deleteError.originalError.message);
    }
};
async function* exportProductTypes() {
    let page = 0;
    while (true) {
        let ret = await productTypeMethods.getProductTypes({
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
async function deleteAllProductTypes() {
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let productTypeDetail of dataStream) {
        await deleteProductType(productTypeDetail);
    }
}
exports.deleteAllProductTypes = deleteAllProductTypes;
async function importAllProductTypes() {
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let productTypeDetail of dataStream) {
        await generateProductType(productTypeDetail);
    }
}
exports.importAllProductTypes = importAllProductTypes;
async function exportAllProductTypes() {
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    for await (let item of exportProductTypes()) {
        ['auditInfo'].forEach((key) => delete item[key]);
        await stream.write(item);
    }
}
exports.exportAllProductTypes = exportAllProductTypes;
//# sourceMappingURL=productType.js.map