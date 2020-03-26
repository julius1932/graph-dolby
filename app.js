const express = require("express");
const app = express();
const gsjson = require('google-spreadsheet-to-json');
const bodyParser = require('body-parser');
var cron = require('node-cron');
const jsonfile = require('jsonfile');
const http = require('http');
const fs = require('fs');
const path = require('path');

const multer = require('multer');
const csv = require('fast-csv');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://junta:papa12345@ds251618.mlab.com:51618/analytics';


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


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
    return HELPERS.byRetailer(res, param);
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
            uri: 'https://playground.jsreport.net/w/julius1932/9mFYNpcR/api/report',
            //uri: 'https://playground.jsreport.net/w/anon/exIUKNsN/api/report',
            method: 'POST',
            json: data
        };
        let request = require('request');
        //res.setHeader('Content-Type', 'application/pdf');
        request(options).pipe(res);
    });

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


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'tmp/csv/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.originalname + path.extname(file.originalname));
    }
});
//const upload = multer({dest: 'tmp/csv/',});
let upload = multer({ storage: storage }).single('file');
app.post('/upload-csv', function(req, res) {
    upload(req, res, function(err) {
        const fileRows = [];
        //console.log(req);
        //

        console.log(req.file.path);
        csv.fromPath(req.file.path, { headers: true })
            .on("data", function(data) {
                fileRows.push(adjust(data)); // push each row
            })
            .on("end", function() {

                MongoClient.connect(url, function(err, client) {
                    if (err) {
                        console.log(err);
                    } else {
                        let db = client.db('analytics');
                        db.collection('csv').insertOne({
                            name: req.file.path,
                            status: "0"
                        });
                    }
                });

                res.sendFile(__dirname + '/upload.html');
            })
    });
});
app.get("/allcsv", (req, res) => {
    return allInDir(req, res);
});
app.post("/csv-use", (req, res) => {
    console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooo");
    let file = req.body.csvFile;
    if (!file) {
        return allInDir(req, res);
    }
    let filePath = 'tmp/csv/' + file;
    const fileRows = [];
    csv.fromPath(filePath, { headers: true })
        .on("data", function(data) {
            if (data["Retailer Name"].trim()) {
                fileRows.push(adjust(data)); // push each row
            }
        })
        .on("end", function() {
            jsonfile.writeFileSync(`data.json`, fileRows, { spaces: 2 });
            console.log(fileRows.length);
            return allInDir(req, res);
        })
    // return allInDir(req, res);
});
app.post("/csv-delete", (req, res) => {
    let file = req.body.csvFile;
    if (!file) {
        return allInDir(req, res);
    }
    let filePath = 'tmp/csv/' + file;
    fs.unlinkSync(filePath); // remove temp file
    return allInDir(req, res);
});

function allInDir(req, res) {
    const directoryPath = path.join(__dirname, 'tmp/csv');
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function(err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        console.log("files");
        console.log(files);
        //listing all files using forEach
        return res.jsonp(files);
    });
}

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