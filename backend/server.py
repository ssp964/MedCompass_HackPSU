import os
import sys
from flask import Flask, request
from twilio.twiml.voice_response import VoiceResponse, Gather
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database.scripts.call_script import get_call_scripts, push_responses
# Load environment variables
load_dotenv()

app = Flask(__name__)

# List of predefined questions
questions = [
"Since your discharge, how have you been feeling?",
"Have you experienced any new or worsening symptoms since you left the hospital?",
"Are you taking your medications as prescribed?",
"Have you experienced any side effects or issues with your medications?",
"Do you have any upcoming follow-up appointments scheduled?",
"Have you been able to schedule any follow-up visits if not already done?",
"Is there anything about your recovery that you don’t understand or need clarification on?",
"Do you have enough support at home to assist with your recovery?"
]

conversation = ""
call_report_id = ""

def appendquestions(dynamic_questions):
    global questions
    questions = questions + dynamic_questions
    return questions
# Store call states
call_sessions = {}

@app.route("/voice", methods=["POST"])
def voice():
    # print(request.headers)
    global conversation
    global call_report_id
    conversation = ""
    current_patient = open("CALLREPORTID", 'r')
    current_patient = eval(current_patient.read())
    call_report_id = list(current_patient.keys())[0]
    current_number = current_patient["patient_number"]
    dynamic_questions = get_call_scripts()
    for patient in dynamic_questions:
        # print(patient["patient_number"])
        # print(current_number)
        # print(call_report_id)
        if patient["patient_number"] == current_number:
            appendquestions(patient["questions"])
            print(questions)
    """Handles the initial call interaction."""
    response = VoiceResponse()
    gather = Gather(num_digits=1, action="/handle-availability", method="POST")
    gather.say("Hello! Are you available to answer a few questions? Press 1 for yes, 2 for no.")
    response.append(gather)
    response.say("We did not receive any input. Goodbye!")
    return str(response)

@app.route("/handle-availability", methods=["POST"])
def handle_availability():
    """Processes patient's availability response."""
    response = VoiceResponse()
    digits = request.form.get("Digits")

    if digits == "1":
        call_sid = request.form.get("CallSid")
        call_sessions[call_sid] = {"question_index": 0}  # Initialize session
        return ask_question(call_sid)

    elif digits == "2":
        gather = Gather(input="speech", action="/handle-reschedule", method="POST")
        gather.say("Please say a date that works for you.")
        response.append(gather)
        response.say("We did not receive any input. Goodbye!")
        return str(response)

    else:
        response.say("Invalid input. Goodbye!")
        return str(response)

@app.route("/handle-reschedule", methods=["POST"])
def handle_reschedule():
    """Handles rescheduling request."""
    response = VoiceResponse()
    date_response = request.form.get("SpeechResult")
    response.say(f"Thank you! We will call you back on {date_response}. Goodbye!")
    return str(response)

@app.route("/ask-question", methods=["POST"])
def ask_question(call_sid=None):
    global call_report_id
    """Asks the next question dynamically from the list."""
    response = VoiceResponse()
    call_sid = call_sid or request.form.get("CallSid")

    if call_sid not in call_sessions:
        response.say("Session expired. Goodbye!")
        return str(response)

    session = call_sessions[call_sid]
    index = session["question_index"]

    if index < len(questions):
        gather = Gather(input="speech", action="/record-answer", method="POST")
        gather.say(questions[index])
        response.append(gather)
        response.say("We did not receive any input. Goodbye!")
    else:
        response.say("Thank you for your responses. Have a great day!")
    push_responses(call_report_id, conversation)
    print(conversation)
    return str(response)

@app.route("/record-answer", methods=["POST"])
def record_answer():
    global conversation
    """Records the answer and proceeds to the next question."""
    response = VoiceResponse()
    call_sid = request.form.get("CallSid")
    
    if call_sid not in call_sessions:
        response.say("Session expired. Goodbye!")
        return str(response)

    session = call_sessions[call_sid]
    index = session["question_index"]
    answer = request.form.get("SpeechResult")
    
    print(f"Q{index+1}: {questions[index]}")
    print(f"Answer: {answer}")
    conversation += "Question: " + questions[index] + "\nAnswer: " + answer + "\n=-=-"
    session["question_index"] += 1  # Move to the next question

    return ask_question(call_sid)  # Ask next question

if __name__ == "__main__":
    app.run(port=5000, debug=True)
