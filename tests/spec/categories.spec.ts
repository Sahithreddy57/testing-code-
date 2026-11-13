import { test, expect } from '@playwright/test';

import { LoginPage } from '../pages/login';
import { CategoriesPage } from '../pages/categories';
import { categoryName, categoryImage, invalidImage, bigImage, categoryDescription } from '../helpers/category_testdata';

let categoriesPage: CategoriesPage;

test.setTimeout(120000);
// Login before every test
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login();
  categoriesPage = new CategoriesPage(page);

});
//test1,2,3,4,5,6-test done-passed
test('CAT_TC_001 - Categories page opens from sidebar and CAT_TC_002 - Verify Categories page heading and banner and CAT_TC_003 - Verify Add Category button visibility and CAT_TC_004 - Verify all category statistics are visible and CAT_TC_005 - Verify category search field visibility and CAT_TC_006,7,8 - Verify All,active,inactive filter visibility and ', async () => {
  await categoriesPage.openFromSidebar();
  await expect(categoriesPage.heading).toBeVisible();
  await expect(categoriesPage.bannerDescription).toBeVisible();
  await expect(categoriesPage.addCategoryButton).toBeVisible();
  await expect(categoriesPage.statCategoriesLabel).toBeVisible();
  await expect(categoriesPage.statActiveLabel).toBeVisible();
  await expect(categoriesPage.statInactiveLabel).toBeVisible();
  await expect(categoriesPage.statSubCategoriesLabel).toBeVisible();
  await expect(categoriesPage.searchInput).toBeVisible();
  await expect(categoriesPage.filterAll).toBeVisible();
  await expect(categoriesPage.filterActive).toBeVisible();
  await expect(categoriesPage.filterInactive).toBeVisible();

});

// CAT_TC_010 - Verify Categories page reload-done pass
test('CAT_TC_010 - Categories page loads successfully after refresh', async () => {
  await categoriesPage.openFromSidebar();
  await categoriesPage.reload();
  await expect(categoriesPage.heading).toBeVisible();
  await expect(categoriesPage.addCategoryButton).toBeVisible();
  await expect(categoriesPage.searchInput).toBeVisible();

});
//CAT_TC_008-Verifying the add category button in banner + filling the form-->adding the category(whole add category functionality)

test('CAT_TC_008 - Verify Add Category visibility of elements', async () => {

  await categoriesPage.openFromSidebar();
  await categoriesPage.openAddCategoryDialog();
  await expect(categoriesPage.addCategoryHeading).toBeVisible();
  await expect(categoriesPage.nameInput).toBeVisible();
  await expect(categoriesPage.descriptionInput).toBeVisible();
  await expect(categoriesPage.imageInput).toBeAttached();
  await expect(categoriesPage.createCategoryButton).toBeVisible();
  await expect(categoriesPage.activeToggle).toBeVisible();
  await expect(categoriesPage.activeToggle).toHaveAttribute('aria-checked', 'true');
  await expect(categoriesPage.cancelButton).toBeVisible();
});
test.only('CAT_TC_008-verify add category functionality and CAT_TC_041 - Verify search using an existing category name andCAT_TC_042 - Verify search using a partial category name&CAT_TC_043 - Verify search with a non-existing category name& CAT_TC_044 - Verify search results after clearing the search box', async () => {
  await categoriesPage.openFromSidebar();
  await categoriesPage.openAddCategoryDialog();
  await categoriesPage.fillCategoryForm(categoryName, 'Automated test category', categoryImage);
  await categoriesPage.createCategory();
  
  await categoriesPage.openAddCategoryDialog();
  await categoriesPage.fillCategoryForm(categoryName, 'Duplicate category', categoryImage);
  await categoriesPage.createCategory();
  await expect(categoriesPage.page.getByText(' A category with this name already exists')).toBeVisible();
  await expect(categoriesPage.modal).toBeVisible();
  await categoriesPage.cancelButton.click();

  await categoriesPage.searchInput.fill(categoryName);
  await expect(categoriesPage.page.getByText(categoryName, { exact: true })).toBeVisible();

  const partialName = categoryName.substring(0, 5);
  await categoriesPage.searchInput.fill(partialName);
  await expect(categoriesPage.page.getByText(categoryName, { exact: true })).toBeVisible();

  await categoriesPage.searchInput.fill('NonExisting_Category_12345');
  await expect(categoriesPage.page.getByText(categoryName, { exact: true })).not.toBeVisible();


  await categoriesPage.searchInput.clear();
  await expect(categoriesPage.searchInput).toHaveValue('');
  await categoriesPage.filterActive.click();

  await categoriesPage.searchInput.fill(categoryName);

  await expect(categoriesPage.page.getByText(categoryName, { exact: true })).toBeVisible();
  await categoriesPage.filterInactive.click();

  await categoriesPage.searchInput.fill(categoryName);

  await expect(categoriesPage.page.getByText(categoryName, { exact: true })).not.toBeVisible();


});
test('CAT_TC_045 - Verify search with Active filter & CAT_TC_046 - Verify search with Inactive filter', async () => {
  await categoriesPage.openFromSidebar();

  await categoriesPage.filterActive.click();

  await categoriesPage.searchInput.fill(categoryName);

  await expect(categoriesPage.page.getByText(categoryName, { exact: true })).toBeVisible();
  await categoriesPage.filterInactive.click();

  await categoriesPage.searchInput.fill(categoryName);

  await expect(categoriesPage.page.getByText(categoryName, { exact: true })).not.toBeVisible();

});


