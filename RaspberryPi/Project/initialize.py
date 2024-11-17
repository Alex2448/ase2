import json
from main import *


# def remove_prefix(text, prefix):
#     return text[text.startswith(prefix) and len(prefix):]
#


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
