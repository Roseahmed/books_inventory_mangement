# books_store_mangement

Technologies used node js,express js, express-session, passport local strategy for authenticating user and mongodb-Atlas,mongoose database and many more

# Requirements for running project (REST API Service) 

1. Install all the dependecies

2. Node (latest version recommended)

3. Mongodb database

4. Postman

# Main conecpt of this project:

1. Authenticated users: Can create store and add books to store and perform CRUD operation on that particular store.

2. Anonymous users: Can fetch all the stores and books available in system

# Routes: (key and value must be provided while requesting server)

1.User login/register/logout and fetch

http://localhost:3000/login (request type: POST, Body: x-www-form-urlencoded, key: email,password)

http://localhost:3000/register (request type: POST, Body: x-www-form-urlencoded, key: email,password)

http://localhost:3000/me (request type: GET): Check authenticated user credentials

http://localhost:3000/logout (request type: GET): Logout user

2.Create store and performing CRUD operation on store and books (CRUD operations can be performed only on current user store and if user is authenticated) 

http://localhost:3000/create-store (request type: PUT, Body: x-www-form-urlencoded, key: storeName,ownerName): Create current user store

http://localhost:3000/stores/update-store (request type: PATCH, Body: x-www-form-urlencoded, key: storeName,ownerName): Update current user store

http://localhost:3000/books/add-book (request type: POST, Body: x-www-form-urlencoded, key: bookName,totalStock): Add book to current user store

http://localhost:3000/books/update-book (request type: PATCH, Body: x-www-form-urlencoded, key: bookId,bookName,totalStock): Update books in current user store

http://localhost:3000/books/remove-book (request type: DELETE, Body: x-www-form-urlencoded, key: bookId): Delete books from current user store

3.Fetch all stores and books avaliable in system, any type of user can access it

http://localhost:3000/stores (request type: GET): Fetch all the stores avaliable in system

http://localhost:3000/books (request type: GET): Fetch all the books avalibale in system

http://localhost:3000/books/:bookById (request type: GET): Fetch book by id

