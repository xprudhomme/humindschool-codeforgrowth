/* jshint node: true */
/* jshint globalstrict: true */
"use strict";

const argv = require('minimist')(process.argv.slice(2));
const Papa = require('papaparse');
const fs = require('fs');

const fileUtils = require('../lib/fileUtils');

let inputJSONFile = argv.hasOwnProperty("in") ? argv.in : null;
let outputCSVFile = argv.hasOwnProperty("out") ? argv.out : null;

if(!inputJSONFile || !fs.existsSync(inputJSONFile)){
    console.log(` Error: --in parameter must be a valid JSON file: ${inputJSONFile}`);
    process.exit();
}

async function convertJSONToCSV(JSONFile) {

    let jsonString = fs.readFileSync(JSONFile);
    let jsonData = JSON.parse(jsonString);

    let outFile = outputCSVFile? outputCSVFile : JSONFile.replace('.json', '.csv');
    
    //console.dir(jsonData);
    let csvData = Papa.unparse(jsonData);
    await fileUtils.saveCSVToFile(csvData, outFile);
}

convertJSONToCSV(inputJSONFile);