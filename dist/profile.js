"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppsClientMozu = exports.activeProfile = void 0;
class EnvProfile {
    constructor() { }
    get() {
        return this.profile || process.env;
    }
    set(env) {
        this.profile = env;
    }
}
const activeProfile = new EnvProfile();
exports.activeProfile = activeProfile;
function createAppsClient(env) {
    return require('mozu-node-sdk/clients/platform/application')({
        context: {
            appKey: env.KIBO_CLIENT_ID,
            sharedSecret: env.KIBO_SHARED_SECRET,
            baseUrl: env.KIBO_API_BASE_URL,
            tenant: env.KIBO_TENANT,
            siteId: env.KIBO_SITE_ID,
            masterCatalogId: env.KIBO_MASTER_CATALOG_ID,
            catalogId: env.KIBO_CATALOG_ID,
        },
    });
}
function createAppsClientMozu(validate = false, env) {
    var appClient = createAppsClient(env || activeProfile.get());
    if (validate) {
        if (!appClient.context.tenant) {
            throw new Error('missing env var "KIBO_TENANT"');
        }
        if (!appClient.context.appKey) {
            throw new Error('missing env var "KIBO_CLIENT_ID"');
        }
        if (!appClient.context.sharedSecret) {
            throw new Error('missing env var "KIBO_SHARED_SECRET"');
        }
    }
    return appClient;
}
exports.createAppsClientMozu = createAppsClientMozu;
//# sourceMappingURL=profile.js.map