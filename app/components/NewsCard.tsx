"use client";

import React from "react";
import { NewsArticle } from "@/app/lib/newsService";

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  // Format the date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-[#1E293B] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      {article.urlToImage && (
        <img 
          src={article.urlToImage} 
          alt={article.title} 
          className="w-full h-40 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      )}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
        {article.description && (
          <p className="text-gray-300 text-sm mb-3 line-clamp-3">{article.description}</p>
        )}
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>{article.source.name}</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-3 inline-block text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          Read Full Article →
        </a>
      </div>
    </div>
  );
}