import requests
import json



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

        



