import * as Notifications from 'expo-notifications';
import type {
  NotificationDeliveryOutcome,
  NotificationGateway,
  NotificationPermission,
  PrayerCompletionNotification,
} from '../core/types';

function permissionFromStatus(status: Notifications.PermissionStatus): NotificationPermission {
  if (status === Notifications.PermissionStatus.GRANTED) {
    return 'granted';
  }
  if (status === Notifications.PermissionStatus.DENIED) {
    return 'denied';
  }
  return 'undetermined';
}

export class ExpoNotificationGateway implements NotificationGateway {
  async permission(): Promise<NotificationPermission> {
    const permissions = await Notifications.getPermissionsAsync();
    return permissionFromStatus(permissions.status);
  }

  async requestPermission(): Promise<NotificationPermission> {
    const current = await this.permission();
    if (current !== 'undetermined') {
      return current;
    }
    const requested = await Notifications.requestPermissionsAsync();
    return permissionFromStatus(requested.status);
  }

  async deliver(notification: PrayerCompletionNotification): Promise<NotificationDeliveryOutcome> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { body: notification.body },
        trigger: null,
      });
      return 'delivered';
    } catch {
      return 'failed';
    }
  }
}
