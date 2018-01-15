var apiPassThruURL = "https://polar-garden-75406.herokuapp.com/apiPassThru.php";
var apiEndpoint = "http://www.ctabustracker.com/bustime/api/v2/getpredictions";
var selectedRoute;
var selectedDir;
var selectedStop;
var selectedStpnm = 0;
var pingBusTask;
var i = 0;
var clone;
var ctdn;
var stpids = new Array();

// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getURLParm(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function resetList(list) {
    list.empty().append("<option disabled selected>- </option>");
}

function setStopCard(title, subtitle) {
    $("#route-display-num").text(title);
    $("#route-display-name").text(subtitle);
}

function saveStop() {
    if (!$("#saveStopBtn").hasClass("disabled")) {
        console.log("SAVE STOP WORKS");
        $("#saveStopName").prop("disabled", false);
        $("#saveStopID").prop("disabled", false);

        if (selectedRoute) {
            $("#saveStopName").val("Route " + selectedRoute + " - " + selectedStop + " (" + selectedDir + ")");
        } else {
            $("#saveStopName").val("Stop #" + selectedStpnm);

        }
        $("#saveStopID").val(selectedStpnm);
        $("#saveStopDialog").modal("show");
    }
}

function updateRecentList(pStopName, pStopID) {
    var bulkpush = [];
    db.recent.count(function (count) {
        if (count >= 10) {

            bulkpush.push({
                id: 1,
                stopname: pStopName,
                stopid: pStopID
            });
            db.recent.limit(10).each(function (item, cursor) {
                if (bulkpush.length > 10) {
                    return;
                }
                bulkpush.push({
                    id: bulkpush.length + 1,
                    stopname: item.stopname,
                    stopid: item.stopid
                });
            }).then(function () {
                db.recent.bulkPut(bulkpush).then(function () {
                    console.log("bulk complete");
                }).catch(Dexie.BulkError, function (e) {
                    console.error("error", e);
                });
            });
        } else {
            return;
        }
    });
}

$(document).ready(function () {
    console.log(getURLParm("stopid"), getURLParm("stopname"));
    if (getURLParm("stopid") && getURLParm("stopname")) {
        if ((!isNaN(getURLParm("stopid"))) && getURLParm("stopid") % 1 === 0) {
            selectedStpnm = getURLParm("stopid");
            setStopCard("Stop #" + selectedStpnm, "");
            $("#route-card").fadeIn("fast");
            updateRecentList("Stop #" + selectedStpnm, selectedStpnm);
            $("#saveStopBtn").removeClass("disabled");
            pingBusTask = setInterval(function () {
                displayPredictions();
            }, 30000);
            displayPredictions();
        }
    }
});

$("#saveStopSubmit").click(function () {
    showLoader();
    $("#saveStopName").prop("disabled", true);
    $("#saveStopID").prop("disabled", true);
    $("#saveStopDialog").modal("hide");
    db.stops.add({
        stopname: $("#saveStopName").val(),
        stopid: $("#saveStopID").val()
    }).then(function () {
        hideLoader();
        $("#saveStopDialog").modal("hide");
    });
});

$.ajax({
    url: apiPassThruURL,
    dataType: "json",
    method: 'GET',
    data: {
        "apiEndpoint": "http://www.ctabustracker.com/bustime/api/v2/getroutes",
        "key": "RNdTXe2M5DYFx7G2dKKhSfJ27",
        "format": "json"
    }
}).done(function (routeData) {
    console.log(routeData)
    $.each(routeData["bustime-response"]["routes"], function (i, v) {
        $('#routes-list').append('<option value=' + v.rt + '>' + v.rt + ' - ' + v.rtnm + '</option>');
    });
    $('#routes-list').prop("disabled", false);
    hideLoader();
});

$('#routes-list').on('change', function () {
    showLoader();
    $('#routes-direction').prop("disabled", true);
    $('#routes-stops').prop("disabled", true);
    $("#saveStopBtn").addClass("disabled");
    resetList($('#routes-direction'));
    resetList($('#routes-stops'));
    selectedRoute = $('#routes-list').val().split(" ");
    console.log(selectedRoute[0]);
    $.ajax({
        url: apiPassThruURL,
        dataType: "json",
        method: 'GET',
        data: {
            "apiEndpoint": "http://www.ctabustracker.com/bustime/api/v2/getdirections",
            "key": "RNdTXe2M5DYFx7G2dKKhSfJ27",
            "format": "json",
            "rt": selectedRoute[0]
        }
    }).done(function (directionData) {

        console.log("---------------------------");
        console.log("DIRECTIONS SUCCESS FOR " + selectedRoute[0]);
        console.log(directionData);
        console.log("---------------------------");

        $('#routes-direction').prop("disabled", false);
        $.each(directionData["bustime-response"]["directions"], function (i, v) {
            $('#routes-direction').append('<option value=' + v.dir + '>' + v.dir + '</option>')
        });
        hideLoader();
    });
});

