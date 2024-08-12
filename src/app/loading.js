import "@/styles/loadingMain.scss";

export default function Loading() {
  return (
    <div className="skeleton-container-wrap">
      <div className="skeleton-fixed">
        <div className="skeleton-search-bar"></div>
        <div className="skeleton-card"></div>
      </div>
      <div className="skeleton-container">
        <div className="skeleton-head"></div>
        <div className="skeleton-image"></div>
        <div className="skeleton-lines">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
    </div>
  );
}
