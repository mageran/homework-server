const axios = require('axios');
const { parseXml } = require('libxmljs');
const { readFileSync, writeFileSync, existsSync } = require('fs');

const WolframAlphaApiId = '396TWH-6T6PUA6RRP';
const CacheFolder = "cache";

const _buildWolframAlphaQueryUrl = queryString => {
    const url = `http://api.wolframalpha.com/v2/query?input=${escape(queryString)}&appid=${WolframAlphaApiId}`;
    return url;
}

const processXmlResponse = data => {
    const xmlDoc = parseXml(data);
    //console.log(data);
    const obj = {};
    const queryResult = xmlDoc.root();
    if (!queryResult) {
        throw "unexpected query result"
    }
    console.log(`success: ${queryResult.attr('success').value()}`);
    if (queryResult.attr('success').value() !== "true") {
        throw "unsuccessful query"
    }
    const plaintextList = [];
    xmlDoc.find('//pod').forEach(elem => {
        const id = elem.attr('id');
        if (id) {
            console.log(`found pod with id ${id}...`)
            elem.find('//plaintext').forEach(plaintextElem => {
                const text = plaintextElem.text();
                plaintextList.push(...text.split(/\s*\|\s*/));
                const parts = text.split(/\s*\n\s*/);
                for (let i = 0; i < parts.length; i++) {
                    let keyValue = parts[i].split(/\s*\|\s*/);
                    if (keyValue.length !== 2) continue;
                    let key = keyValue[0];
                    let value = keyValue[1];
                    if (obj[key]) {
                        if (typeof obj[key] === 'string') {
                            if (obj[key] === value) {
                                continue;
                            }
                            obj[key] = [obj[key]];
                        }
                        if (!obj[key].includes(value)) {
                            obj[key].push(value);
                        }
                    } else {
                        obj[key] = value;
                    }
                }
            })
        }
    });
    if (plaintextList.length > 0) {
        obj.plaintext = plaintextList;
    }
    console.log(obj);
    return obj;
}

const getCacheFilenameFromQueryString = queryString => {
    const filename = queryString.toLowerCase().split(/\s+/).join('-');
    return `${CacheFolder}/${filename}.xml`;
}

const chemicalQuery = (queryString, options = { debug: true, useCache: false }) => {
    const { debug, useCache } = options;
    console.log(options);
    queryString = (typeof queryString === 'string') ? queryString.trim() : queryString;
    const url = _buildWolframAlphaQueryUrl(queryString);
    const cacheFilename = getCacheFilenameFromQueryString(queryString);
    const getCachedData = () => {
        if (!useCache) return null;
        if (existsSync(cacheFilename)) {
            if (debug) {
                console.log(`using cached data from "${cacheFilename}"...`);
            }
            const data = readFileSync(cacheFilename, 'utf-8');
            try {
                return Promise.resolve(processXmlResponse(data))
            } catch (err) {
                return Promise.reject(err);
            }
        }
        return null;
    }
    const p = getCachedData();
    if (p) return p;
    return axios.get(url)
        .then(response => {
            debug && console.log(`success, response has ${response.data.length} bytes`);
            if (useCache) {
                writeFileSync(cacheFilename, response.data);
                console.log(`output written to ${cacheFilename}`);
            }
            return new Promise((resolve, reject) => {
                try {
                    resolve(processXmlResponse(response.data));
                } catch (err) {
                    reject(err);
                }

            })
        })
}

module.exports = {
    chemicalQuery
}

if (require.main === module) {
    // tests
    const arg = process.argv[2];
    if (!arg) {
        console.log(`argument is missing`);
        return;
    }
    if (arg.endsWith('.xml')) {
        let data = readFileSync(arg, 'utf-8');
        processXmlResponse(data);
    } else {
        let queryString = arg;
        console.log(`queryString "${queryString}"`);
        chemicalQuery(queryString);
    }
}