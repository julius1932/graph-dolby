const express = require("express");
const app = express();
const gsjson = require('google-spreadsheet-to-json');

const HELPERS = require("./helpers");
app.set('port', process.env.PORT || 3000);

app.get('/', function (req, res) {
   res.sendFile(__dirname + '/graph.html');
});
app.get('/byBrands', function (req, res) {
    return HELPERS.byBrand(res);
});

if(!module.parent){
	app.listen(app.get('port'));
	console.log("server listening on port " + app.get('port'));
}



module.exports=app;
