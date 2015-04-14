define({ "api": [
  {
    "type": "get",
    "url": "/notes/:id?limit=:limit&offset=:offset",
    "title": "Get a note old values list.",
    "version": "1.0.0",
    "name": "getNote",
    "group": "Note",
    "permission": [
      {
        "name": "authUser",
        "title": "Authorized user access only.",
        "description": "<p>Requests are valid only in case the user is authorized and have a valid active session.</p> "
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Bearer token for the user session.</p> "
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "id",
            "description": "<p>Note id.</p> "
          },
          {
            "group": "Parameter",
            "type": "number",
            "optional": true,
            "field": "params.limit",
            "description": "<p>Maximum number of records to return.</p> "
          },
          {
            "group": "Parameter",
            "type": "number",
            "optional": true,
            "field": "params.offset",
            "defaultValue": "0",
            "description": "<p>Offset of the first record to return.</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>Note encrypted data.</p> "
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "hash",
            "description": "<p>Hash of note data before encryption.</p> "
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "time",
            "description": "<p>Note history record creation time.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\"data\":\"some data\", \"hash\":\"some hash\", \"time\": 1427190024722},\n]",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl --include --header \"Authorization: Bearer 5nNOF+dNQaHvq...\" http://localhost:9090/notes/128",
        "type": "curl"
      }
    ],
    "filename": "lib/resources/notes.js",
    "groupTitle": "Note",
    "sampleRequest": [
      {
        "url": "http://localhost:9090/notes/:id?limit=:limit&offset=:offset"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"empty session token\"\n}",
          "type": "json"
        },
        {
          "title": "Error 401:",
          "content": "HTTP/1.1 401 Unauthorized\n{\n    \"code\": \"UnauthorizedError\",\n    \"message\": \"invalid session\"\n}",
          "type": "json"
        },
        {
          "title": "Error 400:",
          "content": "HTTP/1.1 400 Bad Request\n{\n    \"code\": \"BadRequestError\",\n    \"message\": \"invalid note id\"\n}",
          "type": "json"
        },
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"request data is missing\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data search failure\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "put",
    "url": "/notes/:id",
    "title": "Update a note with new data.",
    "version": "1.0.0",
    "name": "putNote",
    "group": "Note",
    "permission": [
      {
        "name": "authUser",
        "title": "Authorized user access only.",
        "description": "<p>Requests are valid only in case the user is authorized and have a valid active session.</p> "
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Bearer token for the user session.</p> "
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "id",
            "description": "<p>Note ID.</p> "
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>Note encrypted data.</p> "
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "hash",
            "description": "<p>Hash of note data before encryption.</p> "
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl --include --header \"Authorization: Bearer 5nNOF+dNQaHvq...\" --data \"data=qwe&hash=rty\" --request PUT http://localhost:9090/notes/128",
        "type": "curl"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n\ntrue",
          "type": "json"
        }
      ]
    },
    "filename": "lib/resources/notes.js",
    "groupTitle": "Note",
    "sampleRequest": [
      {
        "url": "http://localhost:9090/notes/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"empty session token\"\n}",
          "type": "json"
        },
        {
          "title": "Error 401:",
          "content": "HTTP/1.1 401 Unauthorized\n{\n    \"code\": \"UnauthorizedError\",\n    \"message\": \"invalid session\"\n}",
          "type": "json"
        },
        {
          "title": "Error 400:",
          "content": "HTTP/1.1 400 Bad Request\n{\n    \"code\": \"BadRequestError\",\n    \"message\": \"invalid note id\"\n}",
          "type": "json"
        },
        {
          "title": "Error 404:",
          "content": "HTTP/1.1 404 Not Found\n{\n    \"code\": \"NotFoundError\",\n    \"message\": \"resource was not found\"\n}",
          "type": "json"
        },
        {
          "title": "Error 400:",
          "content": "HTTP/1.1 400 Bad Request\n{\n    \"code\": \"InvalidContentError\",\n    \"message\": \"content data is too big\"\n}",
          "type": "json"
        },
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"request data is missing\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data search failure\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data creation failure\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data saving failure\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"transaction initialization failure\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"transaction committing failure\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/notes?limit=:limit&offset=:offset",
    "title": "Receive a list of user notes.",
    "version": "1.0.0",
    "name": "getNotes",
    "group": "Notes",
    "permission": [
      {
        "name": "authUser",
        "title": "Authorized user access only.",
        "description": "<p>Requests are valid only in case the user is authorized and have a valid active session.</p> "
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Bearer token for the user session.</p> "
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": true,
            "field": "params.limit",
            "description": "<p>Maximum number of records to return.</p> "
          },
          {
            "group": "Parameter",
            "type": "number",
            "optional": true,
            "field": "params.offset",
            "defaultValue": "0",
            "description": "<p>Offset of the first record to return.</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "id",
            "description": "<p>User note ID.</p> "
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>Note encrypted data.</p> "
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "hash",
            "description": "<p>Hash of note data before encryption.</p> "
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "createTime",
            "description": "<p>Note creation time.</p> "
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "updateTime",
            "description": "<p>Note modification time.</p> "
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "readTime",
            "description": "<p>Note last access time.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\"id\": 512, \"data\":\"some data\", \"hash\":\"some hash\", \"createTime\": 1427190024722, \"updateTime\": 0, \"readTime\": 0},\n    {\"id\": 513, \"data\":\"some data\", \"hash\":\"some hash\", \"createTime\": 1427190838740, \"updateTime\": 1427201953944, \"readTime\": 0},\n    {\"id\": 513, \"data\":\"some data\", \"hash\":\"some hash\", \"createTime\": 1427190838740, \"updateTime\": 1427201953944, \"readTime\": 1427201959845}\n]",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl --include --header \"Authorization: Bearer 5nNOF+dNQaHvq...\" http://localhost:9090/notes",
        "type": "curl"
      }
    ],
    "filename": "lib/resources/notes.js",
    "groupTitle": "Notes",
    "sampleRequest": [
      {
        "url": "http://localhost:9090/notes?limit=:limit&offset=:offset"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"empty session token\"\n}",
          "type": "json"
        },
        {
          "title": "Error 401:",
          "content": "HTTP/1.1 401 Unauthorized\n{\n    \"code\": \"UnauthorizedError\",\n    \"message\": \"invalid session\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data search failure\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/notes",
    "title": "Create a user note.",
    "version": "1.0.0",
    "name": "postNotes",
    "group": "Notes",
    "permission": [
      {
        "name": "authUser",
        "title": "Authorized user access only.",
        "description": "<p>Requests are valid only in case the user is authorized and have a valid active session.</p> "
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Bearer token for the user session.</p> "
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>Note encrypted data.</p> "
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "hash",
            "description": "<p>Hash of note data before encryption.</p> "
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl --include --header \"Authorization: Bearer 5nNOF+dNQaHvq...\" --request POST http://localhost:9090/notes",
        "type": "curl"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n\n{id:512}",
          "type": "json"
        }
      ]
    },
    "filename": "lib/resources/notes.js",
    "groupTitle": "Notes",
    "sampleRequest": [
      {
        "url": "http://localhost:9090/notes"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"empty session token\"\n}",
          "type": "json"
        },
        {
          "title": "Error 401:",
          "content": "HTTP/1.1 401 Unauthorized\n{\n    \"code\": \"UnauthorizedError\",\n    \"message\": \"invalid session\"\n}",
          "type": "json"
        },
        {
          "title": "Error 400:",
          "content": "HTTP/1.1 400 Bad Request\n{\n    \"code\": \"InvalidContentError\",\n    \"message\": \"content data is too big\"\n}",
          "type": "json"
        },
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"request data is missing\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data creation failure\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/profile/pass",
    "title": "Receive user master password data.",
    "version": "1.0.0",
    "name": "getPass",
    "group": "Profile",
    "permission": [
      {
        "name": "authUser",
        "title": "Authorized user access only.",
        "description": "<p>Requests are valid only in case the user is authorized and have a valid active session.</p> "
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Bearer token for the user session.</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "salt",
            "description": "<p>User master password salt.</p> "
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "hash",
            "description": "<p>User master password sha512 hash.</p> "
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "time",
            "description": "<p>User master password modification time.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n\n{\"data\":\"...\",\"hash\":\"...\",\"time\":1428777153259}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl --include --header \"Authorization: Bearer 5nNOF+dNQaHvq...\" http://localhost:9090/profile/pass",
        "type": "curl"
      }
    ],
    "filename": "lib/resources/profile.js",
    "groupTitle": "Profile",
    "sampleRequest": [
      {
        "url": "http://localhost:9090/profile/pass"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"empty session token\"\n}",
          "type": "json"
        },
        {
          "title": "Error 401:",
          "content": "HTTP/1.1 401 Unauthorized\n{\n    \"code\": \"UnauthorizedError\",\n    \"message\": \"invalid session\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data search failure\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "put",
    "url": "/profile/pass",
    "title": "Save user master password data.",
    "version": "1.0.0",
    "name": "setPath",
    "group": "Profile",
    "permission": [
      {
        "name": "authUser",
        "title": "Authorized user access only.",
        "description": "<p>Requests are valid only in case the user is authorized and have a valid active session.</p> "
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Bearer token for the user session.</p> "
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "salt",
            "description": "<p>User master password salt.</p> "
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "hash",
            "description": "<p>User master password sha512 hash.</p> "
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl --include --header \"Authorization: Bearer 5nNOF+dNQaHvq...\" --data \"salt=[pass salt]&hash=[sha512 hash of pass]\" --request PUT http://localhost:9090/profile/pass",
        "type": "curl"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n\ntrue",
          "type": "json"
        }
      ]
    },
    "filename": "lib/resources/profile.js",
    "groupTitle": "Profile",
    "sampleRequest": [
      {
        "url": "http://localhost:9090/profile/pass"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"empty session token\"\n}",
          "type": "json"
        },
        {
          "title": "Error 401:",
          "content": "HTTP/1.1 401 Unauthorized\n{\n    \"code\": \"UnauthorizedError\",\n    \"message\": \"invalid session\"\n}",
          "type": "json"
        },
        {
          "title": "Error 400:",
          "content": "HTTP/1.1 400 Bad Request\n{\n    \"code\": \"InvalidContentError\",\n    \"message\": \"content data is too big\"\n}",
          "type": "json"
        },
        {
          "title": "Error 404:",
          "content": "HTTP/1.1 404 Not Found\n{\n    \"code\": \"NotFoundError\",\n    \"message\": \"resource was not found\"\n}",
          "type": "json"
        },
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"request data is missing\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data search failure\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data saving failure\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "delete",
    "url": "/sessions/:id",
    "title": "Terminate the given user session.",
    "version": "1.0.0",
    "name": "deleteSessionItem",
    "group": "Session",
    "permission": [
      {
        "name": "authUser",
        "title": "Authorized user access only.",
        "description": "<p>Requests are valid only in case the user is authorized and have a valid active session.</p> "
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Bearer token for the user session.</p> "
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "id",
            "description": "<p>User session ID.</p> "
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl --include --header \"Authorization: Bearer 5nNOF+dNQaHvq...\" --request DELETE http://localhost:9090/sessions/128",
        "type": "curl"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n\ntrue",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error 400:",
          "content": "HTTP/1.1 400 Bad Request\n{\n    \"code\": \"BadRequestError\",\n    \"message\": \"invalid session\"\n}",
          "type": "json"
        },
        {
          "title": "Error 400:",
          "content": "HTTP/1.1 400 Bad Request\n{\n    \"code\": \"BadRequestError\",\n    \"message\": \"session is already terminated\"\n}",
          "type": "json"
        },
        {
          "title": "Error 404:",
          "content": "HTTP/1.1 404 Not Found\n{\n    \"code\": \"NotFoundError\",\n    \"message\": \"resource was not found\"\n}",
          "type": "json"
        },
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"empty session token\"\n}",
          "type": "json"
        },
        {
          "title": "Error 401:",
          "content": "HTTP/1.1 401 Unauthorized\n{\n    \"code\": \"UnauthorizedError\",\n    \"message\": \"invalid session\"\n}",
          "type": "json"
        },
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"request data is missing\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data saving failure\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "lib/resources/sessions.js",
    "groupTitle": "Session",
    "sampleRequest": [
      {
        "url": "http://localhost:9090/sessions/:id"
      }
    ]
  },
  {
    "type": "put",
    "url": "/sessions/:id",
    "title": "Activate a new session with the code sent to the user email address.",
    "version": "1.0.0",
    "name": "putSessionItem",
    "group": "Session",
    "permission": [
      {
        "name": "none"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "id",
            "description": "<p>User session ID.</p> "
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "code",
            "description": "<p>Session activation code.</p> "
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl --include --data \"code=fd28f002ea673d316e\" --request PUT http://localhost:9090/sessions/128",
        "type": "curl"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n\ntrue",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error 400:",
          "content": "HTTP/1.1 400 Bad Request\n{\n    \"code\": \"BadRequestError\",\n    \"message\": \"invalid session or confirmation code\"\n}",
          "type": "json"
        },
        {
          "title": "Error 404:",
          "content": "HTTP/1.1 404 Not Found\n{\n    \"code\": \"NotFoundError\",\n    \"message\": \"resource was not found\"\n}",
          "type": "json"
        },
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"request data is missing\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data search failure\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data saving failure\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "lib/resources/sessions.js",
    "groupTitle": "Session",
    "sampleRequest": [
      {
        "url": "http://localhost:9090/sessions/:id"
      }
    ]
  },
  {
    "type": "get",
    "url": "/sessions?limit=:limit&offset=:offset",
    "title": "Receive a list of user sessions.",
    "version": "1.0.0",
    "name": "getSessions",
    "group": "Sessions",
    "permission": [
      {
        "name": "authUser",
        "title": "Authorized user access only.",
        "description": "<p>Requests are valid only in case the user is authorized and have a valid active session.</p> "
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Bearer token for the user session.</p> "
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": true,
            "field": "params.limit",
            "description": "<p>Maximum number of records to return.</p> "
          },
          {
            "group": "Parameter",
            "type": "number",
            "optional": true,
            "field": "params.offset",
            "defaultValue": "0",
            "description": "<p>Offset of the first record to return.</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "id",
            "description": "<p>User session ID.</p> "
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "createTime",
            "description": "<p>Session creation time.</p> "
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "confirmTime",
            "description": "<p>Session activation time.</p> "
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "deleteTime",
            "description": "<p>Session termination time.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\"id\": 128, \"createTime\": 1427190024722, \"confirmTime\": 0, \"deleteTime\": 0},\n    {\"id\": 129, \"createTime\": 1427190838740, \"confirmTime\": 1427201953944, \"deleteTime\": 0},\n    {\"id\": 129, \"createTime\": 1427190838740, \"confirmTime\": 1427201953944, \"deleteTime\": 1427201959845}\n]",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl --include --header \"Authorization: Bearer 5nNOF+dNQaHvq...\" http://localhost:9090/sessions",
        "type": "curl"
      }
    ],
    "filename": "lib/resources/sessions.js",
    "groupTitle": "Sessions",
    "sampleRequest": [
      {
        "url": "http://localhost:9090/sessions?limit=:limit&offset=:offset"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"empty session token\"\n}",
          "type": "json"
        },
        {
          "title": "Error 401:",
          "content": "HTTP/1.1 401 Unauthorized\n{\n    \"code\": \"UnauthorizedError\",\n    \"message\": \"invalid session\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data search failure\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "post",
    "url": "/sessions",
    "title": "Initialize a new session for the given email address.",
    "version": "1.0.0",
    "name": "postSessions",
    "group": "Sessions",
    "permission": [
      {
        "name": "none"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "email",
            "description": "<p>User email address.</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "id",
            "description": "<p>Generated user session ID.</p> "
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>Generated user session bearer token.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"id\": 128,\n    \"token\": \"2r1W5ItJN4GlqK2teD77JLZGddf0unnvAlKv+SAl7VCViStq5VcLgkmFZ85iyBS4Wmp1omOnXNlKeQkoM+UmBt/oMda91ovjNlUR8Kl2oG8Hec+Hrijy8xp3+qQwg1qs\"\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl --include --data \"email=test@gmail.com\" http://localhost:9090/sessions",
        "type": "curl"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"RNG failure\"\n}",
          "type": "json"
        },
        {
          "title": "Error 404:",
          "content": "HTTP/1.1 404 Not Found\n{\n    \"code\": \"NotFoundError\",\n    \"message\": \"resource was not found\"\n}",
          "type": "json"
        },
        {
          "title": "Error 400:",
          "content": "HTTP/1.1 400 Bad Request\n{\n    \"code\": \"InvalidContentError\",\n    \"message\": \"content data is too big\"\n}",
          "type": "json"
        },
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"request data is missing\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data creation failure\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "lib/resources/sessions.js",
    "groupTitle": "Sessions",
    "sampleRequest": [
      {
        "url": "http://localhost:9090/sessions"
      }
    ]
  },
  {
    "type": "get",
    "url": "/tags",
    "title": "Receive user tags data.",
    "version": "1.0.0",
    "name": "getTags",
    "group": "Tags",
    "permission": [
      {
        "name": "authUser",
        "title": "Authorized user access only.",
        "description": "<p>Requests are valid only in case the user is authorized and have a valid active session.</p> "
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Bearer token for the user session.</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>User tags encrypted data.</p> "
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "hash",
            "description": "<p>Hash of tags data before encryption.</p> "
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "time",
            "description": "<p>Tags modification time.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success (no tags):",
          "content": "HTTP/1.1 200 OK\n\n{\"data\":\"...\",\"hash\":\"...\",\"time\":1428777153259}",
          "type": "json"
        },
        {
          "title": "Success (some data):",
          "content": "HTTP/1.1 200 OK\n\n{\"data\":null,\"hash\":null,\"time\":0}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl --include --header \"Authorization: Bearer 5nNOF+dNQaHvq...\" http://localhost:9090/tags",
        "type": "curl"
      }
    ],
    "filename": "lib/resources/tags.js",
    "groupTitle": "Tags",
    "sampleRequest": [
      {
        "url": "http://localhost:9090/tags"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"empty session token\"\n}",
          "type": "json"
        },
        {
          "title": "Error 401:",
          "content": "HTTP/1.1 401 Unauthorized\n{\n    \"code\": \"UnauthorizedError\",\n    \"message\": \"invalid session\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data search failure\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "put",
    "url": "/tags",
    "title": "Save user tags data.",
    "version": "1.0.0",
    "name": "putTags",
    "group": "Tags",
    "permission": [
      {
        "name": "authUser",
        "title": "Authorized user access only.",
        "description": "<p>Requests are valid only in case the user is authorized and have a valid active session.</p> "
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Bearer token for the user session.</p> "
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>User tags encrypted data.</p> "
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "hash",
            "description": "<p>Hash of tags data before encryption.</p> "
          },
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "amount",
            "description": "<p>Amount of user tags in tags encrypted data.</p> "
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl --include --header \"Authorization: Bearer 5nNOF+dNQaHvq...\" --data \"data=[encrypted data]&hash=[sha512 hash of data]&amount=16\" --request PUT http://localhost:9090/tags",
        "type": "curl"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n\ntrue",
          "type": "json"
        }
      ]
    },
    "filename": "lib/resources/tags.js",
    "groupTitle": "Tags",
    "sampleRequest": [
      {
        "url": "http://localhost:9090/tags"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"empty session token\"\n}",
          "type": "json"
        },
        {
          "title": "Error 401:",
          "content": "HTTP/1.1 401 Unauthorized\n{\n    \"code\": \"UnauthorizedError\",\n    \"message\": \"invalid session\"\n}",
          "type": "json"
        },
        {
          "title": "Error 400:",
          "content": "HTTP/1.1 400 Bad Request\n{\n    \"code\": \"InvalidContentError\",\n    \"message\": \"content data is too big\"\n}",
          "type": "json"
        },
        {
          "title": "Error 404:",
          "content": "HTTP/1.1 404 Not Found\n{\n    \"code\": \"NotFoundError\",\n    \"message\": \"resource was not found\"\n}",
          "type": "json"
        },
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"request data is missing\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data search failure\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data saving failure\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "get",
    "url": "/users/:email/keys/current",
    "title": "Get user public key by email.",
    "version": "1.0.0",
    "name": "getUserKey",
    "group": "Users",
    "permission": [
      {
        "name": "none"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "email",
            "description": "<p>User email address.</p> "
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl --include http://localhost:9090/users/test@gmail.com/keys/current",
        "type": "curl"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n\n{\"key\": \"[key data]\"}",
          "type": "json"
        }
      ]
    },
    "filename": "lib/resources/users.js",
    "groupTitle": "Users",
    "sampleRequest": [
      {
        "url": "http://localhost:9090/users/:email/keys/current"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error 404:",
          "content": "HTTP/1.1 404 Not Found\n{\n    \"code\": \"NotFoundError\",\n    \"message\": \"resource was not found\"\n}",
          "type": "json"
        },
        {
          "title": "Error 409:",
          "content": "HTTP/1.1 409 Conflict\n{\n    \"code\": \"MissingParameterError\",\n    \"message\": \"request data is missing\"\n}",
          "type": "json"
        },
        {
          "title": "Error 500:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"code\": \"InternalServerError\",\n    \"message\": \"data search failure\"\n}",
          "type": "json"
        }
      ]
    }
  }
] });