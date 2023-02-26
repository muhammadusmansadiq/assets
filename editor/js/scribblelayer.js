var ScribbleProperties={actions:"actions"}
var colors={"foreground":'rgb(0,255,0)',"background":'rgb(255,0,0)',"erase":'rgb(255,255,255)',"erase-matting":'rgb(255,255,255)',"matting":'rgb(255,255,0)'};function ScribbleCommand(layerId,action){this.layerId=layerId;this.action=action;};ScribbleCommand.prototype.undo=function(model){model.layer(this.layerId).popAction();};ScribbleCommand.prototype.redo=function(model){model.layer(this.layerId).addAction(this.action);};function ScribbleClearCommand(layer){this.layer=layer;this.actions=layer.property(ScribbleProperties.actions);};ScribbleClearCommand.prototype.undo=function(model){this.layer.setProperty(ScribbleProperties.actions,this.actions);this.layer.initActions();this.layer.drawLayer();};ScribbleClearCommand.prototype.redo=function(model){this.layer.setProperty(ScribbleProperties.actions,[]);this.layer.drawLayer();};function MarkerAction(color,lineWidth,points){this.type="marker";this.color=color;this.lineWidth=lineWidth;this.points=points;}
MarkerAction.prototype.constructor=MarkerAction;MarkerAction.prototype.draw=function(ctx){if(this.points.length<2)
return;ctx.beginPath();ctx.strokeStyle=this.color;if(this.color==colors["erase"])
ctx.globalCompositeOperation="destination-out";else
ctx.globalCompositeOperation="source-over";ctx.lineJoin="round";ctx.lineCap="round";ctx.lineWidth=this.lineWidth;ctx.moveTo(this.points[0][0],this.points[0][1]);for(var i=1;i<this.points.length;i++){ctx.lineTo(this.points[i][0],this.points[i][1]);}
ctx.stroke();ctx.globalCompositeOperation="source-over";}
MarkerAction.prototype.compressPoints=function(){return;var linePoints=[];linePoints.push(this.points[0]);for(var i=1;i<this.points.length;i++){var pt=this.points[i];var lastId=linePoints.length-1;if(pt[0]==linePoints[lastId][0]||pt[1]==linePoints[lastId][1]){continue;}else{linePoints.push(pt);}}
this.points=linePoints;}
MarkerAction.prototype.boundingRect=function(){var rect=new Rect();rect.initFromPoints(this.points);if(!rect.isEmpty()){var hr=this.lineWidth/2+2;rect.adjust(-hr,-hr,+hr,+hr);}
return rect;}
function ScribbleMarker(undoStack){LayerTool.apply(this,arguments);this._undoStack=undoStack;this.lineWidth=30;this.color=colors.foreground;this._markerAct=0;}
ScribbleMarker.prototype=Object.create(LayerTool.prototype);ScribbleMarker.prototype.constructor=ScribbleMarker;ScribbleMarker.prototype.cursor=function(){var canvas=document.createElement('canvas');canvas.width=canvas.height=this.lineWidth;var ctx=canvas.getContext("2d");ctx.globalAlpha=0.6;ctx.beginPath();var radius=Math.round(this.lineWidth/2);ctx.arc(radius,radius,radius,0,2*Math.PI);ctx.fillStyle=this.color;ctx.fill();return 'url('+canvas.toDataURL()+')'+radius+' '+radius+', auto';}
ScribbleMarker.prototype.mouseMove=function(event){if(!this.layer())
return;if(this._markerAct){var point=[event.canvasX,event.canvasY];var lastPoint=this._markerAct.points[this._markerAct.points.length-1];if(point[0]==lastPoint[0]&&point[1]==lastPoint[1])
return;this._markerAct.points.push(point);var ctx=this.layer()._canvas.getContext('2d');this._markerAct.draw(ctx);var rect=new Rect({x:lastPoint[0],y:lastPoint[1],width:lastPoint[0]-point[0],height:lastPoint[1]-point[1]});rect.normalize();var lw=this.lineWidth/this.layer().view.getScale();rect.adjust(-lw,-lw,+lw,+lw);this.layer().view.update(rect);}}
ScribbleMarker.prototype.mouseUp=function(event){if(!this.layer())
return;if(!this._markerAct)
return;var act=this._markerAct;act.compressPoints();this._markerAct=0;this._undoStack.push(new ScribbleCommand(this.layer().layerId(),act));}
ScribbleMarker.prototype.mouseDown=function(event){if(!this.layer())
return;if(event.button==0)
{var point=[event.canvasX,event.canvasY];this._markerAct=new MarkerAction(this.color,Math.round(this.lineWidth/this._layer.view.getScale()),[point]);}}
ScribbleMarker.prototype.cancel=function(event){if(this._markerAct){var rect=this._markerAct.boundingRect();delete this._markerAct;this.layer().drawLayer();this.layer().view.update(rect);}}
ScribbleMarker.prototype.setLineWidth=function(val){this.lineWidth=val;this.layer().view.setCursor(this.cursor());}
ScribbleMarker.prototype.setColor=function(val){this.color=colors[val];this.layer().view.setCursor(this.cursor());}
ScribbleMarker.prototype.draw=function(ctx){return;if(this._markerAct){this._markerAct.draw(ctx);}}
function ScribbleLayer(size,layerId){Layer.apply(this,arguments);this._properties['opacity']=60;this._properties[ScribbleProperties.actions]=[]}
ScribbleLayer.prototype=Object.create(Layer.prototype);ScribbleLayer.prototype.constructor=ScribbleLayer;ScribbleLayer.prototype.initActions=function(){if(!this._properties[ScribbleProperties.actions]){this._properties[ScribbleProperties.actions]=[];return;}
var actions=this._properties[ScribbleProperties.actions];if(actions.length==0)
return;var newActions=[];actions.forEach(function(action){if(action.type=="marker"){var markerAct=new MarkerAction(action.color,action.lineWidth,action.points);markerAct.compressPoints();newActions.push(markerAct);}},this);this._properties[ScribbleProperties.actions]=newActions;this.updateLayer();}
ScribbleLayer.prototype.init=function(data){Layer.prototype.init.call(this,data);this.initActions();}
ScribbleLayer.prototype.load=function(oldData){Layer.prototype.load.call(this,oldData);this.initActions();}
ScribbleLayer.prototype.drawActions=function(ctx){var actions=this._properties[ScribbleProperties.actions];actions.forEach(function(action){action.draw(ctx);this.contentRect.unite(action.boundingRect());},this);}
ScribbleLayer.prototype.drawLayer=function(){this.contentRect=new Rect();var ctx=this._canvas.getContext('2d');ctx.clearRect(0,0,this._canvas.width,this._canvas.height);this.drawActions(ctx);this.layerChangedEvent.notify();}
ScribbleLayer.prototype.addAction=function(action){this._properties[ScribbleProperties.actions].push(action);this.save();this.drawLayer();}
ScribbleLayer.prototype.popAction=function(){var actions=this._properties[ScribbleProperties.actions];actions.pop();this.drawLayer();this.save();}