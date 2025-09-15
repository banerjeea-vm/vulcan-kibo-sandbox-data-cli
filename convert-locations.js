const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

// Input CSV file
const csvFile = path.resolve(__dirname, "locations.csv");
// Output JSON file (expected by kibo-sandbox-data-cli)
const outputDir = path.resolve(__dirname, "data");
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
    			code: "DS",
    			name: "Direct Ship"
    		},
    		{
    			code: "SP",
    			name: "In Store Pickup"
    		}
  ],
 regularHours: {
                sunday: {
                    label:r.Sunday ,
                    openTime: ((r.Sunday && typeof r.Sunday === 'string' && r.Sunday.includes('-')) ? `${r.Sunday.split("-")[0].replace("AM", "")}` : null),
                    closeTime:( (r.Sunday && typeof r.Sunday === 'string' && r.Sunday.includes('-')) ? `${convertTo24Hour(r.Sunday.split("-")[1])}` : null),
                    isClosed:  (r.Sunday && typeof r.Sunday === 'string' ) ? false : true
                },
                monday: {
                    label: r.Monday,
                     openTime:( (r.Monday && typeof r.Monday === 'string' && r.Monday.includes('-')) ? `${r.Monday.split("-")[0].replace("AM", "")}` : null),
                      closeTime:( (r.Monday && typeof r.Monday === 'string' && r.Monday.includes('-')) ? `${convertTo24Hour(r.Monday.split("-")[1])}` : null),
                       isClosed:  (r.Monday && typeof r.Monday === 'string' ) ? false : true

                },
                 tuesday: {
                      label: r.Tuesday,
                      openTime: ((r.Tuesday && typeof r.Tuesday === 'string' && r.Tuesday.includes('-')) ? `${r.Tuesday.split("-")[0].replace("AM", "")}` : null),
                      closeTime: ((r.Tuesday && typeof r.Tuesday === 'string' && r.Tuesday.includes('-')) ? `${convertTo24Hour(r.Tuesday.split("-")[1])}` : null),
                      isClosed: (r.Tuesday && typeof r.Tuesday === 'string') ? false : true
                    },
                    wednesday: {
                      label: r.Wednesday,
                      openTime: ((r.Wednesday && typeof r.Wednesday === 'string' && r.Wednesday.includes('-')) ? `${r.Wednesday.split("-")[0].replace("AM", "")}` : null),
                      closeTime: ((r.Wednesday && typeof r.Wednesday === 'string' && r.Wednesday.includes('-')) ? `${convertTo24Hour(r.Wednesday.split("-")[1])}` : null),
                      isClosed: (r.Wednesday && typeof r.Wednesday === 'string') ? false : true
                    },
                    thursday: {
                      label: r.Thursday,
                      openTime: ((r.Thursday && typeof r.Thursday === 'string' && r.Thursday.includes('-')) ? `${r.Thursday.split("-")[0].replace("AM", "")}` : null),
                      closeTime: ((r.Thursday && typeof r.Thursday === 'string' && r.Thursday.includes('-')) ? `${convertTo24Hour(r.Thursday.split("-")[1])}` : null),
                      isClosed: (r.Thursday && typeof r.Thursday === 'string') ? false : true
                    },
                    friday: {
                      label: r.Friday,
                      openTime: ((r.Friday && typeof r.Friday === 'string' && r.Friday.includes('-')) ? `${r.Friday.split("-")[0].replace("AM", "")}` : null),
                      closeTime: ((r.Friday && typeof r.Friday === 'string' && r.Friday.includes('-')) ? `${convertTo24Hour(r.Friday.split("-")[1])}` : null),
                      isClosed: (r.Friday && typeof r.Friday === 'string') ? false : true
                    },
                    saturday: {
                      label: r.Saturday,
                      openTime: ((r.Saturday && typeof r.Saturday === 'string' && r.Saturday.includes('-')) ? `${r.Saturday.split("-")[0].replace("AM", "")}` : null),
                      closeTime: ((r.Saturday && typeof r.Saturday === 'string' && r.Saturday.includes('-')) ? `${convertTo24Hour(r.Saturday.split("-")[1])}` : null),
                      isClosed: (r.Saturday && typeof r.Saturday === 'string') ? false : true
                    },
               timeZone :r.TimeZone
            },
  shippingOriginContact: {
  				firstName: r.ShippingContactFirstName,
  				middleNameOrInitial:"" ,
  				lastNameOrSurname: r.ShippingContactLastNameOrSurname,
                  companyOrOrganization: r.ShippingContactCompanyOrOrganization,
                  phoneNumber: r.ShippingContactPhoneNumber,
                  email: r.ShippingContactEmail
  },

  supportsInventory: true,
  allowFulfillmentWithNoStock: false,
  isDisabled: false,
  express: false,
  transferEnabled: false,
  includeInInventoryAggregrate: false,
  includeInLocationExport : false,
  warehouseEnabled: false

}));

// Write JSON file
const ndjson = locations.map((loc) => JSON.stringify(loc)).join("\n");
fs.writeFileSync(outputFile, ndjson);

console.log(`✅ Converted ${records.length} locations`);
console.log(`➡️  Output written to: ${outputFile}`);

