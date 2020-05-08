{/* <input id="latlng" type="text" value="40.714224,-73.961452">
<input id="submit" type="button" value="Reverse Geocode"></input> */}

// let input = document.getElementById("latlng").value; // ie. "40.714224,-73.961452"
function reverseGeocodeLookup (input, map, infowindow) {
    let latlngStr = input.split(",",2);
    let latitude = parseFloat(latlngStr[0]);
    let longitude = parseFloat(latlngStr[1]);
    
    const latlng = new google.maps.LatLng(latitude, longitude);
    
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
        //   map.setZoom(11);
        //   marker = new google.maps.Marker({
        //       position: latlng, 
        //       map: map
        //   }); 
        //   infowindow.setContent(results[1].formatted_address);
        //   infowindow.open(map, marker);

            console.log(results)
            console.log(results[1])
            return(results[1])
        } else {
          alert("No results found");
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
}


