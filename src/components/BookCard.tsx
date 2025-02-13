import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { FileText, Download, BookOpen } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onLoad?: () => void;
  index: number;
  progress: number;
}

export function BookCard({ book, onLoad, index, progress }: BookCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, Math.min(index * 100, 1000));
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (progress > 0) {
      const phase = Math.floor((progress / 100) * 4);
      setLoadingPhase(phase);
    }
  }, [progress]);

  const getImageUrl = (url: string) => {
    const fileIdMatch = url.match(/id=([^&]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
    }
    return url;
  };

  if (!book.title || !isLoaded) {
    return (
      <BookCardSkeleton progress={progress} phase={loadingPhase} index={index} />
    );
  }

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-800/50 to-indigo-800/50 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
      <div className="relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] shadow-sm hover:shadow-xl">
        <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 relative">
          {!imageError ? (
            <img
              src={getImageUrl(book.coverUrl)}
              alt={book.title}
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
              onLoad={onLoad}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
              <BookOpen className="h-12 w-12 text-slate-400 mb-2" />
              <span className="text-sm text-slate-500">Cover not available</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-800 transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1">by {book.author}</p>
            </div>
            {book.driveLink && (
              <a
                href={book.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full text-blue-800 hover:bg-blue-50 transition-colors"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-800 to-indigo-600 text-white shadow-sm">
              {book.category}
            </span>
            {book.fileType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-slate-800 to-slate-600 text-white shadow-sm">
                <FileText className="h-3 w-3" />
                {book.fileType}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 mt-4 line-clamp-2">{book.description}</p>

          {book.fileSize && (
            <p className="text-xs text-slate-500 mt-3">Size: {book.fileSize}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface SkeletonProps {
  progress: number;
  phase: number;
  index: number;
}

function BookCardSkeleton({ progress, phase, index }: SkeletonProps) {
  const loadingStates = [
    'Getting Books For You..',
    'Fetching details...',
    'Almost ready...',
    'Finalizing...',
  ];

  const delayedProgress = Math.max(0, progress - index * 5);
  const currentLoadingState = loadingStates[phase] || loadingStates[0];

  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-800/30 to-indigo-800/30 rounded-3xl blur opacity-25"></div>
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-100 to-indigo-100">
          <div
            className="h-full bg-gradient-to-r from-blue-800 to-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${delayedProgress}%` }}
          />
        </div>

        <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 shimmer" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                <div className="w-8 h-8 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-700 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                {currentLoadingState}
              </p>
              <p className="mt-2 text-xs text-slate-500 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full inline-block shadow-sm">
                7{delayedProgress}% Complete
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 relative">
          <div className="space-y-3">
            <div className="h-6 bg-slate-100 rounded-lg w-3/4 shimmer" />
            <div className="h-4 bg-slate-100 rounded-lg w-1/2 shimmer" />
            <div className="flex gap-2">
              <div className="h-6 bg-slate-100 rounded-full w-24 shimmer" />
              <div className="h-6 bg-slate-100 rounded-full w-16 shimmer" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 rounded-lg w-full shimmer" />
              <div className="h-4 bg-slate-100 rounded-lg w-2/3 shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}