import { mockUser } from '../../users/__fixtures__';
import { mockDate } from '../../../test/__fixtures__';
import { mockPost } from '../../posts/__fixtures__';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Comment } from '../entities/comment.entity';

export const mockComment: Comment = Object.assign(new Comment(), {
  id: '1',
  body: 'Test comment!',
  post: mockPost,
  user: mockUser,
  created_at: mockDate,
  updated_at: mockDate,
});

export const mockCreateCommentDto: CreateCommentDto = {
  body: mockComment.body,
};
