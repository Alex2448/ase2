import RPi.GPIO as GPIO
from time import sleep

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(16,GPIO.OUT,initial=GPIO.LOW)
sleep(3)
GPIO.output(16,GPIO.HIGH)
sleep(5)
GPIO.output(16,GPIO.LOW)


