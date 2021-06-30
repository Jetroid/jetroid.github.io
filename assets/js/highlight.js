function getElementsInArea(e) {
    var documentElement = document.documentElement;
    var viewportHeight = documentElement.clientHeight;

    var elements = document.querySelectorAll('.post-shadow');
    for (var i = 0; i < elements.length; i++) {
        var rect = elements[i].getBoundingClientRect();

        //Calculate the position of top and bottom of element,
        //then calculate the middle of it
        var topPos = rect.top / viewportHeight * 100;
        var bottomPos = rect.bottom / viewportHeight * 100;
        var middle = (topPos + bottomPos)/2;

        //If the middle of our element is between 32 from top and 32 from bottom,
        //Give it a shadow.
        var inViewport = middle > 32 && middle < 68;
        elements[i].classList.toggle('shadow', inViewport);
    }
}

//We want to do scroll-based highlighting if touchscreen
//or hover-based highlighting otherwise.
//Condition detects touch device
//https://stackoverflow.com/questions/4817029
if ('ontouchstart' in window || navigator.maxTouchPoints) {
    window.addEventListener('touchmove', getElementsInArea);
    window.addEventListener('scroll', getElementsInArea);
    window.addEventListener('resize', getElementsInArea);
} else {
    var elements = document.querySelectorAll('.post-shadow');
    for (var i = 0; i < elements.length; i++) {
        (function(){
            var element = elements[i];
            element.onmouseenter = function(){element.classList.toggle('shadow',true);};
            element.onmouseleave = function(){element.classList.toggle('shadow',false);};
        }());
    }
}
