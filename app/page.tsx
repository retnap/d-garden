import Hero from "@/components/homepage/Hero";
import Last_Articles from "@/components/homepage/Last_Articles";
import EventSection from "@/components/homepage/eventSection";
import NewestWorks from "@/components/homepage/newestWorks";
import ExploreGardens from "@/components/homepage/ExploreGardens";

// Navbar ve Footer, SiteLayout tarafından tüm site sayfalarına tek yerden eklenir.
export default function Home() {
  return (
    <div>
        <Hero />

        <EventSection />

        <Last_Articles />

        <NewestWorks />

        <ExploreGardens />
    </div>
  );
}
