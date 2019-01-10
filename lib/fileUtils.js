let fs = require('fs');

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

  module.exports = {
      saveToHTMLFile,
      saveToJSONFile
  }