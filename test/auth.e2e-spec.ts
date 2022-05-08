import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Roles, User } from '../src/users/entities/user';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import faker from '@faker-js/faker';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let usersRepo: Repository<User>;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
    usersRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    await usersRepo.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/login (POST)', () => {
    it('should fail if no request body passed', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send()
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail if user does not exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: faker.internet.email(),
          password: faker.internet.password(5),
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail if incorrect password', async () => {
      const user = await usersRepo.save({
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.internet.userName(),
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: user.email,
          password: faker.internet.password(5),
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return a token', async () => {
      const user = await usersRepo.save({
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.internet.userName(),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: user.email, password: user.password });
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.access_token).toBeDefined();
      const decodedToken = jwtService.decode(response.body.access_token);
      expect(decodedToken).toMatchObject({
        email: user.email,
        id: user.id,
        role: user.role,
      });
    });
  });

  describe('/profile (GET)', () => {
    it('should fail if no token passed', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail if user does not exists', async () => {
      const token = jwtService.sign({
        email: faker.internet.email(),
        role: Roles.USER,
        id: faker.datatype.number({ min: 0 }),
      });

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return valid user data if logged in', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = await usersRepo.save({
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.internet.userName(),
      });

      const token = jwtService.sign({
        email: user.email,
        role: user.role,
        id: user.id,
      });

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject(JSON.parse(JSON.stringify(user)));
      expect(response.body).not.toHaveProperty('password');
    });
  });

  describe('/register (POST)', () => {
    it('should fail if no request body passed', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send()
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail if empty object passed', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail if invalid email passed', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: faker.random.word(),
          name: faker.internet.userName(),
          password: faker.internet.password(5),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail if no name passed', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: faker.internet.email(),
          password: faker.internet.password(5),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail if invalid password passed', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: faker.internet.email(),
          name: faker.internet.userName(),
          password: faker.datatype.string(2),
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should create user if correct data passed', async () => {
      const userCreateData = {
        email: faker.internet.email(),
        name: faker.internet.userName(),
        password: faker.internet.password(5),
      };
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userCreateData)
        .expect(HttpStatus.CREATED);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = await usersRepo.findOneOrFail({
        where: { email: userCreateData.email },
      });
      expect(response.body).toMatchObject(JSON.parse(JSON.stringify(user)));
    });
  });
});
