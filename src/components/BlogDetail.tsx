import React, { useState, useEffect } from 'react';
import { BlogPost, Car, Comment } from '../types';
import { CARS } from '../data';
import { ArrowLeft, Clock, Heart, Send, MessageSquare, ShieldAlert, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface BlogDetailProps {
  post: BlogPost;
  onBack: () => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ post, onBack }) => {
  const [likes, setLikes] = useState(post.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');

  // Find the featured car
  const featuredCar = CARS.find((c) => c.id === post.carId);

  // Load comments from LocalStorage on mount
  useEffect(() => {
    const savedComments = localStorage.getItem(`comments_${post.id}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      // Seed default comments
      const defaultComments: Comment[] = [
        {
          id: '1',
          author: 'ApexRacer_99',
          text: `Absolutely incredible engineering. The spec sheet is mind-blowing. ${
            featuredCar?.brand === 'Bugatti' 
              ? 'A naturally aspirated V16 in 2026 is a miracle. True watchmaking on wheels.' 
              : featuredCar?.brand === 'Pagani'
              ? 'Exposing the gear shift linkage is sheer genius. Horacio Pagani is a true Renaissance man.'
              : 'The Light Speed Transmission is absolute voodoo magic! Christian von Koenigsegg does it again.'
          }`,
          timestamp: '2 hours ago',
          likes: 12,
        },
        {
          id: '2',
          author: 'MonocoqueX',
          text: `The active aerodynamics on this are pure art. You can tell they tuned the airflow to perfection. Great article, really details the engineering behind the numbers!`,
          timestamp: '1 day ago',
          likes: 8,
        }
      ];
      setComments(defaultComments);
      localStorage.setItem(`comments_${post.id}`, JSON.stringify(defaultComments));
    }
  }, [post.id, featuredCar]);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: commentAuthor.trim(),
      text: commentText.trim(),
      timestamp: 'Just now',
      likes: 0,
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    localStorage.setItem(`comments_${post.id}`, JSON.stringify(updatedComments));

    setCommentAuthor('');
    setCommentText('');
  };

  const handleLikeComment = (commentId: string) => {
    const updated = comments.map((c) => {
      if (c.id === commentId) {
        return { ...c, likes: c.likes + 1 };
      }
      return c;
    });
    setComments(updated);
    localStorage.setItem(`comments_${post.id}`, JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-16">
      {/* Article Hero Banner */}
      <div className="relative h-[55vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/60 z-10" />
        <img
          src={post.featuredImage}
          alt={post.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover scale-102"
        />
        
        {/* Navigation & Controls Overlay */}
        <div className="absolute top-6 left-6 right-6 z-20 max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-mono tracking-wider text-zinc-300 border border-zinc-800 backdrop-blur-md hover:text-gold-400 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> BACK TO JOURNAL
          </button>
          
          <span className="rounded bg-gold-500/10 px-3 py-1 text-[11px] font-mono tracking-wider uppercase text-gold-400 border border-gold-500/20 backdrop-blur-md">
            {post.category}
          </span>
        </div>

        {/* Hero Text */}
        <div className="absolute bottom-12 left-6 right-6 z-20 max-w-4xl mx-auto text-left">
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 mb-4">
            <span>BY {post.author.toUpperCase()}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            <span>{post.date}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {post.readTime}
            </span>
          </div>
          
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
            {post.title}
          </h1>
          
          <p className="text-zinc-300 text-sm md:text-lg font-light leading-relaxed max-w-3xl">
            {post.subtitle}
          </p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Article Body */}
        <div className="lg:col-span-8">
          <article className="prose prose-invert max-w-none">
            {post.content.map((paragraph, index) => (
              <p
                key={index}
                className={`text-zinc-300 text-[15px] md:text-[16px] leading-8 font-sans mb-6 ${
                  index === 0
                    ? 'first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:text-gold-400 first-letter:mr-3 first-letter:float-left first-letter:leading-none'
                    : ''
                }`}
              >
                {paragraph}
              </p>
            ))}
          </article>

          {/* Social Interactions */}
          <div className="flex items-center gap-6 py-6 border-y border-zinc-900 my-10">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-mono tracking-wider border transition-all cursor-pointer ${
                hasLiked
                  ? 'bg-red-500/10 border-red-500/40 text-red-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
              {hasLiked ? 'POST LIKED' : 'LIKE THIS ARTICLE'} ({likes})
            </button>
            
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
              <MessageSquare className="w-4 h-4 text-zinc-600" />
              {comments.length} ENTHUSIAST RESPONSES
            </div>
          </div>

          {/* Discussion & Comments Area */}
          <div className="mt-12">
            <h3 className="font-display text-xl font-semibold text-zinc-100 mb-6 flex items-center gap-2">
              <span>Discussion Board</span>
              <span className="text-xs font-mono bg-zinc-900 px-2 py-0.5 rounded text-zinc-500">COMMUNITY</span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="bg-zinc-950 p-5 rounded-xl border border-zinc-900 mb-8">
              <div className="text-[11px] font-mono text-gold-400/80 mb-3 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> JOIN THE CONVERSATION AS AN ENTHUSIAST
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Enthusiast Handle (e.g. ApexPilot)"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="md:col-span-1 rounded-lg bg-zinc-900/60 border border-zinc-800 px-4 py-2.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20"
                  required
                />
                <input
                  type="text"
                  placeholder="Your response message..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="md:col-span-2 rounded-lg bg-zinc-900/60 border border-zinc-800 px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20"
                  required
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-zinc-600" /> Respect design & specs integrity.
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-xs font-mono font-medium text-black hover:bg-gold-400 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> SUBMIT POST
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-5 rounded-xl bg-zinc-900/25 border border-zinc-900/75 flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-xs font-mono font-semibold text-zinc-300">@{comment.author}</span>
                      <span className="h-1 w-1 rounded-full bg-zinc-800" />
                      <span className="text-[10px] font-mono text-zinc-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-zinc-400 text-xs md:text-sm font-sans leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 md:self-start">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className="flex items-center gap-1 rounded bg-zinc-900 px-2 py-1 text-[10px] font-mono text-zinc-500 hover:text-red-400 border border-zinc-800 transition-all cursor-pointer"
                    >
                      <Heart className="w-3 h-3 text-zinc-600 hover:text-red-400" />
                      LIKE {comment.likes > 0 && `(${comment.likes})`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Featured Machine Specs */}
        {featuredCar && (
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <div className="rounded-xl bg-zinc-950 border border-gold-500/10 p-6 glow-gold relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="text-[10px] font-mono tracking-widest text-gold-500 uppercase mb-2">
                FEATURED MACHINE
              </div>
              
              <h2 className="font-display text-2xl font-bold text-white mb-1">
                {featuredCar.brand}
              </h2>
              <p className="font-mono text-xs text-zinc-400 mb-6">
                {featuredCar.model} &middot; {featuredCar.year}
              </p>

              {/* Specs Rows */}
              <div className="space-y-4 font-mono text-xs mb-6">
                <div className="flex justify-between py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">MSRP</span>
                  <span className="text-gold-400 font-semibold">{featuredCar.priceString}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">POWER</span>
                  <span className="text-zinc-100">{featuredCar.power} hp</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">TORQUE</span>
                  <span className="text-zinc-100">{featuredCar.torque} Nm</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">0-60 MPH</span>
                  <span className="text-zinc-100">{featuredCar.acceleration} seconds</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">V-MAX</span>
                  <span className="text-zinc-100 font-bold text-red-400">{featuredCar.topSpeed} mph</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-900">
                  <span className="text-zinc-500">WEIGHT</span>
                  <span className="text-zinc-100">{featuredCar.weight} kg</span>
                </div>
              </div>

              {/* Highlights Bullet List */}
              <div className="mt-6 pt-4 border-t border-zinc-900">
                <h4 className="font-display text-xs font-semibold uppercase text-zinc-300 tracking-wider mb-3">
                  Technical Innovations
                </h4>
                <ul className="space-y-2">
                  {featuredCar.highlights.slice(0, 3).map((hl, idx) => (
                    <li key={idx} className="flex gap-2 text-[11px] text-zinc-400 leading-normal">
                      <span className="text-gold-500 font-bold">&middot;</span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
