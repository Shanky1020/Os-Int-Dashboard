// News Service
const NewsService = {
  async fetchNews(queryParams) {
    try {
      const url = `/api/news?${queryParams}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`News API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching news:', error);
      return {
        status: 'error',
        totalResults: 0,
        articles: []
      };
    }
  },

  async fetchNewsForRelationship(relationshipName, page = 1) {
    const query = relationshipName.replace(/[-–]/g, ' ').trim();
    return this.fetchNews(`q=${encodeURIComponent(query)}&page=${page}`);
  },

  async searchNews(searchQuery, page = 1) {
    return this.fetchNews(`q=${encodeURIComponent(searchQuery)}&page=${page}`);
  },

  async fetchDefaultNews(page = 1) {
    return this.fetchNews(`page=${page}`);
  }
};

// Export
window.NewsService = NewsService;