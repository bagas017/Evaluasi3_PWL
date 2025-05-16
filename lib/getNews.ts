interface Article {
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    source: {
      name: string;
    };
  }
  
  interface ProcessedArticle {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: string;
  }
  
  export async function getNews(category: string): Promise<ProcessedArticle[]> {
    try {
      const apiUrl = `https://newsapi.org/v2/top-headlines?category=${encodeURIComponent(category)}&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`;
      
      const res = await fetch(apiUrl, {
        next: { revalidate: 600 } // Revalidate every 10 minutes
      });
  
      if (!res.ok) {
        throw new Error(`News API request failed with status ${res.status}`);
      }
  
      const data = await res.json();
      
      if (!data.articles || !Array.isArray(data.articles)) {
        throw new Error('Invalid response format from News API');
      }
  
      return data.articles.map((article: Article) => ({
        title: article.title || 'No title available',
        description: article.description || 'No description available',
        url: article.url,
        urlToImage: article.urlToImage || '/default-news.jpg',
        publishedAt: article.publishedAt 
          ? new Date(article.publishedAt).toLocaleString() 
          : 'Date not available',
        source: article.source?.name || 'Unknown source',
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      // Return empty array or fallback data in case of error
      return [];
    }
  }