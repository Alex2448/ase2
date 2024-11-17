from mfrc522 import SimpleMFRC522
import RPi.GPIO as GPIO
from time import sleep
import json

f = open('user_ids.json',)
data = json.load(f)
print(data)

reader = SimpleMFRC522()

GPIO.cleanup()
GPIO.setmode(GPIO.BCM)
def authenticate(user_id):
    if(user_id in data):
        print(True)  
        GPIO.setup(13,GPIO.OUT,initial=GPIO.LOW)
        GPIO.output(13,GPIO.HIGH)       

    else:
        print(False)
        GPIO.setup(16,GPIO.OUT,initial=GPIO.LOW)
        GPIO.output(16,GPIO.HIGH)

while True:
    try:
        print("Now place your tag to write")
        id, text = reader.read()
        userid =json.loads(text)
        print(userid['id'])
        authenticate(userid)
        sleep(5)
    except KeyboardInterrupt:
        GPIO.cleanup()
        raise
    finally:
        GPIO.cleanup()


    


