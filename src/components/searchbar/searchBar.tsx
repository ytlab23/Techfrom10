import CancelIcon from "@mui/icons-material/Cancel";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  handleSearchReset: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleSearchReset,
}) => {
  return (
    <div className="hero-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          required
        />
        {searchQuery && (
          <CancelIcon onClick={handleSearchReset} className="cancel-icon" />
        )}
        <button>search</button>
      </form>
    </div>
  );
};
