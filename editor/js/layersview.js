var MIN_ZOOM_FACTOR = 1 / 16;
var MAX_ZOOM_FACTOR = 16;
function LayersView(incanvas, imgSize) {
  this.zoomChangedEvent = new Event(this);
  this.offsetChangedEvent = new Event(this);
  var moveMode = false;
  var imageSize = imgSize;
  var canvas = incanvas;
  var canvasBoundingRect = 0;
  fitToContainer(canvas);
  var layers = [];
  var scale = 1;
  var offset = { x: 0, y: 0 };
  this._activeLayer = 0;
  var startScale = null;
  var startDistance = null;
  var startPoint = 0;
  canvas.addEventListener("mousedown", mouseDown.bind(this), false);
  canvas.addEventListener("mouseup", mouseUp.bind(this), false);
  canvas.addEventListener("mousemove", mouseMove.bind(this), false);
  canvas.addEventListener("mousewheel", mouseWheel.bind(this), false);
  canvas.addEventListener("touchstart", touchStart.bind(this), false);
  canvas.addEventListener("touchend", touchEnd.bind(this), false);
  canvas.addEventListener("touchcancel", touchCancel.bind(this), false);
  canvas.addEventListener("touchmove", touchMove.bind(this), false);
  this.isHidden = function () {
    return canvas.offsetParent === null;
  };
  this.resizeCanvas = function () {
    fitToContainer(canvas);
    this.zoomToFit();
  };
  this.activeLayer = function () {
    return this._activeLayer;
  };
  this.setActiveLayer = function (layer) {
    this._activeLayer = layer;
    this.update();
  };
  this.setMoveMode = function (mode) {
    moveMode = mode;
    if (moveMode) {
      this.setCursor("move");
    }
  };
  function canvas2image(canvas) {
    return {
      x: (canvas.x - offset.x) / scale,
      y: (canvas.y - offset.y) / scale,
    };
  }
  function client2canvas(clientX, clientY) {
    return {
      x: clientX - canvasBoundingRect.left,
      y: clientY - canvasBoundingRect.top,
    };
  }
  function mapToCanvas(event) {
    event.canvasX = Math.round(
      (event.clientX - offset.x - canvasBoundingRect.left) / scale
    );
    event.canvasY = Math.round(
      (event.clientY - offset.y - canvasBoundingRect.top) / scale
    );
  }
  function calcDist(event) {
    var diffX = event.touches[0].pageX - event.touches[1].pageX;
    var diffY = event.touches[0].pageY - event.touches[1].pageY;
    return Math.sqrt(diffX * diffX + diffY * diffY);
  }
  function handleTouch(event) {
    if (event.touches.length == 1) {
      event.button = 0;
      event.clientX = event.touches[0].clientX;
      event.clientY = event.touches[0].clientY;
      return true;
    }
    return false;
  }
  function midPoint(x1, y1, x2, y2) {
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  }
  function touchStart(event) {
    if (handleTouch(event)) {
      mouseDown.bind(this)(event);
    } else if (event.touches.length == 2) {
      startPoint = midPoint(
        event.touches[0].pageX,
        event.touches[0].pageY,
        event.touches[1].pageX,
        event.touches[1].pageY
      );
      startDistance = calcDist(event);
      startScale = scale;
      this._activeLayer.tool.cancel(event);
    }
    event.preventDefault();
  }
  function touchEnd(event) {
    if (startDistance) {
      startPoint = 0;
      startDistance = null;
      startScale = null;
    } else {
      mouseUp.bind(this)(event);
    }
    event.preventDefault();
  }
  function touchCancel(event) {
    touchEnd.bind(this)(event);
    this._activeLayer.tool.cancel(event);
  }
  function touchMove(event) {
    if (startDistance) {
      var point = midPoint(
        event.touches[0].pageX,
        event.touches[0].pageY,
        event.touches[1].pageX,
        event.touches[1].pageY
      );
      this.setOffset({
        x: offset.x + (point.x - startPoint.x),
        y: offset.y + (point.y - startPoint.y),
      });
      startPoint = point;
      var newDist = calcDist(event);
      var scale = (1 / startDistance) * newDist * startScale;
      if (!scale || Math.abs(this.startDistance - newDist) < 20) {
        event.preventDefault();
        return;
      }
      var canvasPos = client2canvas(
        (event.touches[0].pageX + event.touches[1].pageX) / 2,
        (event.touches[0].pageY + event.touches[1].pageY) / 2
      );
      this.setScale(scale, canvasPos);
    } else if (handleTouch(event)) {
      mouseMove.bind(this)(event);
    }
    event.preventDefault();
  }
  function mouseDown(event) {
    if (event.button == 1 || moveMode == true) {
      startPoint = { x: event.clientX, y: event.clientY };
      this.setCursor("move");
      return;
    }
    if (this._activeLayer) {
      if (this._activeLayer.tool) {
        mapToCanvas(event);
        this._activeLayer.tool.mouseDown(event);
      }
    }
  }
  function mouseMove(event) {
    if (startPoint) {
      var point = { x: event.clientX, y: event.clientY };
      this.setOffset({
        x: offset.x + (point.x - startPoint.x),
        y: offset.y + (point.y - startPoint.y),
      });
      startPoint = point;
      this.update();
      return;
    }
    if (this._activeLayer) {
      if (this._activeLayer.tool) {
        mapToCanvas(event);
        this._activeLayer.tool.mouseMove(event);
      }
    }
  }
  function mouseUp(event) {
    if (startPoint) {
      startPoint = 0;
      if (moveMode == false && this._activeLayer.tool)
        this.setCursor(this._activeLayer.tool.cursor());
      return;
    }
    if (this._activeLayer) {
      if (this._activeLayer.tool) {
        mapToCanvas(event);
        this._activeLayer.tool.mouseUp(event);
      }
    }
  }
  function mouseWheel(event) {
    var canvasPos = client2canvas(event.clientX, event.clientY);
    if (event.wheelDelta / 120 > 0) {
      this.setScale(scale * scaleStep, canvasPos);
    } else {
      this.setScale(scale / scaleStep, canvasPos);
    }
    event.preventDefault();
  }
  var scaleStep = 1.2;
  this.zoomIn = function () {
    this.setScale(scale * scaleStep);
  };
  this.zoomOut = function () {
    this.setScale(scale / scaleStep);
  };
  this.zoomToOrig = function () {
    scale = 1;
    this.centerImage();
    this.zoomChangedEvent.notify(this);
  };
  this.zoomToFit = function () {
    if (canvas.width == 0 || canvas.height == 0) return;
    var resultRect = new Rect();
    layers.forEach(function (layer) {
      if (layer.visible) {
        resultRect.unite(new Rect(layer.boundingRect()));
      }
    }, this);
    var sw = canvas.width / resultRect.width;
    var sh = canvas.height / resultRect.height;
    scale = sw > sh ? sh : sw;
    scale -= 0.01;
    this.centerImage();
    this.zoomChangedEvent.notify(this);
  };
  this.centerImage = function () {
    offset.x = canvas.width / 2 - (imageSize.width * scale) / 2;
    offset.y = canvas.height / 2 - (imageSize.height * scale) / 2;
    this.update();
  };
  this.setOffset = function (newOffset) {
    if (newOffset.x == offset.x && newOffset.y == offset.y) return;
    offset = newOffset;
    this.update();
    this.offsetChangedEvent.notify(this);
  };
  this.setScale = function (factor, canvasPos) {
    if (factor == scale) return;
    var width = canvas.width;
    var height = canvas.height;
    if (canvasPos == undefined) {
      canvasPos = { x: width / 2, y: height / 2 };
    }
    var pos1 = canvas2image(canvasPos);
    if (factor < MIN_ZOOM_FACTOR) {
      scale = MIN_ZOOM_FACTOR;
    } else if (factor > MAX_ZOOM_FACTOR) {
      scale = MAX_ZOOM_FACTOR;
    } else {
      scale = factor;
    }
    var pos2 = canvas2image(canvasPos);
    offset.x -= (pos1.x - pos2.x) * scale;
    offset.y -= (pos1.y - pos2.y) * scale;
    this.update();
    this.zoomChangedEvent.notify(this);
  };
  this.getOffset = function () {
    return offset;
  };
  this.getScale = function () {
    return scale;
  };
  this.syncWithView = function (view) {
    if (view == this) return;
    scale = view.getScale();
    offset = view.getOffset();
    this.update();
  };
  this.addLayer = function (layer) {
    layers.push(layer);
    layer.setView(this);
    layer.layerChangedEvent.attach(layerChanged.bind(this));
  };
  function layerChanged() {
    this.update();
  }
  this.setCursor = function (cursor) {
    canvas.style.cursor = cursor;
  };
  function fitToContainer(canvas) {
    canvasBoundingRect = canvas.getBoundingClientRect();
    canvas.width = canvas.offsetWidth;
    canvas.height = window.innerHeight - canvasBoundingRect.top;
    canvasBoundingRect = canvas.getBoundingClientRect();
  }
  this.update = function (rect) {
    var context = canvas.getContext("2d");
    context.imageSmoothingQuality = "high";
    context.save();
    context.translate(offset.x, offset.y);
    context.scale(scale, scale);
    if (rect) {
      context.beginPath();
      context.rect(rect.x, rect.y, rect.width, rect.height);
      context.clip();
      context.clearRect(rect.x, rect.y, rect.width, rect.height);
    } else {
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();
    }
    layers.forEach(function (layer) {
      if (layer.visible) {
        context.globalAlpha = layer.opacity() / 100.0;
        layer.render(context);
        context.globalAlpha = 1.0;
      }
    }, this);
    if (this._activeLayer) {
      if (this._activeLayer.tool) {
        this._activeLayer.tool.draw(context);
      }
    }
    if (0) {
      context.strokeStyle = "#f00";
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      context.closePath();
    }
    context.restore();
  };
}
