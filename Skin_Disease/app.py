from flask import Flask, request, jsonify, send_from_directory, render_template, session
from flask_cors import CORS
import numpy as np
from g4f.client import Client
import cv2
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.resnet50 import preprocess_input
import pickle
import os

app = Flask(__name__, static_url_path='/static', static_folder='static', template_folder='templates')
app.secret_key = 'your_secret_key'  # Replace with your actual secret key
CORS(app)

client = Client()

# Load the model and label encoder
model = load_model('my_model.h5')
with open('label_encoder.pkl', 'rb') as file:
    le = pickle.load(file)

# Serve the home.html file
@app.route('/')
def home():
    return render_template('home.html')

# Serve the treatments.html file
@app.route('/treatments')
def treatments():
    return render_template('treatments.html')

#fetch the medicine list 
@app.route('/treatments', methods=['POST'])
def get_treatments():
    try:
        disease_name = session.get('predicted_disease')
        if not disease_name:
            return jsonify({'error': 'No disease predicted'})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": f'''You are a medical expert. Based on the predicted skin disease, {disease_name}, provide a list of 10 commonly known and generalized medicines that are relevant to the condition. Format the output as a plain list with each medicine on a new line. Do not include any additional information or explanations.'''
                }
            ],
        )

        medicines = response.choices[0].message.content

        return jsonify({'medicines': medicines})
    except Exception as e:
        return jsonify({'error': str(e)})


# Serve the hospital.html file
@app.route('/hospital')
def hospital():
    return render_template('hospital.html')

# Serve static files like CSS and JS
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)
@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'})
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'})
        if file:
            # Ensure the uploads directory exists
            uploads_dir = os.path.join(app.static_folder, 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)

            file_path = os.path.join(uploads_dir, file.filename)
            file.save(file_path)

            # Read image file into a buffer
            file.seek(0)
            img_array = np.frombuffer(file.read(), np.uint8)
            img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            if img is None:
                return jsonify({'error': 'Image decoding failed'})

            img = cv2.resize(img, (224, 224))
            img = preprocess_input(np.array([img]))

            predictions = model.predict(img)
            predicted_class_index = np.argmax(predictions)
            predicted_class = le.classes_[predicted_class_index]

            # Save the file and prediction to the session
            session['predicted_disease'] = predicted_class
            session['uploaded_file'] = f'/static/uploads/{file.filename}'

            return jsonify({'prediction': predicted_class})
    except Exception as e:
        return jsonify({'error': str(e)})


# Handle getting disease information
@app.route('/get_disease_info', methods=['POST'])
def get_disease_info():
    try:
        disease_name = request.json.get('diseaseName')
        if not disease_name:
            return jsonify({'error': 'Disease name not provided'})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": f"provide me description of {disease_name} in 3-4 lines and keep it simple and to the point."}
            ],
        )

        return jsonify({'response': response.choices[0].message.content})
    except Exception as e:
        return jsonify({'error': str(e)})

# Handle getting disease symptoms
@app.route('/get_disease_symptoms', methods=['POST'])
def get_disease_symptoms():
    try:
        disease_name = request.json.get('diseaseName')
        if not disease_name:
            return jsonify({'error': 'Disease name not provided'})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": f'''You are an experienced dermatologist. Based on the image detected by the AI model, please provide a well-structured response detailing the symptoms of the identified skin disease, {disease_name}. 
The response should be organized into bullet points and should not exceed 8 words.
Ensure the information is clear and concise.'''
                }
            ],
        )

        return jsonify({'response': response.choices[0].message.content})
    except Exception as e:
        return jsonify({'error': str(e)})

# Handle getting disease complications
@app.route('/get_disease_complications', methods=['POST'])
def get_disease_complications():
    try:
        disease_name = request.json.get('diseaseName')
        if not disease_name:
            return jsonify({'error': 'Disease name not provided'})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": f'''You are an experienced dermatologist. 
