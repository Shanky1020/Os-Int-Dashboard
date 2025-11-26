"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchNewsForRelationship, NewsArticle } from "@/app/lib/newsService";
import NewsCard from "@/app/components/NewsCard";

export default function AllNewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const relationship = searchParams.get('relationship') || '';
  
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        
        let query;
        if (relationship) {
          // Search for specific relationship
          query = `q=${encodeURIComponent(relationship.replace(/[-–]/g, " ").trim())}`;
        } else if (searchQuery) {
          // Search for custom query
          query = `q=${encodeURIComponent(searchQuery)}`;
        } else {
          // Default search for international relations
          query = 'q=international+relations+diplomacy';
        }
        
        const newsData = await fetchNewsForRelationship(`${query}&page=${page}`);
        
        if (newsData.status === "ok") {
          if (page === 1) {
            setArticles(newsData.articles);
          } else {
            setArticles(prev => [...prev, ...newsData.articles]);
          }
          setTotalResults(newsData.totalResults);
          setHasMore(articles.length + newsData.articles.length < newsData.totalResults);
        }
      } catch (err) {
        console.error("Error loading news:", err);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, [relationship, searchQuery, page]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setArticles([]);
  };

  const pageTitle = relationship 
    ? `News for ${relationship}` 
    : searchQuery 
      ? `Search results for "${searchQuery}"` 
      : "Latest International News";

  const resultCount = relationship || searchQuery 
    ? `${totalResults} articles found` 
    : `${totalResults} articles`;

  if (loading && page === 1) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()} 
            className="mr-4 text-blue-400 hover:text-blue-300"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">News</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()} 
          className="mr-4 text-blue-400 hover:text-blue-300"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">News</h1>
      </div>
      
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news..."
            className="flex-1 px-4 py-2 bg-[#1B263B] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>
      
      <h2 className="text-xl font-bold mb-2">{pageTitle}</h2>
      <p className="text-gray-400 mb-6">{resultCount}</p>
      
      {articles.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No news articles found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <NewsCard key={`${article.url}-${index}`} article={article} />
            ))}
          </div>
          
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}