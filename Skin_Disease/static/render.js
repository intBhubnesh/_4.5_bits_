document.addEventListener('DOMContentLoaded', function() {
    fetch('/get_session_data')
        .then(response => response.json())
        .then(data => {
            const predictedDiseaseElement = document.querySelector('.text-wrapper');
            const overlapGroupElement = document.querySelector('.overlap-group');

            if (predictedDiseaseElement) {
                predictedDiseaseElement.textContent = data.predicted_disease || 'No prediction';
            }

            if (overlapGroupElement) {
                overlapGroupElement.style.backgroundImage = `url(${data.uploaded_file || ''})`;
                overlapGroupElement.style.backgroundSize = 'cover';
            }

            // Fetch and display medicines when the page loads
            fetch('/treatments')
                .then(response => response.json())
                .then(medicinesData => {
                    if (medicinesData.medicines) {
                        // Process and display medicines in the treatments.html page
                        console.log('Medicines:', medicinesData.medicines);
                        // Update your HTML to show the medicines
                    } else {
                        console.error('Error fetching medicines:', medicinesData.error);
                    }
                })
                .catch(error => console.error('Error fetching medicines:', error));
        })
        .catch(error => console.error('Error fetching session data:', error));
});
