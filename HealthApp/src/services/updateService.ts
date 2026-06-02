import { api } from './api';
import { detectRegion } from '../config/env';
import { Linking, Platform, Alert } from 'react-native';

export interface UpdateInfo {
  hasUpdate: boolean;
  versionCode?: number;
  versionName?: string;
  apkUrl?: string;
  fileSize?: number;
  releaseNotes?: string;
  forceUpdate?: boolean;
}

/** 检查是否有新版本 */
export async function checkForUpdate(): Promise<UpdateInfo> {
  try {
    const res = await api.updates.check();
    if (res.success && res.data) {
      return res.data;
    }
  } catch {}
  return { hasUpdate: false };
}

/** 下载并安装 APK（通过浏览器下载） */
export async function installApk(apkUrl: string): Promise<void> {
  try {
    const canOpen = await Linking.canOpenURL(apkUrl);
    if (canOpen) {
      await Linking.openURL(apkUrl);
    } else {
      Alert.alert('无法打开下载链接', '请手动访问以下地址下载更新：\n' + apkUrl);
    }
  } catch {
    Alert.alert('下载失败', '无法启动下载，请稍后重试。');
  }
}

/** 格式化文件大小 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
