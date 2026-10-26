import { useEffect } from 'react';

// Sets document.title for the page it's called in, then restores the
// previous title on unmount (so navigating away doesn't leave it stale
// if something else reads document.title in the meantime).
export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | CampusTrade`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
