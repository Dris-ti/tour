import { Test, TestingModule } from '@nestjs/testing';
import { AdminProfileTasksController } from './admin-profile-tasks.controller';

describe('AdminProfileTasksController', () => {
  let controller: AdminProfileTasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminProfileTasksController],
    }).compile();

    controller = module.get<AdminProfileTasksController>(AdminProfileTasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
