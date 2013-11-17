FortNotes
=========

FortNotes is a highly secure online private information manager based on the AES encryption in the browser.
The current stable version - https://bitbucket.org/DarkPark/fortnotes


Deployment
----------

Dependencies:

- NodeJS
- Node Packaged Modules
- MongoDB

Install command (for Ubuntu): `sudo apt-get install nodejs npm mongodb`.

Download and install the project files: `npm install fortnotes`.

Run the server with `npm start` or `node server/main.js`.
Now the web client is accessible on <http://localhost:8080/client/>.

Development
-----------

`sudo npm install -g grunt-cli`


fortnotes.com/client/
fortnotes.com/sync/
fortnotes.com/api/

app.fortnotes.com
api.fortnotes.com


API
---

 Method | Url                           | Description
:------:|:------------------------------|:-----------------------------------------------
  GET   | /api/v1/auth                  | return api key (32 bytes string base64 encoded)
  GET   | /api/v1/notes                 | return a list of last 20 records
  GET   | /api/v1/notes?limit=20&skip=0 | return a custom list of records
  POST  | /api/v1/notes                 | submit fields for creating a new note
  GET   | /api/v1/tags                  | return a blob with all tags and links
  PUT   | /api/v1/tags                  | submit data for updating the tags blob

Response codes:

 Code | Meaning
:----:|:-----------------
  1   | ok
  2   | wrong API version
  3   | wrong API context
  4   | wrong API method