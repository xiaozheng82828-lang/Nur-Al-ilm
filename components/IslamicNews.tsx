import React, { useEffect, useState } from 'react';
import { getIslamicNews } from '../services/geminiService';
import { NewsItem } from '../types';
import { Newspaper, Loader2, MapPin, Clock, User, Globe } from 'lucide-react';

export const IslamicNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const items = await getIslamicNews();
      setNews(items);
      setLoading(false);
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-emerald-700 gap-3 min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-arabic animate-pulse">Gathering news from around the world...</p>
      </div>
    );
  }

  return (
    <div className="p-4 animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
           <Newspaper size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Islamic World News</h2>
          <p className="text-xs text-slate-500">Daily Updates</p>
        </div>
      </div>

      <div className="space-y-4">
        {news.length === 0 ? (
           <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
             No news available at the moment. Please try again later.
           </div>
        ) : (
          news.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-slate-800 text-lg mb-3 leading-snug">{item.headline}</h3>
              
              <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600 mb-4">
                 <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-amber-500" />
                    <span>{item.datetime}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-emerald-600" />
                    <span className="truncate">{item.location}</span>
                 </div>
                 <div className="flex items-center gap-1.5 col-span-2">
                    <User size={12} className="text-slate-400" />
                    <span className="truncate">By {item.reporters}</span>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                 <div className="flex items-center gap-1.5">
                    <Globe size={12} className="text-blue-500" />
                    <span className="text-xs font-medium text-slate-700">{item.platform}</span>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
