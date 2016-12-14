function Slider(map, mapTypes, initialOpacity, parentDiv) {
  this.map = map;
  this.mapTypes = mapTypes;
  this.initialOpacity = initialOpacity;
  this.parentDiv = parentDiv;
}

Slider.prototype.getMap = function() {
  return this.map;
}

Slider.prototype.getMapTypes = function() {
  return this.mapTypes;
}

Slider.prototype.getInitialOpacity = function() {
  return this.initialOpacity;
}

Slider.prototype.getParentDiv = function() {
  return this.parentDiv;
}

Slider.prototype.createSlider = function() {
  var sliderImageUrl = "/static/opacity-slider3d14.png";
  var this_slider = this;
  
  // Create main div to hold the control.
  var opacityDiv = document.createElement('DIV');
  opacityDiv.setAttribute("style", 
    "margin-top:5px;margin-left:0px;overflow-x:hidden;overflow-y:hidden;background:url(" + sliderImageUrl + ") no-repeat;width:71px;height:21px;cursor:pointer;");
  
  // Create knob
  var opacityKnobDiv = document.createElement('DIV');
  opacityKnobDiv.setAttribute("style", 
    "padding:0;margin:0;overflow-x:hidden;overflow-y:hidden;background:url(" + 
      sliderImageUrl + ") no-repeat -71px 0;width:10px;height:21px;");
  opacityDiv.appendChild(opacityKnobDiv);
  

  var opacityCtrlKnob = new ExtDraggableObject(opacityKnobDiv, {
    restrictY: true,
    container: opacityDiv
  });

  google.maps.event.addListener(opacityCtrlKnob, "dragend", function () {
    this_slider.setOpacity(opacityCtrlKnob.valueX());
  });

  google.maps.event.addDomListener(opacityDiv, "click", 
      function (e) {
        var left = this_slider.findPosLeft(this);
        var x = e.pageX - left - 5; // - 5 as we're using a margin of 5px on the div
        opacityCtrlKnob.setValueX(x);
        this_slider.setOpacity(x)});

  if (this.parentDiv != null) {
    this.parentDiv.appendChild(opacityDiv);
  } 
  else {
    opacityDiv.style.marginTop = '15px';
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(opacityDiv);
  }
  // Set initial value
  var initialValue = Slider.OPACITY_MAX_PIXELS / (100 / this.initialOpacity);
  opacityCtrlKnob.setValueX(initialValue);
  this.setOpacity(initialValue);

  return opacityDiv;
}

Slider.prototype.setOpacity = function(pixelX) {
  var value = (100 / Slider.OPACITY_MAX_PIXELS) * pixelX / 100; 
  
  for (var i = 0; i < this.mapTypes.length; i++) {
    this.mapTypes[i].setOpacity(value);
  }
}

Slider.prototype.findPosLeft = function(obj) {
  var curleft = 0;
  if (obj.offsetParent) {
    do {
      curleft += obj.offsetLeft;
    } while (obj = obj.offsetParent);
    return curleft;
  }
  return undefined;
}

/** @type {number} Something something about opacity control */
Slider.OPACITY_MAX_PIXELS = 57;
		
// ???
//		google.maps.event.addDomListener(window, 'load', init);
