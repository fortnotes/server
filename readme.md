#FortNotes#

FortNotes is a highly secure online private information manager based on the AES encryption in the browser.
The current stable version - <https://bitbucket.org/DarkPark/fortnotes>


##Deployment##

Dependencies:

- [NodeJS](http://nodejs.org/)
- [Node Packaged Modules](https://npmjs.org/)
- [MongoDB](http://www.mongodb.org/)

Install command (for Ubuntu): `sudo apt-get install nodejs npm mongodb`.

Download and install the project files: `npm install fortnotes`.

Run the server with `npm start` or `node server/main.js`.
Now the web client is accessible in a web browser <http://localhost:8080/client/>.

##Development##

`sudo npm install -g grunt-cli`


fortnotes.com/client/
fortnotes.com/sync/
fortnotes.com/api/

app.fortnotes.com
api.fortnotes.com


##API##

Requests:

 Method | Url                              | Description
:------:|:---------------------------------|:----------------------------------------------------------------------
 GET    | /api/v1/auth/**name**            | return user pass salt for hash generation
 POST   | /api/v1/auth/**name**/**pass**   | return api key (base64 encoded 64 bytes string) of the created session
 GET    | /api/v1/sessions?limit=20&skip=0 | return a list of user's sessions
 GET    | /api/v1/sessions/**key**         | return a session info by the given api key
 HEAD   | /api/v1/notes                    | return all notes general info
 GET    | /api/v1/notes                    | return a list of last 20 records
 GET    | /api/v1/notes?limit=20&skip=0    | return a custom list of records
 POST   | /api/v1/notes                    | submit fields for creating a new note
 HEAD   | /api/v1/tags                     | return all tags general info
 GET    | /api/v1/tags                     | return a list of last 20 records
 GET    | /api/v1/tags?limit=20&skip=0     | return a custom list of records
 POST   | /api/v1/tags                     | submit fields for creating a new tag

Response codes:

 Code | Meaning           | Description
:----:|:------------------|:---------------------------------------------------------------
  1   | ok                | successful call
  2   | wrong API version | probably too old api version
  3   | wrong API context | url entity part is wrong - /api/v1/**invalid**
  4   | wrong API method  | the corresponding entity doesn't have this method (GET/POST...)
  5   | wrong auth data   | invalid user name, password or api key

###Authentication###

Two-steps algorithm:

- /api/v1/auth/name
- /api/v1/auth/name/pass


###Client-side data###

There are some stored parameters in the browser localStorage:

 Name             | Description
:-----------------|:-----------------------------------------------------------
 config.auth.key  | api key for authentication (base64 encoded 64 bytes string)
 config.auth.time | api key generation time
