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
        str = str.split(" ").join("");
        str = str.split("/").join("");
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
    return Object.values(items);
}
const readOrderByBrand = (data, dist) => {
    let items = {};
    data.forEach(function(item) {
        let brand = item.brandName;
        brand = clean(brand);
        if (dist) {
            brand += clean(item.distributor);
        }
        let pPayed = clean(item.pianoSound) || "NO";
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
    return items;
}
const cleanForChart = function(items, dist) {
    //console.log(items);
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
        items = jsonfile.readFileSync(`./data.json`);
    }
    if (dist) {
        if (!Array.isArray(dist)) {
            dist = [dist];
        }
        console.log(dist);
        dist = dist.map((curr) => curr == "No distributor" ? "" : curr);
        let cleanedDist = dist.map((curr) => clean(curr));
        //let cleanedDist = clean(dist);
        items = items.filter((item) => cleanedDist.includes(clean(item.distributor)));

    }
    items = readOrderByBrand(items, dist);

    let categoriesDist = [];
    let categories = Object.keys(items);

    let data = Object.values(items);
    if (dist) {
        data = data.sort((a, b) => (a.brand > b.brand) ? 1 : ((b.brand > a.brand) ? -1 : 0));
    }
    data.forEach((item) => {
        categoriesDist.push(item.brand);
        series.models.data.push(item.models);
        series.pio.data.push(item.pianoPlayed);
        series.tm.data.push(item.dolbyLogo);
    })
    if (dist) {
        categories = categoriesDist;
    }
    return { categories, series: [series.models, series.pio, series.tm], dist: dist };
}

const HELPERS = {
    clients: (req, res) => {
        let params = req.body;
       // console.log(params);
        let paramsKeys = Object.keys(params);
        paramsKeys = paramsKeys.filter((param) => params[param]);
        //console.log(paramsKeys);
        gsjson({
                spreadsheetId: '1NWNFnVyMZ10AwnwFeAirC5vQNh2MgORywAfRckUFVPw',
                // other options...
            })
            .then(function(result) {
                console.log(result.length);
                let data = result.filter((itm) => {
                    let test = true;
                    for (let i = 0; i < paramsKeys.length; i++) {
                        let key = paramsKeys[i];
                        if (Array.isArray(params[key])) {
                            let arr = params[key].map((curr) => clean(curr));
                            test = test && arr.includes(clean(itm[key]));
                        } else {
                            //console.log(clean(params[key]) + "========" + clean(itm[key]));
                            test = test && (clean(params[key]) === clean(itm[key]));
                            //console.log(test);
                        }
                    }
                    return test;
                });
                //console.log(data);
                return res.jsonp(data);
            })
            .catch(function(err) {
                console.log(err.message);
                console.log(err.stack);
                if (err) {
                    let data = cleanForChart(null, dist);
                    return res.jsonp([]);
                }

            });

    },
    byBrand: (res, dist) => {

        gsjson({
                spreadsheetId: '1NWNFnVyMZ10AwnwFeAirC5vQNh2MgORywAfRckUFVPw',
                // other options...
            })
            .then(function(result) {
                console.log(result.length);
                /*jsonfile.writeFile(`result.json`, result, { spaces: 2 }, function(err) {
                    console.error(err);
                });*/
                let data = cleanForChart(result, dist);
                return res.jsonp(data);
            })
            .catch(function(err) {
                console.log(err.message);
                console.log(err.stack);
                if (err) {
                    let data = cleanForChart(null, dist);
                    return res.jsonp([]);
                }

            });

    },
    distList: (res) => {

        gsjson({
                spreadsheetId: '1NWNFnVyMZ10AwnwFeAirC5vQNh2MgORywAfRckUFVPw',
                // other options...
            })
            .then(function(result) {
                console.log(result.length);
                let data = readOrderByDist(result);
                return res.jsonp(data);

            })
            .catch(function(err) {
                console.log(err.message);
                console.log(err.stack);
                let items = jsonfile.readFileSync(`./data.json`);
                let data = readOrderByDist(items);
                return res.jsonp(data);
            });

    },
}

module.exports = HELPERS;