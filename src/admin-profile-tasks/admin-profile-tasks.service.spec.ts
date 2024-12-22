import { Test, TestingModule } from '@nestjs/testing';
import { AdminProfileTasksService } from './admin-profile-tasks.service';

describe('AdminProfileTasksService', () => {
  let service: AdminProfileTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminProfileTasksService],
    }).compile();

    service = module.get<AdminProfileTasksService>(AdminProfileTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
