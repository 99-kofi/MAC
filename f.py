import speech_recognition as sr
from selenium import webdriver
from selenium.webdriver.common.by import By
from gtts import gTTS
import os
import logging
from playsound import playsound
from flask import Flask, request, jsonify

# Set up logging to file
logging.basicConfig(filename='app.log', level=logging.INFO, 
                    format='%(asctime)s:%(levelname)s:%(message)s')

app = Flask(__name__)

class SpeechToSearch:
    def __init__(self):
        # Headless Chrome setup for server
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        self.driver = webdriver.Chrome(options=options)
        logging.info("Initialized headless Chrome WebDriver")

    def listen_and_search(self):
        r = sr.Recognizer()
        with sr.Microphone() as source:
            logging.info('Listening...')
            audio = r.listen(source)

        try:
            query = r.recognize_google(audio)
            logging.info(f'Recognized speech: {query}')

            if query.lower() == "close":
                logging.info('Terminating the program...')
                self.cleanup()
                return "close"

            self.driver.get('https://www.google.com')  # Open Google
            search_box = self.driver.find_element(By.NAME, "q")  # Find the search box element
            search_box.clear()
            search_box.send_keys(query)  # Enter the query
            search_box.submit()  # Submit the search

            results = self.driver.find_elements(By.CLASS_NAME, "tF2Cxc")[:5]
            if results:
                first_result = results[0].text
                logging.info(f"Top result: {first_result}")
                self.speak(first_result)
                return first_result
            else:
                logging.info("No results found.")
                self.speak("No results found.")
                return "No results found."
        except sr.UnknownValueError:
            logging.error('Could not understand audio')
            self.speak("Didn't get that, please try again.")
            return "Didn't get that, please try again."

    def speak(self, text):
        """Generate speech for a given text and play it"""
        tts = gTTS(text=text, lang='en')
        tts.save('response.mp3')
        try:
            playsound('response.mp3')  # Play the audio using playsound
        except Exception as e:
            logging.error(f"Error playing sound: {e}")

    def cleanup(self):
        """Quit the WebDriver and clean up resources."""
        if hasattr(self, 'driver'):
            self.driver.quit()
            logging.info("Closed WebDriver")

# Flask route for triggering the search via HTTP
@app.route('/search', methods=['POST'])
def search():
    searcher = SpeechToSearch()
    result = searcher.listen_and_search()
    if result == "close":
        shutdown_server()
        return jsonify({"message": "Server is shutting down..."})
    return jsonify({"result": result})

def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func:
        func()

if __name__ == '__main__':
    logging.info("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000)  # Run the Flask app

