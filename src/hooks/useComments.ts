'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  fetchCommentsService,
  createCommentService,
  likeCommentService,
  uploadCommentImageService,
} from '@/lib/commentService'

export default function useComments() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchInitialComments()

    const channel = supabase
      .channel('comments-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
        },
        async () => {
          const data = await fetchCommentsService()
          setComments(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchInitialComments = async () => {
    try {
      const data = await fetchCommentsService()
      setComments(data)
    } catch (err) {
      console.log(err)
    }
  }

  const addComment = async ({
    name,
    comment,
    image,
  }: {
    name: string
    comment: string
    image: File | null
  }) => {
    if (!name.trim()) return
    if (!comment.trim()) return

    setLoading(true)

    try {
      let imageUrl: string | null = null

      if (image) {
        imageUrl = await uploadCommentImageService(image)
      }

      const newComment = await createCommentService({
        name,
        comment,
        imageUrl,
      });

      // instant UI update (tanpa nunggu realtime)
      setComments((prev) => [newComment, ...prev])
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const likeComment = async (id: number) => {
    const liked = localStorage.getItem(`liked-${id}`);

    if (liked) return;

    try {
      // Optimistically update the UI first for a snappy feel
      setComments((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item,
        ),
      );

      // Prevent the same user from liking multiple times
      localStorage.setItem(`liked-${id}`, 'true');

      // Call the database function to increment the count
      await likeCommentService(id);
      
    } catch (err) {
      console.log(err);
      // If the database call fails, revert the UI change
      setComments((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, likes: (item.likes || 1) - 1 } : item,
        ),
      );
      localStorage.removeItem(`liked-${id}`);
    }
  };

  return {
    comments,
    loading,
    addComment,
    likeComment,
  }
}