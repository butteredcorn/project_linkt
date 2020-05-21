$(() => {
    $('.image2').fadeOut(0)
    $('.image3').fadeOut(0)
    let count = 1
    timeoutInterval = 5000
    
    if ($('.image2').attr('src')) {
        setInterval(() => {
            count = ($(".profile-slide :nth-child("+count+")").fadeOut().next().length == 0) ? 1 : count+1;
            setTimeout(() => {
                $(".profile-slide :nth-child("+count+")").fadeIn();
            },350)
        }, timeoutInterval);
    }    
})
