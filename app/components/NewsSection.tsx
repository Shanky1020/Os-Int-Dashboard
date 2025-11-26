"use client";

import React, { useEffect, useState } from "react";
import { fetchNewsForRelationship, NewsArticle } from "@/app/lib/newsService";
import NewsCard from "@/app/components/NewsCard";

interface NewsSectionProps {
  relationshipName: string;
}

export default function NewsSection({ relationshipName }: NewsSectionProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        // Create a search query from the relationship name
        // For example, "Bangladesh - China" becomes "Bangladesh China"
        const query = relationshipName.replace(/[-–]/g, " ").trim();
        const newsData = await fetchNewsForRelationship(query);
        
        if (newsData.status === "ok") {
          setArticles(newsData.articles);
        } else {
          setError("Failed to load news articles");
        }
      } catch (err) {
        console.error("Error loading news:", err);
        setError("Failed to load news articles");
      } finally {
        setLoading(false);
      }
    }

    if (relationshipName) {
      loadNews();
    }
  }, [relationshipName]);

  if (loading) {
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Latest News</h3>
        <p className="text-gray-400">Loading news articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Latest News</h3>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Latest News</h3>
        <p className="text-gray-400">No recent news articles found for this relationship.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Latest News</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article, index) => (
          <NewsCard key={`${article.url}-${index}`} article={article} />
        ))}
      </div>
    </div>
  );
}