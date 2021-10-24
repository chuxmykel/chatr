import { mockUser } from '../../users/__fixtures__';
import { mockComment } from '../../comments/__fixtures__';
import { mockDate } from '../../../test/__fixtures__';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';

export const mockPost: Post = Object.assign(new Post(), {
  id: '1',
  body: 'Test post!',
  comments: [mockComment],
  user: mockUser,
  created_at: mockDate,
  updated_at: mockDate,
});

export const mockCreatePostDto: CreatePostDto = {
  body: mockPost.body,
};
