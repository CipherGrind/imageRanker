function previewImages() {
    const files = document.getElementById('upload').files;
    const previewColumn = document.getElementById('previewColumn');
    previewColumn.innerHTML = ''; // Clear previous content
    imagesData = []; // Clear previous image data

    if (files.length === 0) {
        alert('Please select images to upload.');
        return;
    }

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.className = 'imageContainer';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'previewImage';
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = 0;
            slider.max = 100;
            slider.value = 50;
            slider.className = 'ratingSlider';
            slider.id = `slider-${index}`;

            const ratingDisplay = document.createElement('span');
            ratingDisplay.className = 'ratingDisplay';
            ratingDisplay.innerText = `Rating: ${slider.value}`;
            
            const nameLabel = document.createElement('label');
            nameLabel.className = 'imageNameLabel';
            nameLabel.setAttribute('for', `name-${index}`);
            nameLabel.innerText = 'Image Name:';

            // Remove the file extension for the input field
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'imageNameInput';
            nameInput.value = baseName; // Show name without extension
            nameInput.id = `name-${index}`;

            slider.oninput = function() {
                ratingDisplay.innerText = `Rating: ${slider.value}`;
            };

            // Store initial image data
            imagesData.push({
                file: file,
                name: baseName, // Store the base name without extension
                rating: slider.value,
                index: index,
                dataURL: e.target.result,
                extension: file.name.split('.').pop() // Store the file extension separately
            });

            div.appendChild(nameLabel);
            div.appendChild(nameInput);
            div.appendChild(img);
            div.appendChild(slider);
            div.appendChild(ratingDisplay);
            previewColumn.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

function reorderImages() {
    const previewColumn = document.getElementById('previewColumn');
    const imageContainers = Array.from(previewColumn.getElementsByClassName('imageContainer'));
    
    imageContainers.sort((a, b) => {
        const ratingA = parseInt(a.querySelector('.ratingSlider').value);
        const ratingB = parseInt(b.querySelector('.ratingSlider').value);
        return ratingB - ratingA; // Sort descending
    });

    previewColumn.innerHTML = ''; // Clear existing content
    imageContainers.forEach(container => previewColumn.appendChild(container));
}

function autoNumberNames() {
    // Update the image data with the latest ranking values before sorting
    imagesData.forEach(image => {
        const slider = document.getElementById(`slider-${image.index}`);
        image.rating = slider.value; // Update the rating in the imagesData array
    });

    const sortedImages = [...imagesData].sort((a, b) => b.rating - a.rating);

    sortedImages.forEach((image, index) => {
        const newName = (index + 1).toString().padStart(2, '0'); // Create 01, 02, 03, etc.
        const input = document.getElementById(`name-${image.index}`);
        input.value = newName;
        image.name = newName; // Update image data with new name
    });
}

function useRankingNames() {
    imagesData.forEach(image => {
        const slider = document.getElementById(`slider-${image.index}`);
        const currentRating = slider.value; // Get the current rating from the slider
        const input = document.getElementById(`name-${image.index}`);
        input.value = currentRating; // Use the current rating value as the name
        image.name = currentRating; // Update image data with the current rating as the name
    });
}

function updateImages() {
    imagesData.forEach(image => {
        const newName = document.getElementById(`name-${image.index}`).value;
        const newRating = document.getElementById(`slider-${image.index}`).value;
        // Update image data with new name and rating
        image.name = newName;
        image.rating = newRating;
    });

    alert('Image names and ratings updated successfully!');
}

function saveImages() {
    const folderName = document.getElementById('albumName').value || 'Album';
    const zip = new JSZip();
    const folder = zip.folder(folderName);
    const progressBar = document.getElementById('progressBar');
    const totalImages = imagesData.length;

    progressBar.value = 0; // Reset progress bar

    imagesData.forEach((image, index) => {
        const base64Data = image.dataURL.split(',')[1];
        const fullFileName = `${image.name}.${image.extension}`; // Re-add the extension when saving
        folder.file(fullFileName, base64Data, { base64: true });

        // Update progress bar
        const progress = ((index + 1) / totalImages) * 100;
        progressBar.value = progress;
    });

    zip.generateAsync({ type: 'blob' }).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${folderName}.zip`;
        link.click();

        // Reset progress bar after completion
        progressBar.value = 100;
    });
}

