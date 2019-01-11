/* jshint node: true */
/* jshint globalstrict: true */
"use strict";

const Papa = require('papaparse');
const fs = require('fs');

/**
   * Write JSON object to specified target file
   * @param {String} jsonObj 
   * @param {String} targetFile 
   */
function saveToHTMLFile(htmlstring, targetFile) {
    
    if(!/\.html$/.test(targetFile))
      targetFile+= ".html";

    return new Promise((resolve, reject) => {
  
      // Try saving the file.        
      fs.writeFile(targetFile, htmlstring, (err, text) => {
        if(err)
          reject(err);
        else {
          resolve(targetFile);
        }
      });
    });
}


/**
 * Write JSON object to specified target file
 * @param {String} jsonObj 
 * @param {String} targetFile 
 */
function saveCSVToFile(data, targetFile) {

  if(!/\.csv$/.test(targetFile))
      targetFile+= ".csv";

  return new Promise((resolve, reject) => {
      // Try saving the file.        
      fs.writeFile(targetFile, data, (err, text) => {
          if(err)
              reject(err);
          else {
              resolve(targetFile);
          }
      });
  });
}

function saveToJSONFile(jsonObj, targetFile) {

  if(!/\.json$/.test(targetFile))
    targetFile+= ".json";

  return new Promise((resolve, reject) => {

    try {
      var data = JSON.stringify(jsonObj);
      console.log("Saving JSON data to file: %s", targetFile);
      //console.log("Saving object '%s' to JSON file: %s", JSON.stringify(jsonObj, null, 2), targetFile);
    }
    catch (err) {
      console.log("Could not convert object to JSON string ! " + err);
      reject(err);
    }
        
    // Try saving the file.        
    fs.writeFile(targetFile, data, (err, text) => {
      if(err)
        reject(err);
      else {
        resolve(targetFile);
      }
    });
  });
}


/**
 * Parse a csv file and returns a Promise which resolves to the data as an array
 * @param {string} filepath 
 * @param {string} delimiter 
 */
function getDataFromCSVFile(filepath, delimiter='') {

  // Get CSV file contents as a string
  let contents = fs.readFileSync(filepath, {encoding: 'utf-8'});

  // Parse the csv string and returns a Promise which resolves to the data as an array
  return new Promise((resolve,reject) => {

    Papa.parse(contents, {
            header: true,
            //delimiter: delimiter,
            skipEmptyLines: true,
            //quoteChar: '"',
      complete: results => {
        console.log("CSV file has been fully parsed !");
        resolve(results.data);
      },
      error : (err, file) => {
        console.log("CSV file parsing step encountered an error...");
        reject(err);
      }
    });
  });
}

module.exports = {
  saveToHTMLFile,
  saveToJSONFile,
  saveCSVToFile,
  getDataFromCSVFile,
};