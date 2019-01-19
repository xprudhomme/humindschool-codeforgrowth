//const startupsList  = require("./data/startupsList");

const argv = require('minimist')(process.argv.slice(2));
const puppeteer = require('puppeteer');
const Papa = require('papaparse');
const fs = require('fs');

const xpaths = require('./xpaths');
const fileUtils = require('./lib/fileUtils');

const headless = argv.hasOwnProperty("headless") ? ((argv.headless=="true" || argv.headless=="TRUE" || argv.headless===1)? true:false) : true;

let inputJSONFile = argv.hasOwnProperty("in") ? argv.in : null;
let outputCSVFile = argv.hasOwnProperty("out") ? argv.out : null;

if(!inputJSONFile || !fs.existsSync(inputJSONFile)){
    console.log(` Error: --in parameter must be a valid JSON file: ${inputJSONFile}`);
    process.exit();
}

const jsonString = fs.readFileSync(inputJSONFile);
const startupsList = JSON.parse(jsonString);

let page = null;
let browser = null;

let annuaireUrl = 'https://www.usine-digitale.fr/annuaire-start-up/';

function evaluateXPathFunctions() {

    return page.evaluate( () => {

        window.__utils = {

            /**
             * Alias for the "getElementByXPath" method
             * Retrieves a single DOM element matching a given XPath expression.
             *
             * @param  String            selector  The XPath expression
             * @param  HTMLElement|null  scope       Element to search child elements within
             * @return HTMLElement or null
             */
            getElem(selector, scope) {
                return this.getElementByXPath(selector, scope);
            },


            /**
             * Given an XPath selector, retrieve all matching nodes text contents
             * @param {String} selector 
             * @return {Array}
             */
            getElemText(selector) {

                let text = "", element = this.getElementByXPath(selector);
                
                if (element) {

                    // Replace 'br' nodes with "\n" because node.textContent does delete the line break involved by 'br'
                    if(element.innerHTML) 
                        element.innerHTML = element.innerHTML.replace(/<br>/gi, '\n');
            
                    let elemcontent =  element.textContent || element.innerText;

                    if(elemcontent!=="" && elemcontent!==null && elemcontent !== undefined) {
                        // Remove any trailing space/comma character, replace all multiple spaces by one (keep LF+CR)
                        let cleanedText = elemcontent.replace(/^\s+|^,|[^\S\r\n]+$/gm,'').replace(/[^\S\r\n]+/g, ' ');
                        text = cleanedText.trim();
                    }
                }
            
                return text;
            },


            /**
             * Given an XPath selector, retrieve all matching nodes text contents
             * @param {String} selector 
             * @return {Array}
             */
            getElemTexts(selector) {

                let textEls = [], elements = this.getElementsByXPath(selector);
                
                if (elements && elements.length) {

                    // Replace 'br' nodes with "\n" because node.textContent does delete the line break involved by 'br'
                    elements.map(node => {if(node.innerHTML) node.innerHTML = node.innerHTML.replace(/<br>/gi, '\n');});
            
                    Array.prototype.forEach.call(elements, function _forEach(element) {
                        let elemcontent =  element.textContent || element.innerText;

                        if(elemcontent!=="" && elemcontent!==null && elemcontent !== undefined) {
                            // Remove any trailing space/comma character, replace all multiple spaces by one (keep LF+CR)
                            let cleanedText = elemcontent.replace(/^\s+|^,|[^\S\r\n]+$/gm,'').replace(/[^\S\r\n]+/g, ' ');
                            textEls.push(cleanedText.trim());
                        }
                    });
                }
            
                return textEls;
            },

            /**
             * Retrieves the value of an attribute on the first element matching the provided DOM XPath selector
             * @param {String} selector A DOM XPath selector
             * @param {String} attribute The attribute name to lookup
             */
            getElemAttr(selector, attribute) {
                return this.getElementByXPath(selector).getAttribute(attribute);
            },

            getElementsAttributes(selector, attribute) {

                //console.log(` [getElementsAttributes] Retrieving attribute '${attribute}' from node: ${selector}`);

                let attributes = [], elements = this.getElementsByXPath(selector);

                if (elements && elements.length) {

                    Array.prototype.forEach.call(elements, element => {                  
                        attributes.push(element.getAttribute(attribute));
                    });
                }

                return attributes;
            },

            /**
             * Fetches innerText within the element(s) matching a given XPath selector
             * selector.
             *
             * @param  String  selector  A XPath selector
             * @return String
             */
            fetchText(selector) {
                
                let text = '', elements = this.getElementsByXPath(selector);
                if (elements && elements.length) {
                    Array.prototype.forEach.call(elements, function _forEach(element) {
                        text += element.textContent || element.innerText || element.value || '';
                    });
                }
                return text;
            },
        
            /**
             * Retrieves a single DOM element matching a given XPath expression.
             *
             * @param  String            expression  The XPath expression
             * @param  HTMLElement|null  scope       Element to search child elements within
             * @return HTMLElement or null
             */
            getElementByXPath(expression, scope) {
                scope = scope || document;
                let a = document.evaluate(expression, scope, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                if (a.snapshotLength > 0) {
                    return a.snapshotItem(0);
                }
            },
            
            /**
             * Retrieves all DOM elements matching a given XPath expression.
             *
             * @param  String            expression  The XPath expression
             * @param  HTMLElement|null  scope       Element to search child elements within
             * @return Array
             */
            getElementsByXPath(expression, scope) {
                scope = scope || document;
                let nodes = [];
                let a = document.evaluate(expression, scope, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                for (let i = 0; i < a.snapshotLength; i++) {
                    nodes.push(a.snapshotItem(i));
                }
                return nodes;
            }
        };
      });
}

function extractTextFromXPath(xpath) {
    return page.evaluate( (xpath) => {
        return window.__utils.getElemText(xpath);
    }, xpath);
}

function extractTextsFromXPath(xpath) {
    return page.evaluate( (xpath) => {
        return window.__utils.getElemTexts(xpath);
    }, xpath);
}

async function openStartupPageAndExtractData(startupUrl) {

    console.log(` Treating current page: ${startupUrl}`);
    page = await browser.newPage();
    await page.goto(startupUrl);
    await page.waitFor(2500);
    await evaluateXPathFunctions();
    
    let email = await extractTextFromXPath(xpaths.email);
    let website = await extractTextFromXPath(xpaths.website);
    let phone = await extractTextFromXPath(xpaths.phone);
    let name = await extractTextFromXPath(xpaths.name);
    let creationDate = await extractTextFromXPath(xpaths.creationDate);
    let founders = await extractTextsFromXPath(xpaths.founders);
    let markets = await extractTextsFromXPath(xpaths.markets);
    let addressParts = await extractTextsFromXPath(xpaths.address);
    let employees = await extractTextFromXPath(xpaths.employees);
   
    const results = {
        startupUrl,
        name,
        email,
        website,
        phone,
        creationDate,
        founders,
        markets,
        employees,
        addressParts
    };

    console.log(`Startup data is: ${JSON.stringify(results, null, 2)}`);
    await fileUtils.saveToJSONFile(results, `/tmp/jsonresults_${name}.json`);

    await page.close();
    return results;
}



function launchBrowser() {
    return puppeteer.launch({
        headless: true,
        defaultViewport: {
            width: 1200,
            height: 1800
        }
    });
}

async function saveToCSV(allStartupData) {
        // Convert startups JSON data to CSV string
        let csvData = Papa.unparse(allStartupData);

        // Save startups CSV string to CSV file
        await fileUtils.saveCSVToFile(csvData, outputCSVFile);
}

async function extractStartupsListData(startupsList) {

    let counter=1;
    let allStartupData = [];

    for(let startupUrl of startupsList) {

        console.log(` Dealing with page n°${counter++}/${startupsList.length}: `);
        
        let {founders,
            markets,
            addressParts,
            ...startupData} 
            = await openStartupPageAndExtractData(startupUrl);
        
        let addressLastLine = addressParts.pop();
        let [, zipcode, city] = addressLastLine.match(/(\d{5})\s(.+)/i);

        allStartupData.push({
            ...startupData,
            address: addressParts.shift(),
            city,
            zipcode,
            founders: founders.join(", "),
            markets: markets.join(", ")
        });

        await saveToCSV(allStartupData);
    }
    


    await fileUtils.saveToJSONFile(allStartupData, '/tmp/partialStartupData.json');
}

async function extractStartupURLsList() {

    // Open new page and go to main Annuaire page
    page = await browser.newPage();
    await page.goto(annuaireUrl);
    await page.waitFor(3000);

    let currentPageNumber = 1;
    let nextPageButtonExists = true;

    do {
        console.log(` Current page: n°${currentPageNumber}`);

        await page.click('a[rel=next]');
        await page.waitFor(3000);

        currentPageNumber++;

    } while(nextPageButtonExists);
}

(async () => {

    browser = await launchBrowser();

    await extractStartupsListData(startupsList);
    
    await browser.close();
})();