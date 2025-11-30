const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const Review = require('./models/Review');

dotenv.config();

// ==================== USERS ====================
// Admin Users (isAdmin: true)
// These accounts have full access to the admin dashboard at /admin
const adminUsers = [
  {
    name: 'Admin User',
    email: 'admin@aerostep.com',
    password: 'Admin@123',
    phone: '9876543200',
    profileImage: 'https://i.pravatar.cc/150?img=1',
    isAdmin: true,
    addresses: [{
      fullName: 'Admin User',
      phone: '9876543200',
      street: '1 Admin Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      isDefault: true,
    }],
  },
];

// Regular Users (isAdmin: false)
// These are standard customer accounts for testing the shop
const regularUsers = [
  {
    name: 'Test User',
    email: 'test@test.com',
    password: 'Test@123',
    phone: '9876543210',
    profileImage: 'https://i.pravatar.cc/150?img=12',
    isAdmin: false,
    addresses: [
      {
        fullName: 'Test User',
        phone: '9876543210',
        street: '123 MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        isDefault: true,
      },
      {
        fullName: 'Test User',
        phone: '9876543210',
        street: '456 Park Street',
        city: 'Kolkata',
        state: 'West Bengal',
        zipCode: '700016',
        isDefault: false,
      },
    ],
  },
  {
    name: 'ankit',
    email: 'ankit@example.com',
    password: 'ankit@123',
    phone: '9876543211',
    profileImage: 'https://i.pravatar.cc/150?img=33',
    isAdmin: false,
    addresses: [
      {
        fullName: 'ankit',
        phone: '9876543211',
        street: '789 Connaught Place',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        isDefault: true,
      },
    ],
  },
];

// Combine all users
const users = [...adminUsers, ...regularUsers];

