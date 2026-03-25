const http = require('http');

async function testAPI() {
  console.log('--- Starting API Tests ---');

  // Helper to make requests
  const makeRequest = (path, body) => {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      }, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => resolve({
          status: res.statusCode,
          data: JSON.parse(responseData)
        }));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  };

  try {
    // 1. Create a product
    console.log('Creating product...');
    const createRes = await makeRequest('/api/products', {
      name: 'Samsung 1.5 Ton AC',
      description: 'Split AC with fast cooling',
      price: 35000,
      image_url: 'http://example.com/ac.png',
      stock_quantity: 5,
      merchant_id: 'merchant123'
    });
    console.log('Create Response:', createRes.status, createRes.data);

    if (createRes.status !== 201) throw new Error('Failed to create product');

    const productId = createRes.data._id;
    console.log(`Product created with ID: ${productId} and stock: ${createRes.data.stock_quantity}`);

    // 2. Buy the product
    console.log('Buying product (placing order)...');
    const orderRes = await makeRequest('/api/orders', {
      productId: productId
    });
    console.log('Order Response:', orderRes.status, orderRes.data);
    
    if (orderRes.status !== 200) throw new Error('Failed to place order');
    console.log(`Order placed. New stock: ${orderRes.data.product.stock_quantity}`);

    console.log('--- API Tests Passed ---');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAPI();
