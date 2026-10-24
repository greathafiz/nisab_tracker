import { getNisabValuesForPage } from "@/lib/nisab";
import { HomePageWrapper } from "@/components/homepage/HomePageWrapper";
import { PricesUnavailable } from "@/components/ui/PricesUnavailable";

export const revalidate = 3600;

export default async function Home() {
  const initialData = await getNisabValuesForPage();

  if (!initialData) return <PricesUnavailable />;

  return <HomePageWrapper initialData={initialData} />;
}
