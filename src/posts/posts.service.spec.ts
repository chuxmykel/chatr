import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post } from './entities/post.entity';
import { PostsService } from './posts.service';
import { mockCreatePostDto, mockPost } from './__fixtures__';
import { mockUser } from '../users/__fixtures__';

describe('PostsService', () => {
  let service: PostsService;
  let repo: Repository<Post>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repo = module.get<Repository<Post>>(getRepositoryToken(Post));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post successfully', async () => {
      jest.spyOn(repo, 'create').mockReturnValue(mockPost);
      jest.spyOn(repo, 'save').mockResolvedValue(mockPost);

      const result = await service.create(mockUser, mockCreatePostDto);
      expect(result).toBe(mockPost);
    });
  });

  describe('findAll', () => {
    it('should find and return all posts', async () => {
      jest.spyOn(repo, 'find').mockResolvedValue([mockPost]);

      const result = await service.findAll();
      expect(result).toStrictEqual([mockPost]);
    });
  });

  describe('findOne', () => {
    it('should find and return the specified post', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockPost);

      const result = await service.findOne(mockPost.id);
      expect(result).toBe(mockPost);
    });
  });
});
