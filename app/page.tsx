import { Button } from "@/components/ui/shadcn/button";
import { getNisabValues } from "@/app/api/nisab/route";
import { HomePageWrapper } from "@/components/homepage/HomePageWrapper";

export const revalidate = 3600;

export default async function Home() {
  const initialData = await getNisabValues("USD", 1);

  if (!initialData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-xl">!</span>
          </div>
          <p className="text-red-600 font-medium mb-4">
            Failed to load current data. Please reload the page.
          </p>
          <form action="">
            <Button variant="outline" type="submit">
              Reload
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <HomePageWrapper initialData={initialData} />;
}
