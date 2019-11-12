const jsonfile = require('jsonfile');
const gsjson = require('google-spreadsheet-to-json');

//const LOCAL_HELPERS = {
const readOrderByBrand = (data) => {
    let items = {};
    data.forEach(function(item) {
        let brand = item.brandName;
        brand = clean(brand);
        let pPayed = clean(item.pianoSound) || "NO";
        pPayed = pPayed == "NO" || !pPayed.trim() ? 0 : 1;
        let dolbyLogo = clean(item.trademark) || "NO";
        dolbyLogo = dolbyLogo == "NO" || !dolbyLogo.trim() ? 0 : 1;

        if (items[brand]) {
            items[brand].models++;
            items[brand].pianoPlayed += pPayed;
            items[brand].dolbyLogo += dolbyLogo;
        } else {
            items[brand] = {
                brand: item.brandName,
                models: 1,
                pianoPlayed: pPayed,
                dolbyLogo: dolbyLogo
            }
        }
    });
    return items;
}
const cleanForChart = function(items) {
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
        items = jsonfile.readFileSync(`./byBrands.json`);

    } else {
        items = readOrderByBrand(items);
    }
    let categories = Object.keys(items);
    let data = Object.values(items);
    data.forEach((item) => {
        series.models.data.push(item.models);
        series.pio.data.push(item.pianoPlayed);
        series.tm.data.push(item.dolbyLogo);
    })
    return { categories, series: [series.models, series.pio, series.tm] };
}

const HELPERS = {
    byBrand: (res) => {

        gsjson({
                spreadsheetId: '1NWNFnVyMZ10AwnwFeAirC5vQNh2MgORywAfRckUFVPw',
                // other options...
            })
            .then(function(result) {
                console.log(result.length);
                let data = cleanForChart(result);
                return res.jsonp(data);

            })
            .catch(function(err) {

                let data = cleanForChart(null);
                return res.jsonp(data);
            });

    },
}

module.exports = HELPERS;