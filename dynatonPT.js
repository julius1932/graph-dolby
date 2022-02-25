const insertADs = (tagId, AdArrayObject) => {
    AdArrayObject = [
        {
            url: "http://www.yourdomain.com/yourad.html",
            src: "ad.png",
        },
    ];
	tagId="p2"
    const $elemA = $("<a/>", { href: AdArrayObject[0].url, tagert: "_blank" });

    const $elemImg = $("<img/>", { src: AdArrayObject[0].src });
    $elemImg.css({ width: 250, hieght: 250, display: "block" });
    $elemA.prepend($elemImg);
    setTimeout(function () {
        $(`#${tagId}`).append($elemA);
    }, 1000);
};
const fetchAd = async (url) => {
    $(function () {
        $.ajax({
            url: "https://jsonplaceholder.typicode.com/todos/1", //rtb url
            type: "GET",
            data: {
                numberOfWords: 10,
            },
            dataType: "json",
            success: function (data) {
                console.log("Data: ", data);
                insertADs({}, []);
            },
            error: function (request, error) {
                alert("Request: " + JSON.stringify(request));
            },
        });
    });
};
