
//history
// const rightCanvas = new fabric.Canvas('rightCanvas');

// var canvas = new fabric.Canvas('canvas');
canvas.history = [];
canvas.historyIndex = -1;


//deactive all text at initial 
// var elementsText = document.getElementsByClassName('is-text-active');

// for (var i = 0; i < elementsText.length; i++) {
//     elementsText[i].disabled = true;
// }



// featues buttons 

// Get reference to canvas and buttons



// var myDiv = document.getElementById("canvas-div");
var divWidth = 700;
var divHeight = 800;
// Set the size of the canvas to the full available screen size
canvas.setWidth(divWidth);
canvas.setHeight(divHeight);


var rotateRightBtn = document.getElementById('rotateRightBtn');
var rotateLeftBtn = document.getElementById('rotateLeftBtn');
var fitToScreenBtn = document.getElementById('fitToScreenBtn');
var flipVBtn = document.getElementById('flipVBtn');
var flipHBtn = document.getElementById('flipHBtn');
// var undoBtn = document.getElementById('undoBtn');
// var redoBtn = document.getElementById('redoBtn');
var zoomInBtn = document.getElementById('zoomInBtn');
var zoomOutBtn = document.getElementById('zoomOutBtn');
var zoomOutBtn = document.getElementById('zoomOutBtn');




// // Define a function to load the image into the canvas
// function loadCanvasWithImage(src) {
//   const canvas = new fabric.Canvas('canvas');
//   fabric.Image.fromURL(src, function (img) {
//     loadedImage = img;
//     // Center the image on the canvas
//     img.left = canvas.width / 2;
//     img.top = canvas.height / 2 - 80;
//     img.set({
//         left: img.left,
//         top: img.top + 100,
//         originX: 'center',
//         originY: 'center',
//         lockMovementX: false,
//         lockMovementY: false,
//         hasControls: true
//     });
//     // Disable the click event on the image
//     img.selectable = true;
//     canvas.add(img);
//     canvas.setActiveObject(img);

//     addHistory();
//   });
// }

// // Load the image when the page first loads
// loadCanvasWithImage(myImage.src);

// // Add an event listener to the image to update the canvas when the image changes
// myImage.addEventListener('load', () => {
//   // The image has finished loading, so we can draw it on the canvas
//   const canvas = new fabric.Canvas('canvas');
//   loadCanvasWithImage(myImage.src);
// });

//rotate function 
// Keep track of cumulative rotation angle
var rotationAngle = 0;

// Implement rotate left
rotateLeftBtn.addEventListener('click', function () {
    var image = loadedImage;
    rotationAngle -= 15;
    image.set('angle', rotationAngle);
    canvas.renderAll();
    addHistory();
});

// Implement rotate right
rotateRightBtn.addEventListener('click', function () {
    var image = loadedImage;
    rotationAngle += 15;
    image.set('angle', rotationAngle);
    canvas.renderAll();
    addHistory();
});

// Get the slider elements
var brightnessSlider = document.getElementById('brightness-slider');
// var blurSlider = document.getElementById('blur-slider');
var contrastSlider = document.getElementById('contrast-slider');

// Apply filters on value change
brightnessSlider.addEventListener('input', function () {
    applyFilters();
});
// blurSlider.addEventListener('input', function () {
//     applyFilters();
// });
contrastSlider.addEventListener('input', function () {
    applyFilters();
});

// Apply filters function
function applyFilters() {
    var image = loadedImage;
    image.filters = [
        new fabric.Image.filters.Brightness({ brightness: brightnessSlider.value }),
        // new fabric.Image.filters.Blur({ value: blurSlider.value }),
        new fabric.Image.filters.Contrast({ contrast: contrastSlider.value }),
    ];
    image.applyFilters();
    canvas.renderAll();
    addHistory();
}




// Implement flip vertical
flipVBtn.addEventListener('click', function () {
    var image = loadedImage;
    image.flipY = !image.flipY;
    canvas.renderAll();
    addHistory();
});

// Fit the image to the canvas
fitToScreenBtn.addEventListener('click', function () {
    var image = loadedImage;
    image.scaleToWidth(canvas.width);
    image.scaleToHeight(canvas.height);
    image.set({
        left: canvas.width / 2,
        top: canvas.height / 2,
        originX: 'center',
        originY: 'center'
    });
    canvas.renderAll();
    addHistory();
});


// Implement flip horizontal
flipHBtn.addEventListener('click', function () {
    var image = loadedImage;
    image.flipX = !image.flipX;
    canvas.renderAll();
    addHistory();
});


