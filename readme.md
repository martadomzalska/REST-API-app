# Contact Management RESTful API

This project is a RESTful API developed for managing a contact list. It allows users to create, read, update, and delete contact information. Additionally, it includes user authentication and avatar management features.

## Introduction

The API was created as part of a learning project to understand the fundamentals of Node.js, Express, MongoDB, and implementing user authentication. It demonstrates the ability to set up a secure RESTful API service with a focus on good practices for authentication and file handling.

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens) for authentication
- Passport.js for authentication strategies


## Endpoints 

GET /api/contacts

Description: Retrieves all contacts.
Executes through: listContacts
Returns: An array of all contacts in JSON format.
Response Status:
200 OK: Success, returns the list of contacts.

GET /api/contacts/:id

Description: Retrieves a contact with a specified identifier.
Executes through: getById
Path Parameters: id - contact identifier.
Returns: Contact with the specified identifier in JSON format.
Response Status:
200 OK: Success, returns the contact.
404 Not Found: Contact with the specified identifier does not exist.

POST /api/contacts

Description: Adds a new contact.
Executes through: addContact
Request Body Parameters (JSON): name, email, phone - mandatory fields.
Returns: The new contact with an assigned identifier in JSON format.
Response Status:
201 Created: Success, contact added.
400 Bad Request: Error, missing mandatory fields in the request.

DELETE /api/contacts/:id

Description: Deletes a contact with a specified identifier.
Executes through: removeContact
Path Parameters: id - contact identifier.
Returns: A confirmation message for contact deletion.
Response Status:
200 OK: Success, contact deleted.
404 Not Found: Contact with the specified identifier does not exist.

PUT /api/contacts/:id

Description: Updates a contact with a specified identifier.
Executes through: updateContact
Path Parameters: id - contact identifier.
Request Body Parameters (JSON): Any fields name, email, phone for updating.
Returns: The updated contact in JSON format.
Response Status:
200 OK: Success, contact updated.
400 Bad Request: Error, missing fields in the request.
404 Not Found: Contact with the specified identifier does not exist.

PATCH /api/contacts/:contactId/favorite

Description: Updates the favorite status of a contact.
Executes through: updateStatusContact
Path Parameters: contactId - contact identifier.
Request Body Parameters (JSON): favorite - update to the favorite field.
Returns: The updated contact with the new favorite status in JSON format.
Response Status:
200 OK: Success, favorite status of the contact updated.
400 Bad Request: Error, missing field in the request.
404 Not Found: Contact with the specified identifier does not exist.

POST /users/signup

Description: Registers a new user.
Executes through: Registration logic
Request Body Parameters (JSON): email, password - mandatory fields for user registration.
Returns:
201 Created: Success, user registered.
400 Bad Request: Error, validation failed (missing or invalid fields).
409 Conflict: Error, email is already in use.

POST /users/login

Description: Logs in a user.
Executes through: Login logic
Request Body Parameters (JSON): email, password - user credentials.
Returns:
200 OK: Success, returns a JWT token and user details.
400 Bad Request: Error, validation failed (missing or invalid fields).
401 Unauthorized: Error, email or password is incorrect.

GET /users/logout

Description: Logs out the current user.
Executes through: Middleware for token validation
Request Header Parameters: Authorization: Bearer {token} - JWT token for authentication.
Returns:
204 No Content: Success, user successfully logged out.
401 Unauthorized: Error, token is invalid or user not authorized.

GET /users/current

Description: Retrieves details of the current user based on the JWT token.
Executes through: Middleware for token validation
Request Header Parameters: Authorization: Bearer {token} - JWT token for authentication.
Returns:
200 OK: Success, returns details of the current user.
401 Unauthorized: Error, token is invalid or user not authorized.

## Commands:
npm start: Starts the server in production mode.

npm run start:dev: Starts the server in development mode.

npm run lint: Runs code checking with ESLint. Execute this before each pull request (PR) and fix all ESLint errors.

npm lint:fix: Similar to the above, but also automatically fixes simple errors.

## Installation

To run this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/martadomzalska/REST-API-app.git
   cd your-repo-name
Install dependencies:

bash
Copy code
npm install
Start the server:

bash
Copy code
npm start
Usage
Once the server is running, access the API endpoints. The Swagger documentation is available at http://localhost:3000/api-docs for detailed information about each endpoint.

## Author
Marta Domzalska