import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  getRepositoryToken,
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { User } from '../users/entities/user';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import faker from '@faker-js/faker';
import { ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let module: TestingModule;
  let authService: AuthService;
  let usersRepo: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [AuthService, UsersService],
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.test'],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              type: configService.get<TypeOrmModuleOptions['type']>('DB_TYPE'),
              host: configService.get<string>('DB_HOST'),
              port: +configService.get<number>('DB_PORT'),
              username: configService.get<string>('DB_USERNAME'),
              password: configService.get<string>('DB_PASSWORD'),
              database: configService.get<string>('DB_DATABASE'),
              autoLoadEntities: true,
              synchronize:
                configService.get<string>('DB_SYNCHRONIZE') === 'true',
            } as TypeOrmModuleOptions;
          },
        }),
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '15m' },
        }),
      ],
    }).compile();

    await module.init();
    authService = module.get<AuthService>(AuthService);
    usersRepo = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    usersRepo.clear();
  });

  afterEach(async () => {
    await module.close();
  });

  describe('validateUser', () => {
    it('should be defined', () => {
      expect(authService.validateUser).toBeDefined();
    });

    it('should return null if no users exists', async () => {
      await expect(
        authService.validateUser(
          faker.internet.email(),
          faker.internet.password(5),
        ),
      ).resolves.toBeNull();
    });

    it('should return null if no users exists', async () => {
      await expect(
        authService.validateUser(
          faker.internet.email(),
          faker.internet.password(5),
        ),
      ).resolves.toBeNull();
    });

    it('should return null if it exists and password doesnt match', async () => {
      let user = usersRepo.create({
        email: faker.internet.email(),
        name: faker.internet.userName(),
        password: faker.internet.password(5),
      });

      user = await usersRepo.save(user);

      await expect(
        authService.validateUser(user.email, faker.internet.password(5)),
      ).resolves.toBeNull();
    });

    it('should return user if it exists and password matches', async () => {
      const password = faker.internet.password(5);
      let user = usersRepo.create({
        email: faker.internet.email(),
        name: faker.internet.userName(),
        password: await authService.hashPassword(password),
      });

      user = await usersRepo.save(user);

      await expect(
        authService.validateUser(user.email, password),
      ).resolves.toMatchObject(user);
    });
  });

  describe('login', () => {
    it('should return valid access token', async () => {
      let user = usersRepo.create({
        email: faker.internet.email(),
        name: faker.internet.userName(),
        password: faker.internet.password(5),
      });

      user = await usersRepo.save(user);

      const result = await authService.login(user);
      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');
      const decodedResult = jwtService.decode(result.access_token);
      expect(decodedResult).toMatchObject({
        email: user.email,
        id: user.id,
        role: user.role,
      });
    });
  });

  describe('register', () => {
    it('should fail if user exists', async () => {
      let user = usersRepo.create({
        email: faker.internet.email(),
        name: faker.internet.userName(),
        password: faker.internet.password(5),
      });

      user = await usersRepo.save(user);

      await expect(
        authService.register({
          email: user.email,
          name: user.name,
          password: user.password,
        }),
      ).rejects.toThrowError(ConflictException);

      expect(await usersRepo.count({ where: { email: user.email } })).toEqual(
        1,
      );
    });

    it('should create user', async () => {
      const createdUserData = {
        email: faker.internet.email(),
        name: faker.internet.userName(),
        password: faker.internet.password(5),
      };

      await authService.register(createdUserData);
      await expect(
        usersRepo.count({ where: { email: createdUserData.email } }),
      ).resolves.toEqual(1);
    });
  });
});
