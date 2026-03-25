const http = require('http');
const fs = require('fs');

async function testAPI() {
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
          data: JSON.parse(responseData || '{}')
        }));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  };

  try {
    let out = '';
    out += 'Creating product...\n';
    const createRes = await makeRequest('/api/products', {
      name: 'Samsung 1.5 Ton AC',
      description: 'Split AC with fast cooling',
      price: 35000,
      image_url: 'http://example.com/ac.png',
      stock_quantity: 5,
      merchant_id: 'merchant123'
    });
    out += `Create Response: ${createRes.status} ${JSON.stringify(createRes.data)}\n`;

    if (createRes.status !== 201) throw new Error('Failed to create product');

    const productId = createRes.data._id;
    out += 'Buying product...\n';
    const orderRes = await makeRequest('/api/orders', { productId });
    out += `Order Response: ${orderRes.status} ${JSON.stringify(orderRes.data)}\n`;

    fs.writeFileSync('test_results.txt', out);
  } catch (error) {
    fs.writeFileSync('test_results.txt', 'Error: ' + error.toString());
  }
}

testAPI();
