from flask import Flask, request, jsonify, render_template
import requests
app = Flask(__name__)

# HERE API credentials
HERE_API_KEY = "D0-69Hrcc2g878gUn3d1-SRUpIBBK36uwJIMKW6zSEY"
HERE_API_ENDPOINT = "https://geocode.search.hereapi.com/v1/geocode"

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/clinics", methods=["POST"])
def get_clinics():
    address = request.form["address"]

    response = requests.get(
        HERE_API_ENDPOINT,
        params={"q": address, "apiKey": HERE_API_KEY}
    )

    data = response.json()

    if "items" in data:
        lat = data["items"][0]["position"]["lat"]
        lon = data["items"][0]["position"]["lng"]
        radius = 4000

        # Use /discover to find dermatologist clinics
        discover_response = requests.get(
            "https://discover.search.hereapi.com/v1/discover",
            params={
                "apiKey": HERE_API_KEY,
                "at": f"{lat},{lon}",
                "q": "dermatologist clinic",
                "radius": radius,
                "limit": 10
            }
        )

        clinics = discover_response.json()["items"]

        return render_template("result.html", clinics=clinics)
    else:
        return jsonify({"error": "No items found in API response"})


@app.route("/book_appointment", methods=["POST"])
def book_appointment():
        clinic_id = request.form["clinic_id"]
        clinic_name: str = request.form["clinic_name"]

        # Hardcoded available timings for demonstration purposes
        available_timings = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]

        return render_template("book_appointment.html", clinic_name=clinic_name, available_timings=available_timings)

@app.route("/book_appointment_confirm", methods=["POST"])
def book_appointment_confirm():
        clinic_id = request.form["clinic_id"]
        clinic_name = request.form["clinic_name"]
        date = request.form["date"]
        time = request.form["time"]
        patient_name = request.form["patient_name"]
        patient_email = request.form["patient_email"]
        patient_phone = request.form["patient_phone"]

        # Create a new appointment (for demonstration purposes, we'll just store it in a list)
        appointment = {
            "clinic_id": clinic_id,
            "date": date,
            "time": time,
            "patient_name": patient_name,
            "patient_email": patient_email,
            "patient_phone": patient_phone
        }
        appointments = list() # Replace with a database or storage mechanism
        appointments.append(appointment)

        return render_template("appointment_booked.html", clinic_name=clinic_name, date=date, time=time, patient_email=patient_email)

if __name__ == "__main__":
    app.run(debug=True)