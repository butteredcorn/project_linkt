function updateHeadline(value) {
    document.querySelector(".headlineValue").innerText = value
}

function updatePlaceOfOrigin(value) {
    document.querySelector(".placeOfOrigin").innerText = value
}

function updateOccupation(value) {
    document.querySelector(".occupationValue").innerText = value
}

function updateEducation(value) {
    document.querySelector(".educationValue").innerText = value
}

// function updateMaxAge(value) {
//     if(value < document.querySelector(".minAge").innerText) {
//         alert("Max age must be greater than or equal to min age.")
//         // document.querySelector(".maxAge").value = parseInt(document.querySelector(".minAge").innerText)
//     } else {
//         document.querySelector(".maxAgeValue").innerText = value
//     }
// }

// function updateUserGender(value) {
//     document.querySelector(".userGenderValue").innerText = (value[0].toUpperCase() + value.slice(1))
// }

// function updatePartnerGenderPreference(value) {
//     document.querySelector(".partnerGenderValue").innerText = (value[0].toUpperCase() + value.slice(1))
// }