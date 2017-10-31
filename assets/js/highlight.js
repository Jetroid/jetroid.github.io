function getElementsInArea(e){
    var documentElement = document.documentElement;
    var viewportHeight = documentElement.clientHeight;

    var elements = document.querySelectorAll('.post-shadow');
    for(var i = 0; i < elements.length; i++){
        var element = elements[i];
        var rect = element.getBoundingClientRect();

        //Calculate the position of top and bottom of element,
        //then calculate the middle of it
        var topPos = rect.top / viewportHeight * 100;
        var bottomPos = rect.bottom / viewportHeight * 100;
        var middle = (topPos + bottomPos)/2;

        //If the middle of our element is between 32 from top and 32 from bottom,
        //Give it a shadow.
        var inViewport = middle > 32 && middle < 68;
        element.classList.toggle('shadow', inViewport);
    }
}

window.addEventListener('touchmove', getElementsInArea);
window.addEventListener('scroll', getElementsInArea);
window.addEventListener('resize', getElementsInArea);
