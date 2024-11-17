import requests
from requests import Session
from requests import status_codes
from requests.models import to_key_val_list

# hostname = 'raspberrypi'
hostname = 'localhost'
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
    r = httpRequest('GET', hostUrl + '/api/auth/csrf', params)
    print(r.status_code)
    if (r.status_code == 200):
        return (r.cookies.get_dict()['XSRF-TOKEN'])
    else:
        raise ValueError('Request Unsuccesfull')


def auth(xsrf_token):
    r = httpRequest(
        'POST',
        hostUrl + '/api/auth',
        params,
        getBaseHeaders(xsrf_token),
        '',
        ('Jane', 'Jane')  # TODO: get authentifications
    )

    print('authStatusCode=', r.status_code)
    if (r.status_code == 200):
        return str(r.content)[2:-1]
    else:
        raise ValueError('Cannot Get JWT')


def createProject(content, xsrf_token):
    r = httpRequest(
        'POST',
        hostUrl + '/project',
        params,
        getBaseHeaders(xsrf_token),
        content
    )
    print("Status code insert project", r.status_code)
    if r.status_code == 200:
        project = r.json()
        return project
    else:
        raise ValueError('Project Not Created')


token = getXSRFToken()
jwt = auth(token)
res = createProject({"name": "ASE Smart PC3"}, token)
print(res)
