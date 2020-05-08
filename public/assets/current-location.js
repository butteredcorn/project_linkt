$(() => {
    getLocation()
})

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }
  
function showPosition(position) {
    // const locationCoordinates = {
    //     'latitude': position.coords.latitude,
    //     'longitude': position.coords.longitude
    // }

  // console.log(position.coords.latitude)
  // console.log(position.coords.longitude)

    $('#latitude').val(position.coords.latitude)
    $('#longitude').val(position.coords.longitude)
    $('#modal-latitude').val(position.coords.latitude)
    $('#modal-longitude').val(position.coords.longitude)
    console.log('Latitude: ' + $('#latitude').val())
    console.log('Longitude: ' + $('#longitude').val())
}
