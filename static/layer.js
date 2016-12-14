// Do we really need all mapTypes, or can we just get this mapType?
// Well, we need index to see if this is the top layer...
function Layer(map, parentElement, mapTypes, index) {
  this.map = map;
  this.parentElement = parentElement;
  this.mapTypes = mapTypes;
  this.index = index;
  this.name = mapTypes[index].name;
  this.alt = mapTypes[index].alt;
}

Layer.prototype.getMap = function() {
  return this.map;
}

Layer.prototype.getParentElement = function() {
  return this.parentElement;
}

Layer.prototype.getMapTypes = function() {
  return this.mapTypes;
}

Layer.prototype.getIndex = function() {
  return this.index;
}

Layer.prototype.getName = function() {
  return this.name;
}

Layer.prototype.getAlt = function() {
  return this.alt;
}

Layer.prototype.createLayer = function() {
  var thisLayer = this;
  if (this.parentElement.tagName == "FORM" || this.parentElement.tagName == "FIELDSET") {
    var label = document.createElement("LABEL");
    var radio = document.createElement("INPUT");
    radio.type = "radio";
    radio.name = "layer";
    radio.value = this.alt;

    // This should only happen on first loading
    if (this.index == 0) {
      radio.checked = "checked";
      this.map.overlayMapTypes.push(thisLayer.mapTypes[0]);
      document.getElementById(this.alt).style.display = 'inline-block';
    }

    this.parentElement.appendChild(radio);
    this.parentElement.appendChild(document.createTextNode(this.name));
    this.parentElement.appendChild(document.createElement('br'));

    radio.addEventListener('click', function() {
      oldAlt = thisLayer.map.overlayMapTypes.getAt(0).alt;
      document.getElementById(oldAlt).style.display = 'none';
      thisLayer.map.overlayMapTypes.pop();
      thisLayer.map.overlayMapTypes.push(thisLayer.mapTypes[thisLayer.index]);
      document.getElementById(thisLayer.alt).style.display = 'inline-block';
    })
  }
}
