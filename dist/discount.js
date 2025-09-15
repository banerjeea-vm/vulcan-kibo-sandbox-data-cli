"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAllDiscounts = exports.importAllDiscounts = exports.deleteAllDiscounts = void 0;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = require('path').join(nconf_1.default.get('data') || './data', 'discounts.jsonl');
let appsClient, discountMethod;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    discountMethod =
        require('mozu-node-sdk/clients/commerce/catalog/admin/discount')(appsClient);
}
//function for creating discount
const generateDiscount = async (discountData) => {
    try {
        await discountMethod.createDiscount(discountData);
        console.log('Successfully added discount');
    }
    catch (error) {
        console.error('Error in adding discount', error.originalError.message);
        if (error.originalError.statusCode === 409 && nconf_1.default.get('upsert')) {
            try {
                console.log('disocount id ', discountData.thresholdMessage.discountId);
                await discountMethod.updateDiscount({ discountId: discountData.thresholdMessage.discountId }, { body: discountData });
                console.log('Updated Discount Successfully');
            }
            catch (updateError) {
                console.error('Error while updating discount', updateError.originalError.message);
            }
        }
    }
};
//below function will clean the data , delete discount
const deleteDiscount = async (discountData) => {
    try {
        await discountMethod.deleteDiscount({
            discountId: discountData.thresholdMessage.discountId,
        });
        console.log('Successfully deleted discount');
    }
    catch (deleteError) {
        console.error('Error while cleaning , deleting discount', deleteError.originalError.message);
    }
};
async function* exportItems() {
    let page = 0;
    while (true) {
        let ret = await discountMethod.getDiscounts({
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
async function deleteAllDiscounts() {
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let item of dataStream) {
        await deleteDiscount(item);
    }
}
exports.deleteAllDiscounts = deleteAllDiscounts;
async function importAllDiscounts() {
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let item of dataStream) {
        await generateDiscount(item);
    }
}
exports.importAllDiscounts = importAllDiscounts;
async function exportAllDiscounts() {
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    for await (let item of exportItems()) {
        ['auditInfo'].forEach((key) => delete item[key]);
        await stream.write(item);
    }
}
exports.exportAllDiscounts = exportAllDiscounts;
//# sourceMappingURL=discount.js.map