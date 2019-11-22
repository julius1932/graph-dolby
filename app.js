const express = require("express");
const app = express();
const gsjson = require('google-spreadsheet-to-json');
const bodyParser = require('body-parser');

const TIERS = {
    T1: ['LG', 'SONY', 'SAMSUNG'],
    T2: ['TCL', 'VU', 'PANASONIC', 'SHARP', 'SKYWORTH', 'PHILIPS', 'HITACHI',
        'SANSUI', 'JVC'
    ],
    T3: ['HAIER', 'LLOYD', 'RECONNECT', 'VU', 'LLOYD', 'ONIDA', 'KORYO', 'IMPEX',
        'CROMA', 'AMSTRAD', 'MICROMAX', 'ADZEN', 'HENRY', 'IFFALCON', 'INTEX', 'METZ',
        'MI', 'NVY', 'T-SERIES', 'VISE', 'PANORAMA', 'KODAK - 1', 'AKAI - 3', 'BELTEK - 2',
        'DETEL - 4', 'MITASHI - 4', 'OSCAR - 1', 'DAIWA'
    ]
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const HELPERS = require("./helpers");
app.set('port', process.env.PORT || 3000);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/graph.html');
});
app.get('/bydist', function(req, res) {
    res.sendFile(__dirname + '/graph-dist.html');
});
app.get('/byBrands/:dist?', function(req, res) {
    let dist = req.params.dist || "";
    console.log(req.body);
    return HELPERS.byBrand(res, dist);
});
app.post('/byBrands', function(req, res) {
    let dists = req.body.dists;
    console.log(dists);

    return HELPERS.byBrand(res, dists);
});
app.get('/dist', function(req, res) {
    return HELPERS.distList(res);
});
//:retailerName?/:location?/:city?/:country?/:brandModel?/:brandName?/:category?/:trademark?/:threeFiles?/:pianoSound?/:distributor?/:countryOfOrigin?
app.get(`/clients`, function(req, res) {
    res.sendFile(__dirname + '/clients.html');
});
app.post(`/clients`, function(req, res) {
     return HELPERS.clientsExcel(req, res);
});
app.get(`/client`, function(req, res) {
    HELPERS.clients(req, res, function(result) {

        let t1Data = result.all.filter((item) => TIERS.T1.includes(clean(item.brandName)));

        let t1Sereis = HELPERS.cleanForChart(t1Data, "");
        let t1SereisManu = HELPERS.cleanForChart(t1Data, []);

        let t2Data = result.all.filter((item) => TIERS.T2.includes(clean(item.brandName)));
        let t2Sereis = HELPERS.cleanForChart(t2Data, "");
        let t2SereisManu = HELPERS.cleanForChart(t2Data, []);

        let t3Data = result.all.filter((item) => TIERS.T3.includes(clean(item.brandName)));
        let t3Sereis = HELPERS.cleanForChart(t3Data, "");
        let t3SereisManu = HELPERS.cleanForChart(t3Data, []);
        let data = {
            //template: { 'shortid': 'rkgavynmhS' }, //,
            template: { 'shortid': 'BkeIiSXBnS' }, //,
            data: {
                sound: result.sound,
                chart: [
                    { label: 'Holiday 1 piano sound = DD', y: result.sound.holiday1 },
                    { label: 'Holiday 2 piano sound = DD+', y: result.sound.holiday2 },
                    { label: 'Both DD and DD+:', y: result.sound.both },
                    { label: 'No piano sound:', y: result.sound.no }
                ],

                t1Sereis: t1Sereis,
                t1SerPiChart: [
                    { label: 'With Dolby Tech', y: t1Sereis.DOLBY_AV.yes },
                    { label: 'No Dolby Tech', y: t1Sereis.DOLBY_AV.no },
                ],
                t1SereisManu: t1SereisManu,

                t2Sereis: t2Sereis,
                t2SerPiChart: [
                    { label: 'With Dolby Tech', y: t2Sereis.DOLBY_AV.yes },
                    { label: 'No Dolby Tech', y: t2Sereis.DOLBY_AV.no },
                ],
                t2SereisManu: t2SereisManu,

                t3Sereis: t3Sereis,
                t3SerPiChart: [
                    { label: 'With Dolby Tech', y: t3Sereis.DOLBY_AV.yes },
                    { label: 'No Dolby Tech', y: t3Sereis.DOLBY_AV.no },
                ],
                t3SereisManu: t3SereisManu,

            },
        };
        /*let options = {
            uri: 'http://localhost:5488/api/report',
            method: 'POST',
            json: data
        };*/
        let options = {
            uri: 'https://playground.jsreport.net/w/julius1932/9mFYNpcR/api/report',
            method: 'POST',
            json: data
        };
        let request = require('request');
        res.setHeader('Content-Type', 'application/pdf');
        request(options).pipe(res);
    });

});


app.get(`/books`, function(req, res) {
    let data = {
        template: { 'shortid': 'rkgavynmhS' },
        data: {
            title: "pppppppppp",
            chart: [
                ['Task', 'Hours per Day'],
                ['Work', 8],
                ['Friends', 2],
                ['Eat', 2],
                ['TV', 2],
                ['Gym', 2],
                ['Sleep', 8],
            ]
        }
    };
    let options = {
        uri: 'http://localhost:5488/api/report',
        method: 'POST',
        json: data
    }

    let request = require('request');
    request(options).pipe(res);
});

if (!module.parent) {
    app.listen(app.get('port'));
    console.log("server listening on port " + app.get('port'));
}

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

module.exports = app;