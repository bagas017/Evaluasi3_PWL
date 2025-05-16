'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { FiExternalLink, FiLogOut, FiLoader, FiUser, FiClock, FiBookmark, FiSearch } from 'react-icons/fi';
import Head from 'next/head';

type Article = {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: string;
  apiSource: string;
};

// Fungsi untuk mengukur performa
const measurePerformance = (articles: Article[]) => {
  // 1. Hitung jumlah artikel per sumber
  const articlesBySource: Record<string, number> = {};
  articles.forEach(article => {
    articlesBySource[article.apiSource] = (articlesBySource[article.apiSource] || 0) + 1;
  });

  // 2. Hitung persentase artikel dengan gambar
  const articlesWithImage = articles.filter(article => article.urlToImage && !article.urlToImage.includes('default.jpg')).length;
  const imagePercentage = (articlesWithImage / articles.length) * 100;

  // 3. Analisis distribusi waktu publikasi
  const now = new Date();
  const timeDifferences = articles.map(article => {
    const publishedDate = new Date(article.publishedAt);
    return (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60); // Dalam jam
  });
  
  const avgTimeDiff = timeDifferences.reduce((a, b) => a + b, 0) / timeDifferences.length;
  const minTimeDiff = Math.min(...timeDifferences);
  const maxTimeDiff = Math.max(...timeDifferences);

  // 4. Ukuran data yang di-load
  const dataSize = JSON.stringify(articles).length / 1024; // Dalam KB

  return {
    articlesBySource,
    imagePercentage: Math.round(imagePercentage * 100) / 100,
    timeDistribution: {
      average: Math.round(avgTimeDiff * 100) / 100,
      min: Math.round(minTimeDiff * 100) / 100,
      max: Math.round(maxTimeDiff * 100) / 100,
      unit: 'hours'
    },
    dataSize: Math.round(dataSize * 100) / 100
  };
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  
  // Refs untuk pengukuran performa
  const mountTime = useRef<number>(0);
  const dataFetchTime = useRef<number>(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchStartTime = performance.now();

        // Fetch from multiple APIs
        const [newsApiRes, eventRegistryRes, nytimesRes] = await Promise.all([
          fetch('/api/news?source=newsapi'),
          fetch('/api/news?source=eventregistry'),
          fetch('/api/news?source=nytimes')
        ]);

        if (!newsApiRes.ok || !eventRegistryRes.ok || !nytimesRes.ok) {
          throw new Error('Failed to fetch news from one or more sources');
        }

        const newsApiData = await newsApiRes.json();
        const eventRegistryData = await eventRegistryRes.json();
        const nytimesData = await nytimesRes.json();

        // Combine all articles and add source information
        const combinedArticles = [
          ...newsApiData.map((article: Article) => ({ ...article, apiSource: 'NewsAPI' })),
          ...eventRegistryData.map((article: Article) => ({ ...article, apiSource: 'EventRegistry' })),
          ...nytimesData.map((article: Article) => ({ ...article, apiSource: 'NYTimes' }))
        ];

        dataFetchTime.current = performance.now() - fetchStartTime;
        
        setArticles(combinedArticles);
        setFilteredArticles(combinedArticles);
        
        // Extract unique sources for filtering
        const sources = ['All', ...new Set(combinedArticles.map(article => article.apiSource))];
        setAvailableSources(sources);

        // Log metrik performa
        const performanceMetrics = measurePerformance(combinedArticles);
        console.log('=== PERFORMANCE METRICS ===');
        console.log('1. Data Loading Time:', dataFetchTime.current.toFixed(2), 'ms');
        console.log('2. Articles by Source:', performanceMetrics.articlesBySource);
        console.log('3. Articles with Images:', performanceMetrics.imagePercentage + '%');
        console.log('4. Time Distribution (hours since publication):', performanceMetrics.timeDistribution);
        console.log('5. Total Data Size:', performanceMetrics.dataSize, 'KB');

      } catch (err: any) {
        console.error('Error fetching news:', err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchNews();
    }
  }, [status]);

  useEffect(() => {
    // Catat waktu mount komponen
    mountTime.current = performance.now();

    return () => {
      // Saat komponen unmount, hitung total waktu render
      const totalRenderTime = performance.now() - mountTime.current;
      console.log('Total Component Render Time:', totalRenderTime.toFixed(2), 'ms');
    };
  }, []);
  
  useEffect(() => {
    // Apply filters whenever activeSource or searchQuery changes
    let result = articles;
    
    // Filter by source
    if (activeSource !== 'all') {
      result = result.filter(article => article.apiSource === activeSource);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredArticles(result);
  }, [activeSource, searchQuery, articles]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="p-8 bg-white rounded-xl shadow-sm w-full max-w-md text-center">
          <FiLoader className="animate-spin text-blue-500 text-4xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">We're preparing your personalized news feed</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <FiUser size={20} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome back, <span className="text-blue-600">{session?.user?.name}</span>
              </h1>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-200"
              aria-label="Logout"
            >
              <FiLogOut size={16} /> Sign Out
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading content</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Head>
        <title>Dashboard - Personalized News Feed</title>
        <meta name="description" content="Your personalized news dashboard showing the latest articles from multiple sources like NewsAPI, NYTimes, and EventRegistry." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content="Dashboard - Personalized News Feed" />
        <meta property="og:description" content="Stay updated with the latest curated news articles personalized for you." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/dashboard" />
        <meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dashboard - Personalized News Feed" />
        <meta name="twitter:description" content="Stay updated with the latest curated news articles personalized for you." />
        <meta name="twitter:image" content="https://yourdomain.com/og-image.jpg" />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Dashboard - Personalized News Feed",
            "url": "https://yourdomain.com/dashboard",
            "description": "Your personalized news dashboard showing the latest articles from multiple sources like NewsAPI, NYTimes, and EventRegistry.",
            "author": {
              "@type": "Person",
              "name": session?.user?.name || "User"
            },
            "datePublished": new Date().toISOString()
          })
        }} />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-300 flex items-center justify-center text-white shadow-md">
              <FiUser size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome back, <span className="text-blue-600">{session?.user?.name}</span>
              </h1>
              <p className="text-gray-500">Here's what's happening today</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-200 shadow-sm"
              aria-label="Sign Out"
            >
              <FiLogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Articles</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{articles.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-500">
                <FiBookmark size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-500">
                <FiClock size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">News Sources</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {availableSources.length - 1} {/* Subtract 1 for "All" */}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-500">
                <FiExternalLink size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Search and Filter */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-grow max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search articles by title or description..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex overflow-x-auto pb-2 md:pb-0">
                <div className="flex space-x-2">
                  {availableSources.map((source) => (
                    <button
                      key={source}
                      onClick={() => setActiveSource(source === 'All' ? 'all' : source)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                        (activeSource === 'all' && source === 'All') || activeSource === source
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {activeSource === 'all' ? 'All News' : `${activeSource} News`}
              {searchQuery && ` matching "${searchQuery}"`}
              <span className="text-sm text-gray-500 ml-2">
                ({filteredArticles.length} articles)
              </span>
            </h2>
            
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No articles found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery
                    ? 'Try a different search term or clear the search'
                    : 'Try selecting a different news source or check back later.'}
                </p>
                {(searchQuery || activeSource !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveSource('all');
                    }}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Show All Articles
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article, index) => (
                  <article
                    key={`${article.url}-${index}`}
                    className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 bg-white group"
                  >
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={article.urlToImage || '/default.jpg'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {article.apiSource}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <FiClock className="mr-1" size={14} />
                        {formatDate(article.publishedAt)}
                      </div>
                      <h2 className="font-semibold text-lg line-clamp-2 mb-3">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 transition-colors"
                        >
                          {article.title}
                        </a>
                      </h2>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{article.description}</p>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Read more <FiExternalLink className="ml-1" size={14} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 py-6 border-t border-gray-200">
          <p>Last updated: {new Date().toLocaleString()}</p>
          <p className="mt-1">© {new Date().getFullYear()} News Dashboard. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}