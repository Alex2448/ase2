import RestRequests
from RequestFunctions import *
from authentificator import *
from time import sleep
from RestRequests import *
import logging


def main():
    logging.basicConfig()
    logging.getLogger().setLevel(logging.INFO)

    # hostname = 'raspberrypi'
    hostname = 'localhost'
    port = 8080
    hostUrl = "http://" + hostname + ":" + str(port)

    my_request = RestRequests(hostname, port, hostUrl)

    # first get jwt token
    jwt = eval(auth(hostUrl, my_request))
    jwt_token = jwt['token']
    # then use this token for getting the box
    while True:
        try:
            getBoxConfiguration(hostUrl, my_request, jwt_token)

        except ValueError:
            logging.info("Box is not yet created")
            continue
        else:
            logging.info("Configuration of box successful")
            break

    # main Loop
    while True:

        # get box name
        with open('configuration.json', 'r', encoding='utf-8') as file:
            data = json.load(file)
            box_name = data['name']
            box_id = data['id']

        # check if box is updated or deleted
        try:
            get_box_updates(hostUrl, my_request, jwt_token, box_name)
            logging.info("Update")
        except RuntimeError:
            logging.info("Box is deleted")
            break
        except ValueError:
            # box is not yet created
            logging.info("Box is not yet created")
            sleep(5)
            continue
        sleep(2)

        #TODO: authentification as deliverer/customer
        # # get all deliveries
        # deliverer_green, customer_green = authentificate_main()
        #

        deliverer_id = '61a4edee7399af2dabda017c'

        # get customer_id from box configuration
        with open('configuration.json', 'r', encoding='utf-8') as file:
            data = json.load(file)
            customer_id = data['customer']['id']
            file.close()

        # if deliverer is logged in TODO: from raspberryPi
        deliverer_green = True
        if deliverer_green:
            get_deliveries(hostUrl, my_request, jwt_token, deliverer_id, customer_id, box_id)

        sleep(5) #TODO: change

        # if customer is logged in TODO: from raspberryPi
        customer_green = True
        if customer_green:
            pick_up_deliveries(hostUrl, my_request, jwt_token, customer_id)
            pass
        sleep(3)

    logging.info("Box will shut down...")


if __name__ == "__main__":
    main()
    logging.info("Box has shut down.")

