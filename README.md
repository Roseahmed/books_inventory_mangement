# books_store_mangement

Technologies used node js,express js, express-session, passport local strategy for authenticating user and mongodb-Atlas,mongoose database and many more

Requirements for running this node js REST API services 

1.Node latest version (for running the project on localhost)

2.Npm (for installing all the dependencies)

3.Postman (for requesting the server)

Main conecpt of this project,basically there are two types of users 

1.Authenticated users, which can create store and add books to store and perform CURD operation on that particular store.

2.Anonymous users, whch can fetch all the stores and books available in system

Routes:-(you must provide the key and value while requesting server)

1.user login/register/logout and fetch user

http://localhost:3000/login (request type: POST, Body: x-www-form-urlencoded, key: email,password)

http://localhost:3000/register (request type: POST, Body: x-www-form-urlencoded, key: email,password)

http://localhost:3000/user (request type: GET), to check authenticated user credentials

http://localhost:3000/logout (request type: GET), to logout user

2.Creating store and performing CURD operation on store and books(CURD operations can be performed only on current user store and if user is authenticated) 

http://localhost:3000/create-store (request type: PUT, Body: x-www-form-urlencoded, key: storeName,ownerName) for creating current user store

http://localhost:3000/stores/update-store (request type: PATCH, Body: x-www-form-urlencoded, key: storeName,ownerName) for updating current user store

http://localhost:3000/books/add-book (request type: POST, Body: x-www-form-urlencoded, key: bookName,totalStock) for adding book to current user store

http://localhost:3000/books/update-book (request type: PATCH, Body: x-www-form-urlencoded, key: bookId,bookName,totalStock) for updating books in current user store

http://localhost:3000/books/remove-book (request type: DELETE, Body: x-www-form-urlencoded, key: bookId) for deleting books from current user store

3.Fetching all stores and books avaliable in system, any type of user can access it

http://localhost:3000/stores (request type: GET) for fetching all the stores avaliable in system

http://localhost:3000/books (request type: GET) for fetching all the books avalibale in system

http://localhost:3000/books/:bookById (request type: GET) for fetching book by id

