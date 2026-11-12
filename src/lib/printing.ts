import { Capacitor } from '@capacitor/core';
import { Printer } from '@rdlabo/capacitor-printer';

export async function printCurrentView(name: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Printer.printWebView({ name });
    return;
  }
  window.print();
}