// Zoom in
zoomInBtn.addEventListener('click', function () {
    canvas.setZoom(canvas.getZoom() * 1.1);
    addHistory();
});

// Zoom out
zoomOutBtn.addEventListener('click', function () {
    canvas.setZoom(canvas.getZoom() / 1.1);
    addHistory();
});

var shadowOpacityInput = document.getElementById('shadowOpacity');
var shadowOffsetXInput = document.getElementById('shadowOffsetX');
var shadowOffsetYInput = document.getElementById('shadowOffsetY');
var shadowBlurInput = document.getElementById('shadowBlur');
var shadowColorInput = document.getElementById('shadowColor');
var shadowToggleBtn = document.getElementById('shadowToggle');
var hexValue = document.getElementById("hexValue");

function updateHexValue() {
    const color = shadowColorInput.value;
    const opacity = shadowOpacityInput.value;
    const rgba = `rgba(${parseInt(color.substring(1, 3), 16)}, ${parseInt(color.substring(3, 5), 16)}, ${parseInt(color.substring(5, 7), 16)}, ${opacity})`;
    hexValue.value = rgba;
    updateShadow();
}

function updateShadow() {
    var activeObject = loadedImage;
    if (activeObject && activeObject.setShadow) {
        activeObject.setShadow({
            color: hexValue.value,
            blur: parseInt(shadowBlurInput.value),
            offsetX: parseInt(shadowOffsetXInput.value),
            offsetY: parseInt(shadowOffsetYInput.value)
        });
        canvas.renderAll();
        addHistory();
    }
}

shadowOpacityInput.addEventListener('input', updateHexValue);
shadowOffsetXInput.addEventListener('input', updateShadow);
shadowOffsetYInput.addEventListener('input', updateShadow);
shadowBlurInput.addEventListener('input', updateShadow);
shadowColorInput.addEventListener('input', updateHexValue);
hexValue.addEventListener('input', updateShadow);

shadowToggleBtn.addEventListener('click', function () {
    var activeObject = loadedImage;
    if (activeObject && activeObject.setShadow) {
        if (shadowToggleBtn.innerHTML === 'Activate') {
            shadowToggleBtn.innerHTML = 'Deactivate';
            activeObject.setShadow({
                color: shadowColorInput.value,
                blur: parseInt(hexValue.value),
                offsetX: parseInt(shadowOffsetXInput.value),
                offsetY: parseInt(shadowOffsetYInput.value)
            });
        } else {
            shadowToggleBtn.innerHTML = 'Activate';
            activeObject.setShadow(null);
        }
        canvas.renderAll();
        addHistory();
    }
});


// background add option 

// background options 

const bgColorPicker = document.getElementById("bgColorPicker");
const bgImagePicker = document.getElementById("bgImagePicker");
// const bgImageBlur = document.getElementById("bgImageBlur");

bgColorPicker.addEventListener("change", function () {
    canvas.backgroundColor = this.value;
    canvas.backgroundImage = null;
    canvas.renderAll();
    addHistory();
});
bgImagePicker.addEventListener("change", function () {
    const reader = new FileReader();
    reader.onload = function (event) {
        const imgObj = new Image();
        imgObj.src = event.target.result;
        imgObj.onload = function () {
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const scaleFactor = Math.min(canvasWidth / imgObj.width, canvasHeight / imgObj.height);

            const image = new fabric.Image(imgObj, {
                scaleX: scaleFactor,
                scaleY: scaleFactor,
                top: canvasHeight / 2,
                left: canvasWidth / 2,
                originX: 'center',
                originY: 'center',
                selectable: false
            });

            canvas.setBackgroundImage(
                image,
                canvas.renderAll.bind(canvas),
                {
                    blur: 50 + "px"
                }
            );
            canvas.backgroundColor = null;
            canvas.renderAll();
            addHistory();
        };
    };
    reader.readAsDataURL(this.files[0]);
});
function setBgImage(imageUrl) {
    // const canvas = new fabric.Canvas("canvas");
    const bgImage = new fabric.Image();

    bgImage.setSrc(imageUrl, function (img) {
        if (!img) {
            console.error("Failed to load background image: " + imageUrl);
            return;
        }

        canvas.setBackgroundImage(bgImage, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / bgImage.width,
            scaleY: canvas.height / bgImage.height
        });
    }, {
        crossOrigin: "anonymous"
    });
}


