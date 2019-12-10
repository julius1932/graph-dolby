const jsonfile = require('jsonfile');
const gsjson = require('google-spreadsheet-to-json');
//const LOCAL_HELPERS = {
const clean = (str) => {
    if (!str) {
        return "";
    }
    //console.log(str);
    if (typeof str === 'string') {
        str = str.toUpperCase().trim();
        str = str.split(".").join("");
        str = str.split(",").join("");
        str = str.split("-").join("");
        str = str.split("/").join("");
        str = str.split("&").join("");
        str = str.split(" ").join("");
        str = str.split('\"').join("");
    }

    return str;
}
const readOrderByDist = (data) => {
    let items = {};
    data.forEach(function(item) {
        let distributor = item.distributor;
        distributor = clean(distributor);
        if (!distributor) {
            distributor = "No distoo";
        }
        if (distributor && !items[distributor]) {
            items[distributor] = item.distributor || "No distributor";
        }
    });
    let result = Object.values(items);
    result = result.map((item) => item.split('\"').join(""));
    let tempClean = [];
    let uniqueArray = result.filter(function(item, pos) {
        if (tempClean.includes(clean(item))) {
            return false;
        } else {
            tempClean.push(clean(item));
            return true;
        }
    })
    return uniqueArray;
}
const readOrderByBrand = (data, dist) => {
    let items = {};
    console.log(data.length);
    data.forEach(function(item) {
        let brand = item.brandName;
        brand = clean(brand);
        if (dist) {
            brand += clean(item.distributor);
        }
        let pPayed = clean(item.pianoSound) || "NO";
        //console.log(pPayed, brand);
        pPayed = pPayed == "NO" || !pPayed.trim() ? 0 : 1;
        let dolbyLogo = clean(item.trademark) || "NO";
        dolbyLogo = dolbyLogo == "NO" || !dolbyLogo.trim() ? 0 : 1;

        if (items[brand]) {
            items[brand].models += 1;
            items[brand].pianoPlayed += pPayed;
            items[brand].dolbyLogo += dolbyLogo;
        } else {
            let distStr = item.distributor || "No distributor";
            let brandLab = item.brandName;
            if (dist) {
                brandLab = distStr + " : " + item.brandName;
            }
            items[brand] = {
                brand: brandLab,
                models: 1,
                pianoPlayed: pPayed,
                dolbyLogo: dolbyLogo
            }
        }
    });
    //console.log(items);
    return items;
}
const readOrderByRetailer = (data, graph) => {
    let items = {};
    console.log(data.length);

    data.forEach(function(item) {
        let brandLab = "";
        let brand = item.retailerName;
        switch (graph) {
            case "retailername":
                brand = item["retailerName"];
                brandLab = brand;
                //console.log( graph,b);
                break;
            case "category":
                brand = item["category"];
                brandLab = brand;
                break;
            case "retailercategory":
                brand = item["retailerName"] + item["category"];
                brandLab = item["retailerName"] + " : " + item["category"];
                break;
        }

        let pPayed = clean(item.pianoSound) || "NO";
        //console.log(pPayed, brand);
        pPayed = pPayed == "NO" || !pPayed.trim() ? 0 : 1;
        let dolbyLogo = clean(item.trademark) || "NO";
        dolbyLogo = dolbyLogo == "NO" || !dolbyLogo.trim() ? 0 : 1;
        brand=clean(brand);
        if (items[brand]) {
            items[brand].models += 1;
            items[brand].pianoPlayed += pPayed;
            items[brand].dolbyLogo += dolbyLogo;
        } else {
            items[brand] = {
                brand: brandLab,
                models: 1,
                pianoPlayed: pPayed,
                dolbyLogo: dolbyLogo
            }
        }
    });
    //console.log(items);
    return items;
}
const cleanForChartRetailer = function(items, graph, bars) {
    //console.log("items.length");
    //console.log(items.length);
    let series = {
        models: {
            name: "Models",
            data: []
        },
        pio: {
            name: "Piano Played",
            data: []
        },
        tm: {
            name: "Dolby Logo",
            data: []
        },
    };
    console.log("ppppppppppppppppppppppppppp");

    let totalModels = items.length;
    //console.log("totalModels");
    //console.log(items.length);
    items = readOrderByRetailer(items, graph);

    let categoriesDist = [];
    let categories = Object.keys(items);

    let data = Object.values(items);

    let DOLBY_AV = {
        yes: 0,
        no: 0
    }
    let brandsWithDolby = [];
    let brandsWithOutDolby = [];
    data.sort((a, b) => {
        if (a.models > b.models) return -1;
        if (b.models > a.models) return 1;
    });
    data.forEach((item) => {
        DOLBY_AV.yes += item.dolbyLogo;
        categoriesDist.push(item.brand);
        series.models.data.push(item.models);
        series.pio.data.push(item.pianoPlayed);
        series.tm.data.push(item.dolbyLogo);
        if (item.dolbyLogo > 0) {
            brandsWithDolby.push(item.brand);
        } else {
            brandsWithOutDolby.push(item.brand);
        }
    });
    DOLBY_AV.no = totalModels - DOLBY_AV.yes;
    if (graph) {
        categories = categoriesDist;
    }
    let obItem = { categories, DOLBY_AV: DOLBY_AV, brandsWithDolby: brandsWithDolby, brandsWithOutDolby: brandsWithOutDolby };
    //obItem.color=['#7cb5ec', '#ffa500', '#07023d'],
    obItem.color = [];
    if (!bars || bars.length == 0) {
        obItem.series = [series.models, series.pio, series.tm];
        obItem.color = ['#7cb5ec', '#ffa500', '#07023d'];
    } else {
        let arrr = [];
        if (bars.includes("models")) {
            arrr.push(series.models);
            obItem.color.push('#7cb5ec');
        }
        if (bars.includes("pio")) {
            arrr.push(series.pio);
            obItem.color.push('#ffa500');
        }
        if (bars.includes("tm")) {
            arrr.push(series.tm);
            obItem.color.push('#07023d');
        }
        obItem.series = arrr;
    }
    //console.log(items);
    return obItem;
}
const cleanForChart = function(items, dist, bars) {
    //console.log("items.length");
    //console.log(items.length);
    let series = {
        models: {
            name: "Models",
            data: []
        },
        pio: {
            name: "Piano Played",
            data: []
        },
        tm: {
            name: "Dolby Logo",
            data: []
        },
    };
    if (!items || items.length == 0) {
        console.log("ppppppppppppppppppppppppppp");
        //items = jsonfile.readFileSync(`./data.json`);
    }
    //console.log(".........");
    // console.log(items.length);
    if (dist) {
        if (!Array.isArray(dist)) {
            dist = [dist];
        }
        if (dist.length > 0) {
            console.log(dist);
            dist = dist.map((curr) => curr == "No distributor" ? "" : curr);
            let cleanedDist = dist.map((curr) => clean(curr));
            //let cleanedDist = clean(dist);
            items = items.filter((item) => cleanedDist.includes(clean(item.distributor)));
        }
    }
    let totalModels = items.length;
    //console.log("totalModels");
    //console.log(items.length);
    items = readOrderByBrand(items, dist);

    let categoriesDist = [];
    let categories = Object.keys(items);

    let data = Object.values(items);
    if (dist) {
        data = data.sort((a, b) => (a.brand > b.brand) ? 1 : ((b.brand > a.brand) ? -1 : 0));
    }
    let DOLBY_AV = {
        yes: 0,
        no: 0
    }
    let brandsWithDolby = [];
    let brandsWithOutDolby = [];
    data.sort((a, b) => {
        if (a.models > b.models) return -1;
        if (b.models > a.models) return 1;
    });
    data.forEach((item) => {
        DOLBY_AV.yes += item.dolbyLogo;
        categoriesDist.push(item.brand);
        series.models.data.push(item.models);
        series.pio.data.push(item.pianoPlayed);
        series.tm.data.push(item.dolbyLogo);
        if (item.dolbyLogo > 0) {
            brandsWithDolby.push(item.brand);
        } else {
            brandsWithOutDolby.push(item.brand);
        }
    });
    DOLBY_AV.no = totalModels - DOLBY_AV.yes;
    if (dist) {
        categories = categoriesDist;
    }
    let obItem = { categories, dist: dist, DOLBY_AV: DOLBY_AV, brandsWithDolby: brandsWithDolby, brandsWithOutDolby: brandsWithOutDolby };
    //obItem.color=['#7cb5ec', '#ffa500', '#07023d'],
    obItem.color = [];
    if (!bars || bars.length == 0) {
        obItem.series = [series.models, series.pio, series.tm];
        obItem.color = ['#7cb5ec', '#ffa500', '#07023d'];
    } else {
        let arrr = [];
        if (bars.includes("models")) {
            arrr.push(series.models);
            obItem.color.push('#7cb5ec');
        }
        if (bars.includes("pio")) {
            arrr.push(series.pio);
            obItem.color.push('#ffa500');
        }
        if (bars.includes("tm")) {
            arrr.push(series.tm);
            obItem.color.push('#07023d');
        }
        obItem.series = arrr;
    }
    return obItem;
}

