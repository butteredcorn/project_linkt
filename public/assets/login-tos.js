$(() => {
    const newUser = $('#newUser').val()
    console.log(newUser)
    if (newUser) {
        $('#terms-of-use').modal(focus)
    }
})