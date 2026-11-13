// Unique category name
export const categoryName = `Auto_Category_${Date.now()}`;

// Valid PNG image
export const categoryImage = {
  name: 'category.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  ),
};

// Invalid file format
export const invalidImage = {
  name: 'test.txt',
  mimeType: 'text/plain',
  buffer: Buffer.from('This is not an image'),
};

// Image larger than 5 MB
export const bigImage = {
  name: 'large.png',
  mimeType: 'image/png',
  buffer: Buffer.concat([
    categoryImage.buffer,
    Buffer.alloc(5 * 1024 * 1024 + 1024),
  ]),
};

// Common descriptions
export const categoryDescription = 'Automated test category';