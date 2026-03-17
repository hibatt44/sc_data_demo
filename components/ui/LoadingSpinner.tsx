export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-16" role="status" aria-label="Loading">
      <div className="w-10 h-10 border-4 border-sc-blue-light border-t-sc-blue rounded-full animate-spin" />
    </div>
  );
}
