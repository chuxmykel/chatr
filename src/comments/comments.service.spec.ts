import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommentsService } from './comments.service';
import { PostsService } from '../posts/posts.service';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { mockUser } from '../users/__fixtures__';
import { mockPost } from '../posts/__fixtures__';
import { mockComment, mockCreateCommentDto } from './__fixtures__';
import { CommentErrors } from './constants';

describe('CommentsService', () => {
  let service: CommentsService;
  let postsService: PostsService;
  let repo: Repository<Comment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        PostsService,
        {
          provide: getRepositoryToken(Comment),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Post),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    postsService = module.get<PostsService>(PostsService);
    repo = module.get<Repository<Comment>>(getRepositoryToken(Comment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('commentOnPost', () => {
    it('should throw an error if a post with the supplied postId is not found', async () => {
      jest.spyOn(postsService, 'findOne').mockResolvedValue(null);

      try {
        await service.commentOnPost(
          mockUser,
          mockPost.id,
          mockCreateCommentDto,
        );
      } catch (error) {
        expect(error.message).toBe(CommentErrors.NO_ASSOCIATED_POST);
      }
    });

    it('should create a comment associated to a post', async () => {
      jest.spyOn(postsService, 'findOne').mockResolvedValue(mockPost);
      const createSpy = jest.spyOn(repo, 'create').mockReturnValue(mockComment);
      const saveSpy = jest.spyOn(repo, 'save').mockResolvedValue(mockComment);
      const result = await service.commentOnPost(
        mockUser,
        mockPost.id,
        mockCreateCommentDto,
      );
      expect(result).toBe(mockComment);
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith({
        ...mockCreateCommentDto,
        post: mockPost,
        user: mockUser,
      });
      expect(saveSpy).toHaveBeenCalledWith(mockComment);
    });
  });
});
