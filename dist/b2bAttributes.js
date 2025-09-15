"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportB2BAttributes = exports.importB2BAttributes = void 0;
var Spinner = require('cli-spinner').Spinner;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = require('path').join(nconf_1.default.get('data') || './data', 'b2b-attributes.jsonl');
let appsClient, b2bAttributeClient;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    let Client = require('mozu-node-sdk/client');
    let constants = Client.constants;
    let b2bAttributeFactory = Client.sub({
        getB2BAttributes: Client.method({
            method: constants.verbs.GET,
            url: "{+tenantPod}api/commerce/customer/accountattributedefinition/attributes"
        }),
        updateB2BAttribute: Client.method({
            method: constants.verbs.PUT,
            url: "{+tenantPod}api/commerce/customer/accountattributedefinition/attributes/{attributeFQN}"
        }),
        createB2BAttribute: Client.method({
            method: constants.verbs.POST,
            url: "{+tenantPod}api/commerce/customer/accountattributedefinition/attributes"
        }),
    });
    b2bAttributeClient = new b2bAttributeFactory(appsClient);
}
const generateAttributes = async (attribute) => {
    try {
        const response = await b2bAttributeClient.createB2BAttribute(null, {
            body: attribute,
        });
        console.log('attribute created');
    }
    catch (error) {
        console.error(`'Error in adding ${attribute.attributeFQN}`, error.originalError.message);
        console.log(error.originalError);
        if (error.originalError.statusCode === 409) {
            try {
                await b2bAttributeClient.updateB2BAttribute({ attributeFQN: attribute.attributeFQN }, { body: attribute });
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
        let ret = await b2bAttributeClient.getB2BAttributes({
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
async function importB2BAttributes() {
    var spinner = new Spinner('importing B2B attributes... %s');
    spinner.start();
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let attribute of dataStream) {
        generateAttributes(attribute);
    }
    spinner.stop();
    console.log('attribute imported');
}
exports.importB2BAttributes = importB2BAttributes;
async function exportB2BAttributes() {
    var spinner = new Spinner('exporting B2B attributes... %s');
    spinner.start();
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    for await (let attribute of exportAttributes()) {
        delete attribute['auditInfo'];
        await stream.write(attribute);
    }
    stream.end();
    spinner.stop(true);
    console.log('B2B attributes exported');
}
exports.exportB2BAttributes = exportB2BAttributes;
//# sourceMappingURL=b2bAttributes.js.map