AIBlog TypeScriptLand.
===

Hey yooo
This is the TypeScript code of our blog :)

To run you will need:
- [PostgreSQL](https://www.postgresql.org/)
- [Node.js](https://nodejs.org/)
- [redis](https://redis.io/)
- An account on [groq](https://groq.com/)

With these tools, first you need to create a database and then:

```shell
npm install

cp .env.sample .env
vi .env

npm run migrate:latest
```

To run in dev mode:

```shell
npm run dev
```

To build for production:

```shell
npm run build
```
