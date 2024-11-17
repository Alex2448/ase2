from mfrc522 import SimpleMFRC522
import RPi.GPIO as GPIO
from time import sleep
import json


def get_id_from_tag():
    try:
        reader = SimpleMFRC522()
        ID, text = reader.read()  # id = 264465494, text: {"id": "0002"}
        userid = json.loads(text)
    except ValueError:  # includes simplejson.decoder.JSONDecodeError
        userid = None
    return userid


def show_led(user):
    if user:
        GPIO.setmode(GPIO.BCM)
        print(True)
        GPIO.setup(13, GPIO.OUT, initial=GPIO.LOW)
        GPIO.output(13, GPIO.HIGH)
        sleep(3)
        GPIO.cleanup()
    else:
        GPIO.setmode(GPIO.BCM)
        print(False)
        GPIO.setup(16, GPIO.OUT, initial=GPIO.LOW)
        GPIO.output(16, GPIO.HIGH)
        sleep(3)
        GPIO.cleanup()


def authenticate():
    GPIO.cleanup()
    GPIO.setmode(GPIO.BCM)
    print("Place your tag to scan.")
    userid = get_id_from_tag()
    while userid is None:
        print("Scan not successful, please scan tag again.")
        userid = get_id_from_tag()
    print("Scan succesful.")
    print("Check your tag...")
    # TODO: Anfrage stellen
    print("Checking succesful")  # TODO: delete this later
    user = True
    show_led(user)
    sleep(2)
    return user
