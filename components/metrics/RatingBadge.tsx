import type { SchoolRating } from '@/lib/data/types';

const RATING_STYLES: Record<SchoolRating, string> = {
  'Excellent':      'bg-sc-gold text-sc-text',
  'Good':           'bg-green-700 text-white',
  'Average':        'bg-amber-600 text-white',
  'Below Average':  'bg-red-700 text-white',
  'Unsatisfactory': 'bg-red-900 text-white',
  'Not Rated':      'bg-gray-500 text-white',
};

interface Props {
  rating: SchoolRating;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingBadge({ rating, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-4 py-1.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${RATING_STYLES[rating]} ${sizeClass}`}>
      {rating}
    </span>
  );
}
