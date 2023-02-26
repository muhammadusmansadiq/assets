
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const errorDiv = document.getElementById("error");
const progressBar = document.getElementById("progress-bar");



dropzone.addEventListener("dragover", handleDragOver);
dropzone.addEventListener("drop", handleDrop);
fileInput.addEventListener("change", handleFileSelect);
preview.addEventListener("click", handleImageDelete);

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add("dragover");
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove("dragover");

    const validFiles = [];
    const invalidFiles = [];

    for (const file of e.dataTransfer.files) {
        if (validateFile(file)) {
            validFiles.push(file);
        } else {
            invalidFiles.push(file);
        }
    }

    if (invalidFiles.length > 0) {
        showError("Invalid file type or size");
    }

    previewFiles(validFiles);
}

function handleFileSelect(e) {
    const files = Array.from(fileInput.files);

    const validFiles = [];
    const invalidFiles = [];

    for (const file of files) {
        if (validateFile(file)) {
            validFiles.push(file);
        } else {
            invalidFiles.push(file);
        }
    }

    if (invalidFiles.length > 0) {
        showError("Invalid file type or size is not included");
    }

    previewFiles(validFiles);
}

function validateFile(file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
        return false;
    }

    if (file.size > maxSize) {
        return false;
    }

    return true;
}

function previewFiles(files) {
    for (const file of files) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // create image element
            const imgWrapper = document.createElement("div");
            imgWrapper.classList.add("img-wrapper");

            const img = document.createElement("img");
            img.src = e.target.result;
            img.classList.add("preview");
            imgWrapper.appendChild(img);

            // create processing button
            const processingButton = document.createElement("button");
            processingButton.innerText = "Processing...";
            processingButton.disabled = true;
            imgWrapper.appendChild(processingButton);

            const deleteIcon = document.createElement("span");
            deleteIcon.innerHTML = "&times;";
            deleteIcon.classList.add("delete-icon");
            imgWrapper.appendChild(deleteIcon);

            preview.appendChild(imgWrapper);

            // Create a loading overlay
            const overlay = document.createElement("div");
            overlay.classList.add("overlay");
            overlay.innerHTML = "<div class='spinner'></div><div class='message'>Processing image...</div>";
            document.body.appendChild(overlay);

            // Convert the image to base64
            var base64Image = e.target.result.split(',')[1];
            // Send the base64 encoded image to the server using AJAX
            $.ajax({
                url: '/api',
                type: 'POST',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('X-API-Key', 'asd');
                    // showProcessingButton(processingButton);
                },
                data: {
                    image: base64Image
                },
                xhr: function () {
                    const xhr = new window.XMLHttpRequest();

                    // Upload progress
                    xhr.upload.addEventListener("progress", function (evt) {
                        if (evt.lengthComputable) {
                            const percentComplete = evt.loaded / evt.total;
                            progressBar.style.width = `${percentComplete * 100}%`;
                        }
                    }, false);

                    return xhr;
                },
                success: function (response) {
                    // Remove the loading overlay
                    document.body.removeChild(overlay);

                    if (response.filename) {
                        
                        const resultRow = document.createElement("div");
                        resultRow.classList.add("result-row");

                        const resultImg = document.createElement("img");
                        resultImg.src = e.target.result;
                        resultImg.classList.add("result-preview");

                        // Add a click event listener to the image element
                        resultImg.addEventListener("click", function () {
                            window.location.href = "/" + response.filename; // Navigate to the edit page
                        });

                        resultRow.appendChild(resultImg);

                        document.getElementById("result").appendChild(resultRow);
                    } else {
                        alert('Unknown response from server.');
                    }


                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.status == 401) {
                        alert('Invalid API key.');
                    } else {
                        alert('Error uploading image.');
                    }

                    // remove processing button
                    hideProcessingButton(processingButton);

                    // Remove the loading overlay
                    document.body.removeChild(overlay);
                },
                timeout: 60000
            });
        };
        reader.readAsDataURL(file);
    }
}

function handleImageDelete(e) {
    if (e.target.classList.contains("delete-icon")) {
        const imgWrapper = e.target.parentElement;
        preview.removeChild(imgWrapper);
    }
}

function showError(msg) {
    errorDiv.innerHTML = msg;
    errorDiv.classList.add("error-msg");
}


