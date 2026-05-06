import { CommonActions } from "@react-navigation/native";

/**
 * Stripe return can trigger navigation from BillingReturnScreen and from PremiumAccessScreen
 * (polling / AppState). Only one reset to Main should run.
 */
let checkoutMainResetIssued = false;

export function beginCheckoutReturnNavigation(): void {
  checkoutMainResetIssued = false;
}

export function resetCheckoutNavigationGuards(): void {
  checkoutMainResetIssued = false;
}

export function navigateToMainAfterCheckout(navigation: { dispatch: (action: unknown) => void }): boolean {
  if (checkoutMainResetIssued) {
    return false;
  }
  checkoutMainResetIssued = true;
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: "Main" }]
    })
  );
  return true;
}
