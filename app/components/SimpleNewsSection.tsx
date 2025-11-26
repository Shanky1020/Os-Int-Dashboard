"use client";

import React, { useEffect, useState } from "react";
import { fetchNewsForRelationship, NewsArticle } from "@/app/lib/newsService";

interface SimpleNewsSectionProps {
  title: string;
  query: string;
}

export default function SimpleNewsSection({ title, query }: SimpleNewsSectionProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        const newsData = await fetchNewsForRelationship(query);
        
        if (newsData.status === "ok") {
          // Take only the first 3 articles for the collapsed view
          setArticles(newsData.articles.slice(0, 3));
        }
      } catch (err) {
        console.error("Error loading news:", err);
      } finally {
        setLoading(false);
      }
    }

    if (query) {
      loadNews();
    }
  }, [query]);

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-[#1B263B] rounded-lg">
        <h4 className="font-medium mb-2">{title}</h4>
        <p className="text-gray-400 text-sm">Loading news...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return null; // Don't show anything if no articles
  }

  return (
    <div className="mt-4 p-4 bg-[#1B263B] rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">{title}</h4>
        {articles.length > 1 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        )}
      </div>
      
      <ul className="space-y-2">
        {(expanded ? articles : articles.slice(0, 1)).map((article, index) => (
          <li key={`${article.url}-${index}`} className="text-sm">
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline"
            >
              {article.title}
            </a>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{article.source.name}</span>
              <span>
                {new Date(article.publishedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}