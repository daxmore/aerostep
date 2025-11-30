import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CategoryTiles = () => {
    const categories = [
        {
            title: 'Running',
            description: 'Built for speed',
            image: '/src/assets/images/product_images/high res sport shoe (1).jpeg',
            color: 'from-[#ffd4d4]/20 to-[#ffc4c4]/20'
        },
        {
            title: 'Training',
            description: 'Power through',
            image: '/src/assets/images/product_images/high res sport shoe (4).jpeg',
            color: 'from-[#c4d7ff]/20 to-[#b4c7ff]/20'
        },
        {
            title: 'Walking',
            description: 'Comfort meets style',
            image: '/src/assets/images/product_images/gray shoe with model (1).jpeg',
            color: 'from-[#ffd4ff]/20 to-[#ffc4ff]/20'
        },
    ];

    return (
        <section className="section-spacing bg-white">
            <div className="container-custom px-12 lg:px-20">
                {/* Section Header - Minimal */}
                <div className="mb-20">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">
                        Collections
                    </div>
                    <h2 className="text-heading text-5xl lg:text-6xl font-black text-[#0F1720]">
                        Shop by Category
                    </h2>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.title}
                            to={`/shop?category=${category.title.toLowerCase()}`}
                            className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden p-8 hover:border-gray-200 transition-all duration-300 hover:shadow-lg"
                        >
                            {/* Soft Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${category.color}`}></div>

                            {/* Content */}
                            <div className="relative z-10 space-y-6">
                                {/* Category Name */}
                                <div>
                                    <h3 className="text-3xl font-black text-[#0F1720] mb-2">
                                        {category.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm font-medium">
                                        {category.description}
                                    </p>
                                </div>

                                {/* Product Image */}
                                <div className="flex justify-center">
                                    <img
                                        src={category.image}
                                        alt={`${category.title} shoes`}
                                        className="w-full max-w-[280px] transform group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                                    />
                                </div>

                                {/* Arrow CTA */}
                                <div className="flex items-center gap-2 text-[#0F1720] font-bold text-sm group-hover:gap-3 transition-all">
                                    <span className="uppercase tracking-wide">Shop Now</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryTiles;
