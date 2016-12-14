/**
 * @fileoverview Runs the application. The code is executed in the
 * user's browser. It communicates with the App Engine backend, renders output
 * to the screen, and handles user interactions.
 */

mapper = {};  // Our namespace.


/**
 * Starts the application. The main entry point for the app.
 * @param {string} eeMapId The Earth Engine map ID.
 * @param {string} eeToken The Earth Engine map token.
 */
mapper.boot = function(ids, mapsKey) {
  // Load external libraries.
  google.load('visualization', '1.0');
  google.load('jquery', '1');
  google.load('maps', '3', {other_params: 'key=' + mapsKey});

  ids = JSON.parse(ids);
  // Create the app.
  google.setOnLoadCallback(function() {
    var mapTypes = [];
    var numberOfLayers = ids.length;

    for (var i = 0; i < numberOfLayers; i++) {
      var id = ids[i];
      mapTypes.push(mapper.App.getEeMapType(id.map_id, id.token, id.name, id.alt));
    }

    var app = new mapper.App(mapTypes);
  });

};


///////////////////////////////////////////////////////////////////////////////
//                               The application.                            //
///////////////////////////////////////////////////////////////////////////////



/**
 * The main  application.
 * This constructor renders the UI and sets up event handling.
 * @param {google.maps.ImageMapType} mapType The map type to render on the map.
 * @constructor
 */
mapper.App = function(mapTypes) {
  // Create and display the map.
  this.map = this.createMap(mapTypes);
};


/**
 * Creates a Google Map with a black background the given map type rendered.
 * The map is anchored to the DOM element with the CSS class 'map'.
 * @param {google.maps.ImageMapType} mapType The map type to include on the map.
 * @return {google.maps.Map} A map instance with the map type rendered.
 */
