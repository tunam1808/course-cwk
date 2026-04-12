// components/HeaderWithSearch.tsx

import { FaSearch } from "react-icons/fa";
import { HiChevronDown } from "react-icons/hi";
import { useState } from "react";

export default function HeaderWithSearch() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log("Tìm kiếm:", query);
    }
  };

  return (
    <header className="bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-full overflow-hidden rounded-lg border-2 border-white bg-black shadow-lg"
        >
          {/* Danh mục - ẩn trên mobile */}
          <button
            type="button"
            className="hidden sm:flex px-4 py-3 lg:px-5 lg:py-3.5 bg-gray-800 hover:bg-gray-700 text-white font-medium items-center gap-2 transition-colors border-r border-gray-700 whitespace-nowrap text-sm lg:text-base"
          >
            Danh mục
            <HiChevronDown className="w-4 h-4 lg:w-5 lg:h-5 opacity-80" />
          </button>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm tài nguyên..."
            className="flex-1 min-w-0 px-3 py-3 sm:px-4 sm:py-3.5 lg:px-5 bg-transparent text-white placeholder-gray-500 italic focus:outline-none text-sm lg:text-base"
          />

          {/* Nút tìm kiếm */}
          <button
            type="submit"
            className="px-4 py-3 sm:px-5 sm:py-3.5 lg:px-6 bg-[#ffff00] hover:bg-yellow-400 text-black font-bold flex items-center gap-2 transition-all duration-200 whitespace-nowrap text-sm lg:text-base"
          >
            <FaSearch className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Tìm kiếm</span>
          </button>
        </form>
      </div>
    </header>
  );
}
