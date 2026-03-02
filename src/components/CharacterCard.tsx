"use client";

import { motion } from "framer-motion";

interface CharacterCardProps {
  name: string;
  style: string;
  image: string;
}

export default function CharacterCard({ name, style, image }: CharacterCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="overflow-hidden transition-colors cursor-pointer glass-card group border-white/10 hover:border-brand-yellow/50"
    >
      <div className="aspect-[3/4] relative bg-neutral-900 overflow-hidden p-3">
        {image && (
          <img
            src={image}
            alt={name}
            className="relative inset-0 w-full h-full object-cover object-top transition-all duration-300 origin-center group-hover:scale-105"
          />
        )}
        <div className="flex absolute inset-0 justify-center items-center text-2xl italic font-black opacity-10 transition-transform duration-500 pointer-events-none group-hover:scale-110">
          {name.charAt(0)}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t to-transparent from-black/80" />
        <div className="absolute bottom-4 left-4">
          <h3 className="text-2xl italic font-black tracking-tighter text-white transition-colors group-hover:text-brand-yellow">
            {name}
          </h3>
          <p className="inline-block px-2 py-1 mt-1 text-sm font-bold tracking-widest uppercase text-neutral-400 bg-black/40">
            {style}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
