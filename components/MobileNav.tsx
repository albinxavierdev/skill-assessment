'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        className="flex items-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {isOpen && (
        <div className="absolute top-16 right-0 left-0 z-50 bg-white shadow-lg py-2 px-4 border-t border-gray-200">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 py-2 font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/form"
              className="text-gray-600 hover:text-blue-600 py-2 font-medium"
              onClick={() => setIsOpen(false)}
            >
              Assessment
            </Link>
            <Link
              href="/report"
              className="text-gray-600 hover:text-blue-600 py-2 font-medium"
              onClick={() => setIsOpen(false)}
            >
              Reports
            </Link>
            <div className="pt-2 pb-1">
              <Link
                href="/form"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setIsOpen(false)}
              >
                Start Assessment
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
} 