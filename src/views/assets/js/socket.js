const socket = io.connect("https://vcodes.xyz");

socket.on('userCount', userCount => {
let doc = document.getElementById('connectionCount');
  if(doc) {
    doc.innerHTML = userCount;
  }
})