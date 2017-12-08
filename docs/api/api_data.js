define({ "api": [
  {
    "type": "get",
    "url": "/info",
    "title": "Greeting from server",
    "version": "1.0.0",
    "name": "GetInfo",
    "group": "Pushnotificationservice",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Greeting",
            "description": "<p>from server.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"Welcome to the user service\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "src/routes.js",
    "groupTitle": "Pushnotificationservice"
  },
  {
    "type": "post",
    "url": "/getpushtoken",
    "title": "gets the push token.",
    "version": "1.0.0",
    "name": "Getpushtoken",
    "group": "Pushnotificationservice",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "owner_id",
            "description": "<p>Users unique id.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "success",
            "description": "<p>success information.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n \"success\": \"true\",\n \"pushtoken\": \"98434732897839\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 403 Not Found\n{\n  \"success\": \"false\",\n  \"msg\": \"Authentication failed.\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "src/routes.js",
    "groupTitle": "Pushnotificationservice"
  },
  {
    "type": "post",
    "url": "/savepushtoken",
    "title": "saves the push token.",
    "version": "1.0.0",
    "name": "Savepushtoken",
    "group": "Pushnotificationservice",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-key",
            "description": "<p>Users unique access-key.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "token",
            "description": "<p>token information.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n \"success\": \"true\",\n \"pushtoken\": \"98434732897839\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 403 Not Found\n{\n  \"success\": \"false\",\n  \"msg\": \"Authentication failed.\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "src/routes.js",
    "groupTitle": "Pushnotificationservice"
  }
] });
