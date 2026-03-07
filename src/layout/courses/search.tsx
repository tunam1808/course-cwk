// components/HeaderWithSearch.tsx
import { NavLink } from "react-router-dom";
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
    <header className="bg-black ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <form
          onSubmit={handleSearch}
          className="flex rounded-lg overflow-hidden border-2 border-white bg-black shadow-lg shadow-yellow-900/10"
        >
          {/* Danh mục */}
          <button
            type="button"
            className="px-5 py-3.5 bg-gray-800 hover:bg-gray-700 text-white font-medium flex items-center gap-2 transition-colors border-r border-gray-700"
          >
            Danh mục
            <HiChevronDown className="w-5 h-5 opacity-80" />
          </button>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm tài nguyên background, elements,..."
            className="flex-1 px-5 py-3.5 bg-transparent text-white placeholder-gray-500 italic focus:outline-none text-base"
          />

          {/* Nút tìm kiếm */}
          <button
            type="submit"
            className="px-6 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold flex items-center gap-2 transition-all duration-200"
          >
            <FaSearch className="w-5 h-5" />
            Tìm kiếm
          </button>
        </form>
      </div>
    </header>
  );
}
