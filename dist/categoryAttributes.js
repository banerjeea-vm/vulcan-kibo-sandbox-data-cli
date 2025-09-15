"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCategoryAttributes = exports.importCategoryAttributes = void 0;
var Spinner = require('cli-spinner').Spinner;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = require('path').join(nconf_1.default.get('data') || './data', 'category-attributes.jsonl');
let appsClient, categoryAttributeClient;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    let Client = require('mozu-node-sdk/client');
    let constants = Client.constants;
    let categoryAttributeFactory = Client.sub({
        getCategoryAttributes: Client.method({
            method: constants.verbs.GET,
            url: "{+tenantPod}api/commerce/catalog/admin/categoryattributedefinition/attributes"
        }),
        updateCategoryAttribute: Client.method({
            method: constants.verbs.PUT,
            url: "{+tenantPod}api/commerce/catalog/admin/categoryattributedefinition/attributes/{attributeFQN}"
        }),
        createCategoryAttribute: Client.method({
            method: constants.verbs.POST,
            url: "{+tenantPod}api/commerce/catalog/admin/categoryattributedefinition/attributes"
        }),
    });
    categoryAttributeClient = new categoryAttributeFactory(appsClient);
}
const generateAttributes = async (attribute) => {
    try {
        const response = await categoryAttributeClient.createCategoryAttribute(null, {
            body: attribute,
        });
        console.log('attribute created');
    }
    catch (error) {
        console.error(`'Error in adding ${attribute.attributeFQN}`, error.originalError.message);
        if (error.originalError.statusCode === 409) {
            try {
                await categoryAttributeClient.updateCategoryAttribute({ attributeFQN: attribute.attributeFQN }, { body: attribute });
                console.log(`Updated ${attribute.attributeFQN} Successfully`);
            }
            catch (updateError) {
                console.error('Error while updating attribute', updateError.originalError.message);
            }
        }
    }
};
async function* exportAttributes() {
    let page = 0;
    while (true) {
        let ret = await categoryAttributeClient.getCategoryAttributes({
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
async function importCategoryAttributes() {
    var spinner = new Spinner('importing Category attributes... %s');
    spinner.start();
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let attribute of dataStream) {
        generateAttributes(attribute);
    }
    spinner.stop();
    console.log('attribute imported');
}
exports.importCategoryAttributes = importCategoryAttributes;
async function exportCategoryAttributes() {
    var spinner = new Spinner('exporting Category attributes... %s');
    spinner.start();
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    for await (let attribute of exportAttributes()) {
        delete attribute['auditInfo'];
        await stream.write(attribute);
    }
    stream.end();
    spinner.stop(true);
    console.log('Category attributes exported');
}
exports.exportCategoryAttributes = exportCategoryAttributes;
//# sourceMappingURL=categoryAttributes.js.map