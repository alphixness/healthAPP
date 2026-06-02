import { useEffect, useState, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { checkForUpdate, installApk, formatFileSize } from '../services/updateService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SKIP_VERSION_KEY = 'skip_update_version';

export function useAppUpdate() {
  const [checking, setChecking] = useState(true);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    (async () => {
      try {
        const update = await checkForUpdate();
        if (!update.hasUpdate || !update.apkUrl) {
          setChecking(false);
          return;
        }

        const skippedVersion = await AsyncStorage.getItem(SKIP_VERSION_KEY);
        if (skippedVersion === String(update.versionCode)) {
          setChecking(false);
          return;
        }

        const notes = update.releaseNotes
          ? `\n\n更新内容：\n${update.releaseNotes}`
          : '';
        const size = update.fileSize ? `\n大小：${formatFileSize(update.fileSize)}` : '';

        if (update.forceUpdate) {
          Alert.alert(
            '发现新版本',
            `v${update.versionName}${size}${notes}`,
            [
              {
                text: '立即更新',
                onPress: () => installApk(update.apkUrl!),
              },
            ],
            { cancelable: false },
          );
        } else {
          Alert.alert(
            '发现新版本',
            `v${update.versionName}${size}${notes}`,
            [
              { text: '稍后再说', style: 'cancel' },
              {
                text: '忽略此版本',
                onPress: () => AsyncStorage.setItem(SKIP_VERSION_KEY, String(update.versionCode)),
              },
              { text: '立即更新', onPress: () => installApk(update.apkUrl!) },
            ],
          );
        }
      } catch {
        // 静默失败，不影响启动
      } finally {
        setChecking(false);
      }
    })();
  }, []);
}
