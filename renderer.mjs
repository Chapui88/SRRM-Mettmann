
// MapTiler API Key
const key = 'EdafZNDsmwFgAOzJWLIw';

// OSM Basemap (optional, falls du einen weiteren Layer willst)
const osmLayer = new TileLayer({
  source: new OSM()
});

// MapTiler Layer via TileJSON
const mapTilerLayer = new TileLayer({
  source: new TileJSON({
    url: `https://api.maptiler.com/tiles/0196d83a-7729-7f95-a96b-014210c80d90/tiles.json?key=${key}`,
    tileSize: 512,
    crossOrigin: 'anonymous'
  })
});

// Attribution Control fix
const attribution = new Attribution({
  collapsible: false
});

// Map Initialisierung
const map = new Map({
  target: 'map',
  layers: [osmLayer, mapTilerLayer],
  controls: defaultControls({ attribution: false }).extend([attribution]),
  view: new View({
    center: fromLonLat([0, 0]),
    zoom: 2
  })
});