mapper.App.prototype.createMap = function(mapTypes) {
  var mapOptions = {
    backgroundColor: '#000000',
    center: mapper.App.DEFAULT_CENTER,
    zoom: mapper.App.DEFAULT_ZOOM,
    minZoom: 6,
    maxZoom: 18,
    streetViewControl: false,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.TERRAIN,
                   google.maps.MapTypeId.ROADMAP,
                   google.maps.MapTypeId.SATELLITE],
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };

  var mapEl = $('.map').get(0);
  var map = new google.maps.Map(mapEl, mapOptions);
  map.setOptions({styles: mapper.App.CUSTOM_MAP_STYLES});

  var formDiv = document.createElement('div');
  formDiv.style.backgroundColor  = '#ffffff';
  formDiv.style.marginRight = '10px';
  formDiv.style.padding = '3px';
  formDiv.style.borderRadius = '4px';
  var radioForm = document.createElement('FORM');
  radioForm.action = '""';
  formDiv.appendChild(radioForm);

  toggleFieldsetVisibility = function () {
    if (this.parentElement.style.height == 'auto'){
      this.parentElement.style.height = '10px';
    } else {
      this.parentElement.style.height = 'auto';
    }
  }

  var classFieldSet = document.createElement('FIELDSET');
  classFieldSet.style.border = '0';
  var classTitle = document.createElement('LEGEND');
  classTitle.appendChild(document.createTextNode('IMAGERY AND MODEL'));
  classFieldSet.appendChild(classTitle);
  classFieldSet.style.height = 'auto';

  var coverFieldSet = document.createElement('FIELDSET');
  coverFieldSet.style.border = '0';
  var coverTitle = document.createElement('LEGEND');
  coverTitle.appendChild(document.createTextNode('LANDSCAPE STRUCTURE METRICS'));
  coverFieldSet.appendChild(coverTitle);
  coverFieldSet.style.height = '10px';

  var fragMetSaFieldSet = document.createElement('FIELDSET');
  var fragMetSaTitle = document.createElement('LEGEND');
  fragMetSaTitle.appendChild(document.createTextNode('Mean patch size'));
  fragMetSaFieldSet.appendChild(fragMetSaTitle);
  fragMetSaFieldSet.style.height = '10px';
  fragMetSaFieldSet.style.overflow = 'hidden';

  var fragMetSbFieldSet = document.createElement('FIELDSET');
  var fragMetSbTitle = document.createElement('LEGEND');
  fragMetSbTitle.appendChild(document.createTextNode('Patch aggregation'));
  fragMetSbFieldSet.appendChild(fragMetSbTitle);
  fragMetSbFieldSet.style.height = '10px';
  fragMetSbFieldSet.style.overflow = 'hidden';

  var fragMetScFieldSet = document.createElement('FIELDSET');
  var fragMetScTitle = document.createElement('LEGEND');
  fragMetScTitle.appendChild(document.createTextNode('Nearest neighbor distance'));
  fragMetScFieldSet.appendChild(fragMetScTitle);
  fragMetScFieldSet.style.height = '10px';
  fragMetScFieldSet.style.overflow = 'hidden';

  var fragMetSdFieldSet = document.createElement('FIELDSET');
  var fragMetSdTitle = document.createElement('LEGEND');
  fragMetSdTitle.appendChild(document.createTextNode('Patch shape complexity'));
  fragMetSdFieldSet.appendChild(fragMetSdTitle);
  fragMetSdFieldSet.style.height = '10px';
  fragMetSdFieldSet.style.overflow = 'hidden';

  var fragMetSeFieldSet = document.createElement('FIELDSET');
  var fragMetSeTitle = document.createElement('LEGEND');
  fragMetSeTitle.appendChild(document.createTextNode('Patch dispersion'));
  fragMetSeFieldSet.appendChild(fragMetSeTitle);
  fragMetSeFieldSet.style.height = '10px';
  fragMetSeFieldSet.style.overflow = 'hidden';

  var fragMetSfFieldSet = document.createElement('FIELDSET');
  var fragMetSfTitle = document.createElement('LEGEND');
  fragMetSfTitle.appendChild(document.createTextNode('Large patch dominance'));
  fragMetSfFieldSet.appendChild(fragMetSfTitle);
  fragMetSfFieldSet.style.height = '10px';
  fragMetSfFieldSet.style.overflow = 'hidden';

  var fragMetSgFieldSet = document.createElement('FIELDSET');
  var fragMetSgTitle = document.createElement('LEGEND');
  fragMetSgTitle.appendChild(document.createTextNode('Shape and correlation of large patches'));
  fragMetSgFieldSet.appendChild(fragMetSgTitle);
  fragMetSgFieldSet.style.height = '10px';
  fragMetSgFieldSet.style.overflow = 'hidden';

  radioForm.appendChild(classFieldSet);
  radioForm.appendChild(coverFieldSet);
  radioForm.appendChild(fragMetSaFieldSet);
  radioForm.appendChild(fragMetSbFieldSet);
  radioForm.appendChild(fragMetScFieldSet);
  radioForm.appendChild(fragMetSdFieldSet);
  radioForm.appendChild(fragMetSeFieldSet);
  radioForm.appendChild(fragMetSfFieldSet);
  radioForm.appendChild(fragMetSgFieldSet);
  fragMetSaTitle.addEventListener('click', toggleFieldsetVisibility);
  fragMetSbTitle.addEventListener('click', toggleFieldsetVisibility);
  fragMetScTitle.addEventListener('click', toggleFieldsetVisibility);
  fragMetSdTitle.addEventListener('click', toggleFieldsetVisibility);
  fragMetSeTitle.addEventListener('click', toggleFieldsetVisibility);
  fragMetSfTitle.addEventListener('click', toggleFieldsetVisibility);
  fragMetSgTitle.addEventListener('click', toggleFieldsetVisibility);

  var firstCoverLayerIndex = 2;
  var firstFragMetSaLayerIndex = 3;
  var firstFragMetSbLayerIndex = 4;
  var firstFragMetScLayerIndex = 5;
  var firstFragMetSdLayerIndex = 9;
  var firstFragMetSeLayerIndex = 10;
  var firstFragMetSfLayerIndex = 13;

  for (var i = 0; i < mapTypes.length; i++) {
    if (i < firstCoverLayerIndex){
      var layer = new Layer(map, classFieldSet, mapTypes, i);
    } else if (i < firstFragMetSaLayerIndex) {
      var layer = new Layer(map, fragMetSaFieldSet, mapTypes, i);
    } else if (i < firstFragMetSbLayerIndex) {
      var layer = new Layer(map, fragMetSbFieldSet, mapTypes, i);
    } else if (i < firstFragMetScLayerIndex) {
      var layer = new Layer(map, fragMetScFieldSet, mapTypes, i);
    } else if (i < firstFragMetSdLayerIndex) {
      var layer = new Layer(map, fragMetSdFieldSet, mapTypes, i);
    } else if (i < firstFragMetSeLayerIndex) {
      var layer = new Layer(map, fragMetSeFieldSet, mapTypes, i);
    } else if (i < firstFragMetSfLayerIndex) {
      var layer = new Layer(map, fragMetSfFieldSet, mapTypes, i);
    } else {
      var layer = new Layer(map, fragMetSgFieldSet, mapTypes, i);
    }
    layer.createLayer();
  }

  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(formDiv);

  // Create opacity control
  var initialOpacity = 90;
  var overlaySlider = new Slider(map, mapTypes, initialOpacity);
  overlaySlider.createSlider();

  map.data.setStyle({
    strokeColor: '#000000',
    strokeWeight: 2,
    fillOpacity: 0
  });
  map.data.loadGeoJson('static/orthoimagery_extent_1m_simplified.geojson');
  return map;
};

