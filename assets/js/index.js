db.recent.limit(10).each(function (item, cursor) {
    $(".recent_space").append('<div class="card mb-4"> <div class="card-body"> <h3 class="card-title">' + item.stopname + '</h3> <h6 class="card-subtitle mb-2 text-muted">Stop #' + item.stopid + '</h6> <a href="routes.html?stopid=' + item.stopid + '&stopname=' + item.stopname + '" class="card-link btn btn-link">View Times</a> </div> </div>');
});

function scrollToRecent(){
    $('html, body').animate({
        scrollTop: $("#recent_scroll").offset().top
    }, 750);
}

if(window.location.hash.indexOf("recent") > -1){  
    scrollToRecent();
}

db.recent.count(function (count) {
    if(count == 0){
        $(".recent_space").append('<div class="card bg-info text-white"> <div class="card-body"> Stops that you\'ve recently looked at will appear here. </div> </div>');
    }
});