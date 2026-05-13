import { supabase } from '@/lib/supabase'

export const fetchCommentsService = async () => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error

  return data || []
}

export const likeCommentService = async (id: number) => {
  const { error } = await supabase.rpc('increment_likes', {
    comment_id_to_like: id,
  });

  if (error) throw error;
};

export const uploadCommentImageService = async (
  image: File
) => {
  const fileName = `${Date.now()}-${image.name}`

  const { error } = await supabase.storage
    .from('comments')
    .upload(fileName, image)

  if (error) throw error

  const { data } = supabase.storage
    .from('comments')
    .getPublicUrl(fileName)

  return data.publicUrl
}

export const createCommentService = async ({
  name,
  comment,
  imageUrl,
}: {
  name: string;
  comment: string;
  imageUrl: string | null;
}) => {
  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        name,
        comment,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
};