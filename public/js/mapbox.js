/* eslint-disable */

export const displayMap = locations => {
  mapboxgl.accessToken = 'pk.eyJ1Ijoid2RzdW1pdC1wYWwiLCJhIjoiY2tiaGF0Ym50MDNrMzJ5bDlwNDNkZGJvbSJ9.MvLcYuWefFBt3u4gqCFXKg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/wdsumit-pal/ckbhb95l50cjn1jl3xu99hy4s',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 3,
  });
  
  const bounds= new mapboxgl.LngLatBounds();
  
  locations.forEach(loc => {
    //add marker
    const el = document.createElement('div');
    el.className = 'marker';
  
    // create marker element
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);
  
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map)
  
    bounds.extend(loc.coordinates);
  });
  
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
}

