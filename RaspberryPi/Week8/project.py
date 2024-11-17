import requests
from requests import Session
from requests import status_codes
from requests.models import to_key_val_list

hostname = 'raspberrypi'
port = 8080
hostUrl = "http://" + hostname + ":" + str(port)

session = requests.Session()
params = {
    'mode': 'cors',
    'cache': 'no-cache',
    'credentials': 'include',
    'redirect': 'follow',
    'referrerPolicy': 'origin-when-cross-origin'
}


def httpRequest(method, url, params, headers='', content='', auth=''):
    if method == 'GET':
        res = session.get(url, params=params)
        return res
    elif method == 'POST':
        if auth == '':
            res = session.post(url, params=params, headers=headers, json=content)
        else:
            res = session.post(url, params=params, headers=headers, auth=auth)
        return res
    else:
        raise ValueError('Method Not Found')


def getBaseHeaders(xsrf_token):
    return {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": xsrf_token
    }


def getXSRFToken():
    r = httpRequest('GET', hostUrl + '/auth/csrf', params)
    if r.status_code == 200:
        return r.text
        print('Success!')
    elif r.status_code == 404:
        print('Not Found.')
    else:
        print('Error ocurred, see code: ', r.status_code)
    # TODO: 1. Check response status and return the xsrf token or throw an exception


def auth(xsrf_token):
    r = httpRequest(
        'POST',
        hostUrl + '/auth',
        params
        # TODO 2. Include the base headers
        # TODO: 3. use basic auth
    )

    print('authStatusCode=', r.status_code)
    # TODO: 4. Check Response status and return the jwt token or throw an exception


def createProject(content, xsrf_token):
    r = httpRequest(
        'POST',
        hostUrl + '/project',
        params  # TODO: ,
        # TODO: 5. include the base headers
        # TODO: 6. add the request body
    )
    print("Status code insert project", r.status_code)
    # TODO: 7. Check response status and return projects or throw an exception


token = getXSRFToken()
jwt = auth(token)
res = createProject({"name": "ASE Smart PC3"}, token)
