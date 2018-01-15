$(document).ready(function () {
    db.stops.count(function (count) {
        if(count == 0){
            $(".saved_space").append('<div class="card bg-info text-white"> <div class="card-body"> When looking up stops on the <a href="routes.html">Bus Times</a> page, you can save them so you can quickly access them here. </div> </div>');
            hideLoader();
        }
    });
    db.stops.each(function (item, cursor) {
        $(".saved_space").append('<div class="card mb-4" id="card-' + item.id + '"> <div class="card-body"> <h2 class="card-title">' + item.stopname + '</h2> <h6 class="card-subtitle mb-2 text-muted">Stop #' + item.stopid + '</h6> <a href="routes.html?stopid=' + item.stopid + '&stopname=' + item.stopname + '" class="card-link btn btn-link">View Times</a> <button class="card-link text-danger btn btn-link" data-id="' + item.id + '" data-stopid="' + item.stopid + '" data-stopname="' + item.stopname + '" onclick="deleteSave(this);"><i class="fa fa-trash" aria-hidden="true"></i></button> <button class="card-link text-info btn btn-link" data-id="' + item.id + '" data-stopid="' + item.stopid + '" data-stopname="' + item.stopname + '" onclick="editSave(this);"><i class="fa fa-pencil" aria-hidden="true"></i></button> </div> </div>');
    });
    hideLoader();
});

function deleteSave(el) {
    var id = $(el).data("id");
    var sid = $(el).data("stopid");
    var name = $(el).data("stopname");
    $("#deleteStopID").val(sid);
    $("#deleteStopName").val(name);
    $("#deleteStopDialog").data("deletingid", id);
    $("#deleteStopDialog").modal("show");
}

$("#deleteStopSubmit").click(function () {
    showLoader();
    var id = $("#deleteStopDialog").data("deletingid");
    db.stops.delete(id).then(function () {
        hideLoader();
        $("#deleteStopDialog").modal("hide");
        $("#card-" + id).fadeOut("normal", function () {
            $("#card-" + id).remove();
        });
    });
});

function editSave(el) {
    $("#editStopID").prop("disabled", false);
    $("#editStopName").prop("disabled", false);
    var id = $(el).data("id");
    var sid = $(el).data("stopid");
    var name = $(el).data("stopname");
    $("#editStopID").val(sid);
    $("#editStopName").val(name);
    $("#editStopDialog").data("editingid", id);
    $("#editStopDialog").modal("show");
}

$("#editStopSubmit").click(function () {
    showLoader();
    $("#editStopID").prop("disabled", true);
    $("#editStopName").prop("disabled", true);
    var id = $("#editStopDialog").data("editingid");
    var sid = $("#editStopID").val();
    var name = $("#editStopName").val();
    db.stops.update(id, {
        stopid: sid,
        stopname: name
    }).then(function () {
        hideLoader();
        $("#card-" + id).fadeOut("normal", function () {
            $("#card-" + id).find(".card-title").text(name);
            $("#card-" + id).fadeIn();
        });
        $("#editStopDialog").modal("hide");
    });
});