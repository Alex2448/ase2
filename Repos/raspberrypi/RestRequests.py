import requests


class RestRequests:

    def __init__(self, hostname, port, host_url):
        self.session = requests.Session()
        self.hostname = hostname
        self.port = port
        self.host_url = host_url

    def httpRequest(self, method, url, headers, content='', auth=''):
        if method == 'GET':
            res = self.session.get(url, headers=headers)
            return res
        elif method == 'POST':
            if auth == '':
                res = self.session.post(url, headers=headers, json=content)
            else:
                res = self.session.post(url, headers=headers, json=auth)
            return res
        else:
            raise ValueError('Method Not Found')

    def getBaseHeader(self):
        return {
            "Content-Type": "application/json",
            "accept": "*/*",
            "connection": "keep-alive"
        }

    def getAuthorizationHeaders(self, jwt_token):
        return {
            "Content-Type": "application/json",
            "accept": "*/*",
            "connection": "keep-alive",
            "Authorization": f"Bearer {jwt_token}"
        }
