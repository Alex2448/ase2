from mfrc522 import SimpleMFRC522
import RPi.GPIO as GPIO
from time import sleep

# GPIO.cleanup()

reader = SimpleMFRC522()

while True:
    try:
        text2 = input('new data: ')
        print("Now place your tag to write")
        id, text = reader.read()
        print('Old text: ' + text)
        reader.write(text2)
        print("ID:" + str(id) + " New Text: " + text2)
        print("Written")
        sleep(5)
    except KeyboardInterrupt:
        GPIO.cleanup()
        raise

