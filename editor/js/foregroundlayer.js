function ForegroundLayer(imageLayer, maskLayer, layerId, data) {
  Layer.apply(this, [imageLayer.size(), layerId, data]);
  this.imageLayer = imageLayer;
  this.maskLayer = maskLayer;
  this.worker = null;
  this.maskLayer.layerChangedEvent.attach(maskChanged.bind(this));
  function maskChanged() {
    this.drawLayer();
  }
}
ForegroundLayer.prototype = Object.create(Layer.prototype);
ForegroundLayer.prototype.constructor = ForegroundLayer;
ForegroundLayer.prototype.propertyChanged = function (id) {
  switch (id) {
    case LayerProperties.boundingRect:
      this.view.update();
      break;
  }
};
ForegroundLayer.prototype.drawLayer = function () {
  if (this.maskLayer.contentRect.isEmpty()) return;
  var ctx = this._canvas.getContext("2d");
  ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  var size = this.imageLayer.size();
  if (this.worker) this.worker.terminate();
  this.worker = new Worker("static/assets/editor/js/foregroundworker.js");
  this.worker.onmessage = (event) => {
    if (event.data.status === "complete") {
      ctx.putImageData(event.data.imageData, 0, 0);
      this.layerChangedEvent.notify();
    } else {
    }
  };
  this.worker.postMessage({
    imageData: this.imageLayer._canvas
      .getContext("2d")
      .getImageData(0, 0, size.width, size.height),
    maskData: this.maskLayer._canvas
      .getContext("2d")
      .getImageData(0, 0, size.width, size.height),
  });
};