function setBgColor(inputColor) {
    canvas.backgroundColor = inputColor;
    canvas.backgroundImage = null;
    canvas.renderAll();
    addHistory();
}


let text;
document.getElementById('addTextButton').addEventListener('click', function () {
    // Add text to the canvas
    // Add text to the canvas
    text = new fabric.IText('Hello, world!', {
        left: 100,
        top: 100,
        fontSize: 18,
        fontFamily: "'Open Sans', sans-serif"
    });
    canvas.add(text).setActiveObject(text)
    addHistory();
    // Canvas.add(textbox).setActiveObject(textbox)

    // // Always keep text on top
    // canvas.on('object:added', function (options) {
    //     options.target.bringToFront();
    // });

});
// Delete button functionality
document.getElementById('deleteTextButton').addEventListener('click', function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        canvas.remove(activeObject);
        addHistory();
    }
});

// // Always keep text on top
// canvas.on('object:added', function (options) {
//     options.target.bringToFront();
// });
// Align text to the left
document.getElementById('textLeft').addEventListener('click', function () {
    text.textAlign = 'left';
    text.left = 0;
    canvas.renderAll();
    addHistory();
});

// Align text to the center
document.getElementById('textCenter').addEventListener('click', function () {
    text.textAlign = 'center';
    text.left = canvas.width / 2;
    canvas.renderAll();
    addHistory();
});

// Align text to the right
document.getElementById('textRight').addEventListener('click', function () {
    text.textAlign = 'right';
    text.left = canvas.width - 120;
    canvas.renderAll();
    addHistory();
});

// Set bold
document.getElementById('textBold').addEventListener('click', function () {
    text.fontWeight = (text.fontWeight === 'bold' ? '' : 'bold');
    canvas.renderAll();
    addHistory();
});

// Set italic
document.getElementById('textItalic').addEventListener('click', function () {
    text.fontStyle = (text.fontStyle === 'italic' ? '' : 'italic');
    canvas.renderAll();
    addHistory();
});

// Set underline
document.getElementById('textUnderline').addEventListener('click', function () {
    text.underline = !text.underline;
    canvas.renderAll();
    addHistory();
});


// font size 
const fontSizeSlider = document.getElementById('font-size');
const fontSizeValue = document.getElementById('font-size-value');

fontSizeSlider.addEventListener('input', function () {
    text.fontSize = fontSizeSlider.value;
    fontSizeValue.innerHTML = fontSizeSlider.value;
    canvas.renderAll();
    addHistory();
});

//letter spacing 
const letterSpacingSlider = document.getElementById('letter-spacing');
const letterSpacingValue = document.getElementById('letter-spacing-value');

letterSpacingSlider.addEventListener('input', function () {
    text.charSpacing = letterSpacingSlider.value;
    letterSpacingValue.innerHTML = letterSpacingSlider.value;
    canvas.renderAll();
    addHistory();
});

// text color and rotation 
const textColorPicker = document.getElementById('text-color');


textColorPicker.addEventListener('change', function () {
    text.setColor(textColorPicker.value);
    canvas.renderAll();
    addHistory();
});



//font family
const fontSelect = document.getElementById("font-select");
fontSelect.addEventListener("change", function () {
    text.set("fontFamily", this.value);
    canvas.renderAll();
    addHistory();
});

function setCanvasSize(width, height) {
    // Input validation
    if (width <= 0 || height <= 0) {
      throw new Error('Invalid canvas size');
    }
  
    // Set canvas dimensions
    canvas.setWidth(width);
    canvas.setHeight(height);
  
    // Get the image and canvas aspect ratios
    const image = canvas.item(0);
    const imageAspectRatio = image.width / image.height;
    const canvasAspectRatio = width / height;
  
    // Calculate the scale factor
    let scaleFactor;
    if (imageAspectRatio > canvasAspectRatio) {
      scaleFactor = width / image.width;
    } else {
      scaleFactor = height / image.height;
    }
  
    // Calculate the maximum zoom level that would still fit the image in the canvas
    const maxZoomLevel = Math.min(canvas.width / image.width, canvas.height / image.height);
  
    // Use the maximum zoom level if the calculated scaleFactor is smaller than it
    if (scaleFactor < maxZoomLevel) {
      scaleFactor = maxZoomLevel;
    }
  
    // Scale the image
    image.scale(scaleFactor);
  
    // Get the scaled image width and height
    const scaledImageWidth = image.getScaledWidth();
    const scaledImageHeight = image.getScaledHeight();
  
    // Calculate the image position
    const left = (width - scaledImageWidth) / 2;
    const top = (height - scaledImageHeight) / 2;
  
    // Set the image position
    image.set({
      left: left,
      top: top,
      originX: 'left',
      originY: 'top',
    });
  
    // Reset zoom level
    canvas.setZoom(1);
  
    // Render canvas
    canvas.renderAll();
  
    // Add history
    addHistory();
  }
  
  
  
  
  function downloadCanvas(link, canvasId, format) {
    // var canvas = document.getElementById(canvasId);
    canvas.setActiveObject(null)
    var dataURL = canvas.toDataURL('image/' + format);
    link.href = dataURL;
    link.download
        = 'image.' + format;
}

