// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config } = require('dotenv');

config();

module.exports = {
  type: process.env['DB_TYPE'],
  host: process.env['DB_HOST'],
  port: +process.env['DB_PORT'],
  username: process.env['DB_USERNAME'],
  password: process.env['DB_PASSWORD'],
  database: process.env['DB_DATABASE'],
  autoLoadEntities: true,
  synchronize: process.env['DB_SYNCHRONIZE'] === 'true',
  migrations: ['migrations/**/*.ts'],
  cli: {
    migrationsDir: 'migrations',
  },
};
