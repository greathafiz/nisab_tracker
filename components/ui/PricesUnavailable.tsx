import { Button } from "@/components/ui/shadcn/button";

export function PricesUnavailable() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
          <span className="text-white font-bold text-xl">!</span>
        </div>
        {/* The page's only heading while prices are down */}
        <h1 className="text-red-600 font-medium mb-4">
          Failed to load current data. Please reload the page.
        </h1>
        <form action="">
          <Button variant="outline" type="submit">
            Reload
          </Button>
        </form>
      </div>
    </div>
  );
}
