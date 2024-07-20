// this is for the sessions
document.addEventListener('DOMContentLoaded', function() {
    fetch('/get_session_data')
        .then(response => response.json())
        .then(data => {
            console.log('Session data:', data); // Log the fetched data for debugging
            const predictedDiseaseElement = document.querySelector('.text-wrapper');
            const overlapGroupElement = document.querySelector('.overlap-group');

            if (predictedDiseaseElement) {
                predictedDiseaseElement.textContent = data.predicted_disease || 'No prediction';
            }

            if (overlapGroupElement && data.uploaded_file) {
                // Ensure the image path is correctly formatted
                const encodedFilename = encodeURIComponent(data.uploaded_file.split('/').pop());
                const imageUrl = `/static/uploads/${encodedFilename}`;

                // const imageUrl = `/static/uploads/${data.uploaded_file.split('/').pop()}`;
                console.log('Image URL:', imageUrl); // Log the image URL for debugging

                // Set the background image
                overlapGroupElement.style.backgroundImage = `url(${imageUrl})`;
                overlapGroupElement.style.backgroundSize = 'fit';

                // To ensure the background image is updated, you might need to force reload
                overlapGroupElement.style.backgroundImage = `url(${imageUrl}?t=${new Date().getTime()})`;
            }
        })
        .catch(error => console.error('Error fetching session data:', error));
});


// this is for medicines 
async function fetchTreatments() {
    try {
        const response = await fetch('http://127.0.0.1:5000/treatments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        const treatmentDiv = document.querySelector('.text-wrapper-22');
        treatmentDiv.innerHTML = ''; // Clear any existing content

        if (data.error) {
            treatmentDiv.textContent = data.error;
            return;
        }

        // Create a list element
        const ul = document.createElement('ul');

        // Split the response by new lines and filter out empty lines
        const medicines = data.medicines.split('\n').filter(line => line.trim() !== '');

        // Populate the list with medicines
        medicines.forEach(medicine => {
            const li = document.createElement('li');
            li.textContent = medicine;
            ul.appendChild(li);
        });

        // Append the list to the treatment div
        treatmentDiv.appendChild(ul);

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Call the fetchTreatments function when the page loads
document.addEventListener('DOMContentLoaded', fetchTreatments);

