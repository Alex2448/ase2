import RestRequests
from RequestFunctions import *
from authentificator import *
from time import sleep
from RestRequests import *
import logging
import threading
import os
import sys

end = False
jwt_token = '123'
got_configuration = False


def getUpdates(hostname, host_url, my_request):
    while True:
        global jwt_token
        global got_configuration
        with open('configuration.json', 'r') as f:
            data = json.load(f)
            box_raspberry_id = data['raspberryId']
        got_configuration = True

        # check if box is updated or deleted
        try:
            get_box(host_url, my_request, jwt_token, box_raspberry_id)
            logging.info("Update")
        except RuntimeError:
            logging.info("Box is deleted")
            global end
            end = True
            break
        except ConnectionError:
            logging.info("JWT Token is invalid.")

            # sign in again
            port = 8081
            hostUrl = "http://" + hostname + ":" + str(port)
            my_request = RestRequests(hostname, port, hostUrl)
            # get jwt token
            jwt_token = sign_in(hostUrl, my_request)

            # set port and request again to delivery management
            port = 8082
            hostUrl = "http://" + hostname + ":" + str(port)
            my_request = RestRequests(hostname, port, hostUrl)
            continue

        except ValueError:
            # box is not yet created
            logging.info("Box is not yet created")
            sleep(5)
            continue
        sleep(5)


def box(host_url, my_request):
    # the box should get its configuration first
    while True:
        global got_configuration
        if got_configuration:
            sleep(1)
            break
    while True and got_configuration:
        global end
        global jwt_token

        if end:
            break

        with open('configuration.json', 'r') as f:
            data = json.load(f)
            box_id = data['id']

        # deliverer_RFID = '123456789456'
        # customer_RFID = '987654321987'

        RFID_tag_int = get_id_from_tag()
        RFID_tag = str(RFID_tag_int)

        is_authorized = check_authorization(host_url, my_request, jwt_token, RFID_tag, box_id)
        if is_authorized:
            show_led(True)
            try:
                deliver_or_pickup_deliveries(host_url, my_request, jwt_token, RFID_tag, box_id)
            except ValueError:
                logging.info("Something went wrong with getting deliveries.")
                continue
        else:
            show_led(False)


def main(**kwargs):
    if not os.path.exists('Deliveries'):
        os.makedirs('Deliveries')

    argument_dictionary = kwargs

    logging.basicConfig()
    logging.getLogger().setLevel(logging.INFO)

    hostname = '34.159.69.43'  # this is the deployement adress
    if 'localhost' in argument_dictionary:
        hostname = argument_dictionary['localhost'] # change to local custom address

    port = 8081
    host_url = "http://" + hostname + ":" + str(port)

    my_request = RestRequests(hostname, port, host_url)

    # first get jwt token
    global jwt_token
    jwt_token = sign_in(host_url, my_request)

    # then use this token for getting the box
    port = 8082
    host_url = "http://" + hostname + ":" + str(port)
    my_request = RestRequests(hostname, port, host_url)

    updates = threading.Thread(
        target=getUpdates, args=(hostname, host_url, my_request,))
    box_thread = threading.Thread(target=box, args=(host_url, my_request,))
    box_thread.setDaemon(True)

    updates.start()
    box_thread.start()

    updates.join()

    logging.info("Box will shut down...")

    # logout
    port = 8081
    host_url = "http://" + hostname + ":" + str(port)
    my_request = RestRequests(hostname, port, host_url)
    logout(host_url, my_request)


if __name__ == "__main__":
    main(**dict(arg.split('=') for arg in sys.argv[1:]))
    logging.info("Box has shut down.")
