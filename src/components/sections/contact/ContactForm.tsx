'use client'

import { useState } from 'react'
import { motion, Variants } from 'framer-motion'
import Swal from 'sweetalert2'

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: smoothEase,
    },
  },
}

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message.')
      }

      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
      
      Swal.fire({
        title: "Message Sent!",
        text: "Thank you for reaching out. I'll get back to you soon.",
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
        background: "#0f0f0f",
        color: "#fff",
      });

    } catch (error) {
      console.error(error)
      setStatus('error')

      Swal.fire({
        title: "Error",
        text: "Something went wrong. Please try again later.",
        icon: "error",
        background: "#0f0f0f",
        color: "#fff",
        confirmButtonColor: "#27272a",
      });
    } finally {
      // Reset status to idle after a short delay, unless it's already sending
      if (status !== 'sending') {
        setTimeout(() => setStatus('idle'), 3000);
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.8,
        ease: smoothEase,
      }}
      viewport={{ once: false, amount: 0.2 }}
      className="rounded-[28px] md:rounded-[34px] border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-8 h-full"
    >
      <div className="mb-5 md:mb-6">
        <h3 className="text-xl md:text-2xl font-semibold mb-1">
          Send a Message
        </h3>
        <p className="text-xs md:text-sm text-white/40">
          I'll get back to you as soon as possible.
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false }}
        className="space-y-3 md:space-y-4"
      >
        <motion.input
          variants={itemVariants}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          required
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 md:py-4 outline-none focus:border-white"
        />
        <motion.input
          variants={itemVariants}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your Email"
          required
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 md:py-4 outline-none focus:border-white"
        />
        <motion.textarea
          variants={itemVariants}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your Message"
          required
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 md:py-4 outline-none resize-none focus:border-white"
        />
        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={status === 'sending'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-2xl py-3 md:py-4 bg-white/10 border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </motion.button>
      </motion.form>
    </motion.div>
  )
}