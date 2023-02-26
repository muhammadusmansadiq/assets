function RectTracker(undoStack) {
  var self = this;
  LayerTool.apply(this, arguments);
  this.rect = 0;
  var startPoint = 0;
  var activeHandle = -1;
  var handles = [];
  this.handleRadius = function () {
    return 10 / this.viewScale();
  };
  this.updateHandles = function () {
    handles[0] = this.rect.center();
    handles[1] = this.rect.topLeft();
    handles[2] = this.rect.topRight();
    handles[3] = this.rect.bottomLeft();
    handles[4] = this.rect.bottomRight();
  };
  this.setRect = function (rect) {
    this.rect = new Rect(rect);
    this.updateHandles();
    activeHandle = -1;
    this.layer().view.update();
  };
  this.viewScale = function () {
    return this.layer().view.getScale();
  };
  this.draw = function (context) {
    if (!this.layer()) return;
    context.lineWidth = 1 / this.viewScale();
    context.beginPath();
    context.rect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    context.stroke();
    context.closePath();
    for (var i = 1; i < handles.length; i++) {
      context.beginPath();
      if (i == activeHandle) context.fillStyle = "red";
      else context.fillStyle = "black";
      context.arc(
        handles[i].x,
        handles[i].y,
        this.handleRadius(),
        0,
        2 * Math.PI
      );
      context.fill();
    }
  };
  this.checkHandles = function (point) {
    for (var i = 1; i < handles.length; i++) {
      if (
        Math.abs(handles[i].x - point.x) < this.handleRadius() &&
        Math.abs(handles[i].y - point.y) < this.handleRadius()
      )
        return i;
    }
    if (this.rect.contains(point)) return 0;
    return -1;
  };
  this.mouseDown = function (event) {
    if (this.rect.isEmpty()) return;
    if (event.button == 0) {
      var point = { x: event.canvasX, y: event.canvasY };
      activeHandle = this.checkHandles(point);
      if (activeHandle >= 0) {
        startPoint = point;
      }
    }
  };
  this.redrawHandle = function (handleId) {
    var handleRect = new Rect({
      x: handles[handleId].x,
      y: handles[handleId].y,
      width: 0,
      height: 0,
    });
    var hr = this.handleRadius() + 2;
    handleRect.adjust(-hr, -hr, +hr, +hr);
    this.layer().view.update(handleRect);
  };
  this.mouseMove = function (event) {
    if (!this.layer()) return;
    var cursors = [
      "move",
      "nwse-resize",
      "nesw-resize",
      "nesw-resize",
      "nwse-resize",
    ];
    var point = { x: event.canvasX, y: event.canvasY };
    if (activeHandle >= 0 && startPoint) {
      var tmpRect = this.rect.clone();
      switch (activeHandle) {
        case 0:
          this.rect.translate(point.x - startPoint.x, point.y - startPoint.y);
          startPoint = point;
          break;
        case 1:
          this.rect.setTopLeft(point);
          break;
        case 2:
          this.rect.setTopRight(point);
          break;
        case 3:
          this.rect.setBottomLeft(point);
          break;
        case 4:
          this.rect.setBottomRight(point);
          break;
      }
      this.updateHandles();
      tmpRect.normalize();
      tmpRect.unite(this.rect);
      var hr = this.handleRadius() + 2;
      tmpRect.adjust(-hr, -hr, +hr, +hr);
      this.layer().view.update(tmpRect);
    } else {
      var oldHandle = activeHandle;
      activeHandle = this.checkHandles(point);
      if (oldHandle > 0) this.redrawHandle(oldHandle);
      if (activeHandle >= 0) {
        this.layer().view.setCursor(cursors[activeHandle]);
        if (activeHandle > 0) {
          this.redrawHandle(activeHandle);
        }
      } else {
        this.layer().view.setCursor("default");
      }
    }
  };
  this.mouseUp = function (event) {
    startPoint = 0;
    activeHandle = -1;
    this.rect.normalize();
    var wholeRect = new Rect(this.layer().boundingRect());
    wholeRect.unite(this.rect);
    undoStack.push(
      new ChangeLayerPropertyCommand(
        this.layer().layerId(),
        LayerProperties.boundingRect,
        this.layer().boundingRect(),
        this.rect
      )
    );
    this.layer().view.update(wholeRect);
    this.updateHandles();
  };
  this.cancel = function (event) {
    this.setRect(this.layer().boundingRect());
  };
  this.propertyChanged = function (sender, name) {
    if (name == LayerProperties.boundingRect) {
      self.setRect(self.layer().boundingRect());
    }
  };
}
RectTracker.prototype = Object.create(LayerTool.prototype);
RectTracker.prototype.constructor = RectTracker;
RectTracker.prototype.setLayer = function (layer) {
  if (this.layer())
    this.layer().propertyChangedEvent.detach(this.propertyChanged);
  this._layer = layer;
  if (this.layer())
    this.layer().propertyChangedEvent.attach(this.propertyChanged);
};
