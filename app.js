const express = require("express");
const app = express();
const gsjson = require('google-spreadsheet-to-json');
const bodyParser = require('body-parser');
var cron = require('node-cron');
const jsonfile = require('jsonfile');
const http = require('http');
const fs = require('fs');


const multer = require('multer');
const csv = require('fast-csv');


cron.schedule('*/1 * * * *', () => {
    /*gsjson({
          spreadsheetId: '1NWNFnVyMZ10AwnwFeAirC5vQNh2MgORywAfRckUFVPw',
          // other options...
      })
      .then(function(result) {
          console.log(result.length);
          jsonfile.writeFile(`data.json`, result, { spaces: 2 }, function(err) {
              console.error(err);

          });

      })
      .catch(function(err) {
          console.log(err.message);
          console.log(err.stack);
      });*/
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const upload = multer({ dest: 'tmp/csv/' });

const HELPERS = require("./helpers");
app.set('port', process.env.PORT || 3000);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/graph.html');
    // res.sendFile(__dirname + '/clients.html');
});
app.get('/bydist', function(req, res) {
    res.sendFile(__dirname + '/graph-dist.html');
});
app.get('/data/:key', function(req, res) {
    console.log("pppppp09oiii");
    let key = req.params.key || "";
    return HELPERS.dataByKey(req, res);
});
app.get('/byBrands/:dist?', function(req, res) {
    let dist = req.params.dist || "";
    console.log(req.body);
    console.log(dist, 'pppppppp======----');
    return HELPERS.byBrand(res, dist);
});
app.post('/byBrands', function(req, res) {
    let dists = req.body.dists;


    return HELPERS.byBrand(res, dists);
});
app.get('/dist', function(req, res) {
    console.log("ioooooo");
    return HELPERS.distList(res);
});
//:retailerName?/:location?/:city?/:country?/:brandModel?/:brandName?/:category?/:trademark?/:threeFiles?/:pianoSound?/:distributor?/:countryOfOrigin?
app.get(`/clients`, function(req, res) {
    res.sendFile(__dirname + '/clients.html');
});
app.post(`/clients`, function(req, res) {
    return HELPERS.clientsExcel(req, res);
});
app.get(`/retailer`, function(req, res) {
     res.sendFile(__dirname + '/retailer.html'); 
});
app.get(`/byRetailer`, function(req, res) {
    let param = req.query;
    
    console.log(param);
    return HELPERS.byRetailer(res,param);
});
app.get(`/client`, function(req, res) {
    let params = req.query;
    console.log(params);
    let t1 = params.tier1 || [];
    let t2 = params.tier2 || [];
    let t3 = params.tier3 || [];

    let bars = params.bars || [];
    if (!Array.isArray(bars)) {
        bars = [bars];
    }
    /*if (bars.length > 0) {
        bars.unshift("models");
    }*/
    delete params.bars;
    console.log(bars);
    if (!Array.isArray(t1)) {
        t1 = [t1];
    }
    if (!Array.isArray(t2)) {
        let temp = t2;
        console.log("ooooooooooooooooooooooopppppiiiiiiiiiiiiiiiiii ", temp);

        t2 = [temp];
    }
    if (!Array.isArray(t3)) {
        t3 = [t3];
    }
    console.log(t1, t2, t3);
    t1 = t1.map(x => clean(x));
    t2 = t2.map(x => clean(x));
    t3 = t3.map(x => clean(x));
    console.log(t1, t2, t3);
    HELPERS.clients(req, res, function(result) {

        let t1Data = result.all.filter((item) => t1.includes(clean(item.brandName)));

        let t1Sereis = HELPERS.cleanForChart(t1Data, "", bars);
        let t1SereisManu = HELPERS.cleanForChart(t1Data, [], bars);

        let t2Data = result.all.filter((item) => t2.includes(clean(item.brandName)));
        let t2Sereis = HELPERS.cleanForChart(t2Data, "", bars);
        let t2SereisManu = HELPERS.cleanForChart(t2Data, [], bars);

        let t3Data = result.all.filter((item) => t3.includes(clean(item.brandName)));
        let t3Sereis = HELPERS.cleanForChart(t3Data, "", bars);
        let t3SereisManu = HELPERS.cleanForChart(t3Data, [], bars);

        let t1Empty = (t1.length != 0);
        let t2Empty = (t2.length != 0);
        let t3Empty = (t3.length != 0);
        console.log(t1Empty, t2Empty, t3Empty);
        let data = {
            //template: { 'shortid': 'BkeIiSXBnS' }, //,
            template: { 'shortid': 'BkeIiSXBnS' }, //,
            data: {
                sound: result.sound,
                chart: [
                    { label: 'Holiday 1 piano sound = DD', y: result.sound.holiday1 },
                    { label: 'Holiday 2 piano sound = DD+', y: result.sound.holiday2 },
                    { label: 'Both DD and DD+:', y: result.sound.both },
                    { label: 'No piano sound:', y: result.sound.no }
                ],

                t1Empty: t1Empty,
                t1Sereis: t1Sereis,
                t1SerPiChart: [
                    { label: 'With Dolby Tech', y: t1Sereis.DOLBY_AV.yes },
                    { label: 'No Dolby Tech', y: t1Sereis.DOLBY_AV.no },
                ],
                t1SereisManu: t1SereisManu,

                t2Empty: t2Empty,
                t2Sereis: t2Sereis,
                t2SerPiChart: [
                    { label: 'With Dolby Tech', y: t2Sereis.DOLBY_AV.yes },
                    { label: 'No Dolby Tech', y: t2Sereis.DOLBY_AV.no },
                ],
                t2SereisManu: t2SereisManu,

                t3Empty: t3Empty,
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
            //uri: 'https://playground.jsreport.net/w/anon/YtsnfCM2/api/report',
            uri: 'https://playground.jsreport.net/w/anon/exIUKNsN/api/report',
            method: 'POST',
            json: data
        };
        let request = require('request');
        //res.setHeader('Content-Type', 'application/pdf');
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
        str = str.split("&").join("");
        str = str.split('\"').join("");
    }

    return str;
}
app.get('/upload-csv', function(req, res) {
    res.sendFile(__dirname + '/upload.html');
});

app.post('/upload-csv', upload.single('file'), function(req, res) {
    const fileRows = [];
    // open uploaded file
    csv.fromPath(req.file.path, { headers: true })
        .on("data", function(data) {
            fileRows.push(adjust(data)); // push each row
        })
        .on("end", function() {
            //console.log(fileRows);
            jsonfile.writeFileSync(`data.json`, fileRows, { spaces: 2 });
            fs.unlinkSync(req.file.path); // remove temp file
            //process "fileRows" and respond
            res.sendFile(__dirname + '/success.html');
        })
});

function adjust(data) {
    let item = {
        "retailerName": data["Retailer Name"],
        "location": data["Location"],
        "city": data["City"],
        "state": data["State"],
        "country": data["Country"],
        "region": data["Region"],
        "activityStartDate": data["Activity Start Date"],
        "activityEndDate": data["Activity End Date"],
        "brandModel#": data["Brand Model #"],
        "brandName": data["Brand Name"],
        "category": data["Category"],
        "trademark": data["Trademark"],
        "threeFiles": data["Three Files"],
        "pianoSound": data["Piano Sound"],
        "distributor": data["Distributor"],
        "countryOfOrigin": data["Country of Origin"],
        "manufactureDate": data["Manufacture Date"],
        "price": data["Price"],
        "evidence": data["Evidence"]
    }
    return item;
}
module.exports = app;