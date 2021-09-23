<br />
<p align="center">
<div align="center">
  <img height="300" src="/src/assets/img/zwallet.png"/>
</div>
  <h3 align="center">Backend Zwallet</h3>
  <p align="center">
    <a href="https://github.com/aryairama/zwallet-express"><strong>Explore the docs »</strong></a>
    <br />
    <a href="https://bit.ly/_zwallet">View Demo</a>
    ·
    <a href="https://github.com/aryairama/zwallet-express/issues">Report Bug</a>
    ·
    <a href="https://github.com/aryairama/zwallet-express/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Setup .env example](#setup-env-example)
- [Rest Api](#rest-api)
- [Contributing](#contributing)
- [Related Project](#related-project)
- [Our Team](#our-team)
- [Contact](#contact)



<!-- ABOUT THE PROJECT -->
## About The Project

This is the API for the Zwallet application, one of which is to handle money transfers between users, top up money manually or through payment gateways, manage topups, and others.

### Built With

- [Node.js](https://nodejs.org/en/)
- [Express.js](https://expressjs.com/)
- [JSON Web Tokens](https://jwt.io/)
- [Nodemailer]('https://nodemailer.com/about/')
- and other

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.

* [nodejs](https://nodejs.org/en/download/)

### Requirements
* [Node.js](https://nodejs.org/en/)
* [Postman](https://www.getpostman.com/) for testing
* [Database](https://drive.google.com/drive/folders/11nolsYnWC3h_4pzD7fuKJnV29yHlzlqM?usp=sharing)

### Installation

- Clone This Back End Repo
```
git clone https://github.com/aryairama/zwallet-express.git
```
- Go To Folder Repo
```
cd zwallet-express
```
- Install Module
```
npm install
```
- Make a new database and import [zwallet.sql](https://drive.google.com/drive/folders/11nolsYnWC3h_4pzD7fuKJnV29yHlzlqM?usp=sharing)
- <a href="#setup-env-example">Setup .env</a>
- Starting application
```
npm run serve
```

### Setup .env example

Create .env file in your root project folder.

```env
# Database
DB_HOST = [DB_HOST]
DB_USER = = [DB_USER]
DB_NAME = [DB_NAME]
DB_PASSWORD = [DB_PASSWORD]
DB_PORT = [DB_PORT]
# Aplication
PORT = [PORT_APLICATION]
# Secret key for jwt token
VERIF_SECRET_KEY = [SECRET_KEY_JWT]
FORGOT_PW_SECRET_KEY = [SECRET_KEY_JWT]
ACCESS_SECRET_KEY = [SECRET_KEY_JWT]
REFRESH_TOKEN_SECRET_KEY = [SECRET_KEY_JWT]
# Redis
HOST_REDIS = [REDIS_HOST]
PORT_REDIS = [REDIS_PORT]
AUTH_REDIS = [REDIS_AUTH]
PATH_REDIS = [REDIS_UNIX_SOCKET]
PREFIX_REDIS = [PREFIX-REDIS]
# IP/SOCKET
# Sendmailer SMTP
NODEMAILER_HOST = [SMTP_HOST]
NODEMAILER_PORT = [SMTP_PORT]
NODEMAILER_SECURE = [OPTION_SECURE_SMTP]
NODEMAILER_AUTH_USER = [USER_SMTP]
NODEMAILER_AUTH_PASS = [PASSWORD_SMTP]
# FrontEnd
FRONT_END_ACTIVATION_URL = [URL_FRONT_END]
URL_FRONTEND = [URL_FRONT_END]
# Midtrands
MIDTRANS_PRODUCTION = [false/true]
MIDTRANS_SERVER_KEY = [SERVER_KEY]
MIDTRANS_CLIENT_KEY = [CLIENT_KEY]
```

## Rest Api

You can view my Postman collection [here](https://www.postman.com/crimson-meadow-842892/workspace/zwallet-team)
</br>
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/10655215-216719e0-926d-4baa-af5c-d61ed0b8f3b7?action=collection%2Ffork&collection-url=entityId%3D10655215-216719e0-926d-4baa-af5c-d61ed0b8f3b7%26entityType%3Dcollection%26workspaceId%3D2169e154-425f-4fa4-a152-a299344f8bcf)

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## Related Project
:rocket: [`Backend Zwallet`](https://github.com/aryairama/zwallet-express)

:rocket: [`Frontend Zwallet`](https://github.com/aryairama/zwallet-react)

:rocket: [`Demo Zwallet`](https://bit.ly/_zwallet)

## Our Team

<center>
  <table>
    <tr>
      <td align="center">
        <a href="https://github.com/aryairama">
          <img width="100" src="https://avatars.githubusercontent.com/u/73978824?v=4" alt="Arya Irama Wahono"><br/>
          <sub><b>Arya Irama Wahono</b></sub> <br/>
          <sub>Full Stack Web Developer</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/Chandra-Kurnia">
          <img width="100" src="https://avatars.githubusercontent.com/u/75248269?v=4" alt="Chandra Kurniawan"><br/>
          <sub><b>Chandra Kurniawan</b></sub> <br/>
          <sub>Back End Developer</sub>
        </a>
      </td>
    </tr>
  </table>
</center>

<!-- CONTACT -->
## Contact

My Email : aryairama987@gmail.com

Project Link: [https://github.com/aryairama/zwallet-express](https://github.com/aryairama/zwallet-express)
