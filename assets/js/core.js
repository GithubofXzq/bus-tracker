console.log('%c --------------------------------------', 'color: #3fa9f5;');
console.log('%c rude', 'color: #3fa9f5;');
console.log('%c ', 'color: #3fa9f5;');
console.log('%c snooping around the console like that', 'color: #3fa9f5;');
console.log('%c Just kidding.', 'color: #3fa9f5;');
console.log('%c That\'s okay, if anything, we encourage it! Check out our Github at: https://github.com/LTCodeLab/', 'color: #3fa9f5;');
console.log('%c We put all the code for our projects there!', 'color: #3fa9f5;');
console.log('%c Found a bug? Broke something? Got an error? Report it to us!', 'color: #3fa9f5;');
console.log('%c Visit our site at https://ltcodelab.github.io/', 'color: #3fa9f5;');
console.log('%c --------------------------------------', 'color: #3fa9f5;');

$(document).on('click', '.navbar-toggler', function (e) {
    $(".nav-offcanvas-wrapper").addClass("nav-offcanvas-open");
    $(".nav-offcanvas").addClass("nav-offcanvas-open");
});

$(".nav-offcanvas-wrapper").click(function () {
    $(".nav-offcanvas-wrapper").removeClass("nav-offcanvas-open");
    $(".nav-offcanvas").removeClass("nav-offcanvas-open");
});

console.log('%c>> CORE LOADED.', 'color: #ff3e3e;');