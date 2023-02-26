var ShadowProperties = { color: "color", blurRadius: "blurRadius" };
function ShadowLayer(maskLayer, layerId) {
  Layer.apply(this, [maskLayer.size(), layerId]);
  this._properties[ShadowProperties.blurRadius] = 10;
  this._properties[ShadowProperties.color] = "#000000";
  this._properties["opacity"] = 70;
  this._properties["enabled"] = false;
  this.maskLayer = maskLayer;
  this.maskLayer.layerChangedEvent.attach(maskChanged.bind(this));
  function maskChanged() {
    this.drawLayer();
  }
}
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
ShadowLayer.prototype = Object.create(Layer.prototype);
ShadowLayer.prototype.constructor = ShadowLayer;
ShadowLayer.prototype.defaultBoundingRect = function () {
  var rect = Layer.prototype.defaultBoundingRect.call(this);
  rect.x += 10;
  rect.y += 10;
  return rect;
};
ShadowLayer.prototype.propertyChanged = function (id) {
  switch (id) {
    case ShadowProperties.color:
    case ShadowProperties.blurRadius:
      this.drawLayer();
      break;
    case LayerProperties.opacity:
    case LayerProperties.enabled:
    case LayerProperties.boundingRect:
      this.view.update();
      break;
  }
};
ShadowLayer.prototype.drawLayer = function () {
  if (this.maskLayer.contentRect.isEmpty()) return;
  this.beginWorkEvent.notify();
  var br = this._properties[ShadowProperties.blurRadius];
  var shadowColor = this._properties[ShadowProperties.color];
  var size = this.maskLayer.size();
  var sw = size.width;
  var sh = size.height;
  var ctx = this._canvas.getContext("2d");
  ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  ctx.drawImage(this.maskLayer._canvas, 0, 0);
  var worker = new Worker("static/assets/editor/js/shadowworker.js");
  worker.onmessage = (event) => {
    if (event.data.status === "complete") {
      this.contentRect = new Rect(event.data.contentRect);
      ctx.putImageData(event.data.imagedata, 0, 0);
      this.layerChangedEvent.notify();
      this.endWorkEvent.notify();
    } else {
    }
  };
  worker.postMessage({
    imageData: ctx.getImageData(0, 0, sw, sh),
    color: hexToRgb(shadowColor),
    width: sw,
    height: sh,
    radius: br,
  });
};