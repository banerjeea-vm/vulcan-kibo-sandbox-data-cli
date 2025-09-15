"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollJob = exports.allResources = exports.constants = void 0;
const promises_1 = require("timers/promises");
const toResource = (resource) => ({
    resource,
    format: 'legacy',
    fields: ['*'],
});
exports.constants = {
    HEADERS: {
        MASTER_CATALOG: 'MasterCatalogName',
        CATALOG: 'CatalogName',
    },
    CATALOG_RESOURCE_TYPES: [
        'productoptions',
        'productpropertylocale',
        'productoptionlocalization',
        'productcatalog',
        'products',
        'attributes',
        'productimages',
        'productbundles',
        'productextras',
        'producttypes',
        'pricelists',
        'pricelistentries',
        'pricelistentryprices',
        'pricelistentryextras',
        'categories',
        'categoryimages',
        'producttypeattributes',
        'producttypeattributevalues',
        'attributevalues',
    ],
};
const allResources = () => exports.constants.CATALOG_RESOURCE_TYPES.map(toResource);
exports.allResources = allResources;
async function pollJob(jobStatus, id) {
    let resp = null;
    console.log(`jobid: ${id}`);
    while (true) {
        await (0, promises_1.setTimeout)(5000);
        resp = await jobStatus(id);
        if (resp.isComplete) {
            await (0, promises_1.setTimeout)(15000);
            resp = await jobStatus(id);
            break;
        }
        console.log(`polling status:  ${resp.status || 'submitted'}`);
    }
    console.log(`jobid: ${id}\nstatus:  ${resp.status}`);
    if (resp.statusMessage) {
        console.log(`statusMessage: ${resp.statusMessage}`);
    }
    if (resp.statusDetails) {
        console.log(`statusDetails: ${resp.statusDetails}`);
    }
    for (const sub of resp.resources || []) {
        console.log(`resource: ${sub.resource} sub.status: ${sub.status} stateDetails:  ${sub.stateDetails}`);
    }
    return resp;
}
exports.pollJob = pollJob;
//# sourceMappingURL=shared.js.map