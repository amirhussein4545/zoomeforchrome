export interface ZoomSettings {
  zoomLevel: number; // e.g. 100 to 500 (%)
  bgColor: string;   // e.g. '#000000'
  opacity: number;   // 0 to 100 (%)
  boxColor: string;  // e.g. '#39FF14'
  showPanel: boolean;
  extensionEnabled: boolean;
  lensMode: boolean; // Optional magnifier lens mode
  lensSize: number;  // Lens diameter in px (e.g. 180)
}

export interface SelectionRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ZoomedRegion {
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
  elementHtml?: string;
  sourceRect?: DOMRect;
}

export type SandboxTab = 'sandbox' | 'custom' | 'extension-files' | 'guide';

export type SampleContentType = 'article' | 'charts' | 'blueprint' | 'code' | 'microtext';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'info' | 'success' | 'warning';
}
