window.onload = function() {
  document.querySelector('#greeting').innerText =
    'Hello, World! It is ' + new Date();

var uuid = "46ab76a3-bccd-4f29-a528-f03ba64a0589";
var device;
var socketId;

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}



var onConnectedCallback = function() {
  if (chrome.runtime.lastError) {
    console.log("Connection failed: " + chrome.runtime.lastError.message);
  } 
  else {
    console.log("Connected");
  }
};

function onSocketCreate(createInfo) {
  socketId = createInfo.socketId;
  if (device.uuids.indexOf(uuid) != -1) {
    chrome.bluetoothSocket.connect(createInfo.socketId, device.address, uuid, onConnectedCallback);
  }
  else {
    console.log("Device does not support CatiDialer");
  }
}

function sending(bytes_sent) {
  if (chrome.runtime.lastError) {
    failed_to_send(chrome.runtime.lastError.message);
  }
}

function failed_to_send(msg) {
  console.log("Failed to send: "+msg);
}

  chrome.bluetoothSocket.onReceiveError.addListener(function(errorInfo) {
    // Cause is in errorInfo.error.
    console.log(errorInfo.errorMessage);
  });

  console.log("Getting devices");
  
  function initialize() {
    
    chrome.bluetooth.getDevices(function(devices) {
      console.log("Got "+devices.length+" devices");
      for (var i = 0; i < devices.length; i++) {
        device = devices[i];
        console.log(device);
        chrome.bluetoothSocket.create(onSocketCreate);
      }
    });
    
  }

  initialize();
  
  setTimeout(function() {
    console.log("Dialing");
    chrome.bluetoothSocket.send(socketId, str2ab("01244 318652"), sending);
    setTimeout(function() {
      chrome.bluetoothSocket.send(socketId, str2ab("hangup"), sending);
    }, 4000);
  }, 4000);
};

