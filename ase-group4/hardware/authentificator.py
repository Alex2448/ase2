from mfrc522 import SimpleMFRC522
import RPi.GPIO as GPIO
from time import sleep


def get_id_from_tag():
    GPIO.setwarnings(False)
    try:
        reader = SimpleMFRC522()
        ID, text = reader.read()
        userid = int(text)
    except KeyboardInterrupt:
        userid = None
    except ValueError:
        userid = None
    return userid


def show_led(is_authorized):
    green_light = 16
    red_light = 13
    brightness_detector = 17

    if is_authorized:
        GPIO.cleanup()
        GPIO.setwarnings(False)
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(green_light, GPIO.OUT, initial=GPIO.LOW)
        GPIO.setup(brightness_detector, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.output(green_light, GPIO.HIGH)  # green light
        closed = False
        # light green 10 seconds long if not closed
        for counter in range(10):
            box_closed = GPIO.input(brightness_detector)
            if box_closed != 0:  # closed
                closed = True
                break
            sleep(1)

        GPIO.cleanup()
        GPIO.setwarnings(False)
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(red_light, GPIO.OUT, initial=GPIO.LOW)
        GPIO.setup(brightness_detector, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        while not closed:  # blink red light
            GPIO.output(red_light, GPIO.HIGH)  # red light
            sleep(0.5)
            GPIO.output(red_light, GPIO.LOW)  # red light
            sleep(0.5)
            box_closed = GPIO.input(brightness_detector)
            if box_closed != 0:  # closed
                break
        GPIO.cleanup()
    else:
        GPIO.cleanup()
        GPIO.setwarnings(False)
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(red_light, GPIO.OUT, initial=GPIO.LOW)
        GPIO.output(red_light, GPIO.HIGH)  # red light
        sleep(3)
        GPIO.cleanup()
