import { useState, useEffect, useMemo } from 'react';
import { Library, ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from './data';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { BookCard } from './components/BookCard';
import { fetchBooks } from './api';
import { Book } from './types';

// Priority books that should always appear on the first page
const PRIORITY_BOOKS = [
  'Indian Polity by Laxmikanth 6th Edition English Medium McGraw Hill',
  'History of Modern India 2020 Edition Bipan Chandra',
  'Geography of India Majid Husain 9th Edition',
  'Ecology Environment Quick Revision Material Disha Experts',
  'Magbook Indian History Janmenjay Sahni',
  'Magbook General Science Poonam Singh',
  'Indian Economy by Ramesh Singh 12th Edition'
];

function App() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const booksPerPage = 9;

  const placeholderBooks = Array(booksPerPage).fill(null).map((_, i) => ({
    id: `placeholder-${i}`,
    title: '',
    author: '',
    category: '',
    coverUrl: '',
    description: '',
  }));

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const fetchedBooks = await fetchBooks();
        setBooks(fetchedBooks);
        
        let progress = 0;
        const interval = setInterval(() => {
          progress += 2;
          if (progress <= 100) {
            setTotalProgress(progress);
          } else {
            clearInterval(interval);
            setInitialLoadComplete(true);
          }
        }, 20);
      } catch (err) {
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  useEffect(() => {
    // Reset to first page when search or category changes
    setCurrentPage(1);
  }, [search, selectedCategory]);

  const handleImageLoad = (bookId: string) => {
    setLoadedImages(prev => prev + 1);
  };

  const filteredBooks = useMemo(() => {
    const filtered = books.filter((book) => {
      const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
                          book.author.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // If we're on the first page and there's no search or category filter,
    // ensure priority books appear first
    if (currentPage === 1 && !search && !selectedCategory) {
      const priorityBooks: Book[] = [];
      const otherBooks: Book[] = [];

      filtered.forEach(book => {
        if (PRIORITY_BOOKS.some(title => 
          book.title.toLowerCase().includes(title.toLowerCase())
        )) {
          priorityBooks.push(book);
        } else {
          otherBooks.push(book);
        }
      });

      // Sort priority books to match the order in PRIORITY_BOOKS
      priorityBooks.sort((a, b) => {
        const aIndex = PRIORITY_BOOKS.findIndex(title => 
          a.title.toLowerCase().includes(title.toLowerCase())
        );
        const bIndex = PRIORITY_BOOKS.findIndex(title => 
          b.title.toLowerCase().includes(title.toLowerCase())
        );
        return aIndex - bIndex;
      });

      return [...priorityBooks, ...otherBooks];
    }

    return filtered;
  }, [books, search, selectedCategory, currentPage]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  
  const displayBooks = useMemo(() => {
    if (loading) return placeholderBooks;
    
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
    
    if (!initialLoadComplete && currentPage > 2) {
      return currentBooks.slice(0, booksPerPage * 2);
    }
    
    return currentBooks;
  }, [loading, filteredBooks, currentPage, indexOfFirstBook, indexOfLastBook, initialLoadComplete]);

  const paginate = (direction: 'prev' | 'next') => {
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="glass-nav sticky top-0 z-50 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Library className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Digital Library
              </h1>
            </div>
            <SearchBar search={search} setSearch={setSearch} />
          </div>
        </div>
        {loading && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-200">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {error ? (
          <div className="text-center py-12">
            <div className="inline-block bg-red-50 rounded-lg p-8 border border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayBooks.map((book, index) => (
                <BookCard 
                  key={book.id}
                  book={book}
                  index={index}
                  onLoad={() => handleImageLoad(book.id)}
                  progress={totalProgress}
                />
              ))}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-4">
                <button
                  onClick={() => paginate('prev')}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  <span>Previous</span>
                </button>
                
                <div className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={() => paginate('next')}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              </div>
            )}

            {!loading && !error && filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-block bg-slate-50 rounded-lg p-8 border border-slate-200">
                  <p className="text-slate-600 text-lg">
                    No books found. Try adjusting your search or filters.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