//negative testing
test('CAT_TC_009-verify add category with empty name(shows the error to fill the name)', async () => {
  await categoriesPage.openFromSidebar();
  await categoriesPage.openAddCategoryDialog();
  await categoriesPage.descriptionInput.fill('Automated test category');
  await categoriesPage.imageInput.setInputFiles(categoryImage);
  await categoriesPage.createCategory();
  await expect(categoriesPage.page.getByText('Please enter a category name.')).toBeVisible();
  await expect(categoriesPage.modal).toBeVisible();
});

test('CAT_TC_010-verify add category with spaces-only name(displays error that to enter name)', async () => {
  await categoriesPage.openFromSidebar();
  await categoriesPage.openAddCategoryDialog();
  await categoriesPage.nameInput.fill('     ');
  await categoriesPage.descriptionInput.fill('Automated test category');
  await categoriesPage.imageInput.setInputFiles(categoryImage);
  await categoriesPage.createCategory();
  await expect(categoriesPage.page.getByText('Please enter a category name.')).toBeVisible();
  await expect(categoriesPage.modal).toBeVisible();
});
test('CAT_TC_011-verify add category without image(displays error)', async () => {
  await categoriesPage.openFromSidebar();
  await categoriesPage.openAddCategoryDialog();
  await categoriesPage.nameInput.fill(categoryName);
  await categoriesPage.descriptionInput.fill('Automated test category');
  await categoriesPage.createCategory();
  await expect(categoriesPage.page.getByText(' Please choose a category image.')).toBeVisible();
  await expect(categoriesPage.modal).toBeVisible();

});
test('CAT_TC_012-verify add category with invalid image format(displays error)', async () => {
  await categoriesPage.openFromSidebar();
  await categoriesPage.openAddCategoryDialog();
  await categoriesPage.fillCategoryForm(categoryName, 'Automated test category', invalidImage);
  await categoriesPage.createCategory();
  await expect(categoriesPage.page.getByText(' Please choose an image file (JPG, PNG or WEBP).')).toBeVisible();
  await expect(categoriesPage.modal).toBeVisible();
});
// test('CAT_TC_013-verify add category with duplicate name', async () => {
//   await categoriesPage.openFromSidebar();
//   await categoriesPage.openAddCategoryDialog();
//   await categoriesPage.fillCategoryForm(categoryName, 'Automated test category', categoryImage);
//   await categoriesPage.createCategory();

//   await categoriesPage.openAddCategoryDialog();
//   await categoriesPage.fillCategoryForm(categoryName, 'Duplicate category', categoryImage);
//   await categoriesPage.createCategory();
//   await expect(categoriesPage.page.getByText(' A category with this name already exists')).toBeVisible();
//   await expect(categoriesPage.modal).toBeVisible();
//   await categoriesPage.cancelButton.click();

// });
test('CAT_TC_014-verify cancel button functionality in add category', async () => {
  await categoriesPage.openFromSidebar();
  await categoriesPage.openAddCategoryDialog();
  await categoriesPage.nameInput.fill(categoryName);
  await categoriesPage.descriptionInput.fill('Automated test category');
  await categoriesPage.cancelButton.click();
  await expect(categoriesPage.modal).not.toBeVisible();
});

test('toggle off', async () => {
  await categoriesPage.openFromSidebar();
  await categoriesPage.openAddCategoryDialog();
  await categoriesPage.fillCategoryForm(categoryName, 'Automated test category', categoryImage);
  await categoriesPage.toggleActiveStatus();
  await expect(categoriesPage.activeToggle).toHaveAttribute('aria-checked', 'false');
  await categoriesPage.createCategory();

})


