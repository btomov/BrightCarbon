
# BrightCarbon Notes API

A note taking API for BrightCarbon's Senior Backend Developer Interview. 

## Installation

To run this project you'll need the following pre-requisites:

- NodeJS (Recommend v22)
- MongoDB

### To start the project, follow these steps:
```bash
  npm install
  Create a new database called BrightCarbon (or a name of your choosing) 
  Copy the .env.example file, rename to .env, replace with your MongoDB connection string (or just the DB name)
  npm run dev
```
On your initial start the DB will be empty. Try registering a user and logging in.

You can get all related requests by importing the Postman collection from the root folder of the project
## Running Tests

To run tests, run the following command

```bash
  npm run test
```


## Swagger

The SwaggerHub for this project can be found on http://localhost:5000/api-docs/ once the project has been started