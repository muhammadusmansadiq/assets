var MaskProperties = {
  offset: "offset",
  smoothing: "smoothing",
  feathering: "feathering",
};
function fixMask(ctx, x, y, width, height) {
  var imgData = ctx.getImageData(x, y, width, height);
  for (var i = 0; i < imgData.data.length; i += 4) {
    if (
      imgData.data[i] != 0 ||
      imgData.data[i + 1] != 0 ||
      imgData.data[i + 2] != 0
    ) {
      imgData.data[i + 3] = imgData.data[i + 1];
      imgData.data[i] = 0;
      imgData.data[i + 1] = 255;
      imgData.data[i + 2] = 0;
    } else {
      imgData.data[i] = 0;
      imgData.data[i + 1] = 0;
      imgData.data[i + 2] = 0;
      imgData.data[i + 3] = 0;
    }
  }
  ctx.putImageData(imgData, x, y);
}
function MaskLayer(size, mask, scribbleLayer, mattingLayer, layerId) {
  ScribbleLayer.apply(this, [size, layerId]);
  this.mask = mask;
  this.worker = null;
  this._properties["opacity"] = 60;
  this._properties[MaskProperties.offset] = 0;
  this._properties[MaskProperties.feathering] = 0;
  this._properties[MaskProperties.smoothing] = 0;
  this.mattingLayer = mattingLayer;
  this.mattingLayer.layerChangedEvent.attach(scribbleChanged.bind(this));
  function scribbleChanged() {
    this.drawLayer();
  }
}
MaskLayer.prototype = Object.create(ScribbleLayer.prototype);
MaskLayer.prototype.constructor = MaskLayer;
MaskLayer.prototype.propertyChanged = function (id) {
  switch (id) {
    case MaskProperties.feathering:
    case MaskProperties.offset:
    case MaskProperties.smoothing:
      this.drawLayer();
      break;
  }
};
function imageDataToDataURL(imageData, width, height) {
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}
MaskLayer.prototype.drawLayer = function () {
  if (!this.mask) {
    return ScribbleLayer.prototype.drawLayer.call(this);
  }
  this.beginWorkEvent.notify();
  var br = this._properties[MaskProperties.feathering];
  var offset = this._properties[MaskProperties.offset];
  var ctx = this._canvas.getContext("2d");
  ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  ctx.drawImage(this.mask, 0, 0, this._canvas.width, this._canvas.height);
  var size = { width: this.mask.width, height: this.mask.height };
  var sw = size.width;
  var sh = size.height;
  var mattingData = null;
  if (this.mattingLayer.contentRect.isEmpty() == false)
    mattingData = this.mattingLayer._canvas
      .getContext("2d")
      .getImageData(0, 0, size.width, size.height);
  if (this.worker) this.worker.terminate();
  this.worker = new Worker("static/assets/editor/js/maskworker.js");
  var worker = this.worker;
  this.worker.onmessage = (event) => {
    if (event.data.status === "complete") {
      ctx.putImageData(event.data.imageData, 0, 0);
      fixMask(ctx, 0, 0, size.width, size.height);
      ScribbleLayer.prototype.drawActions.call(this, ctx);
      this.contentRect.unite(new Rect(event.data.contentRect));
      this.layerChangedEvent.notify();
      var self = this;
      if (event.data.trimapData) {
        var trimap = imageDataToDataURL(
          event.data.trimapData,
          size.width,
          size.height
        );
        var trimapRect = new Rect(event.data.trimapRect);
        var data = "";
        data += "&trimap=" + encodeURIComponent(trimap);
        if (trimapRect.isEmpty()) {
          this.endWorkEvent.notify();
          return;
        }
        makeRequest({
          method: "POST",
          url: getUrl() + "/matting",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: data,
        })
          .then((response) => {
            if (worker != this.worker) return;
            if (response) {
              var img = new Image();
              img.onload = function () {
                ctx.clearRect(
                  trimapRect.x,
                  trimapRect.y,
                  trimapRect.width,
                  trimapRect.height
                );
                ctx.drawImage(
                  img,
                  trimapRect.x,
                  trimapRect.y,
                  trimapRect.width,
                  trimapRect.height,
                  trimapRect.x,
                  trimapRect.y,
                  trimapRect.width,
                  trimapRect.height
                );
                fixMask(
                  ctx,
                  trimapRect.x,
                  trimapRect.y,
                  trimapRect.width,
                  trimapRect.height
                );
                self.layerChangedEvent.notify();
              };
              img.src = response;
            }
          })
          .catch((err) => {
            showMessage("Error", err.message);
          })
          .finally(() => {
            self.endWorkEvent.notify();
          });
      } else {
        self.endWorkEvent.notify();
      }
    } else {
    }
  };
  this.worker.postMessage({
    imageData: ctx.getImageData(0, 0, sw, sh),
    mattingData: mattingData,
    width: sw,
    height: sh,
    feathering: br,
    offset: offset,
  });
};