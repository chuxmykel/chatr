import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PostsService } from './posts.service';
import { CommentsService } from '../comments/comments.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentErrors } from '../comments/constants';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(req.user, createPostDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  async commentOnPost(
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
    @Param('postId') postId: string,
  ) {
    try {
      const comment = await this.commentsService.commentOnPost(
        req.user,
        postId,
        createCommentDto,
      );
      return comment;
    } catch (error) {
      switch (error.message) {
        case CommentErrors.NO_ASSOCIATED_POST:
          throw new BadRequestException(CommentErrors.NO_ASSOCIATED_POST);
        default:
          throw new InternalServerErrorException();
      }
    }
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }
}
