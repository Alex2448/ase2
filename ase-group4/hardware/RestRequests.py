import requests


class RestRequests:

    def __init__(self, hostname, port, host_url):
        self.session = requests.Session()
        self.hostname = hostname
        self.port = port
        self.host_url = host_url

    def httpRequest(self, method, url, headers, content='', auth='', cookies=''):
        if method == 'GET':
            res = self.session.get(url, headers=headers, cookies=cookies)
            return res
        elif method == 'POST':
            if auth == '':
                res = self.session.post(url, headers=headers, json=content, cookies=cookies)
            else:
                res = self.session.post(url, headers=headers, json=auth)
            return res
        else:
            raise ValueError('Method Not Found')

    def getHeader(self):
        return {
            "Content-Type": "application/json",
            "accept": "*/*",
            "connection": "keep-alive"
        }

    def getCookie(self, jwt_token):
        return {'jwt': f'{jwt_token}'}
