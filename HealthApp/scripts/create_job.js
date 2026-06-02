/**
 * 通过 DashScope API 直接创建微调任务
 * 文件已上传成功，ID: file-ft-b9027e0434be4e489295dda2
 */
const https = require('https');

const API_KEY = 'sk-e39078fa424c4bf8add3fbf3e661e26d';
const FILE_ID = 'file-ft-b9027e0434be4e489295dda2';

function callAPI(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = https.request({
      hostname: 'dashscope.aliyuncs.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(resp)); }
        catch { resolve({ raw: resp }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // 方案1: OpenAI 兼容模式 (刚才试了不行，再试一次加headers)
  console.log('尝试方案1: OpenAI兼容模式...');
  const r1 = await callAPI('POST', '/compatible-mode/v1/fine_tuning/jobs', {
    model: 'qwen3.5-turbo',
    training_file: FILE_ID,
    hyperparameters: { n_epochs: 3, batch_size: 4, learning_rate_multiplier: 2e-4 },
    suffix: 'health-assistant-v1',
  });
  if (r1.id) {
    console.log('✅ 方案1成功!');
    console.log('任务ID:', r1.id);
    console.log('状态:', r1.status);
    return;
  }
  console.log('方案1失败:', JSON.stringify(r1).slice(0, 300));

  // 方案2: DashScope v1 API (fine-tunes)
  console.log('\n尝试方案2: DashScope v1 fine-tunes API...');
  const r2 = await callAPI('POST', '/api/v1/fine-tunes', {
    model: 'qwen3.5-turbo',
    training_file_ids: [FILE_ID],
    suffix: 'health-assistant-v1',
    parameters: {
      n_epochs: 3,
      batch_size: 4,
      learning_rate: 2e-4,
    },
  });
  if (r2.id || r2.output?.job_id || r2.output?.fine_tuned_model) {
    console.log('✅ 方案2成功!');
    console.log(JSON.stringify(r2, null, 2));
    return;
  }
  console.log('方案2失败:', JSON.stringify(r2).slice(0, 300));

  // 方案3: 百炼专属 API
  console.log('\n尝试方案3: 百炼 fine-tuning API...');
  const r3 = await callAPI('POST', '/api/v1/fine-tuning/jobs', {
    model: 'qwen3.5-turbo',
    training_files: [FILE_ID],
    training_type: 'lora',
    hyper_parameters: {
      epochs: 3,
      batch_size: 4,
      learning_rate: 0.0002,
    },
  });
  if (r3.id || r3.data?.id) {
    console.log('✅ 方案3成功!');
    console.log(JSON.stringify(r3, null, 2));
    return;
  }
  console.log('方案3失败:', JSON.stringify(r3).slice(0, 300));

  console.log('\n❌ 所有API方案都失败了');
  console.log('请手动在网页操作: https://bailian.console.aliyun.com');
  console.log('数据集文件已上传成功，ID:', FILE_ID);
}

main().catch(console.error);
