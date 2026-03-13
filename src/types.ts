export type FirebaseIdToken = string;

export const QUERY_KEYS = {
  DEVICES: 'tapayoka-devices',
  DEVICE: 'tapayoka-device',
  INSTALLATIONS: 'tapayoka-installations',
  INSTALLATION: 'tapayoka-installation',
  ORDERS: 'tapayoka-orders',
  ORDER: 'tapayoka-order',
  AUTHORIZATIONS: 'tapayoka-authorizations',
  BUYER_DEVICES: 'tapayoka-buyer-devices',
  ANALYTICS: 'tapayoka-analytics',
  QR: 'tapayoka-qr',
  ENTITIES: 'tapayoka-entities',
  ME: 'tapayoka-me',
  VENDOR_LOCATIONS: 'tapayoka-vendor-locations',
  VENDOR_LOCATION: 'tapayoka-vendor-location',
  VENDOR_MODELS: 'tapayoka-vendor-models',
  VENDOR_MODEL: 'tapayoka-vendor-model',
  VENDOR_INSTALLATIONS: 'tapayoka-vendor-installations',
  VENDOR_INSTALLATION: 'tapayoka-vendor-installation',
  VENDOR_INSTALLATION_CONTROLS: 'tapayoka-vendor-installation-controls',
  VENDOR_EQUIPMENTS: 'tapayoka-vendor-equipments',
} as const;
