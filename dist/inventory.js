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
//Start: ECM-42
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
//End: ECM-42

Object.defineProperty(exports, "__esModule", { value: true });
exports.seedInventory = exports.importAllInventory = exports.exportAllInventory = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = require("timers/promises");
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const util_1 = __importDefault(require("util"));
const stream_1 = require("stream");
const csv = __importStar(require("fast-csv"));
const nconf_1 = __importDefault(require("nconf"));
const node_stream_zip_1 = __importDefault(require("node-stream-zip"));
const asyncPipeline = util_1.default.promisify(stream_1.pipeline);
nconf_1.default.argv();
const dataDir = nconf_1.default.get('data') || './data';
const locationsFilePath = path_1.default.join(dataDir, 'locations.jsonl');
const inventoryFilePath = path_1.default.join(dataDir, 'inventory.jsonl');
const catalogExportPath = path_1.default.join(dataDir, 'catalog-export.zip');
let appsClient, inventoryClient;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    inventoryClient = require('mozu-node-sdk/clients/commerce/inventory')(appsClient);
}
class InventoryBatch {
    constructor() {
        this.items = [];
        this.batchSize = 3000;
    }
    addItem(inventoryRecord) {
        const { upc, floor = 0, safetyStock = 0, onHand, ltd = 0, } = inventoryRecord;
        this.items.push({
            upc,
            floor,
            safetyStock,
            LTD: ltd,
            quantity: onHand,
        });
    }
    toJSON() {
        return { locationCode: this.locationCode, items: [...this.items] };
    }
    clear() {
        this.items = [];
    }
    full() {
        return this.items.length === this.batchSize;
    }
    size() {
        return this.items.length;
    }
}
class RefetchJobManager {
    constructor() {
        this.jobs = new Set();
    }
    async create(batch) {
        try {
            if (!batch.locationCode || batch.size() === 0) {
                return;
            }
            const refreshJob = await inventoryClient.refreshInventory(null, {
                body: batch.toJSON(),
            });
            batch.clear();
            this.watch(refreshJob.jobID);
            console.log(`inventory refresh job created ${refreshJob.jobID}`);
        }
        catch (error) {
            console.error(error);
        }
    }
    async watch(id) {
        this.jobs.add(id);
        let resp = null;
        console.log(`jobid: ${id}`);
        while (true) {
            await (0, promises_1.setTimeout)(5000);
            resp = await inventoryClient.getInventoryJob({ jobId: id });
            if (resp.success || resp.status === 'FAILED') {
                break;
            }
            console.log(`polling status:  ${resp.status}`);
        }
        console.log(`jobid: ${id} locationCode: ${resp.locationCode} status:  ${resp.status} items: ${resp.itemCount}`);
        if (resp.messages) {
            for (let message of resp.messages) {
                console.log(`jobid: ${id} message: ${message}`);
            }
        }
        this.jobs.delete(id);
        return resp;
    }
    async waitForJobs() {
        while (this.jobs.size) {
            await (0, promises_1.setTimeout)(5000);
        }
    }
}
async function* exportLocationInventory(locationCode) {
    let page = 1, pageSize = 200;
    while (true) {
        const resp = await inventoryClient.getInventory(null, {
            body: {
                requestLocation: {
                    locationCode,
                },
                type: 'ANY',
                pageSize,
                pageNum: page,
            },
        });
        for (const prod of resp) {
            yield prod;
        }
        page++;
        if (resp.length <= pageSize) {
            break;
        }
    }
}
async function exportAllInventory() {
    initClients();
    const locationStream = (0, utilites_1.createJsonLFileStream)(locationsFilePath);
    const inventoryStream = (0, utilites_1.createJsonLFileWriteStream)(inventoryFilePath);
    for await (let location of locationStream) {
        for await (let inventory of exportLocationInventory(location.code)) {
            await inventoryStream.write(inventory);
        }
    }
}
exports.exportAllInventory = exportAllInventory;
async function importAllInventory() {
    //Start: ECM-42
    convertCsvToJson();//End: ECM-42
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(inventoryFilePath);
    const inventoryBatch = new InventoryBatch();
    const jobManager = new RefetchJobManager();
    for await (let record of dataStream) {
        if (inventoryBatch.locationCode !== record.locationCode) {
            await jobManager.create(inventoryBatch);
        }
        if (inventoryBatch.full()) {
            await jobManager.create(inventoryBatch);
        }
        inventoryBatch.locationCode = record.locationCode;
        inventoryBatch.addItem(record);
    }
    if (inventoryBatch.size() > 0) {
        await jobManager.create(inventoryBatch);
    }
    await jobManager.waitForJobs();
}
exports.importAllInventory = importAllInventory;
async function getStandardProducts() {
    await (0, utilites_1.isValidZip)(catalogExportPath);
    const catalogZip = new node_stream_zip_1.default.async({ file: catalogExportPath });
    const readStream = await catalogZip.stream('productoptions.csv');
    readStream.on('end', () => catalogZip.close());
    const transformer = (row) => {
        const { ProductCode, ProductUsage } = row;
        return { ProductCode, ProductUsage };
    };
    const standardProducts = [];
    const parser = csv
        .parse({ headers: true })
        .transform(transformer)
        .on('data', (row) => {
        if (row.ProductUsage === 'Standard') {
            standardProducts.push(row.ProductCode);
        }
    });
    await asyncPipeline(readStream, parser);
    return standardProducts;
}
async function getConfigurableProduct() {
    await (0, utilites_1.isValidZip)(catalogExportPath);
    const catalogZip = new node_stream_zip_1.default.async({ file: catalogExportPath });
    const readStream = await catalogZip.stream('productoptions.csv');
    readStream.on('end', () => catalogZip.close());
    const transformer = (row) => {
        const { VariationCode } = row;
        return { VariationCode };
    };
    const products = [];
    const parser = csv
        .parse({ headers: true })
        .transform(transformer)
        .on('data', (row) => {
        products.push(row.VariationCode);
    });
    await asyncPipeline(readStream, parser);
    return products;
}
async function seedInventory() {
    initClients();
    const seedOnHand = 1000;
    const standard = await getStandardProducts();
    const variants = await getConfigurableProduct();
    const products = [...standard, ...variants];
    const locationStream = (0, utilites_1.createJsonLFileStream)(locationsFilePath);
    const jobManager = new RefetchJobManager();
    for await (let location of locationStream) {
        const inventoryBatch = new InventoryBatch();
        inventoryBatch.locationCode = location.code;
        for (const code of products) {
            if (inventoryBatch.full()) {
                await jobManager.create(inventoryBatch);
            }
            inventoryBatch.addItem({ upc: code, onHand: seedOnHand });
        }
        if (inventoryBatch.size() > 0) {
            await jobManager.create(inventoryBatch);
        }
    }
    await jobManager.waitForJobs();
}
exports.seedInventory = seedInventory;
//# sourceMappingURL=inventory.js.map

//Start: ECM-42
function convertCsvToJson(){

const csvFile = path.resolve(__dirname, "../ProductsInventory.csv");
const outputDir = path.resolve(__dirname, "../data");
const outputFile = path.join(outputDir, "inventory.jsonl");
const parse = require('csv-parse/sync');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const input = fs.readFileSync(csvFile, 'utf8');
 const cleanInput = input.replace(/^\uFEFF/, '');
 const records = parse.parse(cleanInput, {
  columns: true,
  delimiter: ',',
  skip_empty_lines: true
});

const inventoryProducts = records.map((r) => ({
  locationCode: r.LocationID,
  upc: r.ProductID,
  onHand: r.Quantity
}));

// Write JSON file
const ndjson = inventoryProducts.map((loc) => JSON.stringify(loc)).join("\n");
fs.writeFileSync(outputFile, ndjson);

console.log(`✅ Converted ${records.length} inventoryProducts`);
console.log(`➡️  Output written to: ${outputFile}`);
}