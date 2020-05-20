$(() => {
    $('#image2').fadeOut()
    $('#image3').fadeOut()
    let count = 1
    timeoutInterval = 5000

    setInterval(() => {
        count = ($(".profile-slide :nth-child("+count+")").fadeOut().next().length == 0) ? 1 : count+1;
        setTimeout(() => {
            $(".profile-slide :nth-child("+count+")").fadeIn();
        },350)
    }, timeoutInterval);
})
