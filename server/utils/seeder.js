const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const User = require('../models/User');

dotenv.config();

const sampleProducts = [
    {
        name: 'Premium Egyptian Cotton Shirting',
        brand: 'Raymond',
        category: 'Shirting',
        material: 'Cotton',
        price: 1299,
        stock: 50,
        description: 'Luxurious 100% Egyptian cotton fabric with a silky smooth finish. Perfect for formal and semi-formal shirts. Available in a rich white shade with excellent breathability.',
        imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
        ratings: 4.5,
        numReviews: 28,
    },
    {
        name: 'Italian Linen Summer Shirting',
        brand: 'Arvind',
        category: 'Shirting',
        material: 'Linen',
        price: 1599,
        stock: 35,
        description: 'Breathable Italian linen fabric, ideal for summers. Features a natural texture and gentle drape. Perfect for casual and resort-wear shirts.',
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
        ratings: 4.2,
        numReviews: 15,
    },
    {
        name: 'Oxford Weave Cotton Shirting',
        brand: 'Bombay Dyeing',
        category: 'Shirting',
        material: 'Cotton',
        price: 899,
        stock: 80,
        description: 'Classic Oxford weave cotton fabric with a basketweave texture. Durable and easy to maintain. Ideal for everyday formal wear shirts.',
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
        ratings: 4.0,
        numReviews: 42,
    },
    {
        name: 'Silk Blend Luxury Shirting',
        brand: 'Raymond',
        category: 'Shirting',
        material: 'Silk',
        price: 2499,
        stock: 20,
        description: 'Exquisite silk-cotton blend fabric with a natural sheen. Lightweight and comfortable. Perfect for special occasions and premium formal shirts.',
        imageUrl: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
        ratings: 4.8,
        numReviews: 12,
    },
    {
        name: 'Tropical Wool Suiting',
        brand: 'Raymond',
        category: 'Suiting',
        material: 'Wool',
        price: 3499,
        stock: 25,
        description: 'Lightweight tropical wool suiting fabric, perfect for year-round wear. Excellent drape and wrinkle resistance. Ideal for professional suits.',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
        ratings: 4.7,
        numReviews: 35,
    },
    {
        name: 'Polyester Blend Formal Suiting',
        brand: 'Park Avenue',
        category: 'Suiting',
        material: 'Polyester',
        price: 1899,
        stock: 60,
        description: 'High-quality polyester-viscose blend suiting fabric. Wrinkle-free and easy maintenance. Features a smooth finish perfect for office wear.',
        imageUrl: 'https://images.unsplash.com/photo-1594938374182-a57061daf372?w=800',
        ratings: 3.9,
        numReviews: 22,
    },
    {
        name: 'Italian Wool Premium Suiting',
        brand: 'Arvind',
        category: 'Suiting',
        material: 'Wool',
        price: 4999,
        stock: 15,
        description: 'Premium Italian merino wool suiting fabric. Exceptionally soft with a natural stretch. The ultimate choice for luxury bespoke suits.',
        imageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800',
        ratings: 4.9,
        numReviews: 8,
    },
    {
        name: 'Linen Cotton Blend Suiting',
        brand: 'Siyaram',
        category: 'Suiting',
        material: 'Blend',
        price: 2199,
        stock: 40,
        description: 'A perfect blend of linen and cotton for summer suiting. Breathable and comfortable with a natural, textured look. Great for semi-formal blazers.',
        imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800',
        ratings: 4.3,
        numReviews: 19,
    },
];

const adminUser = {
    name: 'Admin',
    email: 'admin@fabricart.com',
    password: 'admin123',
    role: 'admin',
};

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Product.deleteMany({});
        await User.deleteMany({});
        console.log('Cleared existing data');

        // Seed admin user
        const admin = await User.create(adminUser);
        console.log(`✅ Admin user created: ${admin.email}`);

        // Seed products
        await Product.insertMany(sampleProducts);
        console.log(`✅ ${sampleProducts.length} products seeded`);

        console.log('\n🌱 Database seeded successfully!');
        console.log('   Admin: admin@fabricart.com / admin123\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        process.exit(1);
    }
};

seedDB();
