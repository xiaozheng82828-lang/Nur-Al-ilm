import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const IslamicCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarGrid, setCalendarGrid] = useState<{ day: number, hijriDate: string }[]>([]);
  const [hijriMonthName, setHijriMonthName] = useState('');
  const [hijriYear, setHijriYear] = useState('');

  // Formatter for Hijri dates
  const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const hijriDayFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    day: 'numeric'
  });

  useEffect(() => {
    generateCalendar(currentDate);
  }, [currentDate]);

  const generateCalendar = (date: Date) => {
    // 1. Get current Hijri Month/Year string
    const parts = hijriFormatter.formatToParts(date);
    const mName = parts.find(p => p.type === 'month')?.value || '';
    const yr = parts.find(p => p.type === 'year')?.value || '';
    setHijriMonthName(mName);
    setHijriYear(yr);

    // 2. Simple Grid Generation:
    // Finding exact start/end of Hijri month using only Gregorian date iteration is tricky without a library.
    // Strategy: Render a 35-day window centered on the current date, highlight today.
    
    // Better Strategy for visual: Show current week + surrounding weeks.
    // Let's create a grid starting from 2 weeks ago to 2 weeks ahead.
    const grid = [];
    for (let i = -14; i <= 14; i++) {
        const d = new Date(date);
        d.setDate(date.getDate() + i);
        grid.push({
            day: d.getDate(), // Gregorian Day
            hijriDate: hijriFormatter.format(d), // Full Hijri String
            isToday: i === 0,
            dateObj: d
        });
    }
    // @ts-ignore
    setCalendarGrid(grid);
  };

  return (
    <div className="flex flex-col h-full p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-md border border-amber-100 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-800 p-6 text-white text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
           <h2 className="text-3xl font-bold font-arabic mb-1">{hijriMonthName}</h2>
           <p className="text-emerald-200 text-lg font-arabic">{hijriYear} AH</p>
           
           <div className="mt-4 inline-block bg-emerald-900/50 px-4 py-2 rounded-lg border border-emerald-600/50 backdrop-blur-sm">
             <span className="text-sm uppercase tracking-widest text-emerald-100">Today</span>
             <div className="text-xl font-bold mt-1">
                {hijriFormatter.format(new Date())}
             </div>
           </div>
        </div>

        {/* Scrollable List of Days */}
        <div className="p-4 bg-[#FFFBF2]">
            <h3 className="text-emerald-800 font-bold mb-4 flex items-center gap-2">
                <CalendarIcon size={20} />
                <span>Upcoming Days</span>
            </h3>
            <div className="space-y-2">
                {calendarGrid.map((item: any, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-3 rounded-xl border ${item.isToday ? 'bg-emerald-100 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-gray-100'}`}
                    >
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase">{item.dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="font-bold text-gray-800">{item.dateObj.getDate()} {item.dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                        </div>
                        <div className="text-right">
                             <span className={`font-arabic text-lg ${item.isToday ? 'text-emerald-800 font-bold' : 'text-emerald-600'}`}>
                                {item.hijriDate.split(' ')[0]} {/* Approximate day number extraction */}
                             </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">
        * Dates are approximate based on the Umm al-Qura calendar. Actual lunar visibility may vary.
      </p>
    </div>
  );
};
