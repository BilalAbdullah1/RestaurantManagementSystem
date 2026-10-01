# [AGENT 1] Mandatory System Rules & UI Guidelines

When building or explaining UI & Backend code, strictly adhere to the following mandatory rules:

## 1. Reusable Form Components
Always use custom components from `src/components/form/` instead of native HTML tags. NEVER use raw HTML `<select>`, `<input type="date">`, etc.

*   **Select / Dropdowns**: 
    *   **MUST** use `<SearchableSelect>` (`src/components/form/select/SearchableSelect.tsx`) instead of `<Select>`. Dropdowns must be searchable.
*   **Date Inputs**: 
    *   Use `<DatePicker>` (`src/components/form/date-picker.tsx`). Do not use native HTML date inputs.
*   **Time Inputs**:
    *   Use `<TimePicker>` (`src/components/form/TimePicker.tsx`).
*   **Multi-Select**:
    *   Use `<MultiSelect>` (`src/components/form/MultiSelect.tsx`) when multiple selections are needed.
*   **Image Uploads**:
    *   Use `<ImageUpload>` (`src/components/form/ImageUpload.tsx`).
*   **Rich Text**:
    *   Use `<RichTextEditor>` (`src/components/form/RichTextEditor.tsx`).
*   **Labels**:
    *   Use `<Label>` (`src/components/form/Label.tsx`) for form field labels.
*   **Debounced Search**:
    *   Use `<DebouncedSearch>` (`src/components/form/DebouncedSearch.tsx`) for search inputs triggering API calls.

## 2. Advanced UI Components
Whenever designing rich user interfaces, integrate these custom components from `src/components/ui/`:

*   **Toasts**: Trigger global notifications using `toast.success()`, `toast.error()`, or `toast.info()` from `src/components/ui/Toast.tsx`.
*   **Tooltips**: Use `<Tooltip content="...">` (`src/components/ui/Tooltip.tsx`).
*   **Skeleton Loaders**: Use `<Skeleton />` (`src/components/ui/Skeleton.tsx`) for loading states.
*   **Stepper**: Use `<Stepper />` (`src/components/ui/Stepper.tsx`) for multi-step wizards.
*   **Breadcrumbs**: Use `<Breadcrumb />` (`src/components/ui/Breadcrumb.tsx`) at the top of pages to show navigation paths.

## 3. Directory, Datatables & Grid Screens Standard Layout
Every directory-style page (Student Directory, Staff Directory, Admissions, Fee Challans, etc.) must strictly include:
*   **KPI stats summary cards** (`<StatCards>` from `src/components/ui/UIDesigns/StatCards.tsx`) at the top.
*   **Datatables Architecture**:
    *   **Global search, sorting, and filters** (TanStack Table).
    *   **Data Export**: CSV and PDF export actions configured correctly.
    *   **Pagination controls** with custom "rows per page" selectors.
    *   **Table container wrappers** with `overflow-x-auto min-h-[250px]` configuration.

## 4. Dropdown Actions Menu Position (Portal Pattern)
*   **Never render absolute action dropdowns inline** inside table cells. Always use React Portals (`createPortal` to `document.body`).
*   **Group Row Actions:** Always wrap row actions in `<ActionMenu>` from `src/components/ui/UIDesigns/ActionMenu.tsx`.

## 5. Form Views (Slide-Over Drawer vs Full-Page Form)
*   **Small Forms:** Details panels and small forms MUST open inside `<ProfileDrawer>` from `src/components/ui/UIDesigns/ProfileDrawer.tsx`.
*   **Large Forms:** For complex forms (e.g. Student Admission, Vehicle Registration), use a dedicated full-page form view with a header "Back" button, grouped card sections, and a fixed bottom action bar.

## 6. Dark Mode Aesthetics
*   All styles must support dark mode with Tailwind slate/gray configurations (`dark:bg-gray-900`, `dark:border-gray-800`, `dark:text-gray-300`).

## 7. Database Migrations
* **NEVER** run EF Core migration commands (`dotnet ef migrations add`, `dotnet ef database update`) directly in terminal. Always generate raw SQL scripts for the user to run manually.

## 8. API Requests (Axios)
* **NEVER** prepend `/api/` to your frontend Axios requests. The global `axiosConfig.ts` already sets `baseURL` to `/api`. Use `api.get('/students/...')` instead of `api.get('/api/students/...')`.

## 9. Master SMS System Cycle & Interactive Screen-by-Screen Study Guide Protocol
* **Strict 2 Screens per Turn:** Always explain exactly 2 screens per response in deep, easy-to-understand detail.
* **Simultaneous Live Fixes:** Fix any user-reported errors or UI improvements live on the spot, verify build (`dotnet build` & `npx tsc --noEmit`), and report the fix cleanly.
* **Deep Explanations:** Detail every field, state hook, API endpoint, button action, portal pattern, and Agent 1 component usage.
