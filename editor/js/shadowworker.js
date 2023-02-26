importScripts('blur.js');
onmessage = function(event) {
    var imageData = event.data.imageData;
    var color = event.data.color;
    var width = event.data.width;
    var height = event.data.height;
    var radius = event.data.radius;
    for (var i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i + 0] = imageData.data[i + 1] = imageData.data[i + 2] = imageData.data[i + 3];
        imageData.data[i + 3] = 255;
    }
    blurImageData(imageData, 0, 0, width, height, radius);
    var max_val = 10000;
    var tl = {
        x: max_val,
        y: max_val
    };
    var br = {
        x: -max_val,
        y: -max_val
    };
    var empty = true;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var i = y * width * 4 + x * 4;
            if (imageData.data[i]) {
                tl.x = Math.min(tl.x, x)
                tl.y = Math.min(tl.y, y);
                br.x = Math.max(br.x, x);
                br.y = Math.max(br.y, y);
                empty = false;
            }
            imageData.data[i + 3] = imageData.data[i];
            imageData.data[i] = color.r;
            imageData.data[i + 1] = color.g;
            imageData.data[i + 2] = color.b;
        }
    }
    var rect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    if (empty == false) {
        rect.x = tl.x;
        rect.y = tl.y;
        rect.width = br.x - tl.x;
        rect.height = br.y - tl.y;
    }
    postMessage({
        status: 'complete',
        imagedata: imageData,
        contentRect: rect
    });
    close();
}