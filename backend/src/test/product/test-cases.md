# Product Test Cases

## Hierarchy

Brand
└── Category
└── Series
└── Product

## Important Rules

- Product requires only `seriesId` (category/brand are derived through series)
- (`seriesId`, `name`) must be unique (case-insensitive)
- Product can be created under inactive series (no restriction at create time)
- Public visibility requires all active flags:
  - `Product.isActive === true`
  - `Series.isActive === true`
  - `Category.isActive === true`
  - `Brand.isActive === true`
- Admin ignores visibility status flags

---

## API Validation (`product.api.test.js`)

### Create Product – `POST /api/products`

1. Create product successfully (admin, valid payload)
2. Fail when `seriesId` is missing
3. Fail when `seriesId` format is invalid
4. Fail when `name` is missing
5. Fail when `name` is empty
6. Fail when `name` contains only spaces
7. Fail when `iconImage` is missing
8. Fail when `iconImage` mime type is invalid
9. Fail when `iconImage` file size exceeds limit
10. Return `401` for public user
11. Map unexpected error to `500`

> Note: series existence and duplicate name checks are integration coverage.

### Get Products – `GET /api/products`

12. Return products with filters (`seriesId`, `categoryId`, `brandId`, `page`, `limit`)
13. Return products successfully with no query params
14. Filter by `seriesId` correctly
15. Filter by `categoryId` correctly (derived via series relation)
16. Filter by `brandId` correctly (derived via category relation)
17. Return only active products for public user
18. Hide products under inactive series/category/brand for public user
19. Return active + inactive products for admin user
20. Fail when `seriesId` format is invalid
21. Fail when `categoryId` format is invalid
22. Fail when `brandId` format is invalid
23. Fail when `page` is invalid
24. Fail when `limit` is invalid
25. Map unexpected error to `500`

### Get Single Product – `GET /api/products/:id`

26. Return product successfully
27. Fail when id format is invalid
28. Return `404` when product is inactive for public
29. Return `404` when parent series is inactive for public
30. Return `404` when parent category is inactive for public
31. Return `404` when parent brand is inactive for public
32. Map `NotFoundError` to `404`
33. Map unexpected error to `500`

### Update Product – `PATCH /api/products/:id`

34. Update product successfully
35. Return no-change success when no fields are provided
36. Fail when product id format is invalid
37. Fail when `seriesId` format is invalid (when provided)
38. Fail when `name` is empty / whitespace when provided
39. Fail when `description` is not string when provided
40. Fail when `isActive` is not boolean when provided
41. Update description only successfully
42. Update icon image successfully
43. Fail when `iconImage` file size exceeds limit
44. Return `401` for public user
45. Map `NotFoundError` to `404`
46. Map `ConflictError` to `409`
47. Map unexpected error to `500`

### Update Product Status – `PATCH /api/products/:id/status`

48. Update status successfully
49. Fail when id format is invalid
50. Fail when `isActive` is missing
51. Fail when `isActive` is not boolean
52. Return `401` for public user
53. Map `NotFoundError` to `404`
54. Map unexpected error to `500`

### Delete Product – `DELETE /api/products/:id`

55. Delete product successfully
56. Fail when id format is invalid
57. Return `401` for public user
58. Map `NotFoundError` to `404`
59. Map unexpected error to `500`

---

## DB Integration (`product.integration.db.test.js`)

### Create Product – Integration

1. Create product under valid series
2. Return `404` if series does not exist
3. Trim name before saving (`" iPhone 15 "` -> `"iPhone 15"`)
4. Return `409` for case-insensitive duplicate under same series
5. Allow same product name under different series
6. Ensure (`seriesId`, `name`) uniqueness is enforced

### Get Products – Integration

7. Hide inactive product for public
8. Hide product under inactive series for public
9. Hide product under inactive category for public
10. Hide product under inactive brand for public
11. Return active + inactive products for admin
12. Filtering by `seriesId` works correctly
13. Filtering by `categoryId` works correctly
14. Filtering by `brandId` works correctly
15. Pagination works correctly

### Get Single Product – Integration

16. Return `404` for inactive product when accessed by public
17. Return `404` when series is inactive for public
18. Return `404` when category is inactive for public
19. Return `404` when brand is inactive for public
20. Return inactive product for admin
21. Return product even if series/category/brand are inactive for admin
22. Return `404` when product does not exist

### Update Product – Integration

23. Return `404` when product does not exist
24. Return `404` when updating to non-existing series
25. Return `409` when updating to duplicate name under same series
26. Allow duplicate name under different series
27. Trim name before update and persist
28. Replace image and keep product record consistent

### Update Product Status – Integration

29. Persist toggle: active -> inactive -> active
30. Return `404` when product does not exist
31. Verify DB state changed

### Delete Product – Integration

32. Delete product successfully
33. Return `404` when product does not exist
34. Ensure deleting product does not affect series/category/brand

---

## Final Visibility Rule

For public users, return product only when:

- `Product.isActive === true`
- `Series.isActive === true`
- `Category.isActive === true`
- `Brand.isActive === true`

For admin users:

- Ignore all status flags
