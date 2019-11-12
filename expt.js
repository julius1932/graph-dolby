const gsjson = require('google-spreadsheet-to-json');
const jsonfile = require('jsonfile');

gsjson({
        spreadsheetId: '1NWNFnVyMZ10AwnwFeAirC5vQNh2MgORywAfRckUFVPw',
        // other options...
    })
    .then(function(result) {
        console.log(result.length);
        console.log(result);
        jsonfile.writeFile(`data.json`, result, { spaces: 2 }, function(err) {
            console.error(err);

        });

    })
    .catch(function(err) {
        console.log(err.message);
        console.log(err.stack);
    });