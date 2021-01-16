import requests
import json
import cv2
import numpy as np
import urllib
import urllib.request


response = requests.get('https://api.fbi.gov/wanted/v1/list')
data = json.loads(response.content)
wanted=[]

page = 1

for i in range(1000):
	response = requests.get('https://api.fbi.gov/wanted/v1/list?page=' + str(page))
	data = json.loads(response.content)
	if not data['items']:
		break
	wanted.extend(data['items'])
	page = data['page'] + 1

urls = []
for item in wanted:
	if item['subjects'] == ['Kidnappings and Missing Persons']:
		a=item['images'][0]['original']
		urls.append(a)

class AppURLopener(urllib.request.FancyURLopener):
    version = "Mozilla/5.0"

opener = AppURLopener()

def url_to_image(url):
	# download the image, convert it to a NumPy array, and then read
	# it into OpenCV format
	resp = opener.open(url)
	image = np.asarray(bytearray(resp.read()), dtype="uint8")
	image = cv2.imdecode(image, cv2.IMREAD_COLOR)
	# return the image
	return image

for url in urls:
	url_to_image(url)



        



