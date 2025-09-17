"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
//Start:ECM-58
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");//End:ECM-58

Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllLocations = exports.importAllLocations = exports.exportAllLocations = void 0;
const path_1 = __importDefault(require("path"));
const utilites_1 = require("./utilites");
const profile_1 = require("./profile");
const nconf_1 = __importDefault(require("nconf"));
nconf_1.default.argv();
const dataFilePath = path_1.default.join(nconf_1.default.get('data') || './data', 'locations.jsonl');
let appsClient, locationTypeMethods, locationMethods, locationUsagesMethods;
 function initClients() {
    appsClient = (0, profile_1.createAppsClientMozu)();
    locationTypeMethods =
        require('mozu-node-sdk/clients/commerce/admin/locationType')(appsClient);
    locationMethods = require('mozu-node-sdk/clients/commerce/admin/location')(appsClient);
    locationUsagesMethods =
        require('mozu-node-sdk/clients/commerce/settings/locationUsage')(appsClient);
}
const setDirectShipLocationUsage = async (code) => {
    var ds = await locationUsagesMethods.getLocationUsage({ code: 'ds' });
    if (ds.locationCodes.includes(code)) {
        return;
    }
    ds.locationCodes.push(code);
    await locationUsagesMethods.updateLocationUsage({ code: 'ds' }, { body: ds });
};
const locationTypes = {};
//function for creating location
const generateLocation = async (locationData) => {
    for (const locationType of locationData.locationTypes || []) {

        if (!locationTypes[locationType.code]) {
            locationTypes[locationType.code] = true;
            try {
                await locationTypeMethods.addLocationType(locationType);
            }
            catch (error) { }

        }
    }
    try {
        await locationMethods.addLocation(locationData);
        console.log('Successfully added location');
    }
    catch (error) {
        console.error(locationData.code+ 'Error in adding statusCode', error.originalError.statusCode);
        console.error('errorCode', error.originalError.errorCode);
        if (error.originalError.statusCode === 409 && error.originalError.errorCode ==='ITEM_ALREADY_EXISTS') {
            try {
            console.log(locationData.code+' is trying to Update');
                await locationMethods.updateLocation({ locationCode: locationData.code }, { body: locationData });
                console.log(locationData.code+' is Updated location Successfully');
            }
            catch (updateError) {
            console.log('=========error==========');
                console.error('Error while updating location', updateError.originalError.message);
            }
        }
    }
};
//below function will clean the data , delete location
const deleteLocation = async (locationData) => {
    try {
        await locationMethods.deleteLocation({
            locationId: locationData.id,
        });
        console.log('Successfully deleted location');
    }
    catch (deleteError) {
        console.error('Error while cleaning , deleting location', deleteError.originalError.message);
    }
};
async function* exportLocations() {
    let page = 0;
    while (true) {
        let ret = await locationMethods.getLocations({
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
async function exportAllLocations() {
    initClients();
    const stream = (0, utilites_1.createJsonLFileWriteStream)(dataFilePath);
    for await (let item of exportLocations()) {
        ['auditInfo'].forEach((key) => delete item[key]);
        await stream.write(item);
    }
}
exports.exportAllLocations = exportAllLocations;
async function importAllLocations() {
convertCsvToJson();//ECM-58
    initClients();

    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);

    for await (let locationDetail of dataStream) {

        await generateLocation(locationDetail);

        if (locationDetail.fulfillmentTypes.some((_) => _.code === 'DS')) {
            await setDirectShipLocationUsage(locationDetail.code);
        }
    }
}
exports.importAllLocations = importAllLocations;

async function deleteAllLocations() {
    initClients();
    let dataStream = (0, utilites_1.createJsonLFileStream)(dataFilePath);
    for await (let locationDetail of dataStream) {
        await deleteLocation(locationDetail);
    }
}
exports.deleteAllLocations = deleteAllLocations;

//ECM-58
function convertCsvToJson(){

const csvFile = path.resolve(__dirname, "../locations.csv");

const outputDir = path.resolve(__dirname, "../data");
const outputFile = path.join(outputDir, "locations.jsonl");

// Ensure data directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read and parse CSV
const csv = fs.readFileSync(csvFile);
const records = parse(csv, { columns: true, skip_empty_lines: true });

const convertTo24Hour = (timeStr) => {
  const match = timeStr && timeStr.match(/(\d+):(\d+)([AP]M)/i);
  if (!match) return '';
  let [_, hours, minutes, period] = match;
  hours = parseInt(hours, 10);
  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Map CSV rows → Kibo Location schema
const locations = records.map((r) => ({
  code: r.LocationCode,
  name: r.Name,
  phone:r.Phone,
  locationTypes :[{
    code: r.LocationTypeCodes,
  }],
  address: {
    address1: r.Address1,
    address2: r.Address2 || "",
    cityOrTown: r.CityOrTown,
    stateOrProvince: r.StateOrProvince,
    postalOrZipCode: r.PostalOrZipCode,
    countryCode: r.CountryCode
  },
  geo: {
    lat: r.Latitude ? parseFloat(r.Latitude) : null,
    lng: r.Longitude ? parseFloat(r.Longitude) : null,
  },
  fulfillmentTypes: [
    		{
    			code: "SP",
    			name: "In Store Pickup"
    		},
    		{
               code: "DL",
               name: "Delivery"
            },
  ],
 regularHours: {
                sunday: {
                    label:r.Sunday ,
                    openTime: ((r.Sunday && typeof r.Sunday === 'string' && r.Sunday.includes('-')) ? `${convertTo24Hour(r.Sunday.split("-")[0])}` : null),
                    closeTime:( (r.Sunday && typeof r.Sunday === 'string' && r.Sunday.includes('-')) ? `${convertTo24Hour(r.Sunday.split("-")[1])}` : null),
                    isClosed:  (r.Sunday && typeof r.Sunday === 'string' ) ? false : true
                },
                monday: {
                    label: r.Monday,
                     openTime:( (r.Monday && typeof r.Monday === 'string' && r.Monday.includes('-')) ? `${convertTo24Hour(r.Monday.split("-")[0])}` : null),
                      closeTime:( (r.Monday && typeof r.Monday === 'string' && r.Monday.includes('-')) ? `${convertTo24Hour(r.Monday.split("-")[1])}` : null),
                       isClosed:  (r.Monday && typeof r.Monday === 'string' ) ? false : true

                },
                 tuesday: {
                      label: r.Tuesday,
                      openTime: ((r.Tuesday && typeof r.Tuesday === 'string' && r.Tuesday.includes('-')) ? `${convertTo24Hour(r.Tuesday.split("-")[0])}` : null),
                      closeTime: ((r.Tuesday && typeof r.Tuesday === 'string' && r.Tuesday.includes('-')) ? `${convertTo24Hour(r.Tuesday.split("-")[1])}` : null),
                      isClosed: (r.Tuesday && typeof r.Tuesday === 'string') ? false : true
                    },
                    wednesday: {
                      label: r.Wednesday,
                      openTime: ((r.Wednesday && typeof r.Wednesday === 'string' && r.Wednesday.includes('-')) ? `${convertTo24Hour(r.Wednesday.split("-")[0])}` : null),
                      closeTime: ((r.Wednesday && typeof r.Wednesday === 'string' && r.Wednesday.includes('-')) ? `${convertTo24Hour(r.Wednesday.split("-")[1])}` : null),
                      isClosed: (r.Wednesday && typeof r.Wednesday === 'string') ? false : true
                    },
                    thursday: {
                      label: r.Thursday,
                      openTime: ((r.Thursday && typeof r.Thursday === 'string' && r.Thursday.includes('-')) ? `${convertTo24Hour(r.Thursday.split("-")[0])}` : null),
                      closeTime: ((r.Thursday && typeof r.Thursday === 'string' && r.Thursday.includes('-')) ? `${convertTo24Hour(r.Thursday.split("-")[1])}` : null),
                      isClosed: (r.Thursday && typeof r.Thursday === 'string') ? false : true
                    },
                    friday: {
                      label: r.Friday,
                      openTime: ((r.Friday && typeof r.Friday === 'string' && r.Friday.includes('-')) ? `${convertTo24Hour(r.Friday.split("-")[0])}` : null),
                      closeTime: ((r.Friday && typeof r.Friday === 'string' && r.Friday.includes('-')) ? `${convertTo24Hour(r.Friday.split("-")[1])}` : null),
                      isClosed: (r.Friday && typeof r.Friday === 'string') ? false : true
                    },
                    saturday: {
                      label: r.Saturday,
                      openTime: ((r.Saturday && typeof r.Saturday === 'string' && r.Saturday.includes('-')) ? `${convertTo24Hour(r.Saturday.split("-")[0])}` : null),
                      closeTime: ((r.Saturday && typeof r.Saturday === 'string' && r.Saturday.includes('-')) ? `${convertTo24Hour(r.Saturday.split("-")[1])}` : null),
                      isClosed: (r.Saturday && typeof r.Saturday === 'string') ? false : true
                    },
               timeZone :r.TimeZone
            },
  shippingOriginContact: {
  				firstName: r.ShippingContactFirstName ,
  				middleNameOrInitial:"" ,
  				lastNameOrSurname: r.ShippingContactLastNameOrSurname,
                  companyOrOrganization: r.ShippingContactCompanyOrOrganization,
                  phoneNumber: r.ShippingContactPhoneNumber,
                  email: r.ShippingContactEmail
  },
  supportsInventory: r.SupportsInventory === 'Yes' ? true : false,
  allowFulfillmentWithNoStock: r.AllowFulfillmentWithNoStock ==='Yes' ? true : false,
  isDisabled: r.IsDisabled ==='Yes' ? true : false,
  express: r.Express ==='Yes' ? true : false,
  transferEnabled: r.TransferEnabled ==='Yes' ? true : false,
  includeInInventoryAggregrate: r.IncludeInInventoryAggregrate ==='Yes' ? true : false,
  includeInLocationExport : r.IncludeInLocationExport ==='Yes' ? true : false,
  warehouseEnabled: r.WarehouseEnabled ==='Yes' ? true : false
}));
// Write JSON file
const ndjson = locations.map((loc) => JSON.stringify(loc)).join("\n");
fs.writeFileSync(outputFile, ndjson);

console.log(`✅ Converted ${records.length} locations`);
console.log(`➡️  Output written to: ${outputFile}`);
}


//# sourceMappingURL=locations.js.map
