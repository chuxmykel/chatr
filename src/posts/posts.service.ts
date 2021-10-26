import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  create(user: User, createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postsRepository.create({ ...createPostDto, user });
    return this.postsRepository.save(post);
  }

  findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: ['comments', 'user'],
    });
  }

  findOne(id: string): Promise<Post> {
    return this.postsRepository.findOne(id);
  }
}
