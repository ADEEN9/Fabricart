const { pool } = require('./db');
require('dotenv').config(); // Ensure variables are loaded if run standalone

const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('⏳ Creating Postgres tables if they do not exist...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        phone VARCHAR(20),
        street VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        zipCode VARCHAR(20),
        country VARCHAR(100) DEFAULT 'India',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('Shirting', 'Suiting')),
        material VARCHAR(50) NOT NULL CHECK (material IN ('Cotton', 'Linen', 'Silk', 'Polyester', 'Wool', 'Blend')),
        price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        description TEXT NOT NULL,
        image_url VARCHAR(255) DEFAULT '',
        image_public_id VARCHAR(255),
        ratings NUMERIC(3, 2) DEFAULT 0 CHECK (ratings >= 0 AND ratings <= 5),
        num_reviews INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Product Images table (for multiple images per product)
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        url VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL
      )
    `);

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        shipping_street VARCHAR(255) NOT NULL,
        shipping_city VARCHAR(100) NOT NULL,
        shipping_state VARCHAR(100) NOT NULL,
        shipping_zipCode VARCHAR(20) NOT NULL,
        shipping_country VARCHAR(100) DEFAULT 'India',
        payment_method VARCHAR(50) DEFAULT 'Stripe' CHECK (payment_method IN ('Stripe', 'COD', 'Razorpay')),
        payment_result_id VARCHAR(255),
        payment_result_status VARCHAR(50),
        payment_result_update_time VARCHAR(100),
        payment_result_email VARCHAR(255),
        items_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
        shipping_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
        tax_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
        total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
        is_paid BOOLEAN DEFAULT false,
        paid_at TIMESTAMP WITH TIME ZONE,
        is_delivered BOOLEAN DEFAULT false,
        delivered_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(50) DEFAULT 'Processing' CHECK (status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order Items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        name VARCHAR(120) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        quantity NUMERIC(10, 2) NOT NULL CHECK (quantity >= 0.5),
        price NUMERIC(10, 2) NOT NULL
      )
    `);

    console.log('✅ All Postgres tables successfully created/verified');
    client.release();
  } catch (error) {
    console.error('❌ Failed to initialize tables:', error.message);
    process.exit(1);
  }
};

// Optionally allow running this file directly from Node
if (require.main === module) {
  initializeDatabase().then(() => process.exit(0));
}

module.exports = initializeDatabase;
