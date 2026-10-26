import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page Not Found');

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-ink/60">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
      >
        Back to home
      </Link>
    </div>
  );
}
