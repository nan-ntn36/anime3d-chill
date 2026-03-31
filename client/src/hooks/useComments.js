import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import commentApi from '../api/commentApi';
import toast from 'react-hot-toast';

export const useComments = (movieSlug, page = 1) => {
  const queryClient = useQueryClient();
  const queryKey = ['comments', movieSlug, page];

  // Fetch comments
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: () => commentApi.getComments(movieSlug, page).then(res => res.data.data),
    enabled: !!movieSlug, // Chỉ fetch khi có slug
    staleTime: 1000 * 60 * 5, // 5 phút
  });

  // Tạo comment (hoặc reply)
  const createMutation = useMutation({
    mutationFn: (payload) => commentApi.createComment(payload),
    onSuccess: () => {
      // Invalidate query để load lại danh sách mới nhất
      queryClient.invalidateQueries({ queryKey: ['comments', movieSlug] });
      toast.success('Đăng bình luận thành công!');
    },
    onError: (err) => {
      const msg = err.response?.data?.error?.message || 'Có lỗi xảy ra khi đăng bình luận';
      toast.error(msg);
    },
  });

  // Chỉnh sửa comment
  const updateMutation = useMutation({
    mutationFn: ({ id, content }) => commentApi.updateComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', movieSlug] });
      toast.success('Cập nhật bình luận thành công!');
    },
    onError: (err) => {
      const msg = err.response?.data?.error?.message || 'Lỗi cập nhật bình luận';
      toast.error(msg);
    },
  });

  // Xóa comment
  const deleteMutation = useMutation({
    mutationFn: (id) => commentApi.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', movieSlug] });
      toast.success('Đã xóa bình luận');
    },
    onError: (err) => {
      const msg = err.response?.data?.error?.message || 'Không thể xóa bình luận';
      toast.error(msg);
    },
  });

  return {
    // Data
    comments: data?.items || [],
    pagination: data?.pagination || null,
    isLoading,
    isError,
    error,
    refetch,
    // Mutations
    addComment: (content, parentId = null) =>
      createMutation.mutate({ movieSlug, content, parentId }),
    editComment: (id, content) => updateMutation.mutate({ id, content }),
    removeComment: (id) => deleteMutation.mutate(id),
    
    // Mutation States
    isAdding: createMutation.isPending,
    isEditing: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useRecentComments = (limit = 4) => {
  return useQuery({
    queryKey: ['comments', 'recent', limit],
    queryFn: () => commentApi.getRecentComments(limit).then(res => res.data.data),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
