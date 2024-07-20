document.addEventListener('DOMContentLoaded', function() {
    const diseaseNameElement = document.getElementById('disease-name');
    const diseaseDescriptionElement = document.getElementById('disease-description');
    const symptomsListElement = document.getElementById('symptoms-list');
    const complicationsElement = document.querySelector('.scarring-of-the-skin'); // New element for complications
    const causesElement = document.querySelector('.bacterial-infection'); // New element for causes
    const preventionsElement = document.querySelector('.wash-face-twice'); // Preventions

    const unionWrapper = document.querySelector('.union-wrapper');
    const fileInput = document.getElementById('file-input');
    const overlapGroup = document.getElementById('overlap-group');
    const predictionText = document.getElementById('prediction-text');
    const divWrapper = document.getElementById('div-wrapper');

    unionWrapper.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        unionWrapper.style.borderColor = '#000';
    });

    unionWrapper.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        unionWrapper.style.borderColor = '#ccc';
    });

    unionWrapper.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        unionWrapper.style.borderColor = '#ccc';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();

            reader.onload = function(event) {
                overlapGroup.style.backgroundImage = `url(${event.target.result})`;
            }

            reader.readAsDataURL(file);
            uploadImage(file);
        }
    });

    unionWrapper.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(event) {
                overlapGroup.style.backgroundImage = `url(${event.target.result})`;
            }

            reader.readAsDataURL(file);
            uploadImage(file);
        }
    });

    function uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                predictionText.textContent = 'Error in prediction';
                console.error('Prediction error:', data.error);
            } else {
                const { prediction } = data;
                predictionText.textContent = prediction;
                diseaseNameElement.textContent = prediction;
                getDiseaseInfo(prediction); // Call function to fetch disease description
                getDiseaseSymptoms(prediction); // Call function to fetch symptoms
                getDiseaseComplications(prediction); // Call function to fetch complications
                getDiseaseCauses(prediction); // Call function to fetch causes
                getDiseasePreventions(prediction); // CAll function to fetch prediction

            }
        })
        .catch(error => {
            predictionText.textContent = 'Error in prediction';
            console.error('Error:', error);
        });
    }

    async function getDiseaseInfo(diseaseName) {
        try {
            console.log('Sending request for description:', diseaseName);
            const response = await fetch('http://127.0.0.1:5000/get_disease_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ diseaseName })
            });
    
            const result = await response.json();
            console.log('Received description response:', result);
            if (result.error) {
                console.error('Error fetching disease description:', result.error);
                diseaseDescriptionElement.textContent = 'Error fetching description';
            } else {
                diseaseDescriptionElement.textContent = result.response;
            }
        } catch (error) {
            console.error('Error:', error);
            diseaseDescriptionElement.textContent = 'Error fetching description';
        }
    }

    async function getDiseaseSymptoms(diseaseName) {
        try {
            console.log('Sending request for symptoms:', diseaseName);
            const response = await fetch('http://127.0.0.1:5000/get_disease_symptoms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ diseaseName })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const result = await response.json();
            console.log('Received symptoms response:', result);
            if (result.error) {
                console.error('Error fetching symptoms:', result.error);
            } else {
                if (symptomsListElement) {
                    symptomsListElement.innerHTML = `<ul>${result.response.split('\n').map(symptom => `<li>${symptom}</li>`).join('')}</ul>`;
                } else {
                    console.error('symptomsListElement not found');
                }
            }
        } catch (error) {
            console.error('Error in getDiseaseSymptoms:', error);
            symptomsListElement.innerHTML = 'Error fetching symptoms';
        }
    }

    async function getDiseaseComplications(diseaseName) {
        try {
            console.log('Sending request for complications:', diseaseName);
            const response = await fetch('http://127.0.0.1:5000/get_disease_complications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ diseaseName })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const result = await response.json();
            console.log('Received complications response:', result);
            if (result.error) {
                console.error('Error fetching complications:', result.error);
            } else {
                if (complicationsElement) {
                    complicationsElement.innerHTML = result.response.split('\n').join('<br />');
                } else {
                    console.error('complicationsElement not found');
                }
            }
        } catch (error) {
            console.error('Error in getDiseaseComplications:', error);
            complicationsElement.innerHTML = 'Error fetching complications';
        }
    }
    async function getDiseaseCauses(diseaseName) {
        try {
            console.log('Sending request for causes:', diseaseName);
            const response = await fetch('http://127.0.0.1:5000/get_disease_causes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ diseaseName })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const result = await response.json();
            console.log('Received causes response:', result);
            if (result.error) {
                console.error('Error fetching causes:', result.error);
                // Handle error scenario in UI if needed
            } else {
                // Check if causesElement exists before updating inner HTML
                if (causesElement) {
                    causesElement.innerHTML = `<ul>${result.response.split('\n').map(cause => `<li>${cause}</li>`).join('')}</ul>`;
                } else {
                    console.error('causesElement not found');
                }
            }
        } catch (error) {
            console.error('Error in getDiseaseCauses:', error);
            // Handle specific error scenarios here, such as displaying an error message to the user
            causesElement.innerHTML = 'Error fetching causes'; // Example of handling error in UI
        }
    }
    async function getDiseasePreventions(diseaseName) {
        try {
            console.log('Sending request for preventions:', diseaseName);
            const response = await fetch('http://127.0.0.1:5000/get_disease_preventions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ diseaseName })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const result = await response.json();
            console.log('Received preventions response:', result);
            if (result.error) {
                console.error('Error fetching preventions:', result.error);
                // Handle error scenario in UI if needed
            } else {
                // Check if preventionsElement exists before updating inner HTML
                if (preventionsElement) {
                    preventionsElement.innerHTML = `<ul>${result.response.split('\n').map(prevention => `<li>${prevention}</li>`).join('')}</ul>`;
                } else {
                    console.error('preventionsElement not found');
                }
            }
        } catch (error) {
            console.error('Error in getDiseasePreventions:', error);
            // Handle specific error scenarios here, such as displaying an error message to the user
            preventionsElement.innerHTML = 'Error fetching preventions'; // Example of handling error in UI
        }
    }
    
    // component 
    // Function to fetch medicines based on disease name
function fetchMedicines(diseaseName) {
    fetch('/get_disease_medicines', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diseaseName: diseaseName }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error fetching medicines:', data.error);
            return;
        }

        // Assuming 'data.medicines' is an array of medicine objects
        const medicines = data.medicines;
        renderMedicines(medicines); // Function to render medicines dynamically
    })
    .catch(error => console.error('Error:', error));
}

// Function to render medicines dynamically
function renderMedicines(medicines) {
    const medicineContainer = document.getElementById('medicine-container');
    medicineContainer.innerHTML = ''; // Clear previous content

    medicines.forEach(medicine => {
        let component;
        if (medicine.category === 'pills') {
            component = `<div class="group-2">
                            <div class="overlap-group-3">
                                <div class="text-wrapper-22">${medicine.name}</div>
                                <div class="text-wrapper-23">Pills</div>
                                <div class="overlap-group-4">
                                    <img class="pill" src="https://c.animaapp.com/1pZ8h9vQ/img/pill-1-1@2x.png" />
                                </div>
                            </div>
                        </div>`;
        } else if (medicine.category === 'lotion') {
            component = `<div class="group-2">
                            <div class="overlap-group-3">
                                <div class="text-wrapper-22">${medicine.name}</div>
                                <div class="text-wrapper-23">Lotion</div>
                                <div class="overlap-group-4">
                                    <img class="lotion" src="https://c.animaapp.com/1pZ8h9vQ/img/lotion-1@2x.png" />
                                </div>
                            </div>
                        </div>`;
        } else if (medicine.category === 'syrups') {
            component = `<div class="group-2">
                            <div class="overlap-group-3">
                                <div class="text-wrapper-22">${medicine.name}</div>
                                <div class="text-wrapper-23">Syrups</div>
                                <div class="overlap-group-4">
                                    <img class="image" src="https://c.animaapp.com/1pZ8h9vQ/img/image-163@2x.png" />
                                </div>
                            </div>
                        </div>`;
        }

        // Append the generated component to the container
        medicineContainer.innerHTML += component;
    });
}

// Example usage:
const diseaseName = 'Acne'; // Replace with actual disease name
fetchMedicines(diseaseName);

    
});
