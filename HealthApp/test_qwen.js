const https = require('https');

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject).on('timeout', function() { this.destroy(); reject(new Error('timeout')); });
  });
}

(async () => {
  try {
    // Try httpbin for a reliable PNG
    let imgBuf = null;
    try {
      imgBuf = await download('https://httpbin.org/image/png');
      console.log('Downloaded:', imgBuf.length, 'bytes');
    } catch (e) {
      console.log('httpbin failed:', e.message);
    }

    if (!imgBuf || imgBuf.length < 100) {
      console.error('Could not get test image');
      process.exit(1);
    }

    const base64 = imgBuf.toString('base64');
    const body = JSON.stringify({
      model: 'qwen3.6-plus',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
            { type: 'text', text: 'List any foods you see in this image. Return ONLY a JSON array like [{"name":"food name","nameEn":"english name","confidence":0.95}]. If no food, return [].' }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    });

    console.log('Model: qwen3.6-plus');
    console.log('Request body size:', body.length, 'bytes');

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'dashscope.aliyuncs.com',
        path: '/compatible-mode/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer sk-e39078fa424c4bf8add3fbf3e661e26d',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    console.log('Status:', result.status);
    if (result.status === 200) {
      console.log('Content:', result.data.choices?.[0]?.message?.content);
    } else {
      console.log('Error:', JSON.stringify(result.data).slice(0, 1000));
    }
  } catch (e) {
    console.error('Failed:', e.message);
  }
})();
