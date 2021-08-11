# zWallet API 

### `Tools & App builder`

1. Node Js
2. Express Js
3. MySql
4. bcrypt
5. cors
6. express fileupload
7. express validator
8. ioredis
9. jwt
10. uuid
11. nodemailer
12. eslint

### `Auth`

| Feature | Method | Link |
| ----------- | ----------- | ----------- |
| Login | post | http://localhost:4000/users/login
| Register | post | http://localhost:4000/users/
| Forgot password | post | http://localhost:4000/users/forgotpassword

### `Main`
| Feature | Method | Link |
| ----------- | ----------- | ----------- |
| Show user | get | http://localhost:4000/users/:id
| Get all user | get | http://localhost:4000/users/
| Get data transactions | get | http://localhost:4000/main/transaction
| Show transactions | get | http://localhost:4000/main/transaction/:id
| Transfer | post | http://localhost:4000/main/transfer
| Top Up | post | http://localhost:4000/main/topup