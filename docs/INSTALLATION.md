<h1 align="center">
  <br>
  Self hosting the bot
  <br>
</h1>

## Setting up server
* [Node.js](https://nodejs.org) v16+.
* [FFMPEG](http://www.ffmpeg.org/).
* [MySQL](https://www.mysql.com/downloads/) or any other type of relational database.

## Configuring the config files.
* ### src/config:

  * `port`: The port that the webserver will run on.
  * More will be coming later...
* ### prisma/schema.prisma

  * `url`(line 7): Add your mysql URL; for example: `mysql://root:password123@localhost:3306/video-stream`.
  * Once done run the command in the console: `npx prisma migrate dev --name init`.

* ### RTMP/config.js:

 * `rtmp_server.trans.ffmpeg`: The path to FFMPEG.exe; for example: `'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe'`.

## Running the webserver:

* Run the command `node .` or `npm run start`.

### Optional

* To see the database you can run `npm run db`, which will load up a web-server to see all your data (which you can edit).
