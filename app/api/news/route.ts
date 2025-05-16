import { NextResponse } from 'next/server';

export async function GET() {
  const articles: any[] = [];

  // Source 1: NewsAPI
  try {
    const newsapiRes = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
    );
    const newsapi = await newsapiRes.json();

    if (newsapi?.articles) {
      articles.push(
        ...newsapi.articles.map((item: any) => ({
          title: item.title,
          description: item.description,
          url: item.url,
          urlToImage: item.urlToImage || '/default.jpg',
          publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString() : '',
          source: item.source?.name || 'NewsAPI',
        }))
      );
    }
  } catch (error) {
    console.error('NewsAPI Error:', error);
  }

  // Source 2: Event Registry
  try {
    const eventRes = await fetch(
      `https://eventregistry.org/api/v1/article/getArticles?apiKey=${process.env.EVENT_REGISTRY_API_KEY}&lang=eng&sortBy=date&articlesPage=1&articlesCount=5`
    );
    const eventRegistry = await eventRes.json();

    if (eventRegistry?.articles?.results) {
      articles.push(
        ...eventRegistry.articles.results.map((item: any) => ({
          title: item.title,
          description: item.body || item.summary || '',
          url: item.url,
          urlToImage: item.image || '/default.jpg',
          publishedAt: item.dateTime ? new Date(item.dateTime).toISOString() : '',
          source: item.source?.title || 'Event Registry',
        }))
      );
    }
  } catch (error) {
    console.error('EventRegistry Error:', error);
  }

  // Source 3: NY Times
  try {
    const nytRes = await fetch(
      `https://api.nytimes.com/svc/topstories/v2/world.json?api-key=${process.env.NYTIMES_API_KEY}`
    );
    const nytimes = await nytRes.json();

    if (nytimes?.results) {
      articles.push(
        ...nytimes.results.slice(0, 5).map((item: any) => ({
          title: item.title,
          description: item.abstract,
          url: item.url,
          urlToImage: item.multimedia?.[0]?.url || '/default.jpg',
          publishedAt: item.published_date ? new Date(item.published_date).toISOString() : '',
          source: 'New York Times',
        }))
      );
    }
  } catch (error) {
    console.error('NYTimes Error:', error);
  }

  // Sort all articles by latest published date
  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return NextResponse.json(articles);
}