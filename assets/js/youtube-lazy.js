/* Generate the youtube iframe if the user clicks the image. */
document.addEventListener("DOMContentLoaded", function(event){
  const youtubes = Array.from(document.getElementsByClassName("youtube"));
  youtubes.forEach(function(item){
    const img = item.firstChild;
    console.log("Is this even changing???");
    img.addEventListener("click", (function(dotyoutube){
      return function(e){
        e.preventDefault();
        const iframe = document.createElement("iframe");
        iframe.src = img.getAttribute("data-iframesrc");
        dotyoutube.replaceChild(img, iframe);
        console.log(dotyoutube);
        console.log(dotyoutube.classList);
        dotyoutube.classList.remove("thumbnail");
      };
    }(item)));
  });
});

