import React from 'react';
import { BlogPost } from '../types';
import { ArrowUpRight, Clock, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface BlogCardProps {
  post: BlogPost;
  onClick: () => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-zinc-950 border border-zinc-900 transition-all duration-500 hover:border-gold-500/40 glow-titanium"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Article Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30 z-10" />
        <img
          src={post.featuredImage}
          alt={post.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Category tag on image */}
        <span className="absolute top-4 left-4 z-20 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase text-gold-400 border border-gold-500/20 backdrop-blur-md">
          {post.category}
        </span>
      </div>

      {/* Metadata & Title */}
      <div className="p-6 relative z-10 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 mb-3">
            <span>{post.date}</span>
            <span className="h-1 w-1 rounded-full bg-zinc-800" />
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-500" /> {post.readTime}
            </span>
          </div>

          <h3 className="font-display text-lg font-semibold text-zinc-100 group-hover:text-gold-400 transition-colors leading-snug mb-2">
            {post.title}
          </h3>

          <p className="text-zinc-400 text-xs font-sans line-clamp-2 leading-relaxed mb-4">
            {post.subtitle}
          </p>
        </div>

        {/* Footer info: tags & engagement */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-900/60 mt-auto">
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-900/50 border border-zinc-800"
              >
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-500/80 transition-colors" />
              {post.likes}
            </span>
            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-gold-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
