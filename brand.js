const jsonfile = require('jsonfile');
var data = jsonfile.readFileSync(`./data.json`);
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
//items = Object.values(items);
jsonfile.writeFile(`byBrands.json`, items, { spaces: 2 }, function(err) {
    console.error(err);

});

function clean(str) {
	if(!str){
		return "";
	}
    str = str.toUpperCase().trim();
    str = str.split(".").join("");
    str = str.split(",").join("");
    str = str.split("-").join("");
    str = str.split(" ").join("");
    return str;
}