// Get all the toggle buttons
var orignalImg = null;
var modImg = null;
var loadedImage;

// Get the image element
const myImage = document.getElementById("myImage");
// var canvas = new fabric.Canvas('canvas');
// const      canvas = document.getElementById("canvas");

const toggleButtons = document.querySelectorAll(".toggle-btn");

// Get all the toggle divs
const toggleDivs = document.querySelectorAll(".toggle-div");

// Loop through all the toggle buttons
toggleButtons.forEach((button) => {
    // Add a click event listener to each button
    button.addEventListener("click", () => {
        // Get the target div from the data-target attribute
        const targetDiv = document.querySelector(button.dataset.target);

        // Loop through all the toggle divs and hide them
        toggleDivs.forEach((div) => {
            div.classList.remove("active");
        });

        // Show the target div
        targetDiv.classList.add("active");

        // Loop through all the toggle buttons and remove the active class
        toggleButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        // Add the active class to the clicked button
        button.classList.add("active");
    });
});
const canvas = new fabric.Canvas("canvas");

// Set the default active button and div
toggleButtons[1].click();

// row of editors
function showEditorRow() {
    console.log("editor row");

 

    // loadCanvasWithImage(myImage.src);
    var row1 = document.getElementById("editor-row1");
    var row2 = document.getElementById("editor-row2");
    if (row1.style.display === "none" && row2.style.display === "none") {
        row1.style.display = "block";
        row2.style.display = "block";
        document.getElementById("edit-row3").style.display = "none";
        document.getElementById("edit-row4").style.display = "none";
    }
}
function showEditRow() {
    var row3 = document.getElementById("edit-row3");
    var row4 = document.getElementById("edit-row4");
    if (row3.style.display === "none" && row4.style.display === "none") {
        document.getElementById("editor-row1").style.display = "none";
        document.getElementById("editor-row2").style.display = "none";
        row3.style.display = "block";
        row4.style.display = "block";
    }
}




var imagePosition = { x: 0, y: 0 };

function loadCanvasWithImage(src) {
  fabric.Image.fromURL(src, function(img) {
    // If an image is already loaded, remove it from the canvas and replace it with the new image
    if (loadedImage) {
      canvas.remove(loadedImage);
    }
    loadedImage = img;

    // Set the canvas size to match the size of the loaded image
    canvas.setWidth(img.width);
    canvas.setHeight(img.height);

    // Get the size of the available screen space
    var availableWidth = window.innerWidth;
    var availableHeight = window.innerHeight;

    // Calculate the scaling factor to fit the image within the available screen space
    var scaleFactor = 0.7 * Math.min(
      availableWidth / img.width,
      availableHeight / img.height
    );

    // Scale the image
    img.scale(scaleFactor);

    // Set the position of the image to the center of the canvas
    img.set({
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: 'center',
      originY: 'center',
      lockMovementX: false,
      lockMovementY: false,
      hasControls: true,
    });

    // Disable the click event on the image
    img.selectable = true;

    // Update the image position
    imagePosition.x = canvas.width / 2;
    imagePosition.y = canvas.height / 2;

    // Check if the shadow is active on the previous image and set it for the new image
    if (loadedImage && loadedImage.shadow) {
      img.setShadow(loadedImage.shadow);
    }

    // Add the new image to the canvas
    canvas.add(img);
    canvas.setActiveObject(img);

    // Center the image on the canvas
    canvas.centerObject(img);

    // Reset zoom level
    canvas.setZoom(1);

    // Render canvas
    canvas.renderAll();

    // Add history
    addHistory();
  });
}


// Load the image when the page first loads
//   loadCanvasWithImage(myImage.src);
var runOnce = false;
// Add an event listener to the image to update the canvas when the image changes
myImage.addEventListener("load", () => {
    // The image has finished loading, so we can draw it on the canvas
    // const canvas = new fabric.Canvas('canvas');

    loadCanvasWithImage(myImage.src);


});

//row
const buttonRow = document.querySelector('.button-row');
let touchStartX = null;
let touchMoveX = null;

buttonRow.addEventListener('touchstart', (event) => {
  touchStartX = event.touches[0].clientX;
  touchMoveX = touchStartX;
});

buttonRow.addEventListener('touchmove', (event) => {
  event.preventDefault();
  touchMoveX = event.touches[0].clientX;
  const scrollPos = buttonRow.scrollLeft - (touchMoveX - touchStartX);
  buttonRow.scrollTo({
    left: scrollPos,
    behavior: 'smooth'
  });
});

buttonRow.addEventListener('touchend', (event) => {
  const touchEndX = event.changedTouches[0].clientX;
  if (touchEndX < touchStartX && touchMoveX - touchStartX > 50) {
    buttonRow.scrollBy({
      left: buttonRow.clientWidth,
      behavior: 'smooth'
    });
  } else if (touchEndX > touchStartX && touchStartX - touchMoveX > 50) {
    buttonRow.scrollBy({
      left: -buttonRow.clientWidth,
      behavior: 'smooth'
    });
  }
  touchStartX = null;
  touchMoveX = null;
});