//custom size active 
document.getElementById("widthInput").addEventListener("input", checkCustomSizeInputs);
document.getElementById("heightInput").addEventListener("input", checkCustomSizeInputs);

function checkCustomSizeInputs() {
    var widthInput = document.getElementById("widthInput").value;
    var heightInput = document.getElementById("heightInput").value;
    var customSizeBtn = document.getElementById("customSizeBtn");

    if (widthInput.length > 0 && heightInput.length > 0) {
        customSizeBtn.disabled = false;
    } else {
        customSizeBtn.disabled = true;
    }
}



// Function to handle undo operation
function undo() {
    if (canvas.historyIndex > 0) {
        canvas.historyIndex--;
        canvas.loadFromJSON(canvas.history[canvas.historyIndex]);
        canvas.renderAll();
    }

}


// Function to handle redo operation
function redo() {
    if (canvas.historyIndex < canvas.history.length - 1) {
        canvas.historyIndex++;
        canvas.loadFromJSON(canvas.history[canvas.historyIndex]);
        canvas.renderAll();
    }

}



canvas.on('object:modified', function () {
    addHistory()

});

function addHistory() {
    //check if there any text element added if added
    // checkText()
    // checkShadow()

    canvas.history.push(JSON.stringify(canvas));
    canvas.historyIndex++;


}
// Attach event listeners to the undo and redo buttons
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);
function checkText() {

    var objects = canvas.getObjects();
    var textAdded = false;

    for (var i = 0; i < objects.length; i++) {
        if (objects[i] instanceof fabric.IText) {
            // There is text added to the canvas
            textAdded = true;
            break;
        }
    }

    if (textAdded) {
        console.log("Text added")
        var elementsText = document.getElementsByClassName('is-text-active');

        for (var i = 0; i < elementsText.length; i++) {
            elementsText[i].disabled = false;
        }

    } else {
        console.log("text remove")
        var elementsText = document.getElementsByClassName('is-text-active');

        for (var i = 0; i < elementsText.length; i++) {
            elementsText[i].disabled = true;
        }


    }

}


const grayscaleButton = document.getElementById("grayscale-button");
grayscaleButton.addEventListener("click", () => {
    loadedImage.filters.push(new fabric.Image.filters.Grayscale());
    loadedImage.applyFilters();
    canvas.renderAll();
});

const sepiaButton = document.getElementById("sepia-button");
sepiaButton.addEventListener("click", () => {
    loadedImage.filters.push(new fabric.Image.filters.Sepia());
    loadedImage.applyFilters();
    canvas.renderAll();
});

const invertButton = document.getElementById("invert-button");
invertButton.addEventListener("click", () => {
    loadedImage.filters.push(new fabric.Image.filters.Invert());
    loadedImage.applyFilters();
    canvas.renderAll();
});



const blurButton = document.getElementById("blur-button");

blurButton.addEventListener("click", () => {
    loadedImage.filters.push(new fabric.Image.filters.Convolute({
        matrix: [1 / 9, 1 / 9, 1 / 9,
        1 / 9, 1 / 9, 1 / 9,
        1 / 9, 1 / 9, 1 / 9]
    }));
    loadedImage.applyFilters();
    canvas.renderAll();
});



const hueRotationButton = document.getElementById("hue-rotation-button");
hueRotationButton.addEventListener("click", () => {
  loadedImage.filters.push(new fabric.Image.filters.HueRotation({
    rotation: 90 // a value between 0 and 360
  }));
  loadedImage.applyFilters();
  canvas.renderAll();
});

const pixelateButton = document.getElementById("pixelate-button");
pixelateButton.addEventListener("click", () => {
  loadedImage.filters.push(new fabric.Image.filters.Pixelate({
    blocksize: 10 // the size of each pixel block in pixels
  }));
  loadedImage.applyFilters();
  canvas.renderAll();
});


