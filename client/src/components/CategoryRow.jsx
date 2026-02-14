const categories = [
  "All",
  "Engineering",
  "Medical",
  "School",
  "Novels",
  "Old Books",
  "New Books",
  "Donate"
];

export default function CategoryRow() {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex gap-8 px-6 py-4 overflow-x-auto">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="cursor-pointer font-semibold text-sm hover:text-blue-600 whitespace-nowrap"
          >
            {cat}
          </div>
        ))}
      </div>
    </div>
  );
}