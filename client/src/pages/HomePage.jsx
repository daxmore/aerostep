import AeroStepHero from '../components/AeroStepHero';
import CategoryTiles from '../components/CategoryTiles';
import EditorialGrid from '../components/EditorialGrid';
import NewArrivals from '../components/NewArrivals';
import FeaturedCollection from '../components/FeaturedCollection';
import BrandMessage from '../components/BrandMessage';
import SubscribeStrip from '../components/SubscribeStrip';

const HomePage = () => {
  return (
    <>
      <main>
        <AeroStepHero />
        <CategoryTiles />
        <EditorialGrid />
        <NewArrivals />
        <FeaturedCollection />
        <BrandMessage />
        <SubscribeStrip />
      </main>
    </>
  );
};

export default HomePage;
