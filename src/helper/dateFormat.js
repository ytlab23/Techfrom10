const dateFormat = (date) => {
  const now = new Date();
  const timestamp = new Date(date);

  if (timestamp.toString() === "Invalid Date") return date;

  const diff = now - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 72) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

export default dateFormat;
