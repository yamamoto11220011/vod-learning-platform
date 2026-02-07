import { Button } from "@/components/ui/button";

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {["すべて", ...categories].map((category) => (
        <Button
          key={category}
          type="button"
          variant={selected === category ? "default" : "secondary"}
          size="sm"
          onClick={() => onSelect(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
