var LayerNames = {
  ImageLayer: "image",
  ScribbleLayer: "scribble",
  ForegroundLayer: "foreground",
  BackgroundLayer: "background",
  ShadowLayer: "shadow",
  MaskLayer: "mask",
  MattingLayer: "matting",
};
function getUrl() {
  var query = window.location.pathname.split("/");
  // console.log("query is "+ query[1])
  // console.log('./uploads/input/'+query[1])
  return query[1];
}
function getImageKey() {
  var query = window.location.pathname.split("/");
  return query[1];
}
function cleanUnclaimed() {
  var images = JSON.parse(localStorage.getItem("images"));
  var arr = [];
  for (var i = 0; i < localStorage.length; i++) {
    var itemKey = localStorage.key(i);
    var index = itemKey.indexOf("_");
    if (index != -1) {
      var key = itemKey.substr(0, index);
      var found = images.find((element) => element.key == key);
      if (!found) {
        arr.push(itemKey);
      }
    }
  }
  arr.forEach(function (e) {
    localStorage.removeItem(e);
  });
}
function checkAndCleanStorage() {
  try {
    var images = JSON.parse(localStorage.getItem("images"));
    if (!images) images = [];
    var key = getImageKey();
    var now = Date.now();
    if (!images.find((img) => img.key == key)) {
      images.push({ key: key, timestamp: now });
    }
    var newImages = [];
    var arr = [];
    for (var index = 0; index < images.length; index++) {
      var item = images[index];
      var diffTime = Math.abs(now - item.timestamp);
      if (diffTime > 1000 * 60 * 60 * 4) {
        for (var i = 0; i < localStorage.length; i++) {
          var itemKey = localStorage.key(i);
          if (itemKey.indexOf(item.key) != -1) {
            arr.push(itemKey);
          }
        }
      } else {
        newImages.push(item);
      }
    }
    images = newImages;
    arr.forEach(function (e) {
      localStorage.removeItem(e);
    });
    localStorage.setItem("images", JSON.stringify(images));
  } catch (e) {
    localStorage.clear();
  }
}
function Model(img) {
  checkAndCleanStorage();
  this._img = img;
  this.modelLoadedEvent = new Event(this);
  var layers = {};
  var size = null;
  this.undoStack = new UndoStack(this);
  this.fileName = img.fileName;
  	
  // var imagePromise = loadImage(getUrl() + "/image");
  // var maskPromise = loadImage(getUrl() + "/alpha");
  // var imagePromise = loadImage("https://bg2.depin.info/uploads/input/c15915fd-ae6b-4f04-9173-6279f2df4091.jpg");
  // var maskPromise = loadImage("https://bg2.depin.info/uploads/mask/c15915fd-ae6b-4f04-9173-6279f2df4091.png");
// var imagePromise = "https://bg2.depin.info/uploads/input//42d25ae7-fefa-454c-a8d0-9fb686486e3c.jpg";
// var maskPromise = "https://bg2.depin.info/uploads/mask//42d25ae7-fefa-454c-a8d0-9fb686486e3c.png";
var img_id = getUrl()
console.log(img_id)

var imagePromise = loadImage("./uploads/input/"+img_id+".jpg");
var maskPromise = loadImage("./uploads/mask/"+img_id+".png");
  var dataPromise = makeRequest({ method: "GET", url: "https://raw.githubusercontent.com/muhammadusmansadiq/new-bg/main/model" });
  console.log(dataPromise + "data promise")
  Promise.all([imagePromise, maskPromise, dataPromise])
    .then((values) => {
      var image = values[0];
      console.log(image)
      var mask = values[1];
      var data = JSON.parse(values[2]);
      if (image.complete && mask.complete) {
        size = { width: image.width, height: image.height };
        var imageLayer = new ImageLayer(image, LayerNames.ImageLayer);
        imageLayer.load(data[LayerNames.ImageLayer]);

        var scribbleLayer = new ScribbleLayer(size, LayerNames.ScribbleLayer);
        scribbleLayer.load(data[LayerNames.ScribbleLayer]);

        var mattingLayer = new ScribbleLayer(size, LayerNames.MattingLayer);
        mattingLayer.load(data[LayerNames.MattingLayer]);

        var maskLayer = new MaskLayer(
          size,
          mask,
          scribbleLayer,
          mattingLayer,
          LayerNames.MaskLayer
        );

        maskLayer.load(data[LayerNames.MaskLayer]);
        var foregroundLayer = new ForegroundLayer(
          imageLayer,
          maskLayer,
          LayerNames.ForegroundLayer
        );
        
        foregroundLayer.load(data[LayerNames.ForegroundLayer]);
        var backgroundLayer = new BackgroundLayer(
          imageLayer,
          maskLayer,
          LayerNames.BackgroundLayer
        );
        backgroundLayer.load(data[LayerNames.BackgroundLayer]);
        var shadowLayer = new ShadowLayer(maskLayer, LayerNames.ShadowLayer);
        shadowLayer.load(data[LayerNames.ShadowLayer]);
        addLayer(imageLayer);
        addLayer(mattingLayer);
        addLayer(maskLayer);
        addLayer(backgroundLayer);
        addLayer(shadowLayer);
        addLayer(foregroundLayer);
        this.modelLoadedEvent.notify();
        maskLayer.drawLayer();
      }
    })
    .catch((error) => {
      showMessage("Load failed", error.message);
    });
  this.imageSize = function () {
    return size;
  };
  function addLayer(layer) {
    layers[layer.layerId()] = layer;
  }
  this.layer = function (name) {
    return layers[name];
  };
}