///////////////////////////////////////////////////////////////////////////////
//                        Static helpers and constants.                      //
///////////////////////////////////////////////////////////////////////////////


/**
 * Generates a Google Maps map type (or layer) for the passed-in EE map id. See:
 * https://developers.google.com/maps/documentation/javascript/maptypes#ImageMapTypes
 * @param {string} eeMapId The Earth Engine map ID.
 * @param {string} eeToken The Earth Engine map token.
 * @return {google.maps.ImageMapType} A Google Maps ImageMapType object for the
 *     EE map with the given ID and token.
 */
mapper.App.getEeMapType = function(eeMapId, eeToken, name, alt) {
  var eeMapOptions = {
    getTileUrl: function(tile, zoom) {
      var url = mapper.App.EE_URL + '/map/';
      url += [eeMapId, zoom, tile.x, tile.y].join('/');
      url += '?token=' + eeToken;
      return url;
    },
    tileSize: new google.maps.Size(256, 256),
    maxZoom: 9,
    minZoom: 0,
    name: name,
    alt: alt
  };
  return new google.maps.ImageMapType(eeMapOptions);
};


/** @type {string} The Earth Engine API URL. */
mapper.App.EE_URL = 'https://earthengine.googleapis.com';


/** @type {number} The default zoom level for the map. */
mapper.App.DEFAULT_ZOOM = 9;


/** @type {Object} The default center of the map. */
mapper.App.DEFAULT_CENTER = {lng: -111.766, lat: 35.302};


/**
 * @type {Array} An array of Google Map styles. See:
 *     https://developers.google.com/maps/documentation/javascript/styling
 */
mapper.App.BLACK_BASE_MAP_STYLES = [
  {stylers: [{lightness: -100}]},
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{visibility: 'off'}]
  }
]

mapper.App.CUSTOM_MAP_STYLES = [
  {
    "featureType": "administrative.province",
    "stylers": [ { "visibility": "off" } ]
  },
  {
    "featureType": "landscape",
    "stylers": [ { "saturation": -100 },
                 { "lightness": 65 },
                 { "visibility": "on" } ]
  },
  {
    "featureType": "poi",
    "stylers": [ { "saturation": -100 },
                 { "lightness": 51 },
                 { "visibility": "simplified" } ]
  },
  {
    "featureType": "road.arterial",
    "stylers": [ { "saturation": -100 },
                 { "lightness": 30 },
                 { "visibility": "on" } ]
  },
  {
    "featureType": "road.highway",
    "stylers": [ { "saturation": -100 },
                 { "visibility": "simplified" } ]
  },
  {
    "featureType": "road.local",
    "stylers": [ { "saturation": -100 },
                 { "lightness": 40 },
                 { "visibility": "on" } ]
  },
  {
    "featureType": "transit",
    "stylers": [ { "saturation": -100 },
                 { "visibility": "simplified" } ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [ { "hue": "#ffff00" },
                 { "saturation": -97 },
                 { "lightness": -25 } ]
  },
  {
    "featureType": "water",
    "elementType": "labels",
    "stylers": [ { "saturation": -100 },
                 { "lightness": -25 },
                 { "visibility": "on" } ]
  }
]
