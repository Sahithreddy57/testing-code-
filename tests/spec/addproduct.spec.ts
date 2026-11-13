import { test, expect } from '@playwright/test';

import { LoginPage } from '../pages/login';
import { AddProductPage } from '../pages/addproduct';
import {
    validProduct,
    requiredOnlyProduct,
    productNameData,
    brandData,
    priceData,
    flavourData,
    descriptionData,
    noteData,
    imageData
} from '../helpers/addcategory_testdata';

let addProduct: AddProductPage;

test.setTimeout(120000);

// Login before every test
test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login();

    addProduct = new AddProductPage(page);
});


// ADD PRODUCT PAGE - POSITIVE TESTING

// ADDPROD_TC_001 - Verify Add Product page opens from sidebar
test('ADDPROD_TC_001 - Verify Add Product page opens from sidebar &ADDPROD_TC_002 - Verify all Add Product form fields are visible', async () => {
    await addProduct.openFromSidebar();
    await addProduct.expectLoaded();
    await expect(addProduct.heading).toBeVisible();
    await expect(addProduct.bannerDescription).toBeVisible();
    await expect(addProduct.sectionTag).toBeVisible();
    await expect(addProduct.sectionDescription).toBeVisible();
    await expect(addProduct.productNameInput).toBeVisible();
    await expect(addProduct.priceInput).toBeVisible();
    await expect(addProduct.brandInput).toBeVisible();
    await expect(addProduct.flavourInput).toBeVisible();
    await expect(addProduct.descriptionInput).toBeVisible();
    await expect(addProduct.noteInput).toBeVisible();
    await expect(addProduct.categorySelect).toBeVisible();
    await expect(addProduct.subCategorySelect).toBeVisible();
    await expect(addProduct.imageInput).toBeAttached();
    await expect(addProduct.addProductButton).toBeVisible();
});

// ADDPROD_TC_003 - Verify Brand Name is marked as required
test('ADDPROD_TC_003 - Verify Brand Name is marked as required', async () => {
    await addProduct.openFromSidebar();
    expect(await addProduct.brandShowsRequiredError()).toBeTruthy();
});

// ADDPROD_TC_004 - Verify all fields are empty by default
test('ADDPROD_TC_004 - Verify all fields are empty by default', async () => {
    await addProduct.openFromSidebar();

    await expect(addProduct.productNameInput).toHaveValue('');
    await expect(addProduct.priceInput).toHaveValue('');
    await expect(addProduct.brandInput).toHaveValue('');
    await expect(addProduct.flavourInput).toHaveValue('');
    await expect(addProduct.descriptionInput).toHaveValue('');
    await expect(addProduct.noteInput).toHaveValue('');
});

// ADDPROD_TC_005 - Verify image field accepts image files only
test('ADDPROD_TC_005 - Verify image field accepts image files only', async () => {
    await addProduct.openFromSidebar();

    await expect(addProduct.imageInput).toHaveAttribute(
        'accept',
        /image|jpg|jpeg|png|webp/i
    );
});

// ADDPROD_TC_006 - Verify subcategory requires main category first
test('ADDPROD_TC_006 - Verify subcategory requires main category first', async () => {
    await addProduct.openFromSidebar();

    await expect(addProduct.subCategorySelect).toBeDisabled();
});

// ADDPROD_TC_007 - Verify subcategory options are available after selecting category
test('ADDPROD_TC_007 - Verify subcategory options are available after selecting category', async () => {
    await addProduct.openFromSidebar();

    const selected = await addProduct.selectFirstCategoryWithSubCategory();

    expect(selected).toBeDefined();

    // Wait for subcategory options to load
    await expect.poll(
        async () => (await addProduct.subCategoryOptionTexts()).length,
        { timeout: 15000 }
    ).toBeGreaterThan(1);

    const subCategories = await addProduct.subCategoryOptionTexts();

    expect(subCategories.length).toBeGreaterThan(1);
});

