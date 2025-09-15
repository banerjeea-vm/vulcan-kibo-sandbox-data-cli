"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAllProducts = exports.importAllProductVariations = exports.importAllProducts = exports.deleteAllProducts = void 0;
const path_1 = __importDefault(require("path"));
var Spinner = require('cli-spinner').Spinner;
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const category_1 = require("./category");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = path_1.default.join(nconf_1.default.get('data') || './data', 'products.jsonl');
const variationDataFilePath = path_1.default.join(nconf_1.default.get('data') || './data', 'product-variations.jsonl');
let appsClient, product, productVariant;
function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    product = require('mozu-node-sdk/clients/commerce/catalog/admin/product')(appsClient);
    productVariant =
        require('mozu-node-sdk/clients/commerce/catalog/admin/products/productVariation')(appsClient);
}
//function for creating documentType
const generateProduct = async (productData) => {
    try {
        await product.addProduct({ productCode: productData.productCode }, { body: productData });
        console.log('Successfully added product');
    }
    catch (error) {
        if (error.originalError.statusCode === 409 && nconf_1.default.get('upsert')) {
            try {
                await product.updateProduct({ productCode: productData.productCode }, { body: productData });
            }
            catch (updateError) {
                console.error(`Error while updating product ${product.productCode}`, updateError.originalError.message);
            }
        }
    }
};
//function for creating documentType
const generateProductVariation = async (productDatas, productCode) => {
    productDatas.forEach((element) => {
        delete element.variationkey;
    });
    const body = {
        totalCount: productDatas.length,
        items: productDatas,
    };
    try {
        await productVariant.updateProductVariations({ productCode: productCode }, { body: body });
    }
    catch (error) {
        console.error(`Error in adding product variant ${productCode}`, error.originalError.message);
    }
};
const prepForExport = (product, cats) => { };
async function* exportProducts() {
    let page = 0;
    while (true) {
        let ret = await product.getProducts({
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
async function* exportProductVariations(productCode) {
    let page = 0;
    while (true) {
        let ret = await productVariant.getProductVariations({
            startIndex: page * 200,
            productCode: productCode,
            filter: 'isActive eq true',
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
//below function will clean the data , delete document
const deleteProduct = async (productData) => {
    try {
        await product.deleteProduct({
            productCode: productData.productCode,
        });
    }
    catch (deleteError) {
        console.error(`Error while cleaning , deleting product ${productData.productCode}`, deleteError.originalError.message);
    }
};
async function deleteAllProducts() {
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let productDetail of dataStream) {
        await deleteProduct(productDetail);
    }
}
exports.deleteAllProducts = deleteAllProducts;
async function importAllProducts() {
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    const cats = (await (0, category_1.allCategories)()).lookup;
    for await (let productDetail of dataStream) {
        productDetail.productInCatalogs?.forEach((catalog) => {
            catalog.productCategories?.forEach((pCat) => {
                pCat.categoryId = cats[pCat.categoryCode]?.id;
            });
            if (catalog.primaryProductCategory) {
                catalog.primaryProductCategory.categoryId =
                    cats[catalog.primaryProductCategory.categoryCode]?.categoryId;
            }
        });
        await generateProduct(productDetail);
    }
}
exports.importAllProducts = importAllProducts;
async function importAllProductVariations() {
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(variationDataFilePath);
    let set = [];
    let curPc = null;
    for await (let variation of dataStream) {
        curPc = curPc || variation.productCode;
        if (variation.productCode !== curPc && set.length) {
            await generateProductVariation(set, curPc);
            curPc = variation.productCode;
            set = [];
        }
        set.push(variation);
    }
    if (set.length) {
        await generateProductVariation(set, curPc);
    }
}
exports.importAllProductVariations = importAllProductVariations;
async function exportAllProducts() {
    initClients();
    var spinner = new Spinner('exporting products.. %s');
    spinner.start();
    const cats = (await (0, category_1.allCategories)()).idLookup;
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    const variationStream = (0, utilites_1.createJsonLFileWriteStream)(variationDataFilePath);
    for await (let productDetail of exportProducts()) {
        ['auditInfo'].forEach((key) => delete productDetail[key]);
        productDetail.productInCatalogs = productDetail.productInCatalogs?.filter((catalog) => catalog.catalogId === 1);
        if (!productDetail.productInCatalogs ||
            !productDetail.productInCatalogs?.length) {
            return;
        }
        productDetail.productInCatalogs?.forEach((catalog) => {
            delete catalog.content;
            delete catalog.isPriceOverridden;
            delete catalog.seoContent;
            catalog.isContentOverridden = false;
            catalog.isPriceOverridden = false;
            catalog.isSeoContentOverridden = false;
            catalog.productCategories?.forEach((pCat) => {
                pCat.categoryCode = cats[pCat.categoryId]?.categoryCode;
            });
            if (catalog.primaryProductCategory) {
                catalog.primaryProductCategory.categoryCode =
                    cats[catalog.primaryProductCategory.categoryId]?.categoryCode;
            }
        });
        await stream.write(productDetail);
        if (productDetail.productUsage !== 'Configurable') {
            continue;
        }
        try {
            for await (let variation of exportProductVariations(productDetail.productCode)) {
                variation.productCode = productDetail.productCode;
                await variationStream.write(variation);
            }
        }
        catch (error) {
            console.error(`Error in exporting product variation ${productDetail.productCode}`, error);
        }
    }
    spinner.stop(true);
    console.log('products exported');
}
exports.exportAllProducts = exportAllProducts;
//# sourceMappingURL=product.js.map