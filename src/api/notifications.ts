export type NotificationPreferences = {
  expiryPushEnabled: boolean;
  mealPushEnabled: boolean;
};

export type ExpiryAlert = {
  pantryItemId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  expiresAt: string | null;
  daysUntilExpiry: number | null;
};

export type ExpiryAlertsResponse = {
  enabled: boolean;
  days: number;
  totalAlerts: number;
  alerts: ExpiryAlert[];
};
