var apiPassThruURL = "https://polar-garden-75406.herokuapp.com/apiPassThru.php";
var apiEndpoint = "http://www.ctabustracker.com/bustime/api/v2/getpredictions";
var selectedRoute;
var selectedDir;
var selectedStop;
var selectedStpnm;
var pingBusTask = null;
var i = 0;
var clone;
var ctdn;
var stpids = new Array();

function resetList(list) {
    list.empty().append("<option disabled selected> </option>");
}

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
});

$('#routes-list').on('change', function () {
    $('#routes-direction').prop("disabled", true);
    $('#routes-stops').prop("disabled", true);
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
    });
});

$('#routes-direction').on('change', function (e) {
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
        console.log("STOP DATA SUCCESS FOR ROUTE" + selectedRoute[0] + " DIR " + selectedDir);
        console.log(stopData);
        console.log("---------------------------");

        $('#routes-stops').prop("disabled", false);
        $.each(stopData["bustime-response"]["stops"], function (i, v) {
            $('#routes-stops').append('<option value=' + v.stpid + '>' + v.stpnm + '</option>')
        });
    });
});


$('#routes-stops').on('change', function (e) {
    clearInterval(pingBusTask);
    selectedStop = $('#routes-stops').val();
    console.log(selectedDir);
    displayPredictions();
    pingBusTask = setInterval(function() {
        displayPredictions();
    }, 30000);
});

function displayPredictions() {
    $(".routes-predictions").empty();
    $.ajax({
        url: apiPassThruURL,
        dataType: "json",
        method: 'GET',
        data: {
            "apiEndpoint": "http://www.ctabustracker.com/bustime/api/v2/getpredictions",
            "key": "RNdTXe2M5DYFx7G2dKKhSfJ27",
            "format": "json",
            'stpid': selectedStop
        }
    }).done(function (data) {
        console.log("---------------------------");
        console.log("PREDICTION DATA SUCCESS FOR ROUTE" + selectedRoute[0] + " DIR " + selectedDir + " STOP " + selectedStop);
        console.log(data);
        console.log("---------------------------");
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
    });
}