import QRCode from 'qrcode';

export async function displayQRCode(data: string): Promise<void> {
  console.log('\n--- Encrypted Data ---');
  console.log(data);
  console.log('\n--- QR Code ---\n');

  // Generate QR code for terminal display
  const qrString = await QRCode.toString(data, {
    type: 'terminal',
    small: true,
  });

  console.log(qrString);
}

export async function waitForKeyPress(): Promise<void> {
  console.log('\nPress any key to continue...');

  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.once('data', () => {
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
      resolve();
    });
  });
}
