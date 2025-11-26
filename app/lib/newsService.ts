// News API Service
const NEWS_API_KEY = "4a4d4182be014267994f6de800db8b11";

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export async function fetchNewsForRelationship(relationshipQuery: string): Promise<NewsResponse> {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(relationshipQuery)}&apiKey=${NEWS_API_KEY}&pageSize=5&sortBy=publishedAt`
    );
    
    if (!response.ok) {
      throw new Error(`News API request failed with status ${response.status}`);
    }
    
    const data: NewsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching news:", error);
    // Return a fallback response in case of error
    return {
      status: "error",
      totalResults: 0,
      articles: []
    };
  }
}