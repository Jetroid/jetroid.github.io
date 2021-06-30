const carouselList = document.querySelector('.carousel__list');
const carouselElems = Array.from(document.querySelectorAll('.carousel__item'));
const detailElems = Array.from(document.querySelectorAll('.module-details'));
const alreadyShown = Array.from(document.querySelectorAll(
  '.bartos-flur_module' +
  '.chronograf_module' +
  '.polygraf_module' +
  '.little-melody_module'
  ));

const carouselInit = function() {
  registerOpenCarousel();
  document.querySelector('.carousel__previous').addEventListener('click', function() {
    const current = document.querySelector('[data-pos="3"]');
    const next = document.querySelector('[data-pos="2"]');
    /* TODO: Lazy load next module images
                and all related images
    const load = document.querySelector('[data-pos="9"] img');
    lazyLoadInstance.load(load, {});
    */

    updateCarousel(2);
    updateDetails(current, next, 2);
  });
  document.querySelector('.carousel__next').addEventListener('click', function() {
    const current = document.querySelector('[data-pos="3"]');
    const next = document.querySelector('[data-pos="4"]');
    updateCarousel(4);
    updateDetails(current, next, 4);
  });
  document.querySelector('.carousel__close').addEventListener('click', function() {
    closeCarousel();
  });
}

const updateCarousel = function(nextPos) {
  /* Update the data-pos on the carousel elements */
  carouselElems.forEach(item => {
    const itemPos = parseInt(item.getAttribute('data-pos'));
    const newPos = getPos(itemPos, 3 - nextPos);
    item.setAttribute('data-pos', newPos);
  });
}

const updateDetails = function(current, next, nextPos) {
  /* Determine the string name of the modules */
  const current_module = get_module(current);
  const next_module = get_module(next);

  /* Get the info box dom elements */
  const current_details = document.querySelector("." + current_module + "-details");
  const next_details = document.querySelector("." + next_module + "-details");

  /* Stop any currently playing youtube videos. */
  const youtubes = Array.from(current_details.getElementsByClassName("youtube"));
  youtubes.forEach(item => {
    const child = item.firstElementChild;
    if (child.tagName.toUpperCase() === "IFRAME") {
      child.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    }
  });

  /* Remove any stray animation classes */
  detailElems.forEach(item => {
    item.classList.remove("appear-left");
    item.classList.remove("appear-right");
  });

  current_details.classList.add("hidden");
  next_details.classList.remove("hidden");

  /* Add the animation classes */
  if (nextPos > 3) {
    next_details.classList.add("appear-right");
  } else {
    next_details.classList.add("appear-left");
  }
}

const registerOpenCarousel = function() {
  carouselList.addEventListener('click', openCarousel);
}

const deregisterOpenCarousel = function() {
  carouselList.removeEventListener('click', openCarousel);
}

const registerCarouselClicking = function() {
  carouselList.addEventListener('click', carouselClick);
}

const get_module = function(li) {
  const name_module = li.className.split(" ").filter(function(el) {
      return el.includes("_module");
  })[0];
  return name_module.slice(0, name_module.length-7);
}

const getPos = function (current, change) {
  const numElems = carouselElems.length;
  return (current + change + numElems) % numElems;
}

const openCarousel = function(event) {
  document.querySelector(".frequencycentral .details").classList.add("hidden");
  document.querySelector('.carousel').classList.add('active');
  const next = event.target.closest('.carousel__item');
  const nextPos = parseInt(next.getAttribute('data-pos'));
  deregisterOpenCarousel();
  registerCarouselClicking();
  updateDetails(next, next, nextPos);
}

const closeCarousel = function() {
  document.querySelector(".frequencycentral .details").classList.remove("hidden");
  document.querySelector('.carousel').classList.remove('active');
  detailElems.forEach(item => {
    item.classList.add("hidden");
  });
  registerOpenCarousel();
  deregisterCarouselClicking();
}

const carouselClick = function (event) {
  const current = carouselElems.find((elem) => elem.getAttribute('data-pos') == 3);
  const next = event.target.closest('.carousel__item');

  if (!next || !current) {
    return;
  };

  const nextPos = parseInt(next.getAttribute('data-pos'));

  /* Update the carousel to display the new element */
  updateCarousel(nextPos);

  /* Display the new details box and animate both this and the old one */
  updateDetails(current, next, nextPos);
}

carouselInit();
