/* jshint node: true */
/* jshint globalstrict: true */
"use strict";

const argv = require('minimist')(process.argv.slice(2));
const Papa = require('papaparse');
const fs = require('fs');

const fileUtils = require('../lib/fileUtils');

let inputJSONFile = argv.hasOwnProperty("jsonfile") ? argv.jsonfile : null;

if(!inputJSONFile || !fs.existsSync(inputJSONFile)){
    console.log(` Error: --jsonfile parameter must be a valid JSON file: ${inputJSONFile}`);
    process.exit();
}

async function convertJSONToCSV(JSONFile) {
    let jsonString = fs.readFileSync(JSONFile);
    let jsonData = JSON.parse(jsonString);
    
    //console.dir(jsonData);
    let csvData = Papa.unparse(jsonData);
    await fileUtils.saveCSVToFile(csvData, JSONFile.replace('.json', '.csv'));
}

convertJSONToCSV(inputJSONFile);