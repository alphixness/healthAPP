"""
健康助手微调数据集上传脚本
用法: python scripts/upload_dataset.py
"""

import json
import os
import sys

# 确保 api_key 通过环境变量传入，或手动填写
DASHSCOPE_API_KEY = os.environ.get('DASHSCOPE_API_KEY') or os.environ.get('EXPO_PUBLIC_QWEN_API_KEY')

if not DASHSCOPE_API_KEY:
    print("❌ 未找到 API Key")
    print("请先设置环境变量:")
    print("  set DASHSCOPE_API_KEY=sk-xxx")
    print("或者直接编辑本脚本，填入 api_key")
    sys.exit(1)

# 读取数据集
dataset_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'finetune_dataset.jsonl')
if not os.path.exists(dataset_path):
    print(f"❌ 数据集文件不存在: {dataset_path}")
    sys.exit(1)

# 统计数据集
with open(dataset_path, 'r', encoding='utf-8') as f:
    lines = [l.strip() for l in f if l.strip()]
print(f"✅ 数据集文件: {dataset_path}")
print(f"   样本数: {len(lines)}")

# 验证格式
errors = 0
for i, line in enumerate(lines):
    try:
        data = json.loads(line)
        msgs = data.get('messages', [])
        if len(msgs) != 3:
            print(f"⚠️ 第{i+1}行消息数不为3: {len(msgs)}")
            errors += 1
        roles = [m['role'] for m in msgs]
        if roles != ['system', 'user', 'assistant']:
            print(f"⚠️ 第{i+1}行角色顺序错误: {roles}")
            errors += 1
    except Exception as e:
        print(f"❌ 第{i+1}行JSON解析失败: {e}")
        errors += 1

if errors:
    print(f"❌ 发现 {errors} 个错误，请修复后重试")
    sys.exit(1)

print(f"✅ 格式验证通过，准备上传到 DashScope...")

try:
    import dashscope
except ImportError:
    print("正在安装 dashscope SDK...")
    os.system(f"{sys.executable} -m pip install dashscope -q")
    import dashscope

dashscope.api_key = DASHSCOPE_API_KEY

# 上传文件
print("正在上传数据集到 DashScope（上传可能需要几分钟）...")
try:
    upload_result = dashscope.upload_file(dataset_path)
    file_id = upload_result.get('uploaded_files', [{}])[0].get('file_id', '')
    if file_id:
        print(f"\n✅ 上传成功！")
        print(f"   文件ID: {file_id}")
        print(f"\n📋 下一步操作：")
        print(f"   1. 打开 https://bailian.console.aliyun.com  → 模型调优")
        print(f"   2. 点击「新建微调任务」")
        print(f"   3. 数据集选刚才上传的文件（ID: {file_id}）")
        print(f"   4. 基础模型选 qwen3.5-turbo 或 qwen3.5-plus")
        print(f"   5. 方法选 LoRA（高效微调，效果好且便宜）")
        print(f"   6. 学习率保持默认（2e-4），训练轮数建议 3-5 轮")
        print(f"   7. 提交训练（通常10-30分钟完成）")
        print(f"   8. 训练完成后获得模型名称，替换 aiAssistantService.ts 中的 model 字段")
    else:
        print(f"上传返回: {upload_result}")
        print("请手动上传到百炼平台: https://bailian.console.aliyun.com")
except Exception as e:
    print(f"❌ 上传失败: {e}")
    print("\n请手动上传到百炼平台:")
    print("  1. 打开 https://bailian.console.aliyun.com")
    print("  2. 进入「模型调优」→「数据集管理」→「创建数据集」")
    print(f"  3. 上传文件: {dataset_path}")
