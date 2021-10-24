import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostsService } from '../posts/posts.service';
import { Post } from '../posts/entities/post.entity';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentErrors } from './constants';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private readonly postsService: PostsService,
  ) {}

  async commentOnPost(
    user: User,
    postId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const post: Post = await this.postsService.findOne(postId);
    if (!post) {
      throw new Error(CommentErrors.NO_ASSOCIATED_POST);
    }
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      post,
      user,
    });
    return this.commentsRepository.save(comment);
  }
}