const HELPERS = {
    dataByKey: (req, res) => {

        let key = req.params.key || "";
        console.log(key);
        if (key == "brandmodel" || key == "brandModel") {
            key = 'brandModel#';
        }
        if (key == "retailername" || key == "retailerName") {
            key = 'retailerName';
        }
        if (key == "brandname" || key == "brandName") {
            key = 'brandName';
        }
        if (key == "threefiles" || key == "threeFiles") {
            key = 'threeFiles';
        }
        if (key == "pianosound" || key == "pianoSound") {
            key = 'pianoSound';
        }
        if (key == "countryoforigin" || key == "countryOfOrigin") {
            key = 'countryOfOrigin';
        }
        //console.log(key);
        /* gsjson({
                 spreadsheetId: '1NWNFnVyMZ10AwnwFeAirC5vQNh2MgORywAfRckUFVPw',
                 // other options...
             })
             .then(function(result) {*/
        let result = jsonfile.readFileSync(`data.json`);
        result = result.map((item) => item[key]);
        result = result.map((item) => item.split('\"').join(""));
        let tempClean = [];
        let uniqueArray = result.filter(function(item, pos) {
            if (tempClean.includes(clean(item))) {
                return false;
            } else {
                tempClean.push(clean(item));
                return true;
            }
        })
        uniqueArray = uniqueArray.sort();
        //console.log(result);
        return res.jsonp(uniqueArray);
        /*})
        .catch(function(err) {
            console.log(err.message);
            console.log(err.stack);
            if (err) {

                return res.jsonp([]);
            }

        });*/

    },
    clientsExcel: (req, res) => {
        let params = req.body;
        let brandName = [];
        let t1 = params.tier1;
        let t2 = params.tier2;
        let t3 = params.tier3;
        if (t1) {
            if (!Array.isArray(t1)) {
                t1 = [t1];
            }
            brandName = [...brandName, ...t1];
        }
        if (t2) {
            if (!Array.isArray(t2)) {
                t2 = [t2];
            }
            brandName = [...brandName, ...t2];
        }
        if (t3) {
            if (!Array.isArray(t3)) {
                t3 = [t3];
            }
            brandName = [...brandName, ...t3];
        }

        delete params.tier1;
        delete params.tier2;
        delete params.tier3;
        /* if (params.brandName) {
             if (!Array.isArray(params.brandName)) {
                 params.brandName = [params.brandName];
             }
             params.brandName = [...params.brandName, ...brandName];
         } else {
             params.brandName = brandName;
         }
         if (params.brandName.length == 0) {
             delete params.brandName;
         }*/

        let paramsKeys = Object.keys(params);
        paramsKeys = paramsKeys.filter((param) => params[param]);
        console.log(paramsKeys);
        /*gsjson({
                spreadsheetId: '1NWNFnVyMZ10AwnwFeAirC5vQNh2MgORywAfRckUFVPw',
                // other options...
            })
            .then(function(result) {*/
        //console.log(result.length);
        let result = jsonfile.readFileSync(`data.json`);
        let data = result.filter((itm) => {
            let test = true;
            for (let i = 0; i < paramsKeys.length; i++) {
                let key = paramsKeys[i];
                if (Array.isArray(params[key])) {
                    let arr = params[key].map((curr) => clean(curr));
                    test = test && arr.includes(clean(itm[mapKeys(key)]));
                } else {

                    test = test && (clean(params[key]) === clean(itm[mapKeys(key)]));
                    if (test) {
                        console.log(clean(params[key]) + "========" + clean(itm[mapKeys(key)]));
                    }
                    //console.log(test);
                }
            }
            return test;
        });
        //console.log(data);
        return res.jsonp(data);
        /* })
         .catch(function(err) {
             console.log(err.message);
             console.log(err.stack);
             if (err) {

                 return res.jsonp([]);
             }

         });*/

    },
    clients: (req, res, callback) => {
        let params = req.query;
        console.log("=======");
        let brandName = [];
        let t1 = params.tier1;
        let t2 = params.tier2;
        let t3 = params.tier3;
        if (t1) {
            if (!Array.isArray(t1)) {
                t1 = [t1];
            }
            brandName = [...brandName, ...t1];
        }
        if (t2) {
            if (!Array.isArray(t2)) {
                t2 = [t2];
            }
            brandName = [...brandName, ...t2];
        }
        if (t3) {
            if (!Array.isArray(t3)) {
                t3 = [t3];
            }
            brandName = [...brandName, ...t3];
        }

        delete params.tier1;
        delete params.tier2;
        delete params.tier3;
        /*if (params.brandName) {
            if (!Array.isArray(params.brandName)) {
                params.brandName = [params.brandName];
            }
            params.brandName = [...params.brandName, ...brandName];
        } else {
            params.brandName = brandName;
        }
        
        console.log(params);
        if (params.brandName.length == 0) {
            delete params.brandName;
        }*/
        let paramsKeys = Object.keys(params);
        paramsKeys = paramsKeys.filter((param) => params[param]);
        //console.log(paramsKeys);
        /*gsjson({
                spreadsheetId: '1NWNFnVyMZ10AwnwFeAirC5vQNh2MgORywAfRckUFVPw',
                // other options...
            })
            .then(function(result) {*/
        let result = jsonfile.readFileSync(`data.json`);
        console.log(result.length);
        let data = result.filter((itm) => {
            let test = true;
            for (let i = 0; i < paramsKeys.length; i++) {
                let key = paramsKeys[i];
                if (Array.isArray(params[key])) {
                    let arr = params[key].map((curr) => clean(curr));
                    test = test && arr.includes(clean(itm[mapKeys(key)]));
                } else {
                    //console.log(clean(params[key]) + "========" + clean(itm[key]));
                    test = test && (clean(params[key]) === clean(itm[mapKeys(key)]));
                    //console.log(test);
                }
            }
            // console.log(test);
            return test;
        });


        let sound = {
            holiday1: 0,
            holiday2: 0,
            both: 0,
            no: 0
        }
        data.forEach((item) => {
            let soP = clean(item.pianoSound);
            //console.log(soP);
            switch (soP) {
                case "HOLIDAY1":
                    sound.holiday1++;
                    break;
                case "HOLIDAY2":
                    sound.holiday2++;
                    break;
                case "BOTH":
                    sound.both++;
                    break;
                case "NO":
                case "":
                    sound.no++;

                    break;
            }

        })
        callback({
            all: data,
            sound: sound
        });
        /*
                    })
                    .catch(function(err) {
                        console.log(err.message);
                        console.log(err.stack);
                        if (err) {
                            //let data = cleanForChart(null, dist);
                            return {};
                        }

                    });*/

    },
    byRetailer: (res, params) => {
        let result = jsonfile.readFileSync(`data.json`);
        console.log(result.length);
        if (params.retailer) {
            if (!Array.isArray(params.retailer)) {
                params.retailer = [params.retailer];
            }
            let retailers = params.retailer;
            retailers = retailers.map((item) => clean(item));
            result = result.filter(function(item, pos) {
                return retailers.includes(clean(item.retailerName));
            });
            console.log(result.length);
        }
        let graph = "retailername";
        let bars = "";
        if (params.graph) {
            graph = params.graph;
        }
        if (params.bars) {
            bars = params.bars;
        }
        let data = cleanForChartRetailer(result, graph, bars);
        console.log(data);
        return res.jsonp(data);
    },
    byBrand: (res, dist) => {

        /* gsjson({
                 spreadsheetId: '1NWNFnVyMZ10AwnwFeAirC5vQNh2MgORywAfRckUFVPw',
                 // other options...
             })
             .then(function(result) {*/
        let result = jsonfile.readFileSync(`data.json`);
        console.log(result.length);
        /*jsonfile.writeFile(`result.json`, result, { spaces: 2 }, function(err) {
            console.error(err);
        });*/
        let data = cleanForChart(result, dist);
        return res.jsonp(data);
        /*})
        .catch(function(err) {
            console.log(err.message);
            console.log(err.stack);
            if (err) {
                let data = cleanForChart(null, dist);
                return res.jsonp([]);
            }

        });*/

    },
    distList: (res) => {
        /*
                gsjson({
                        spreadsheetId: '1NWNFnVyMZ10AwnwFeAirC5vQNh2MgORywAfRckUFVPw',
                        // other options...
                    })
                    .then(function(result) {*/
        let result = jsonfile.readFileSync(`data.json`);
        console.log(result.length);
        let data = readOrderByDist(result);
        return res.jsonp(data);

        /* })
         .catch(function(err) {
             console.log(err.message);
             console.log(err.stack);
             //let items = jsonfile.readFileSync(`./data.json`);
             //let data = readOrderByDist(items);
             return res.jsonp([]);
         });*/

    },
    cleanForChart: cleanForChart
}

function mapKeys(key) {
    if (key == "brandmodel" || key == "brandModel") {
        return 'brandModel#';
    }
    if (key == "retailername" || key == "retailerName") {
        return 'retailerName';
    }
    if (key == "brandname" || key == "brandName") {
        return 'brandName';
    }
    if (key == "threefiles" || key == "threeFiles") {
        return 'threeFiles';
    }
    if (key == "pianosound" || key == "pianoSound") {
        return 'pianoSound';
    }
    if (key == "countryoforigin" || key == "countryOfOrigin") {
        return 'countryOfOrigin';
    }
    return key;
}
module.exports = HELPERS;