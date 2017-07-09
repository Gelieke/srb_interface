function drawMap() {

    var mymap = L.map('mapid').setView([52.221310, 6.912363], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoicmVnZW50b24iLCJhIjoiY2ozeWs1ZTdxMDAxNjMzbzhvMjdwbXJ6ZyJ9.40G10GGUpp1jFFeJfmshsw',
    }).addTo(mymap);

    var wijk = "wijk";

    // add polygons for the neighbourhoods
    var debothoven = new L.polygon([
        [52.223646, 6.899257],
        [52.224725, 6.909416],
        [52.223454, 6.909918],
        [52.222979, 6.911678],
        [52.218868, 6.912166],
        [52.216922, 6.910857],
        [52.216444, 6.905726],
        [52.217005, 6.900228]],
        { fillColor: '#68add8', fillOpacity: '1', color: '#2c81bf', weight: '1', wijk: 'De Bothoven', 'className': 'hoverstyle'});
    
    var velvelindenhof = new L.polygon([
        [52.224725, 6.909416],
        [52.225126, 6.917679],
        [52.224028, 6.928719],
        [52.219893, 6.926704],
        [52.218605, 6.926447],
        [52.219277, 6.918398],
        [52.218629, 6.915554],
        [52.216922, 6.910857],
        [52.218868, 6.912166],
        [52.222979, 6.911678],
        [52.223454, 6.909918]],
        { fillColor: '#68add8', fillOpacity: '1', color: '#2c81bf', weight: '1', wijk: 'Velve-Lindenhof', 'className': 'hoverstyle'});

    // click events for selection
    debothoven.on('click', onPolyClick).addTo(mymap);
    velvelindenhof.on('click', onPolyClick).addTo(mymap);   

    // Put names on the map
    debothoven.bindTooltip("De Bothoven",
       {permanent: true, direction:"center"}
      ).openTooltip()

    velvelindenhof.bindTooltip("Velve-Lindenhof",
       {permanent: true, direction:"center"}
      ).openTooltip()

    // add polygons to group and do stuff with it for change colour on click/selection
    group = L.featureGroup().addTo(mymap);
    debothoven.addTo(group);
    velvelindenhof.addTo(group);
    
    var tempID = 1;
    group.eachLayer(function(layer) {
      layer.layerID = tempID;
      tempID+=1;
    });
    
    changeColour = function (group, ID, colour) {
        group.eachLayer(function(layer) {
            if (layer.layerID === ID) {
                layer.setStyle({fillColor: colour})
            }
        });
    }
}

