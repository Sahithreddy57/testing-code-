
import type { ProductDetails, ImageInput } from '../pages/addproduct';

// ---------------- VALID TEST DATA ----------------

export const validProduct: ProductDetails = {
  name: 'Glass Water Pipe',
  price: '299.99',
  brand: 'RAW',
  flavour: 'Mint',
  description: 'Premium quality glass water pipe for testing.',
  note: 'Limited stock'
};

export const requiredOnlyProduct: ProductDetails = {
  name: 'Test Product',
  price: '199',
  brand: 'Test Brand'
};

export const productWithCategory: ProductDetails = {
  name: 'Category Test Product',
  price: '199',
  brand: 'Category Test Brand'
};

// ---------------- FIELD TEST DATA ----------------

export const productNameData = {
  valid: 'Glass Water Pipe',
  spaces: '  Glass Water Pipe  ',
  specialCharacters: 'Glass-Pipe @#$',
  numbers: 'Pipe 12345',
  script: '<script>alert("XSS")</script>'
};

export const brandData = {
  valid: 'RAW',
  spaces: '     ',
  specialCharacters: 'RAW-@#123'
};

export const priceData = {
  validWhole: '299',
  validDecimal: '299.99',
  alphabetic: 'abc',
  specialCharacters: '@#$%',
  zero: '0',
  negative: '-100',
  large: '999999999999999'
};

export const flavourData = {
  valid: 'Double Apple',
  specialCharacters: 'Mint-@#'
};

export const descriptionData = {
  valid: 'Premium quality product description.',
  specialCharacters: 'Quality @#$ product\nSecond line\nThird line',
  counterText: 'A'.repeat(25),
  maximumLength: 'A'.repeat(2000),
  exceedingLength: 'A'.repeat(2001)
};

export const noteData = {
  valid: 'Limited stock available',
  specialCharacters: 'Limited-Stock @#$'
};

// ---------------- IMAGE TEST DATA ----------------

// Small valid PNG image (1x1 pixel)
const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/XioAAAAASUVORK5CYII=',
  'base64'
);

export const imageData: Record<string, ImageInput> = {
  png: {
    name: 'test-image.png',
    mimeType: 'image/png',
    buffer: pngBuffer
  },

  jpg: {
    name: 'test-image.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(pngBuffer)
  },

  jpeg: {
    name: 'test-image.jpeg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(pngBuffer)
  },

  pdf: {
    name: 'test-document.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\nTest PDF')
  },

  text: {
    name: 'test-document.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Test document')
  },

  svg: {
    name: 'test-image.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>'
    )
  }
};
