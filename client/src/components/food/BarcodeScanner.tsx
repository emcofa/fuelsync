import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

type BarcodeScannerProps = {
  onScan: (code: string) => void;
  onClose: () => void;
};

const SCANNER_ELEMENT_ID = 'barcode-scanner';

const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasScanned = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          if (hasScanned.current) return;
          hasScanned.current = true;
          scanner.stop().catch(() => {});
          onScan(decodedText);
        },
        () => {},
      )
      .catch(() => {
        setError('Could not access camera. Please allow camera permissions.');
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Scan Barcode</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            ✕
          </button>
        </div>

        <div id={SCANNER_ELEMENT_ID} className="overflow-hidden rounded-md" />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <p className="mt-3 text-center text-xs text-gray-500">
          Point your camera at a barcode
        </p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
