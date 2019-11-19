const express = require("express");
const app = express();
const gsjson = require('google-spreadsheet-to-json');
const bodyParser = require('body-parser');

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
   return HELPERS.clients(req, res);
});
if (!module.parent) {
    app.listen(app.get('port'));
    console.log("server listening on port " + app.get('port'));
}



module.exports = app;