import React from 'react';

/**
 * Utility: Fuzzy / accent-insensitive search
 * "nguyen" will match "Nguyễn", "NGUYEN", "nguyền", etc.
 */
export const normalizeStr = (str = '') =>
  str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');   // strip diacritics

export const fuzzyMatch = (haystack = '', needle = '') =>
  normalizeStr(haystack).includes(normalizeStr(needle));

const AdminSearchBar = ({ value, onChange, placeholder = 'Tìm kiếm...' }) => (
  <div className="relative w-full md:w-72">
    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">search</span>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    )}
  </div>
);

export default AdminSearchBar;
