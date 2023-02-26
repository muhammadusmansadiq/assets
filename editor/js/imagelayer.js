function ImageLayer(image, layerId, data) {
  Layer.apply(this, [
    { width: image.width, height: image.height },
    layerId,
    // data,
  ]);
  var ctx = this._canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
}
ImageLayer.prototype = Object.create(Layer.prototype);
ImageLayer.prototype.constructor = ImageLayer;
