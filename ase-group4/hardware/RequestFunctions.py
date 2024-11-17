import json
import os
import logging
from requests import ConnectionError


def sign_in(hostUrl, my_request):
    with open('authentification.json') as json_file:
        auth_from_file = json.load(json_file)

    # auth = HTTPBasicAuth(auth_from_file['username'], auth_from_file['password'])

    r = my_request.httpRequest(
        'POST',
        hostUrl + '/cas-api/auth/signin',
        my_request.getHeader(),
        '',
        auth_from_file  # TODO: get authentifications
    )

    if r.status_code == 200:
        jwt = eval(str(r.content)[2:-1])
        return jwt['token']
    else:
        raise ValueError('Cannot Get JWT')


def get_box(hostUrl, my_request, jwt_token, box_raspberry_id):
    r = my_request.httpRequest(
        'GET',
        hostUrl + f'/delivery-api/boxes/getBox/{box_raspberry_id}',
        headers=my_request.getHeader(),
        cookies=my_request.getCookie(jwt_token)
    )
    if r.status_code == 401:
        raise ConnectionError('JWT Token is invalid.')
    if r.status_code == 400:
        raise RuntimeError('Box is not in the system registered. Check if it is deleted or not yet initialized.')

    if r.status_code == 200:
        box = r.content.decode()
        box_dict = json.loads(box)
        with open('configuration.json', 'w', encoding='utf-8') as file:
            json.dump(box_dict, file, ensure_ascii=False, indent=4)
    else:
        raise ValueError(f'Box is not yet created: ', r.status_code)


def check_authorization(hostUrl, my_request, jwt_token, RFID, box_id):
    r = my_request.httpRequest(
        'POST',
        hostUrl + f'/delivery-api/deliveries/checkAuthorization/{box_id}/{RFID}',
        headers=my_request.getHeader(),
        cookies=my_request.getCookie(jwt_token)
    )
    if r.status_code == 200:
        return True
    else:
        return False


def deliver_or_pickup_deliveries(hostUrl, my_request, jwt_token, RFID, box_id):
    r = my_request.httpRequest(
        'POST',
        hostUrl + f'/delivery-api/deliveries/deliverOrPickUpMultipleDeliveries/{box_id}/{RFID}',
        headers=my_request.getHeader(),
        cookies=my_request.getCookie(jwt_token)
    )
    if r.status_code == 200:
        deliveries = r.content.decode()
        deliveries_array = json.loads(deliveries)
        for delivery in deliveries_array:
            delivery_id = delivery['id']
            delivery_status = delivery['status']
            if delivery_status == 'DELIVERED':
                with open('Deliveries/' + delivery_id + '.json', 'w', encoding='utf-8') as file:
                    json.dump(delivery, file, ensure_ascii=False, indent=4)
                    file.close()
                logging.info(f"Delivery {delivery_id} successfully delivered.")

            if delivery_status == 'PICKED_UP':
                os.remove('Deliveries/' + delivery_id + '.json')
                logging.info(f"Delivery {delivery_id} successfully picked up.")

    else:  # 400 if no deliveries
        raise ValueError('There are no deliveries.')


def logout(hostUrl, my_request):
    r = my_request.httpRequest(
        'POST',
        hostUrl + '/cas-api/auth/logout',
        my_request.getHeader(),
        ''
    )

    print('authStatusCode=', r.status_code)
    if r.status_code == 200:
        return True
    else:
        raise ValueError('Cannot Logout')