// ADDPROD_TC_008 - Verify description character counter updates
test('ADDPROD_TC_008 - Verify description character counter updates', async () => {
    await addProduct.openFromSidebar();

    await addProduct.descriptionInput.fill(descriptionData.counterText);

    const counter = await addProduct.descriptionCounterValue();

    expect(counter).toBe(25);
});

// ADDPROD_TC_009 - Verify description maximum length is 2000 characters
test('ADDPROD_TC_009 - Verify description maximum length is 2000 characters', async () => {
    await addProduct.openFromSidebar();

    await addProduct.descriptionInput.fill(descriptionData.maximumLength);

    await expect(addProduct.descriptionInput).toHaveValue(
        descriptionData.maximumLength
    );
});

// ADDPROD_TC_010 - Verify selected image is accepted
test('ADDPROD_TC_010 - Verify selected image is accepted', async () => {
    await addProduct.openFromSidebar();

    await addProduct.uploadImage(imageData.png);

    const imageName = await addProduct.selectedImageName();

    expect(imageName).toBe('test-image.png');
});

// ADDPROD_TC_011 - Verify product is added with all details
test('ADDPROD_TC_011 - Verify product is added with all details', async () => {
    await addProduct.openFromSidebar();
    await addProduct.fillProductName(validProduct.name!);
    await addProduct.fillPrice(validProduct.price!);
    await addProduct.fillBrand(validProduct.brand!);
    await addProduct.fillFlavour(validProduct.flavour!);
    await addProduct.fillDescription(validProduct.description!);
    await addProduct.fillNote(validProduct.note!);
    const selectedCategory = await addProduct.selectFirstCategoryWithSubCategory();
    expect(selectedCategory).toBeDefined();
    await addProduct.uploadImage(imageData.png);
    const successDialog = addProduct.page.waitForEvent('dialog');
    await addProduct.clickAddProduct();
    const dialog = await successDialog;
    expect(dialog.message()).toBe('Product added successfully');
    await dialog.accept();
});

// ADDPROD_TC_012 - Verify product is added with only required fields
test('ADDPROD_TC_012 - Verify product is added with only required fields', async () => {
    await addProduct.openFromSidebar();
    await addProduct.fillProductName(requiredOnlyProduct.name!);
    await addProduct.fillPrice(requiredOnlyProduct.price!);
    await addProduct.fillBrand(requiredOnlyProduct.brand!);
    await addProduct.fillDescription(validProduct.description!);
    const selectedCategory = await addProduct.selectFirstCategoryWithSubCategory();
    expect(selectedCategory).toBeDefined();
    await addProduct.selectSubCategory(selectedCategory!.subCategory);
    await addProduct.uploadImage(imageData.png);
    const successDialog = addProduct.page.waitForEvent('dialog');
    await addProduct.clickAddProduct();
    const dialog = await successDialog;
    expect(dialog.message()).toBe('Product added successfully');
    await dialog.accept();
});

// ADDPROD_TC_013 - Verify category and subcategory reset after adding product
test('ADDPROD_TC_013 - Verify category and subcategory reset after adding product', async () => {
    await addProduct.openFromSidebar();

    const selected = await addProduct.selectFirstCategoryWithSubCategory();

    expect(selected).toBeDefined();

    await addProduct.fillForm({
        ...validProduct,
        image: imageData.png
    });

    await addProduct.clickAddProduct();

    await expect(addProduct.categorySelect).toHaveValue('');
    await expect(addProduct.subCategorySelect).toBeDisabled();
});


// ADD PRODUCT PAGE - NEGATIVE TESTING

// ADDPROD_TC_014 - Verify product is not added when Brand Name is empty
test('ADDPROD_TC_014 - Verify product is not added when Brand Name is empty', async () => {
    await addProduct.openFromSidebar();

    await addProduct.fillForm({
        name: validProduct.name,
        price: validProduct.price,
        brand: ''
    });

    await addProduct.clickAddProduct();

    expect(await addProduct.brandShowsRequiredError()).toBeTruthy();
});

// ADDPROD_TC_015 - Verify product is not added when the form is empty
test('ADDPROD_TC_015 - Verify product is not added when the form is empty', async () => {
    await addProduct.openFromSidebar();

    await addProduct.clickAddProduct();

    expect(await addProduct.brandShowsRequiredError()).toBeTruthy();
});

