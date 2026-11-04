declare global {
  interface Window {
    smartsupp?: any;
    _smartsupp?: any;
  }
}

export function openSmartsuppChat(prefillMessage?: string) {
  try {
    if (typeof window !== 'undefined') {
      // Dispatch custom event for immediate responsive UI feedback
      window.dispatchEvent(
        new CustomEvent('open-swift-chat', {
          detail: { message: prefillMessage },
        })
      );

      if (window.smartsupp) {
        window.smartsupp('chat:open');
        if (prefillMessage) {
          window.smartsupp('message', prefillMessage);
        }
      }
    }
  } catch (err) {
    console.error('Error opening Smartsupp chat:', err);
  }
}

export function updateSmartsuppUser(name: string, email: string, phone?: string) {
  try {
    if (typeof window !== 'undefined' && window.smartsupp) {
      window.smartsupp('name', name);
      window.smartsupp('email', email);
      if (phone) {
        window.smartsupp('variables', { phone });
      }
    }
  } catch (err) {
    console.error('Error updating Smartsupp user:', err);
  }
}
