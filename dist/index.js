"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAllCarrierConfigurations = exports.exportOrderRouting = exports.exportAllInventory = exports.exportAllSearch = exports.exportAllDocuments = exports.exportAllDocumentLists = exports.exportAllDocumentTypes = exports.exportAllDiscounts = exports.exportAllLocationGroupConfigurations = exports.exportAllLocationGroups = exports.exportAllLocations = exports.exportAllProductTypes = exports.exportAllProductAttributes = exports.exportAllProducts = exports.exportAllChannels = exports.exportAllCatalogByAPI = exports.exportCategories = exports.importFulfillmentSettings = exports.importAllInventory = exports.importAllCatalogByAPI = exports.importAllCarrierConfigurations = exports.importGeneralSettings = exports.importAllSearch = exports.importAllDocuments = exports.importAllDocumentLists = exports.importAllDocumentTypes = exports.importAllDiscounts = exports.importAllProducts = exports.importCategories = exports.importAllProductTypes = exports.importAllProductAttributes = exports.importAllLocationGroupConfigurations = exports.importAllLocationGroups = exports.importAllLocations = exports.importAllChannels = exports.deleteAllDocumentTypes = exports.deleteAllDocumentLists = exports.deleteAllDocuments = exports.deleteAllDiscounts = exports.deleteAllLocations = exports.deleteAllProductTypes = exports.deleteAllProductAttributes = exports.deleteCategories = exports.deleteAllProducts = exports.deleteAndImport = exports.deleteAllData = exports.exportAllData = exports.importAllData = exports.initDataDir = exports.setActiveProfile = void 0;
exports.exportOrderAttributes = exports.importOrderAttributes = exports.exportCategoryAttributes = exports.importCategoryAttributes = exports.exportLocationAttributes = exports.importLocationAttributes = exports.exportCustomerAttributes = exports.importCustomerAttributes = exports.exportB2BAttributes = exports.importB2BAttributes = exports.exportFulfillmentSettings = void 0;
const category_1 = require("./category");
Object.defineProperty(exports, "deleteCategories", { enumerable: true, get: function () { return category_1.deleteCategories; } });
Object.defineProperty(exports, "importCategories", { enumerable: true, get: function () { return category_1.importCategories; } });
Object.defineProperty(exports, "exportCategories", { enumerable: true, get: function () { return category_1.exportCategories; } });
const product_1 = require("./product");
Object.defineProperty(exports, "deleteAllProducts", { enumerable: true, get: function () { return product_1.deleteAllProducts; } });
Object.defineProperty(exports, "importAllProducts", { enumerable: true, get: function () { return product_1.importAllProducts; } });
Object.defineProperty(exports, "exportAllProducts", { enumerable: true, get: function () { return product_1.exportAllProducts; } });
const productAttribute_1 = require("./productAttribute");
Object.defineProperty(exports, "deleteAllProductAttributes", { enumerable: true, get: function () { return productAttribute_1.deleteAllProductAttributes; } });
Object.defineProperty(exports, "importAllProductAttributes", { enumerable: true, get: function () { return productAttribute_1.importAllProductAttributes; } });
Object.defineProperty(exports, "exportAllProductAttributes", { enumerable: true, get: function () { return productAttribute_1.exportAllProductAttributes; } });
const productType_1 = require("./productType");
Object.defineProperty(exports, "deleteAllProductTypes", { enumerable: true, get: function () { return productType_1.deleteAllProductTypes; } });
Object.defineProperty(exports, "importAllProductTypes", { enumerable: true, get: function () { return productType_1.importAllProductTypes; } });
Object.defineProperty(exports, "exportAllProductTypes", { enumerable: true, get: function () { return productType_1.exportAllProductTypes; } });
const locations_1 = require("./locations");
Object.defineProperty(exports, "deleteAllLocations", { enumerable: true, get: function () { return locations_1.deleteAllLocations; } });
Object.defineProperty(exports, "importAllLocations", { enumerable: true, get: function () { return locations_1.importAllLocations; } });
Object.defineProperty(exports, "exportAllLocations", { enumerable: true, get: function () { return locations_1.exportAllLocations; } });
const locationGroupConfiguration_1 = require("./locationGroupConfiguration");
Object.defineProperty(exports, "importAllLocationGroupConfigurations", { enumerable: true, get: function () { return locationGroupConfiguration_1.importAllLocationGroupConfigurations; } });
Object.defineProperty(exports, "exportAllLocationGroupConfigurations", { enumerable: true, get: function () { return locationGroupConfiguration_1.exportAllLocationGroupConfigurations; } });
const locationGroups_1 = require("./locationGroups");
Object.defineProperty(exports, "importAllLocationGroups", { enumerable: true, get: function () { return locationGroups_1.importAllLocationGroups; } });
Object.defineProperty(exports, "exportAllLocationGroups", { enumerable: true, get: function () { return locationGroups_1.exportAllLocationGroups; } });
const orderRouting_1 = require("./orderRouting");
Object.defineProperty(exports, "exportOrderRouting", { enumerable: true, get: function () { return orderRouting_1.exportOrderRouting; } });
const generalSettings_1 = require("./generalSettings");
Object.defineProperty(exports, "importGeneralSettings", { enumerable: true, get: function () { return generalSettings_1.importGeneralSettings; } });
const fulfillmentSettings_1 = require("./fulfillmentSettings");
Object.defineProperty(exports, "importFulfillmentSettings", { enumerable: true, get: function () { return fulfillmentSettings_1.importFulfillmentSettings; } });
Object.defineProperty(exports, "exportFulfillmentSettings", { enumerable: true, get: function () { return fulfillmentSettings_1.exportFulfillmentSettings; } });
const b2bAttributes_1 = require("./b2bAttributes");
Object.defineProperty(exports, "importB2BAttributes", { enumerable: true, get: function () { return b2bAttributes_1.importB2BAttributes; } });
Object.defineProperty(exports, "exportB2BAttributes", { enumerable: true, get: function () { return b2bAttributes_1.exportB2BAttributes; } });
const customerAttributes_1 = require("./customerAttributes");
Object.defineProperty(exports, "importCustomerAttributes", { enumerable: true, get: function () { return customerAttributes_1.importCustomerAttributes; } });
Object.defineProperty(exports, "exportCustomerAttributes", { enumerable: true, get: function () { return customerAttributes_1.exportCustomerAttributes; } });
const locationAttributes_1 = require("./locationAttributes");
Object.defineProperty(exports, "importLocationAttributes", { enumerable: true, get: function () { return locationAttributes_1.importLocationAttributes; } });
Object.defineProperty(exports, "exportLocationAttributes", { enumerable: true, get: function () { return locationAttributes_1.exportLocationAttributes; } });
const categoryAttributes_1 = require("./categoryAttributes");
Object.defineProperty(exports, "importCategoryAttributes", { enumerable: true, get: function () { return categoryAttributes_1.importCategoryAttributes; } });
Object.defineProperty(exports, "exportCategoryAttributes", { enumerable: true, get: function () { return categoryAttributes_1.exportCategoryAttributes; } });
const orderAttributes_1 = require("./orderAttributes");
Object.defineProperty(exports, "importOrderAttributes", { enumerable: true, get: function () { return orderAttributes_1.importOrderAttributes; } });
Object.defineProperty(exports, "exportOrderAttributes", { enumerable: true, get: function () { return orderAttributes_1.exportOrderAttributes; } });
const carrierConfiguration_1 = require("./carrierConfiguration");
Object.defineProperty(exports, "importAllCarrierConfigurations", { enumerable: true, get: function () { return carrierConfiguration_1.importAllCarrierConfigurations; } });
Object.defineProperty(exports, "exportAllCarrierConfigurations", { enumerable: true, get: function () { return carrierConfiguration_1.exportAllCarrierConfigurations; } });
const inventory_1 = require("./inventory");
Object.defineProperty(exports, "importAllInventory", { enumerable: true, get: function () { return inventory_1.importAllInventory; } });
Object.defineProperty(exports, "exportAllInventory", { enumerable: true, get: function () { return inventory_1.exportAllInventory; } });
const channel_1 = require("./channel");
Object.defineProperty(exports, "exportAllChannels", { enumerable: true, get: function () { return channel_1.exportAllChannels; } });
Object.defineProperty(exports, "importAllChannels", { enumerable: true, get: function () { return channel_1.importAllChannels; } });
const search_1 = require("./search");
Object.defineProperty(exports, "exportAllSearch", { enumerable: true, get: function () { return search_1.exportAllSearch; } });
Object.defineProperty(exports, "importAllSearch", { enumerable: true, get: function () { return search_1.importAllSearch; } });
const discount_1 = require("./discount");
Object.defineProperty(exports, "deleteAllDiscounts", { enumerable: true, get: function () { return discount_1.deleteAllDiscounts; } });
Object.defineProperty(exports, "importAllDiscounts", { enumerable: true, get: function () { return discount_1.importAllDiscounts; } });
Object.defineProperty(exports, "exportAllDiscounts", { enumerable: true, get: function () { return discount_1.exportAllDiscounts; } });
const documentType_1 = require("./documentType");
Object.defineProperty(exports, "deleteAllDocumentTypes", { enumerable: true, get: function () { return documentType_1.deleteAllDocumentTypes; } });
Object.defineProperty(exports, "importAllDocumentTypes", { enumerable: true, get: function () { return documentType_1.importAllDocumentTypes; } });
Object.defineProperty(exports, "exportAllDocumentTypes", { enumerable: true, get: function () { return documentType_1.exportAllDocumentTypes; } });
const documentList_1 = require("./documentList");
Object.defineProperty(exports, "deleteAllDocumentLists", { enumerable: true, get: function () { return documentList_1.deleteAllDocumentLists; } });
Object.defineProperty(exports, "importAllDocumentLists", { enumerable: true, get: function () { return documentList_1.importAllDocumentLists; } });
Object.defineProperty(exports, "exportAllDocumentLists", { enumerable: true, get: function () { return documentList_1.exportAllDocumentLists; } });
const document_1 = require("./document");
Object.defineProperty(exports, "deleteAllDocuments", { enumerable: true, get: function () { return document_1.deleteAllDocuments; } });
Object.defineProperty(exports, "importAllDocuments", { enumerable: true, get: function () { return document_1.importAllDocuments; } });
Object.defineProperty(exports, "exportAllDocuments", { enumerable: true, get: function () { return document_1.exportAllDocuments; } });
const catalogExport_1 = require("./api-import-export/catalogExport");
Object.defineProperty(exports, "exportAllCatalogByAPI", { enumerable: true, get: function () { return catalogExport_1.exportAllCatalogByAPI; } });
const catalogImport_1 = require("./api-import-export/catalogImport");
Object.defineProperty(exports, "importAllCatalogByAPI", { enumerable: true, get: function () { return catalogImport_1.importAllCatalogByAPI; } });
const profile_1 = require("./profile");
var ncp = require('ncp').ncp;
const taskReducer = (result, fn) => result.then(fn);
const deleteAllData = () => {
    console.log('--Deleting all data--');
    return [
        product_1.deleteAllProducts,
        category_1.deleteCategories,
        productAttribute_1.deleteAllProductAttributes,
        productType_1.deleteAllProductTypes,
        locations_1.deleteAllLocations,
        discount_1.deleteAllDiscounts,
        document_1.deleteAllDocuments,
        documentList_1.deleteAllDocumentLists,
        documentType_1.deleteAllDocumentTypes,
    ].reduce(taskReducer, Promise.resolve());
};
exports.deleteAllData = deleteAllData;
const importAllData = () => {
    console.log('--Importing all data--');
    return [
        channel_1.importAllChannels,
        catalogImport_1.importAllCatalogByAPI,
        locations_1.importAllLocations,
        locationGroups_1.importAllLocationGroups,
        locationGroupConfiguration_1.importAllLocationGroupConfigurations,
        generalSettings_1.importGeneralSettings,
        fulfillmentSettings_1.importFulfillmentSettings,
        carrierConfiguration_1.importAllCarrierConfigurations,
        b2bAttributes_1.importB2BAttributes,
        customerAttributes_1.importCustomerAttributes,
        locationAttributes_1.importLocationAttributes,
        categoryAttributes_1.importCategoryAttributes,
        orderAttributes_1.importOrderAttributes,
        inventory_1.importAllInventory,
        orderRouting_1.importOrderRouting,
        discount_1.importAllDiscounts,
        documentType_1.importAllDocumentTypes,
        documentList_1.importAllDocumentLists,
        document_1.importAllDocuments,
    ].reduce(taskReducer, Promise.resolve());
};
exports.importAllData = importAllData;
const exportAllData = () => {
    console.log('--exporting all data--');
    return [
        catalogExport_1.exportAllCatalogByAPI,
        channel_1.exportAllChannels,
        generalSettings_1.exportGeneralSettings,
        fulfillmentSettings_1.exportFulfillmentSettings,
        discount_1.exportAllDiscounts,
        locations_1.exportAllLocations,
        locationGroups_1.exportAllLocationGroups,
        locationGroupConfiguration_1.exportAllLocationGroupConfigurations,
        carrierConfiguration_1.exportAllCarrierConfigurations,
        b2bAttributes_1.exportB2BAttributes,
        customerAttributes_1.exportCustomerAttributes,
        locationAttributes_1.exportLocationAttributes,
        categoryAttributes_1.exportCategoryAttributes,
        orderAttributes_1.exportOrderAttributes,
        inventory_1.exportAllInventory,
        orderRouting_1.exportOrderRouting,
        documentType_1.exportAllDocumentTypes,
        documentList_1.exportAllDocumentLists,
        document_1.exportAllDocuments,
        search_1.exportAllSearch,
    ].reduce(taskReducer, Promise.resolve());
};
exports.exportAllData = exportAllData;
const deleteAndImport = () => [deleteAllData, importAllData].reduce(taskReducer, Promise.resolve());
exports.deleteAndImport = deleteAndImport;
const initDataDir = (cfg) => {
    console.log(__dirname);
    const dataDir = require('path').join(__dirname, '..', 'data');
    ncp(dataDir, cfg.data, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log(`inited data dir ${cfg.data}!`);
    });
};
exports.initDataDir = initDataDir;
const setActiveProfile = (env) => {
    profile_1.activeProfile.set(env);
};
exports.setActiveProfile = setActiveProfile;
//# sourceMappingURL=index.js.map