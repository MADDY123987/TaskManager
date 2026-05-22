import type { RootState } from '../../store/store';

export const selectNotifications = (state: RootState) => state.notifications.items;
export const selectUnreadCount = (state: RootState) => state.notifications.items.filter((notification) => !notification.read).length;
export const selectNotificationPage = (state: RootState) => state.notifications.page;
export const selectNotificationPageSize = (state: RootState) => state.notifications.pageSize;
export const selectNotificationLoading = (state: RootState) => state.notifications.loading;
