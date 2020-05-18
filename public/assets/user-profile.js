function showProfilePictureGrid (value) {
    $('#selected-profile-position').val(value)
    $('#profile-picture-modal').modal('show');
}

function selectUserPhoto(value) {
    $("#selected-profile-picture").val(value)
    //console.log(value)
}

$(() => {
    $('.name').text(naiveTitleCase($('.name').text())) 
    $('.occupation').text(naiveTitleCase($('.occupation').text())) 
    $('.education').text(naiveTitleCase($('.education').text())) 
})

// $(() => {
//     console.log($('#location-coordinates').val())
//     return reverseGeocodeLookup($('#location-coordinates').val())
// })


function getLocation (value) {
    const location = reverseGeocodeLookup(value)
    return(location)
}
