const insertADs = (tagId, adObj) => {
    AdArrayObject = [
        {
            url: "http://www.yourdomain.com/yourad.html",
            src: "ad.png",
        },
    ];
    const $elemA = $("<a/>", { href: adObj.url || "", tagert: "_blank" });

    const $elemImg = $("<img/>", {
        src: (src = adObj.photoUrl || ""),
    });
    $elemImg.css({ width: 250, hieght: 250, display: "block" });
    $elemA.prepend($elemImg);
    setTimeout(function () {
        $(`#${tagId}`).append($elemA);
    }, 1000);
};
const fetchAd = async (url, tagId) => {
    $(function () {
        $.ajax({
            url: url, //rtb url
            type: "GET",
            data: {},
            dataType: "json",
            success: function (data) {
                console.log("Data: ");
                insertADs(tagId, data.data || {});
            },
            error: function (request, error) {
                console.log("Request: " + JSON.stringify(request));
            },
        });
    });
};
