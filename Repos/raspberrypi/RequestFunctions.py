import json
import os
import logging


def getBoxConfiguration(hostUrl, my_request, jwt_token):
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


def auth(hostUrl, my_request):
    with open('authentification.json') as json_file:
        auth_from_file = json.load(json_file)

    # auth = HTTPBasicAuth(auth_from_file['username'], auth_from_file['password'])

    r = my_request.httpRequest(
        'POST',
        hostUrl + '/api/auth/signin',
        my_request.getBaseHeader(),
        '',
        auth_from_file  # TODO: get authentifications
    )

    print('authStatusCode=', r.status_code)
    if r.status_code == 200:
        return str(r.content)[2:-1]
    else:
        raise ValueError('Cannot Get JWT')


def get_box_updates(hostUrl, my_request, jwt_token, box_name):
    r = my_request.httpRequest(
        'GET',
        hostUrl + f'/api/boxes/getBox/{box_name}',
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


def get_deliveries(hostUrl, my_request, jwt_token, deliverer_id, customer_id, box_id):
    r = my_request.httpRequest(
        'POST',
        hostUrl + f'/api/delivery/deliverMultipleDeliveries/{deliverer_id}&{customer_id}&{box_id}',
        headers=my_request.getAuthorizationHeaders(jwt_token)
    )
    # TODO: better status codes
    if r.status_code == 200:
        deliveries = r.content.decode()
        deliveries_array = json.loads(deliveries)
        for delivery in deliveries_array:
            delivery_id = delivery['id']
            with open('Deliveries/' + delivery_id + '.json', 'w', encoding='utf-8') as file:
                json.dump(delivery, file, ensure_ascii=False, indent=4)
                file.close()
            logging.info(f"Delivery {delivery_id} successfully delivered.")
    else:
        raise ValueError('Deliveries cannot be delivered by deliverer.')


def pick_up_deliveries(hostUrl, my_request, jwt_token, customer_id):
    r = my_request.httpRequest(
        'POST',
        hostUrl + f'/api/delivery/pickUpMultipleDeliveries/{customer_id}',
        headers=my_request.getAuthorizationHeaders(jwt_token)
    )
    if r.status_code == 200:
        deliveries = r.content.decode()
        deliveries_array = json.loads(deliveries)
        for delivery in deliveries_array:
            delivery_id = delivery['id']
            os.remove('Deliveries/' + delivery_id + '.json')
            logging.info(f"Delivery {delivery_id} successfully picked up.")
    else:
        raise ValueError('Deliveries cannot be delivered by deliverer.')
