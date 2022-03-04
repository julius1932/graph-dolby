const insertADs = (tagId, AdArrayObject) => {
    AdArrayObject = [
        {
            url: "http://www.yourdomain.com/yourad.html",
            src: "ad.png",
        },
    ];
    tagId = "p2";
    const $elemA = $("<a/>", { href: AdArrayObject[0].url, tagert: "_blank" });

    const $elemImg = $("<img/>", {
        src: (src =
            "data:image/png;base64,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"),
    });
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
