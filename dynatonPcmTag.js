const insertADs = (tagId, adObj) => {
    
    tagId=`dynaton-adslot-id-${adSlot._id}`;
    const $elemA = $("<a/>", { href: adObj.url || "", tagert: "_blank" });

    const $elemImg = $("<img/>", {
        src: (src = adObj.photoUrl[0] || ""),
    });
    $elemImg.css({ width: adObj.adSlot.width, height: adObj.adSlot.height, display: "block" });
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
