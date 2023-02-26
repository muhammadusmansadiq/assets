onmessage = function(event) {
    var imageData = event.data.imageData;
    var maskData = event.data.maskData;
    for (var i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i + 3] = maskData.data[i + 3];
    }
    postMessage({
        status: 'complete',
        imageData: imageData
    });
    close();
}