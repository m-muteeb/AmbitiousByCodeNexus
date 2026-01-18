// Utility functions (Mocked)

export const formatCurrency = (amount) => {
  return `$${amount}`;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

// Removed Supabase data fetching functions like fetchTopics, etc.
// If valid frontend-only logic existed, it would be preserved here.
