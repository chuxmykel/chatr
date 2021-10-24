import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CommentsService } from '../comments/comments.service';
import { Post } from './entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { mockComment, mockCreateCommentDto } from '../comments/__fixtures__';
import { mockCreatePostDto, mockPost } from './__fixtures__';
import { CommentErrors } from '../comments/constants';
import { mockUnknownError } from '../../test/__fixtures__';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;
  let commentsService: CommentsService;
  const mockRequest = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        PostsService,
        CommentsService,
        {
          provide: getRepositoryToken(Post),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Comment),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
    commentsService = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create post successfully', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockPost);
      const result = await controller.create(mockRequest, mockCreatePostDto);
      expect(result).toBe(mockPost);
    });
  });

  describe('commentOnPost', () => {
    it('should throw a post not found error if a post with the supplied postId is not found', async () => {
      jest
        .spyOn(commentsService, 'commentOnPost')
        .mockRejectedValue(new Error(CommentErrors.NO_ASSOCIATED_POST));
      try {
        await controller.commentOnPost(
          mockRequest,
          mockCreateCommentDto,
          mockPost.id,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw an internal server error when unknown errors occur', async () => {
      jest
        .spyOn(commentsService, 'commentOnPost')
        .mockRejectedValue(mockUnknownError);
      try {
        await controller.commentOnPost(
          mockRequest,
          mockCreateCommentDto,
          mockPost.id,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });

    it('should create and return created post', async () => {
      jest
        .spyOn(commentsService, 'commentOnPost')
        .mockResolvedValue(mockComment);
      const result = await controller.commentOnPost(
        mockRequest,
        mockCreateCommentDto,
        mockPost.id,
      );
      expect(result).toBe(mockComment);
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockPost]);
      const result = await controller.findAll();
      expect(result).toStrictEqual([mockPost]);
    });
  });

  describe('findOne', () => {
    it('should return a post with the specified id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockPost);
      const result = await controller.findOne(mockPost.id);
      expect(result).toStrictEqual(mockPost);
    });
  });
});
