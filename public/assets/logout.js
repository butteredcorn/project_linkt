

function logout() {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    location.reload()
  }