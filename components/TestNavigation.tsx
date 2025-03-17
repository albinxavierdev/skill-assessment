'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TestNavigation() {
  const pathname = usePathname();
  
  const links = [
    { href: '/test', label: 'Test Home' },
    { href: '/test/db', label: 'DB Connection' },
    { href: '/test/form', label: 'Form Test' },
    { href: '/test/db-schema', label: 'DB Schema' },
    { href: '/admin', label: 'Admin Panel' },
    { href: '/', label: 'Main App' },
  ];
  
  return (
    <div className="bg-blue-700 text-white py-3 px-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
        <div className="font-bold text-lg mb-3 md:mb-0">SkillPrep Test Tools</div>
        
        <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
          {links.map((link) => (
            <Link 
              href={link.href} 
              key={link.href}
              className={`hover:underline ${pathname === link.href ? 'font-bold underline' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 