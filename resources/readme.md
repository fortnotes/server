## API ##

Requests:

 Method | Url                              | Description
:------:|:---------------------------------|:----------------------------------------------------------------------
 GET    | /api/v1/auth/**name**            | return user ip and pass salt for hash generation
 POST   | /api/v1/auth/**name**/**pass**   | return api key (base64 encoded 64 bytes string) of the created session
 GET    | /api/v1/sessions?limit=20&skip=0 | return a list of user's sessions
 GET    | /api/v1/sessions/**key**         | return a session info by the given api key
 PUT    | /api/v1/sessions/**key**         | session refresh and check that it is still valid (should be done on each SPA reload), on success returns the previous access time
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