const products = [
  {
    title: 'AirFlow Pro Running Shoes - Cream',
    description: 'Premium lightweight running shoes with advanced air cushioning technology. Engineered for speed and endurance with breathable mesh upper and responsive midsole.',
    price: 5999,
    images: {
      primary: '/src/assets/images/product_images/cream shoe (1).jpeg',
      thumbnail: '/src/assets/images/product_images/cream shoe (1).jpeg',
      gallery: [
        '/src/assets/images/product_images/cream shoe (1).jpeg',
        '/src/assets/images/product_images/cream shoe (2).jpeg',
        '/src/assets/images/product_images/cream shoe (3).jpeg',
        '/src/assets/images/product_images/cream shoe (4).jpeg',
      ],
    },
    sizes: [
      { size: 6, stock: 8 },
      { size: 7, stock: 12 },
      { size: 8, stock: 15 },
      { size: 9, stock: 20 },
      { size: 10, stock: 10 },
      { size: 11, stock: 5 },
      { size: 12, stock: 3 },
    ],
    category: 'Running',
    tags: ['New Arrival', 'Best Seller'],
    featured: true,
    averageRating: 4.5,
    numReviews: 0,
  },
  {
    title: 'UltraBoost Performance - Gray Blue',
    description: 'Lightweight athletic sneakers with responsive boost technology. Perfect for high-intensity training and daily runs with superior energy return.',
    price: 7999,
    images: {
      primary: '/src/assets/images/product_images/gray blue shoe.jpeg',
      thumbnail: '/src/assets/images/product_images/gray blue shoe.jpeg',
      gallery: [
        '/src/assets/images/product_images/gray blue shoe.jpeg',
      ],
    },
    sizes: [
      { size: 6, stock: 5 },
      { size: 7, stock: 8 },
      { size: 8, stock: 12 },
      { size: 9, stock: 15 },
      { size: 10, stock: 7 },
      { size: 11, stock: 4 },
    ],
    category: 'Running',
    tags: ['Best Seller'],
    featured: true,
    averageRating: 4.7,
    numReviews: 0,
  },
  {
    title: 'Velocity Sport Trainer - Gray',
    description: 'Versatile training shoes designed for high-intensity workouts. Features dynamic support and superior grip for all-around athletic performance.',
    price: 4999,
    images: {
      primary: '/src/assets/images/product_images/gray shoe (1).jpeg',
      thumbnail: '/src/assets/images/product_images/gray shoe (1).jpeg',
      gallery: [
        '/src/assets/images/product_images/gray shoe (1).jpeg',
        '/src/assets/images/product_images/gray shoe (2).jpeg',
      ],
    },
    sizes: [
      { size: 5, stock: 10 },
      { size: 6, stock: 15 },
      { size: 7, stock: 18 },
      { size: 8, stock: 12 },
      { size: 9, stock: 8 },
      { size: 10, stock: 5 },
    ],
    category: 'Training',
    tags: ['New Arrival'],
    featured: false,
    averageRating: 4.3,
    numReviews: 0,
  },
  {
    title: 'Elite Performance Runner - White',
    description: 'High-performance running shoes with carbon fiber plate technology. Designed for competitive athletes seeking maximum speed and efficiency.',
    price: 8999,
    images: {
      primary: '/src/assets/images/product_images/white shoes (1).jpeg',
      thumbnail: '/src/assets/images/product_images/white shoes (1).jpeg',
      gallery: [
        '/src/assets/images/product_images/white shoes (1).jpeg',
        '/src/assets/images/product_images/white shoes (2).jpeg',
      ],
    },
    sizes: [
      { size: 6, stock: 4 },
      { size: 7, stock: 6 },
      { size: 8, stock: 10 },
      { size: 9, stock: 12 },
      { size: 10, stock: 8 },
      { size: 11, stock: 3 },
    ],
    category: 'Running',
    tags: ['Limited Edition'],
    featured: false,
    averageRating: 4.1,
    numReviews: 0,
  },
  {
    title: 'Pro Sport Sneaker - Purple',
    description: 'Bold performance sneakers with advanced cushioning system. Ideal for gym workouts, running, and everyday athletic activities.',
    price: 6499,
    images: {
      primary: '/src/assets/images/product_images/purple shoe (1).jpeg',
      thumbnail: '/src/assets/images/product_images/purple shoe (1).jpeg',
      gallery: [
        '/src/assets/images/product_images/purple shoe (1).jpeg',
        '/src/assets/images/product_images/purple shoe (2).jpeg',
        '/src/assets/images/product_images/purple shoe (3).jpeg',
        '/src/assets/images/product_images/purple shoe (4).jpeg',
      ],
    },
    sizes: [
      { size: 5, stock: 8 },
      { size: 6, stock: 12 },
      { size: 7, stock: 15 },
      { size: 8, stock: 10 },
      { size: 9, stock: 6 },
    ],
    category: 'Training',
    tags: ['Best Seller'],
    featured: false,
    averageRating: 4.6,
    numReviews: 0,
  },
  {
    title: 'MaxFlex Training Shoe',
    description: 'High-top training shoes with ankle support and maximum grip. Built for explosive movements and lateral stability during intense training.',
    price: 7499,
    images: {
      primary: '/src/assets/images/product_images/high res sport shoe (1).jpeg',
      thumbnail: '/src/assets/images/product_images/high res sport shoe (1).jpeg',
      gallery: [
        '/src/assets/images/product_images/high res sport shoe (1).jpeg',
        '/src/assets/images/product_images/high res sport shoe (2).jpeg',
        '/src/assets/images/product_images/high res sport shoe (3).jpeg',
      ],
    },
    sizes: [
      { size: 7, stock: 3 },
      { size: 8, stock: 5 },
      { size: 9, stock: 8 },
      { size: 10, stock: 10 },
      { size: 11, stock: 6 },
      { size: 12, stock: 4 },
    ],
    category: 'Training',
    tags: ['Limited Edition'],
    featured: true,
    averageRating: 4.8,
    numReviews: 0,
  },
  {
    title: 'Swift Runner Pro - Gray',
    description: 'Professional-grade running shoes with advanced traction and breathability. Perfect for marathon training and long-distance runs.',
    price: 6999,
    images: {
      primary: '/src/assets/images/product_images/gray shoe with model (1).jpeg',
      thumbnail: '/src/assets/images/product_images/gray shoe with model (1).jpeg',
      gallery: [
        '/src/assets/images/product_images/gray shoe with model (1).jpeg',
        '/src/assets/images/product_images/gray shoe with model (2).jpeg',
      ],
    },
    sizes: [
      { size: 6, stock: 10 },
      { size: 7, stock: 15 },
      { size: 8, stock: 18 },
      { size: 9, stock: 20 },
      { size: 10, stock: 12 },
    ],
    category: 'Running',
    tags: ['New Arrival'],
    featured: false,
    averageRating: 4.2,
    numReviews: 0,
  },
  {
    title: 'Premium Sport Elite',
    description: 'Flagship performance shoes with cutting-edge technology. Features adaptive fit system and superior energy return for peak athletic performance.',
    price: 9999,
    images: {
      primary: '/src/assets/images/product_images/high res sport shoe (4).jpeg',
      thumbnail: '/src/assets/images/product_images/high res sport shoe (4).jpeg',
      gallery: [
        '/src/assets/images/product_images/high res sport shoe (4).jpeg',
        '/src/assets/images/product_images/high res sport shoe (5).jpeg',
      ],
    },
    sizes: [
      { size: 7, stock: 5 },
      { size: 8, stock: 7 },
      { size: 9, stock: 10 },
      { size: 10, stock: 8 },
      { size: 11, stock: 4 },
    ],
    category: 'Basketball',
    tags: ['Limited Edition'],
    featured: true,
    averageRating: 4.4,
    numReviews: 0,
  },
  {
    title: 'CloudWalk Performance - White',
    description: 'Ultra-comfortable performance shoes with cloud-like cushioning. Designed for all-day wear and versatile athletic activities.',
    price: 5499,
    images: {
      primary: '/src/assets/images/product_images/white_background_isolated_product_shot_of_a (1).jpeg',
      thumbnail: '/src/assets/images/product_images/white_background_isolated_product_shot_of_a (1).jpeg',
      gallery: [
        '/src/assets/images/product_images/white_background_isolated_product_shot_of_a (1).jpeg',
        '/src/assets/images/product_images/white_background_isolated_product_shot_of_a (2).jpeg',
      ],
    },
    sizes: [
      { size: 5, stock: 12 },
      { size: 6, stock: 16 },
      { size: 7, stock: 20 },
      { size: 8, stock: 18 },
      { size: 9, stock: 10 },
    ],
    category: 'Casual',
    tags: ['New Arrival'],
    featured: false,
    averageRating: 4.5,
    numReviews: 0,
  },
  {
    title: 'Cream Sport Classic',
    description: 'Timeless athletic shoes combining style and performance. Features premium materials and classic design for everyday athletic wear.',
    price: 4499,
    images: {
      primary: '/src/assets/images/product_images/cream shoe and bg.jpeg',
      thumbnail: '/src/assets/images/product_images/cream shoe and bg.jpeg',
      gallery: [
        '/src/assets/images/product_images/cream shoe and bg.jpeg',
      ],
    },
    sizes: [
      { size: 6, stock: 15 },
      { size: 7, stock: 18 },
      { size: 8, stock: 20 },
      { size: 9, stock: 15 },
      { size: 10, stock: 10 },
    ],
    category: 'Casual',
    tags: [],
    featured: false,
    averageRating: 4.0,
    numReviews: 0,
  },
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('🔄 Clearing existing data...');
    await Product.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('👥 Importing users...');
    const createdUsers = await User.insertMany(users);
    console.log('✅ Users imported!');

    console.log('👟 Importing products...');
    const createdProducts = await Product.insertMany(products);
    console.log('✅ Products imported!');

    // Add products to test user's wishlist (regular user, not admin)
    console.log('❤️  Creating wishlist...');
    createdUsers[1].wishlist = [
      createdProducts[1]._id,
      createdProducts[5]._id,
      createdProducts[2]._id
    ];
    await createdUsers[1].save();
    console.log('✅ Wishlist created!');

    // Create reviews
    console.log('⭐ Creating reviews...');
    const reviews = [
      {
        userId: createdUsers[1]._id,  // Test User
        productId: createdProducts[0]._id,
        rating: 5,
        title: 'Amazing shoes!',
        comment: 'Very comfortable, perfect for long runs. Highly recommend!',
      },
      {
        userId: createdUsers[2]._id,  // John Doe
        productId: createdProducts[0]._id,
        rating: 4,
        title: 'Good quality',
        comment: 'Great cushioning but a bit pricey',
      },
      {
        userId: createdUsers[1]._id,  // Test User
        productId: createdProducts[1]._id,
        rating: 5,
        title: 'Best sneakers ever',
        comment: 'The boost technology is incredible. Worth every rupee!',
      },
      {
        userId: createdUsers[2]._id,  // John Doe
        productId: createdProducts[5]._id,
        rating: 5,
        title: 'Perfect for training',
        comment: 'Great ankle support and excellent grip during workouts',
      },
    ];

    await Review.insertMany(reviews);
    console.log('✅ Reviews imported!');

    // Update product ratings
    console.log('📊 Updating product ratings...');
    for (let product of createdProducts) {
      const productReviews = reviews.filter(
        r => r.productId.toString() === product._id.toString()
      );
      if (productReviews.length > 0) {
        const avgRating =
          productReviews.reduce((acc, item) => acc + item.rating, 0) /
          productReviews.length;
        await Product.findByIdAndUpdate(product._id, {
          averageRating: avgRating,
          numReviews: productReviews.length,
        });
      }
    }
    console.log('✅ Product ratings updated!');

    console.log('\n🎉 All Data Imported Successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${createdUsers.length} users (${adminUsers.length} admin, ${regularUsers.length} regular)`);
    console.log(`   - ${createdProducts.length} products with size-specific stock`);
    console.log(`   - ${reviews.length} product reviews`);
    console.log(`   - 1 wishlist with 3 products\n`);
    console.log('🔑 Admin Login:');
    console.log(`   Email: admin@aerostep.com`);
    console.log(`   Password: Admin@123\n`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Product.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('✅ Data Destroyed!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
