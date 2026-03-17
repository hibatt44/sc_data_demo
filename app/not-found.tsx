import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';

export default function NotFound() {
  return (
    <PageContainer>
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-sc-text mb-4">Page Not Found</h1>
        <p className="text-sc-muted mb-8">The district or school you are looking for could not be found.</p>
        <Link href="/" className="bg-sc-blue text-white px-6 py-3 rounded font-semibold hover:bg-sc-blue-dark transition-colors">
          Back to State Overview
        </Link>
      </div>
    </PageContainer>
  );
}
