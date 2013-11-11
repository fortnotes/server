FortNotes
=========

FortNotes is a highly secure online private information manager based on the AES encryption in the browser.
The current stable version - https://bitbucket.org/DarkPark/fortnotes


fortnotes.com/client/
fortnotes.com/sync/
fortnotes.com/api/

app.fortnotes.com
api.fortnotes.com


API

/api/auth

GET /api/v1/notes?limit=20&skip=0
	return a list of last 20 records
POST /api/v1/notes
	submit fields for creating a new note

GET /api/v1/tags
	return a blob with all tags and links
PUT /api/v1/tags
	submit data for updating the tags blob

GET /api/v1/auth
	return api key (32 bytes string base64 encoded)

Response codes:
1	ok
2	wrong API version
3	wrong API context
4	wrong API method