// ADDPROD_TC_016 - Verify script text is treated as plain text in Product Name
test('ADDPROD_TC_016 - Verify script text is treated as plain text in Product Name', async () => {
    await addProduct.openFromSidebar();

    let dialogOpened = false;

    addProduct.page.once('dialog', async dialog => {
        dialogOpened = true;
        await dialog.dismiss();
    });

    await addProduct.productNameInput.fill(productNameData.script);

    await expect(addProduct.productNameInput).toHaveValue(productNameData.script);

    expect(dialogOpened).toBe(false);
});


// PRODUCT NAME FIELD TESTING

// ADDPROD_TC_017 - Verify Product Name accepts valid text
test('ADDPROD_TC_017 - Verify Product Name accepts valid text', async () => {
    await addProduct.openFromSidebar();

    await addProduct.productNameInput.fill(productNameData.valid);

    await expect(addProduct.productNameInput).toHaveValue(productNameData.valid);
});

// ADDPROD_TC_018 - Verify Product Name with leading and trailing spaces
test('ADDPROD_TC_018 - Verify Product Name with leading and trailing spaces', async () => {
    await addProduct.openFromSidebar();

    await addProduct.productNameInput.fill(productNameData.spaces);

    await expect(addProduct.productNameInput).toHaveValue(productNameData.spaces);
});

// ADDPROD_TC_019 - Verify Product Name accepts special characters
test('ADDPROD_TC_019 - Verify Product Name accepts special characters', async () => {
    await addProduct.openFromSidebar();

    await addProduct.productNameInput.fill(productNameData.specialCharacters);

    await expect(addProduct.productNameInput).toHaveValue(
        productNameData.specialCharacters
    );
});

// ADDPROD_TC_020 - Verify Product Name accepts numbers
test('ADDPROD_TC_020 - Verify Product Name accepts numbers', async () => {
    await addProduct.openFromSidebar();

    await addProduct.productNameInput.fill(productNameData.numbers);

    await expect(addProduct.productNameInput).toHaveValue(productNameData.numbers);
});


// PRICE FIELD TESTING

// ADDPROD_TC_021 - Verify Price accepts whole numbers
test('ADDPROD_TC_021 - Verify Price accepts whole numbers', async () => {
    await addProduct.openFromSidebar();

    await addProduct.priceInput.fill(priceData.validWhole);

    await expect(addProduct.priceInput).toHaveValue(priceData.validWhole);
});

// ADDPROD_TC_022 - Verify Price accepts decimal values
test('ADDPROD_TC_022 - Verify Price accepts decimal values', async () => {
    await addProduct.openFromSidebar();

    await addProduct.priceInput.fill(priceData.validDecimal);

    await expect(addProduct.priceInput).toHaveValue(priceData.validDecimal);
});

// ADDPROD_TC_023 - Verify Price does not accept alphabetic characters
test('ADDPROD_TC_023 - Verify Price does not accept alphabetic characters', async () => {
    await addProduct.openFromSidebar();

    await addProduct.priceInput.fill(priceData.alphabetic);

    const price = await addProduct.priceInput.inputValue();

    expect(price).not.toContain(priceData.alphabetic);
});