Based on the image detected by the AI model, please provide a well-structured response detailing the complications of the identified skin disease, {disease_name}.
 The response should be organized into two points, with each point containing only 2 words.It should not exceed 2 lines. Ensure the information is clear and concise, using the following format:
1.Short-Term Complications: Explain the immediate complications of {disease_name}.
2.Long-Term Complications: Describe the long-term complications of {disease_name}.
Your response should be informative and helpful for both patients and healthcare providers.'''
                }
            ],
        )

        return jsonify({'response': response.choices[0].message.content})
    except Exception as e:
        return jsonify({'error': str(e)})

# Handle getting disease causes
@app.route('/get_disease_causes', methods=['POST'])
def get_disease_causes():
    try:
        disease_name = request.json.get('diseaseName')
        if not disease_name:
            return jsonify({'error': 'Disease name not provided'})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": f'''You are an experienced dermatologist. Based on the image detected by the AI model, please provide a well-structured response detailing the causes of the identified skin disease, {disease_name}. 
The response should be organized into five key points and should not exceed 8 words.
Ensure the information is clear and concise, using the following format:
1.Genetic Factors: Explain the role of genetics in causing {disease_name}.
2.Environmental Triggers: Describe environmental factors that can lead to this disease.
3.Lifestyle Influences: Discuss how lifestyle choices might contribute to the disease.
4.Infections: Highlight any infections that can trigger or worsen the disease.
5.Immune System: Elaborate on how the immune system is involved in causing {disease_name}.
Your response should be informative and helpful for both patients and healthcare providers.'''
                }
            ],
        )

        return jsonify({'response': response.choices[0].message.content})
    except Exception as e:
        return jsonify({'error': str(e)})

# Handle getting disease prevention
@app.route('/get_disease_preventions', methods=['POST'])
def get_disease_preventions():
    try:
        disease_name = request.json.get('diseaseName')
        if not disease_name:
            return jsonify({'error': 'Disease name not provided'})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": f'''You are an experienced dermatologist. Based on the image detected by the AI model, please provide a well-structured response detailing the prevention methods for the identified skin disease, {disease_name}. The response should be organized into six key points, with each point containing only 10 words. 
Ensure the information is clear and concise, using the following format:
1.Hygiene: Describe hygiene practices to prevent {disease_name}.
2.Diet: Explain dietary recommendations to avoid {disease_name}.
3.Sun Protection: Discuss sun protection measures for {disease_name}.
4.Allergen Avoidance: Highlight ways to avoid allergens causing {disease_name}.
5.Moisturization: Elaborate on moisturization techniques to prevent {disease_name}.
6.Regular Check-Ups: Emphasize the importance of regular dermatological check-ups.
Your response should be informative and helpful for both patients and healthcare providers.'''
                }
            ],
        )

        return jsonify({'response': response.choices[0].message.content})
    except Exception as e:
        return jsonify({'error': str(e)})

# Serve session data to JavaScript
@app.route('/get_session_data')
def get_session_data():
    return jsonify({
        'predicted_disease': session.get('predicted_disease', 'No prediction'),
        'uploaded_file': session.get('uploaded_file', '')
    })

# Handle generating medicines for the predicted disease
@app.route('/generate_medicines', methods=['GET'])
def generate_medicines():
    try:
        disease_name = session.get('predicted_disease')
        if not disease_name:
            return jsonify({'error': 'No disease predicted'})

        # Query the model or API to get medicine recommendations based on disease_name
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": f'''You are a medical expert. Based on the predicted skin disease, {disease_name}, please provide a list of recommended medicines. The response should be organized into categories such as "pill", "lotion", "syrup", and each category should have a name and brief description of the medicine.'''
                }
            ],
        )

        medicines = response.choices[0].message.content

        return jsonify({'medicines': medicines})
    except Exception as e:
        return jsonify({'error': str(e)})



if __name__ == '__main__':
    app.run(debug=True)
