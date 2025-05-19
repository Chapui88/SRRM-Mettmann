const { ipcRenderer } = require('electron');
//const ol = window.ol;
// const proj4 = require('proj4'); // entfernt, wir nutzen globales proj4
const GeoTIFF = require('geotiff');

// EPSG:25832 registrieren
proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");
ol.proj.proj4.register(proj4);

// Leere Hintergrundkarte (nur weißer Hintergrund, optional OSM als Overlay möglich)


//const whiteBackground = new ol.layer.Tile({
//  source: new ol.source.TileImage({
//    tileUrlFunction: () => '', // Leere Tiles
//  })
//});

const osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM()
});


// Vector Layer für Punkte
const vectorSource = new ol.source.Vector();
const vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({ color: 'red' }),
      stroke: new ol.style.Stroke({ color: 'white', width: 2 })
    })
  })
});

// OpenLayers Map initialisieren
const map = new ol.Map({
  target: 'map',
  layers: [osmLayer, vectorLayer], // RasterLayer kommt dynamisch dazu
  view: new ol.View({
    projection: 'EPSG:25832',
    center: [500000, 5700000], // Dummy-Center, wird nach GeoTIFF fit gemacht
    zoom: 10
  })
});

// GeoTIFF laden & darstellen
async function loadGeoTIFFLayer(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();

  const bbox = image.getBoundingBox(); // [minX, minY, maxX, maxY] in EPSG:25832
  console.log('GeoTIFF extent (EPSG:25832):', bbox);

  const rasterLayer = new ol.layer.Image({
    source: new ol.source.ImageStatic({
      url: url,
      imageExtent: bbox,
      projection: 'EPSG:25832'
    })
  });

  map.addLayer(rasterLayer);

  // Map extent anpassen
  map.getView().fit(bbox, { padding: [20, 20, 20, 20] });
}

// Klick zum Punkt hinzufügen
map.on('click', function (evt) {
  const coord = evt.coordinate;
  const feature = new ol.Feature(new ol.geom.Point(coord));
  vectorSource.addFeature(feature);
  console.log('Punkt hinzugefügt:', coord);
});

// Punkte speichern
document.getElementById('saveBtn').addEventListener('click', () => {
  const features = vectorSource.getFeatures();
  const coords = features.map(f => f.getGeometry().getCoordinates());
  ipcRenderer.send('save-points', coords);
});

// Ergebnis-Feedback
ipcRenderer.on('save-result', (event, result) => {
  if (result.success) {
    alert('Punkte gespeichert unter:\n' + result.path);
  } else {
    alert('Fehler beim Speichern: ' + result.error);
  }
});

// GeoTIFF laden
loadGeoTIFFLayer('./assets/raster.tif');


console.log(ol.VERSION);
