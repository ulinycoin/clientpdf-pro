import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal valid PDF content
const MINIMAL_PDF = Buffer.from(
    'JVBERi0xLjcKMSAwIG9iaiA8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4gZW5kb2JqCjIgMCBvYmogPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUiIgL0NvdW50IDEgPj4gZW5kb2JqCjMgMCBvYmogPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8ID4+IC9Db250ZW50cyA0IDAgUiA+PiBlbmRvYmoKNCAwIG9iaiA8PCAvTGVuZ3RoIDIxID4+IHN0cmVhbQpCVCAvRjEgMTIgVGYgNzAgNzAwIFRkIChIZWxsbyBXb3JsZCkgVGogRVQKZW5kc3RyZWFtIGVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMTkgMDAwMDAgbiAKdHJhaWxlciA8PCAvU2l6ZSA1IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgozMTAKJSVFT0Y=',
    'base64'
);

test.describe('Merge PDF Flow', () => {
    test('should allow users to upload multiple PDFs and merge them', async ({ page }) => {
        await page.goto('/#merge');

        // Wait for the tool page to load
        await expect(page.locator('h1')).toContainText(/Merge/i);

        // Create dummy PDF files
        const file1Path = path.join(__dirname, 'test1.pdf');
        const file2Path = path.join(__dirname, 'test2.pdf');

        fs.writeFileSync(file1Path, MINIMAL_PDF);
        fs.writeFileSync(file2Path, MINIMAL_PDF);

        // Upload files directly
        // Note: we target the input inside FileUpload which is visible when hasFiles is false
        const fileInput = page.locator('input[type="file"]').first();
        await fileInput.setInputFiles([file1Path, file2Path]);

        // Check if files are listed (checking by name)
        await expect(page.locator('text=test1.pdf')).toBeVisible();
        await expect(page.locator('text=test2.pdf')).toBeVisible();

        // Click merge button - using a more specific locator if possible, 
        // or just rely on text match since we forced English locale
        const mergeBtn = page.getByRole('button', { name: /Merge PDFs/i });
        await expect(mergeBtn).toBeEnabled({ timeout: 10000 });
        await mergeBtn.click();

        // Wait for processing and success message
        await expect(page.locator('text=merged successfully')).toBeVisible({ timeout: 30000 });

        // Clean up
        if (fs.existsSync(file1Path)) fs.unlinkSync(file1Path);
        if (fs.existsSync(file2Path)) fs.unlinkSync(file2Path);
    });
});
