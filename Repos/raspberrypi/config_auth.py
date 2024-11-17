from mfrc522 import SimpleMFRC522
import RPi.GPIO as GPIO
from time import sleep

reader = SimpleMFRC522()

while True: # TODO: maybe delete this file
    try:
        print('Your old data: ' + text)
        change = input('Do you want to change the data? Type yes or no')
        if change == 'yes':
            new_data = input('new data: ')

            print("Now place your tag to write")
            id, text = reader.read()
            reader.write(new_data)
            print("ID:" + str(id) + " New Text: " + new_data)
            print("Written")
        else:
            break
        sleep(1)
    finally:
        GPIO.cleanup()

