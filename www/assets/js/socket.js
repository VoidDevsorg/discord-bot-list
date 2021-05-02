const socket = io.connect("https://vcodes.xyz");

socket.on('userCount', userCount => {
        document.getElementById('connectionCount').innerHTML = userCount;
  })