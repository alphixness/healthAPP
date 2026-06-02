/**
 * 上传微调数据集到 DashScope (OpenAI 兼容模式)
 * 用法: node scripts/upload_dataset_node.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'sk-e39078fa424c4bf8add3fbf3e661e26d';
const datasetPath = path.resolve(__dirname, '..', 'data', 'finetune_dataset.jsonl');

if (!fs.existsSync(datasetPath)) {
  console.error('❌ 数据集文件不存在:', datasetPath);
  process.exit(1);
}

const fileContent = fs.readFileSync(datasetPath, 'utf-8');
const lines = fileContent.trim().split('\n').filter(Boolean);
console.log(`✅ 数据集: ${lines.length} 条样本`);

// ── 第一步：上传文件 ──
console.log('\n📤 正在上传数据集到 DashScope...');

const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
let body = '';
body += `--${boundary}\r\n`;
body += 'Content-Disposition: form-data; name="file"; filename="finetune_dataset.jsonl"\r\n';
body += 'Content-Type: application/jsonl\r\n\r\n';
body += fileContent;
body += `\r\n--${boundary}\r\n`;
body += 'Content-Disposition: form-data; name="purpose"\r\n\r\n';
body += 'fine-tune\r\n';
body += `--${boundary}--\r\n`;

const uploadReq = https.request({
  hostname: 'dashscope.aliyuncs.com',
  path: '/compatible-mode/v1/files',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(body),
  },
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.id) {
        const fileId = result.id;
        console.log(`✅ 文件上传成功!`);
        console.log(`   文件ID: ${fileId}`);
        console.log(`   状态: ${result.status}`);

        // ── 第二步：创建微调任务 ──
        console.log('\n📋 信息记录（等一下去百炼网页操作）:');
        console.log(`   文件ID: ${fileId}`);
        console.log(`   数据集大小: ${(fs.statSync(datasetPath).size / 1024).toFixed(1)} KB`);
        console.log(`   样本数: ${lines.length}`);
        console.log(`   格式: ChatML (system/user/assistant)`);
        console.log();

        // 直接尝试创建微调任务 (OpenAI兼容)
        createFineTuneJob(fileId);
      } else {
        console.error('❌ 上传失败:', JSON.stringify(result, null, 2));
        printManualInstructions();
      }
    } catch (e) {
      console.error('❌ 解析响应失败:', data.slice(0, 500));
      printManualInstructions();
    }
  });
});

uploadReq.on('error', (err) => {
  console.error('❌ 网络请求失败:', err.message);
  printManualInstructions();
});

uploadReq.write(body);
uploadReq.end();

function createFineTuneJob(fileId) {
  console.log('🔄 正在创建微调任务...');

  const jobBody = JSON.stringify({
    model: 'qwen3.5-turbo',
    training_file: fileId,
    hyperparameters: {
      n_epochs: 3,
      batch_size: 4,
      learning_rate_multiplier: 2e-4,
    },
    suffix: 'health-assistant-v1',
  });

  const jobReq = https.request({
    hostname: 'dashscope.aliyuncs.com',
    path: '/compatible-mode/v1/fine_tuning/jobs',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(jobBody),
    },
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.id) {
          console.log(`✅ 微调任务已提交!`);
          console.log(`   任务ID: ${result.id}`);
          console.log(`   模型: qwen3.5-turbo`);
          console.log(`   状态: ${result.status}`);
          console.log(`   训练轮数: 3`);
          console.log();
          console.log('📊 查看训练进度 (等几分钟后):');
          console.log(`   curl https://dashscope.aliyuncs.com/compatible-mode/v1/fine_tuning/jobs \\
  -H "Authorization: Bearer ${API_KEY.slice(0, 8)}..."`);
          console.log();
          console.log('⏳ 训练通常在 10-30 分钟内完成');
          console.log('   完成后在代码中把 model 字段改为微调后的模型名');
        } else {
          console.log('⚠️ 自动创建任务失败，请在百炼网页手动操作');
          console.log('返回:', JSON.stringify(result, null, 2));
          printManualInstructions(fileId);
        }
      } catch (e) {
        console.log('⚠️ 解析失败，请在百炼网页手动操作');
        printManualInstructions(fileId);
      }
    });
  });

  jobReq.on('error', (err) => {
    console.log('⚠️ 创建任务请求失败:', err.message);
    printManualInstructions(fileId);
  });

  jobReq.write(jobBody);
  jobReq.end();
}

function printManualInstructions(fileId) {
  console.log('\n📋 手动操作说明:');
  console.log('='.repeat(50));
  console.log('第1步: 打开百炼平台');
  console.log('  https://bailian.console.aliyun.com');
  console.log();
  if (fileId) {
    console.log('第2步: 进入「模型调优」→「新建微调任务」');
    console.log('  数据集文件ID:', fileId);
  } else {
    console.log('第2步: 进入「模型调优」→「数据集管理」→「创建数据集」');
    console.log('  上传文件:', datasetPath);
  }
  console.log();
  console.log('第3步: 配置微调参数');
  console.log('  基础模型: qwen3.5-turbo (推荐) 或 qwen3.5-plus');
  console.log('  方法: LoRA');
  console.log('  训练轮数: 3');
  console.log();
  console.log('第4步: 等待训练完成（约10-30分钟）');
  console.log();
  console.log('第5步: 更新 app 代码');
  console.log('  src/services/aiAssistantService.ts');
  console.log('  将 model 字段改为训练完成后的模型名');
}