const saturationButton = document.getElementById("saturation-button");
saturationButton.addEventListener("click", () => {
  loadedImage.filters.push(new fabric.Image.filters.Saturation({
    saturation: 0.5 // a value between -1 and 1
  }));
  loadedImage.applyFilters();
  canvas.renderAll();
});


const vintageButton = document.getElementById("vintage-button");
vintageButton.addEventListener("click", () => {
  loadedImage.filters.push(new fabric.Image.filters.Vintage());
  loadedImage.applyFilters();
  canvas.renderAll();
});



const embossButton = document.getElementById("emboss-button");
embossButton.addEventListener("click", () => {
  loadedImage.filters.push(new fabric.Image.filters.Convolute({
    matrix: [ 0, 0, 0,
              0, 1, 0,
              0, 0, 0 ]
  }));
  loadedImage.applyFilters();
  canvas.renderAll();
});


const noiseButton = document.getElementById("noise-button");
noiseButton.addEventListener("click", () => {
  loadedImage.filters.push(new fabric.Image.filters.Noise({
    noise: 25 // amount of noise to add (from 0 to 255)
  }));
  loadedImage.applyFilters();
  canvas.renderAll();
});


const colorCorrectionButton = document.getElementById("color-correction-button");
colorCorrectionButton.addEventListener("click", () => {
  // define the color matrix
  const matrix = [
    1.5, 0, 0, 0, 0,
    0, 1.2, 0, 0, 0,
    0, 0, 0.9, 0, 0,
    0, 0, 0, 1, 0,
    0, 0, 0, 0, 1
  ];

  // create a ColorMatrix filter with the matrix
  const colorMatrixFilter = new fabric.Image.filters.ColorMatrix({
    matrix: matrix
  });

  // apply the filter to the image
  loadedImage.filters.push(colorMatrixFilter);
  loadedImage.applyFilters();
  canvas.renderAll();
});

const pastelButton = document.getElementById("pastel-button");
pastelButton.addEventListener("click", () => {
  // get the blend color and opacity values from the form
  const blendColor = document.getElementById("blend-color-input").value;
  const opacity = document.getElementById("opacity-input").value;

  // create a BlendColor filter with the blend color, blend mode set to 'screen', and opacity set to the user-specified value
  const blendColorFilter = new fabric.Image.filters.BlendColor({
    color: blendColor,
    mode: 'screen',
    alpha: parseFloat(opacity)
  });

  // apply the filter to the image
  loadedImage.filters.push(blendColorFilter);
  loadedImage.applyFilters();
  canvas.renderAll();
});

//crop 


document.querySelector("#crop").addEventListener("click", function(event) {
    document.querySelector("button#crop").classList.add("disabled");
    let rect = new fabric.Rect({
        left: selectionRect.left,
        top: selectionRect.top,
        width: selectionRect.getScaledWidth(),
        height: selectionRect.getScaledHeight(),
        absolutePositioned: true,
    });
    loadedImage.clipPath = rect;
    canvas.remove(selectionRect);
    var cropped = new Image();
    cropped.src = canvas.toDataURL({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
    });
    cropped.onload = function() {
        canvas.clear();
        image = new fabric.Image(cropped);
        image.left = rect.left;
        image.top = rect.top;
        image.setCoords();
        loadedImage = image
        canvas.add(loadedImage);
        canvas.renderAll();
    }
});




let selectionRect;

function addSelectionRect() {
    if (selectionRect) {
        canvas.remove(selectionRect);
    }
    selectionRect = new fabric.Rect({
        fill: "rgba(0,0,0,0.3)",
        originX: "left",
        originY: "top",
        stroke: "black",
        opacity: 1,
        width: loadedImage.width,
        height: loadedImage.height,
        hasRotatingPoint: false,
        transparentCorners: false,
        cornerColor: "white",
        cornerStrokeColor: "black",
        borderColor: "black",
        cornerSize: 12,
        padding: 0,
        cornerStyle: "circle",
        borderDashArray: [5, 5],
        borderScaleFactor: 1.3,
    });
    selectionRect.scaleToWidth(300);
    canvas.centerObject(selectionRect);
    canvas.add(selectionRect);
}

document.querySelector("#startCrop").addEventListener("click", function() {
    addSelectionRect();
    canvas.setActiveObject(selectionRect);
    canvas.forEachObject(function(obj) {
        if (obj !== selectionRect) {
            obj.set({
                selectable: false
            });
        }
    });
    canvas.renderAll();
    document.querySelector("button#crop").classList.remove("disabled");
});
