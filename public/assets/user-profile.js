function showProfilePictureGrid () {
    $('#profile-picture-modal').modal('show');
}

function selectUserPhoto(value) {
    $("#selected-profile-picture").val(value)
    //console.log(value)
}

// $(() => {
//     console.log($('#location-coordinates').val())
//     return reverseGeocodeLookup($('#location-coordinates').val())
// })


function getLocation (value) {
    const location = reverseGeocodeLookup(value)
    return(location)
}
