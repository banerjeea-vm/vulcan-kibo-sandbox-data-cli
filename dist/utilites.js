"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidZip = exports.createFilesDirIfNotExists = exports.createJsonLFileWriteStream = exports.createJsonLFileStream = void 0;
const jsonlines_1 = __importDefault(require("jsonlines"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
function createJsonLFileStream(dataFilePath) {
    const source = fs_1.default.createReadStream(dataFilePath);
    const parser = jsonlines_1.default.parse({ emitInvalidLines: true });
    const dataStream = source.pipe(parser);
    return dataStream;
}
exports.createJsonLFileStream = createJsonLFileStream;
function createJsonLFileWriteStream(dataFilePath) {
    createFilesDirIfNotExists(dataFilePath);
    var stringifier = jsonlines_1.default.stringify();
    const destStream = fs_1.default.createWriteStream(dataFilePath);
    stringifier.pipe(destStream);
    return stringifier;
}
exports.createJsonLFileWriteStream = createJsonLFileWriteStream;
function createFilesDirIfNotExists(filename) {
    const dir = path_1.default.dirname(filename);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
}
exports.createFilesDirIfNotExists = createFilesDirIfNotExists;
async function isValidZip(path) {
    if (!path.endsWith('.zip')) {
        throw new Error('invalid file type, use zip');
    }
    try {
        await promises_1.default.access(path);
    }
    catch (error) {
        console.error(error);
        throw new Error(`import file not found or inaccessible. path ${path}`);
    }
}
exports.isValidZip = isValidZip;
//# sourceMappingURL=utilites.js.map