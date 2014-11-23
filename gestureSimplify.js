(function(window){

var GestureSimplify = function (gesture, pointLimit) {
  //--instance variables--//
  this.gesture = gesture;
  this.vectors = [];
  this.angles = [];
  this.distanceThresh = 2;
  this.angleThresh = 0.5;
  this.pointLimit = pointLimit;
  this.resetDisallowed();

  console.clear();
  var startLength = this.gesture.length;
  this.mainLoop();
  var endLength = this.gesture.length;
  console.log('startLength: ' + startLength + ', endLength: ' + endLength);
  console.log('total points removed: ', (startLength - endLength));
}

GestureSimplify.prototype.mainLoop = function () {
  
  //===REMOVE ALL POINTS WITH ANGLES LESS THAN 4 DEGREES===//
  var rmPnts = this.anaylzeAngle();
  var angleFlag = this.iteratePointRemoval(rmPnts, 'angle check');
  
  //===REMOVE ALL POINTS WITH NEIGHBORING DISTANCE LESS THAN THRESH===//
  rmPnts = this.anaylzeDistance();
  var distanceFlag = this.iteratePointRemoval(rmPnts, 'distance check');
  
  //--repeat loop with current thresholds---//
  if (angleFlag || distanceFlag) {
   this.mainLoop();
  } else {
   console.log('this round done, currentPointLength: ', this.gesture.length);
   if (this.gesture.length > this.pointLimit) {
     console.log('going back in, increasing thresholds');
     this.distanceThresh += 1;
     this.angleThresh += 2;
     this.mainLoop();
   } else {
     console.log('point limit satisfied, exiting');
   }
  }
}

GestureSimplify.prototype.iteratePointRemoval = function (rmPnts, iterationName) {
  var removeFlag = false;
  if (rmPnts.length) {
   console.log(
    'points to remove after ' + iterationName + 
    ': ', rmPnts.length
   );
   removeFlag = true;
   for (var i = rmPnts.length - 1; i >= 0; i--) {
     this.removePoint(rmPnts[i]);
   } 
  }
  return removeFlag;
}

GestureSimplify.prototype.anaylzeAngle = function () {
  var rmPnts = [];
  for (var i = 1; i < this.gesture.length - 1; i++) {
   var angle = this.getAngle(i);
   if (angle < this.angleThresh) {
     rmPnts.push(i);
   }
   
  }
  return rmPnts;
}

GestureSimplify.prototype.anaylzeDistance = function () {
  var rmPnts = [];
  for (var i = 1; i < this.gesture.length - 1; i++) {
   var d1 = this.getDistance(i - 1, i);
   var d2 = this.getDistance(i, i + 1);
   if (d1 < this.distanceThresh || d2 < this.distanceThresh) {
     if (this.getAngle(i) < 45) {
      rmPnts.push(i);
      i++;
     }
   }
   
  }
  return rmPnts;
}

GestureSimplify.prototype.resetDisallowed = function () {
  this.disallowed = [];
  if (this.gesture.length) {
   console.log('reset disallowed list');
   this.disallowed.push(0);
   this.disallowed.push(this.gesture.length - 1);
  }
}

GestureSimplify.prototype.getDistance = function (i1, i2) {
  var x1 = this.gesture[i1].x;
  var y1 = this.gesture[i1].y;
  var x2 = this.gesture[i2].x;
  var y2 = this.gesture[i2].y;
  return Math.sqrt( (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) );
}

GestureSimplify.prototype.getAngle = function (i) {
  if (i < 0 || i >= this.gesture.length) {
   console.log('GEN ANGLE: Out of Bounds Error');
   return;
  }
  var v1 = {
   x: this.gesture[i].x - this.gesture[i - 1].x,
   y: this.gesture[i].y - this.gesture[i - 1].y
  };
  var v2 = {
   x: this.gesture[i + 1].x - this.gesture[i].x,
   y: this.gesture[i + 1].y - this.gesture[i].y
  };
  var top = this.dotProduct(v1, v2);
  var bottom = this.vectorLength(v1) * this.vectorLength(v2);
  if (bottom == 0) {
   return 0;
  }
  var angle = Math.acos(top / bottom);
  return (angle * 180) / Math.PI;
}

GestureSimplify.prototype.dotProduct = function (v, w) {
  return (v.x * w.x) + (v.y * w.y);
}

GestureSimplify.prototype.vectorLength = function (v) {
  return Math.sqrt((v.x * v.x) + (v.y * v.y));
}

GestureSimplify.prototype.removePoint = function (i) {
  if (i < 0 || i >= this.gesture.length) {
   console.log('REMOVE POINT: Out of Bounds Error');
   return false;
  }
  if (this.disallowed.indexOf(i) != -1) {
   console.log('tried to remove: ', i);
   return false;
  }
  this.gesture.splice(i, 1);
  return true;
}

GestureSimplify.prototype.getSimplification = function () {
  return this.gesture;
}

GestureSimplify.prototype.render = function (graphicsContext) {
  if (graphicsContext == null){
   console.log('error: no graphics context provided');
   return;
  }
  var previousStrokeStyle = graphicsContext.strokeStyle;
  var previousFillStyle = graphicsContext.fillStyle;
  var previousLineWidth = graphicsContext.lineWidth;
  graphicsContext.strokeStyle = '#ff0000';
  graphicsContext.lineWidth = 2;
  //render lines
  graphicsContext.beginPath();
  graphicsContext.moveTo(
   this.gesture[0].x,
   this.gesture[0].y
  );
  for (var i = 1; i < this.gesture.length; i++){
   graphicsContext.lineTo(
     this.gesture[i].x, 
     this.gesture[i].y
   );
  }
  graphicsContext.stroke();

  graphicsContext.fillStyle = '#3333ff';

  for (var i = 0; i < this.gesture.length; i++) {
   graphicsContext.fillRect(this.gesture[i].x - 2, this.gesture[i].y - 2, 4, 4);
  }
  //reset graphics settings to previous settings
  graphicsContext.strokeStyle = previousStrokeStyle;
  graphicsContext.fillStyle = previousFillStyle;
  graphicsContext.lineWidth = previousLineWidth;
}

window.GestureSimplify = GestureSimplify;

})(window);