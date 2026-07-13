export async function sendWebhookPayload(
  url: string,
  frontImageBase64: string,
  backImageBase64: string
) {
  let deviceInfo = {};
  if (typeof window !== 'undefined') {
    deviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  const payload = {
    timestamp: new Date().toISOString(),
    device: deviceInfo,
    gps: { latitude: 0, longitude: 0, accuracy: 0 }, 
    images: {
      front: frontImageBase64,
      back: backImageBase64,
    },
    validations: {
      front: {
        documentoCompleto: true,
        iluminacion: true,
        estable: true
      },
      back: {
        reversoCompleto: true,
        sinReflejos: true
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el webhook');
    }
    
    return true;
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
}
