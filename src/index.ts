import AppDataSource from '../ormconfig';
import { User } from './user/entities/user.entity';

AppDataSource.initialize()
  .then(async () => {
    console.log('Inserting a new user into the database...');
    console.log('Loading users from the database...');
    const users = await AppDataSource.manager.find(User);
    console.log('Loaded users: ', users);

    console.log(
      'Here you can setup and run express / fastify / any other framework.',
    );
  })
  .catch((error) => console.log(error));
