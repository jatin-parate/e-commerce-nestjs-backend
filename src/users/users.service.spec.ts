import faker from '@faker-js/faker';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  getRepositoryToken,
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let module: TestingModule;
  let usersService: UsersService;
  let usersRepo: Repository<User>;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [UsersService],
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
      ],
    }).compile();

    await module.init();
    usersService = module.get<UsersService>(UsersService);
    usersRepo = module.get(getRepositoryToken(User));
    usersRepo.clear();
  });

  afterEach(async () => {
    await module.close();
  });

  describe('findOne', () => {
    it('should return null', async () => {
      await expect(
        usersService.findOne(faker.internet.email()),
      ).resolves.toBeUndefined();
    });

    it('should return the user', async () => {
      let user = await usersRepo.create({
        email: faker.internet.email(),
        name: faker.internet.userName(),
        password: faker.internet.password(5),
      });
      user = await usersRepo.save(user);

      expect(await usersService.findOne(user.email)).toMatchObject(user);
    });
  });

  describe('create', () => {
    it('should create the user', async () => {
      const createUserData: Omit<
        User,
        'id' | 'createdAt' | 'updatedAt' | 'role'
      > = {
        email: faker.internet.email(),
        name: faker.internet.userName(),
        password: faker.internet.password(5),
      };
      await usersService.create(createUserData);
      const createdUser = await usersRepo.findOne({
        where: { email: createUserData.email },
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser).toMatchObject(createUserData);
    });

    it('should fail if no params passed', async () => {
      await expect(
        usersService.create(undefined as any),
      ).rejects.toThrowError();
      await expect(usersRepo.find()).resolves.toHaveLength(0);
    });

    it('should fail if empty object passed', async () => {
      await expect(usersService.create({} as any)).rejects.toThrowError();
      await expect(usersRepo.find()).resolves.toHaveLength(0);
    });
  });
});
