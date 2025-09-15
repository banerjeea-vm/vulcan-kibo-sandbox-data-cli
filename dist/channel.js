"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAllChannels = exports.importAllChannels = void 0;
var Spinner = require('cli-spinner').Spinner;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = require('path').join(nconf_1.default.get('data') || './data', 'channels.jsonl');
let appsClient, channelClient;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    channelClient = require('mozu-node-sdk/clients/commerce/channel')(appsClient);
}
const generateChannels = async (channel) => {
    try {
        const response = await channelClient.createChannel(null, {
            body: channel,
        });
        console.log('channel created');
    }
    catch (error) {
        console.error('Error in adding channel', error.originalError.message);
        if (error.originalError.statusCode === 409 && nconf_1.default.get('upsert')) {
            try {
                await channelClient.updateChannel({ code: channel.code }, { body: channel });
                console.log('Updated channel Successfully');
            }
            catch (updateError) {
                console.error('Error while updating channel', updateError.originalError.message);
            }
        }
    }
};
async function* exportChannels() {
    let page = 0;
    while (true) {
        let ret = await channelClient.getChannels({
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
async function importAllChannels() {
    var spinner = new Spinner('importing channels.. %s');
    spinner.start();
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let channel of dataStream) {
        channel.tenantId = channelClient.context.tenant;
        channel.siteIds = [channelClient.context.site];
        generateChannels(channel);
    }
    spinner.stop();
    console.log('channels imported');
}
exports.importAllChannels = importAllChannels;
async function exportAllChannels() {
    var spinner = new Spinner('exporting channels.. %s');
    spinner.start();
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    for await (let channel of exportChannels()) {
        delete channel['auditInfo'];
        await stream.write(channel);
    }
    stream.end();
    spinner.stop(true);
    console.log('channels exported');
}
exports.exportAllChannels = exportAllChannels;
//# sourceMappingURL=channel.js.map