import requests
import json
import cv2
import numpy as np
import urllib
import urllib.request
import tempfile
from skimage import io
import os
import face_recognition

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

images=[]
for url in urls:
	images.append(url_to_image(url))

def save_images_in_tempdir(images, input_image=None):
	paths = []
	with tempfile.TemporaryDirectory() as temp_dir:
		for i in range(len(images)):
			io.imsave(os.path.join(temp_dir, 'missing.jpg'), images[i])
			paths.append(os.path.join(temp_dir, 'missing.jpg'))
		if input_image is not None:
			unknown_image = face_recognition.load_image_file(input_image)
		read_images = []
		for path in paths:
			read_images.append(face_recognition.load_image_file(path))
	print('done')

save_images_in_tempdir(images)





