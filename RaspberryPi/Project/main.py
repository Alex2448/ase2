import RestRequests
import json
from initialize import *
from authentificator import *
from time import sleep
from RestRequests import *
import logging


def get_deliveries(hostUrl, my_request, jwt_token):
    # TODO: customerID mitgeben
    r = my_request.httpRequest(
        'GET',
        hostUrl + '/api/boxes/NewBoxConfiguration',
        headers=my_request.getAuthorizationHeaders(jwt_token)
    )
    if (r.status_code == 200):
        box = r.content.decode()
        box_dict = json.loads(box)
        with open('configuration.json', 'w', encoding='utf-8') as file:
            json.dump(box_dict, file, ensure_ascii=False, indent=4)
    else:
        raise ValueError('Box is not yet created')


def get_box_updates(hostUrl, my_request, jwt_token, box_name):
    r = my_request.httpRequest(
        'GET',
        hostUrl + f'/api/boxes/{box_name}',
        headers=my_request.getAuthorizationHeaders(jwt_token)
    )
    if r.status_code == 400:
        raise RuntimeError('Box is deleted')

    if r.status_code == 200:
        box = r.content.decode()
        box_dict = json.loads(box)
        with open('configuration.json', 'w', encoding='utf-8') as file:
            json.dump(box_dict, file, ensure_ascii=False, indent=4)
    else:
        raise ValueError(f'Box is not yet created: ', r.status_code)


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
    while True:
        # then use this token for getting the box
        try:
            getBoxConfiguration(hostUrl, my_request, jwt_token)

        except ValueError:
            logging.info("Box is not yet created")
            continue
        else:
            logging.info("Configuration of box successful")
            break

    while True:

        # get box name
        with open('configuration.json', 'r', encoding='utf-8') as file:
            data = json.load(file)
            box_name = data['name']


        logging.info("Here")

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

        # # get all deliveries
        # deliverer_green, user_green = authentificate_main()
        #
        #
        # if deliverer_green:
        #     # TODO: give authentification as deliverer
        #     get_deliveries(hostUrl, my_request, jwt_token)
        #
        # if user_green:
        #     pass
        # sleep(3)
    logging.info("Box will shut down...")


if __name__ == "__main__":
    main()
