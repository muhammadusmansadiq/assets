function ChangeLayerPropertyCommand(layerId,propertyName,oldVal,newVal){var id=layerId;var name=propertyName;var oldValue=oldVal;var newValue=newVal;this.undo=function(model){model.layer(id).setProperty(name,oldValue);}
this.redo=function(model){model.layer(id).setProperty(name,newValue);}};function ChangeLayerPropertiesCommand(layerId,oldVal,newVal){var id=layerId;var oldValue=oldVal;var newValue=newVal;this.undo=function(model){model.layer(id).init(oldValue);model.layer(id).save();}
this.redo=function(model){model.layer(id).init(newValue);model.layer(id).save();}};function GroupUndoCommand(){var commands=[];this.undo=function(model){commands.forEach((command)=>{command.undo(model);},this);}
this.redo=function(model){commands.forEach((command)=>{command.redo(model);},this);}
this.push=function(cmd){commands.push(cmd);}};function UndoStack(mdl){var model=mdl;var undoStack=[];var undoCursor=-1;this.indexChangedEvent=new Event(this);this.undo=function(){if(this.canUndo()){undoStack[undoCursor].undo(model);undoCursor--;this.indexChangedEvent.notify();}}
this.redo=function(){if(this.canRedo()){undoCursor++;undoStack[undoCursor].redo(model);this.indexChangedEvent.notify();}}
this.canUndo=function(){if(undoStack.length>0&&undoCursor>=0)
return true;else
return false;}
this.canRedo=function(){if(undoStack.length>0&&undoCursor<undoStack.length-1)
return true;else
return false;}
this.push=function(cmd){undoStack.splice(undoCursor+1);undoStack.push(cmd);this.redo();}}