// ADDPROD_TC_024 - Verify Price does not accept special characters
test('ADDPROD_TC_024 - Verify Price does not accept special characters', async () => {
    await addProduct.openFromSidebar();

    await addProduct.priceInput.fill(priceData.specialCharacters);

    const price = await addProduct.priceInput.inputValue();

    expect(price).not.toMatch(/[@#$%]/);
});


// BRAND NAME FIELD TESTING

// ADDPROD_TC_028 - Verify Brand Name accepts valid text
test('ADDPROD_TC_028 - Verify Brand Name accepts valid text', async () => {
    await addProduct.openFromSidebar();

    await addProduct.brandInput.fill(brandData.valid);

    await expect(addProduct.brandInput).toHaveValue(brandData.valid);
});

// ADDPROD_TC_029 - Verify Brand Name does not accept spaces only
test('ADDPROD_TC_029 - Verify Brand Name does not accept spaces only', async () => {
    await addProduct.openFromSidebar();

    await addProduct.brandInput.fill(brandData.spaces);
    await addProduct.clickAddProduct();

    expect(await addProduct.brandShowsRequiredError()).toBeTruthy();
});

// ADDPROD_TC_030 - Verify Brand Name accepts special characters
test('ADDPROD_TC_030 - Verify Brand Name does not accept special characters', async () => {
    await addProduct.openFromSidebar();
    await addProduct.brandInput.fill(brandData.specialCharacters);

    await expect(addProduct.brandInput).not.toHaveValue(brandData.specialCharacters);
    await expect(addProduct.brandInput).toHaveValue(/^[a-zA-Z&-]*$/);
});


// FLAVOUR FIELD TESTING

// ADDPROD_TC_031 - Verify Flavour accepts valid text
test('ADDPROD_TC_031 - Verify Flavour accepts valid text', async () => {
    await addProduct.openFromSidebar();

    await addProduct.flavourInput.fill(flavourData.valid);

    await expect(addProduct.flavourInput).toHaveValue(flavourData.valid);
});

// ADDPROD_TC_032 - Verify Flavour accepts special characters
test('ADDPROD_TC_032 - Verify Flavour accepts only few special characters', async () => {
    await addProduct.openFromSidebar();
    await addProduct.flavourInput.fill(flavourData.specialCharacters);

    await expect(addProduct.flavourInput).toHaveValue(/^[a-zA-Z&,'()-]*$/);
});

// DESCRIPTION FIELD TESTING

// ADDPROD_TC_033 - Verify Description accepts valid text
test('ADDPROD_TC_033 - Verify Description accepts valid text', async () => {
    await addProduct.openFromSidebar();

    await addProduct.descriptionInput.fill(descriptionData.valid);

    await expect(addProduct.descriptionInput).toHaveValue(descriptionData.valid);
});

// ADDPROD_TC_034 - Verify Description accepts special characters and line breaks
test('ADDPROD_TC_034 - Verify Description accepts special characters and line breaks', async () => {
    await addProduct.openFromSidebar();

    await addProduct.descriptionInput.fill(descriptionData.specialCharacters);

    await expect(addProduct.descriptionInput).toHaveValue(
        descriptionData.specialCharacters
    );
});


// NOTE FIELD TESTING

// ADDPROD_TC_035 - Verify Note accepts valid text
test('ADDPROD_TC_035 - Verify Note accepts valid text', async () => {
    await addProduct.openFromSidebar();

    await addProduct.noteInput.fill(noteData.valid);

    await expect(addProduct.noteInput).toHaveValue(noteData.valid);
});

// ADDPROD_TC_036 - Verify Note accepts special characters
test('ADDPROD_TC_036 - Verify Note accepts special characters', async () => {
    await addProduct.openFromSidebar();

    await addProduct.noteInput.fill(noteData.specialCharacters);

    await expect(addProduct.noteInput).toHaveValue(noteData.specialCharacters);
});


// CATEGORY AND SUBCATEGORY TESTING

// ADDPROD_TC_037 - Verify category dropdown options
test('ADDPROD_TC_037 - Verify category dropdown options', async () => {
    await addProduct.openFromSidebar();

    const categories = await addProduct.categoryOptionTexts();

    expect(categories.length).toBeGreaterThan(1);
});

// ADDPROD_TC_038 - Verify selected category remains selected
test('ADDPROD_TC_038 - Verify selected category remains selected', async () => {
    await addProduct.openFromSidebar();

    await addProduct.categorySelect.selectOption({ index: 1 });

    const selectedCategory = await addProduct.categorySelect.inputValue();

    expect(selectedCategory).not.toBe('');

    await expect(addProduct.categorySelect).toHaveValue(selectedCategory);
});

// ADDPROD_TC_039 - Verify changing category updates subcategory options
// // ADDPROD_TC_039 - Verify changing category updates subcategory options
// test.only('ADDPROD_TC_039 - Verify changing category updates subcategory options', async () => {
//     await addProduct.openFromSidebar();

//     const categories = await addProduct.categoryOptionTexts();

//     expect(categories.length).toBeGreaterThan(2);

//     // Select first category
//     await addProduct.categorySelect.selectOption({ index: 1 });

//     const firstOptions = await addProduct.subCategoryOptionTexts();

//     // Select second category
//     await addProduct.categorySelect.selectOption({ index: 2 });

//     const secondOptions = await addProduct.subCategoryOptionTexts();

//     console.log('First category subcategories:', firstOptions);
//     console.log('Second category subcategories:', secondOptions);

//     expect(firstOptions.length).toBeGreaterThan(0);
//     expect(secondOptions.length).toBeGreaterThan(0);
//     expect(secondOptions).not.toEqual(firstOptions);
// });

// ADDPROD_TC_040 - Verify old subcategory is cleared when main category changes
test('ADDPROD_TC_040 - Verify old subcategory is cleared when main category changes', async () => {
    await addProduct.openFromSidebar();

    const selected = await addProduct.selectFirstCategoryWithSubCategory();
    expect(selected).toBeDefined();

    await addProduct.selectSubCategory(selected!.subCategory);

    const categories = await addProduct.categoryOptionTexts();
    expect(categories.length).toBeGreaterThan(2);

    await addProduct.categorySelect.selectOption({ index: 2 });

    await expect(addProduct.subCategorySelect).not.toHaveValue(selected!.subCategory);
});

// IMAGE UPLOAD TESTING

// ADDPROD_TC_041 - Verify non-image files cannot be uploaded
test('ADDPROD_TC_041 - Verify non-image files cannot be uploaded', async () => {
    await addProduct.openFromSidebar();
    await addProduct.fillForm(validProduct);
    await addProduct.selectFirstCategoryWithSubCategory();
    await addProduct.uploadImage(imageData.pdf);

    await expect(addProduct.page.locator('body')).toContainText(
        /isn't a supported image\. Please choose a JPG, JPEG, PNG or WEBP file\./i
    );

    await addProduct.clickAddProduct();

    await expect(addProduct.page.locator('body')).toContainText(
        /Product image is required\./i
    );
});

// ADDPROD_TC_042 - Verify supported image formats
test('ADDPROD_TC_042 - Verify supported image formats', async () => {
    await addProduct.openFromSidebar();

    await addProduct.uploadImage(imageData.png);

    expect(await addProduct.selectedImageName()).toBe('test-image.png');
});

// ADDPROD_TC_043 - Verify unsupported image format is rejected
test('ADDPROD_TC_043 - Verify unsupported image format is rejected', async () => {
    await addProduct.openFromSidebar();
    await addProduct.fillForm(validProduct);
    await addProduct.selectFirstCategoryWithSubCategory();
    await addProduct.uploadImage(imageData.pdf);

    await expect(addProduct.page.locator('body')).toContainText(
        /isn't a supported image\. Please choose a JPG, JPEG, PNG or WEBP file\./i
    );
});
// ADDPROD_TC_045 - Verify selected image can be replaced
test('ADDPROD_TC_045 - Verify selected image can be replaced', async () => {
    await addProduct.openFromSidebar();

    await addProduct.uploadImage(imageData.png);

    const firstImage = await addProduct.selectedImageName();

    await addProduct.uploadImage(imageData.jpeg);

    const secondImage = await addProduct.selectedImageName();

    expect(firstImage).toBe('test-image.png');
    expect(secondImage).toBe('test-image.jpeg');
    expect(secondImage).not.toBe(firstImage);
});



// ADDPROD_TC_054 - Verify Add Product page works after browser refresh
test('ADDPROD_TC_054 - Verify Add Product page works after browser refresh', async () => {
    await addProduct.openFromSidebar();

    await addProduct.reload();

    await expect(addProduct.heading).toBeVisible();
    await expect(addProduct.productNameInput)
    .toBeVisible();
    await expect(addProduct.addProductButton).toBeVisible();
});