$('#routes-direction').on('change', function (e) {
    showLoader();
    $('#routes-stops').prop("disabled", true);
    resetList($('#routes-stops'));
    selectedDir = $('#routes-direction').val();
    console.log(selectedDir);
    $.ajax({
        url: apiPassThruURL,
        dataType: "json",
        method: 'GET',
        data: {
            "apiEndpoint": "http://www.ctabustracker.com/bustime/api/v2/getstops",
            "key": "RNdTXe2M5DYFx7G2dKKhSfJ27",
            "format": "json",
            "rt": selectedRoute[0],
            "dir": selectedDir
        }
    }).done(function (stopData) {
        console.log("---------------------------");
        console.log("STOP DATA SUCCESS FOR ROUTE " + selectedRoute[0] + " DIR " + selectedDir);
        console.log(stopData);
        console.log("---------------------------");

        $('#routes-stops').prop("disabled", false);
        $.each(stopData["bustime-response"]["stops"], function (i, v) {
            $('#routes-stops').append('<option value=' + v.stpid + '>' + v.stpnm + '</option>')
        });
        hideLoader();
    });
});


$('#routes-stops').on('change', function (e) {
    clearInterval(pingBusTask);
    selectedStpnm = $('#routes-stops').val();
    selectedStop = $("#routes-stops option:selected").text();
    console.log(selectedDir);
    $("#saveStopBtn").removeClass("disabled");
    $("#route-card").fadeOut("fast", function () {
        setStopCard("Route " + selectedRoute, selectedStop + " (" + selectedDir + ")");
        $(this).fadeIn("fast");
    });
    $("#saveStopBtn").prop("disabled", false);

    pingBusTask = setInterval(function () {
        displayPredictions();
    }, 30000);
    displayPredictions();
    updateRecentList("Route " + selectedRoute + " - " + selectedStop + " (" + selectedDir + ")", selectedStpnm);
});

function displayPredictions() {
    showLoader();
    $(".routes-predictions").fadeOut("fast", function () {

        $(".routes-predictions").empty();

        $.ajax({
            url: apiPassThruURL,
            dataType: "json",
            method: 'GET',
            data: {
                "apiEndpoint": "http://www.ctabustracker.com/bustime/api/v2/getpredictions",
                "key": "RNdTXe2M5DYFx7G2dKKhSfJ27",
                "format": "json",
                'stpid': selectedStpnm
            }
        }).done(function (data) {
            console.log("---------------------------");
            console.log("PREDICTION DATA SUCCESS FOR " + selectedStpnm);
            console.log(data);
            console.log("---------------------------");
            if (data["bustime-response"]["error"]) {
                console.warn("Error: " + data["bustime-response"]["error"][0].msg);
                if (data["bustime-response"]["error"][0].msg == "No arrival times") {
                    $(".routes-predictions").append('<div class="card py-4 bg-danger text-white text-center"> <span>No arrival times found.</span> </div>');
                } else if (data["bustime-response"]["error"][0].msg == "No service scheduled") {
                    $(".routes-predictions").append('<div class="card py-4 bg-danger text-white text-center"> <span>No buses are scheduled for this stop.</span> </div>');
                } else if (data["bustime-response"]["error"][0].msg == "No data found for parameter") {
                    $(".routes-predictions").append('<div class="card py-4 bg-danger text-white text-center"> <span>That Stop ID couldn\'t be found.</span> </div>');
                } else {
                    $(".routes-predictions").append('<div class="card py-4 bg-danger text-white text-center"> <span>Some unknown error occured.</span> </div>');
                }
                clearInterval(pingBusTask);
            }



            $.each(data["bustime-response"]["prd"], function (i, v) {
                var clone = $("#predictions-template").clone();
                clone.removeAttr('id');
                var timeText;
                if (v.prdctdn == 'DUE') {
                    timeText = 'Approaching';
                    clone.addClass("bg-success text-white");
                } else if (v.prdctdn == 'DLY') {
                    timeText = 'Delayed';
                    clone.addClass("bg-danger text-white");
                } else {
                    timeText = v.prdctdn + ' minutes';
                }
                clone.find(".route-prediction-time").text(timeText);
                clone.find(".route-prediction-destination").text(v.des);
                clone.find(".route-prediction-route").text(v.rt);
                $(".routes-predictions").append(clone);
            });
            $(".routes-predictions").fadeIn();
            hideLoader();

        });


    });
}

$("#stopIDSubmit").click(function () {
    clearInterval(pingBusTask);
    var stopID = $("#stopIDInput").val();
    selectedRoute = null;
    selectedStop = null;
    selectedStpnm = stopID;
    $("#route-card").fadeOut("fast", function () {
        setStopCard("Stop #" + selectedStpnm, "");
        $(this).fadeIn("fast");
    });

    updateRecentList("Stop #" + selectedStpnm, selectedStpnm);



    $('#routes-direction').prop("disabled", true);
    $('#routes-stops').prop("disabled", true);
    resetList($('#routes-direction'));
    resetList($('#routes-stops'));
    $("#saveStopBtn").removeClass("disabled");
    pingBusTask = setInterval(function () {
        displayPredictions();
    }, 30000);
    displayPredictions();
    $("#stopIDDialog").modal("hide");
});