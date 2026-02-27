# Series Test Cases

## Hierarchy

Brand
 └── Category
       └── Series

## Important Rules

- Series requires only `categoryId`
- Brand is derived from category
- (`categoryId`, `name`) must be unique (case-insensitive)
- Series can be created under inactive category (no restriction at create time)
- Public visibility requires:
  - `Series.isActive === true`
  - `Category.isActive === true`
  - `Brand.isActive === true`
- Admin ignores all status flags

---

## API Validation (`series.api.test.js`)

### Create Series – `POST /api/series`

1. Create series successfully (admin, valid payload)
2. Fail when `categoryId` is missing
3. Fail when `categoryId` format is invalid
4. Fail when `name` is missing
5. Fail when `name` is empty
6. Fail when `name` contains only spaces
7. Fail when `iconImage` is missing (if required)
8. Fail when `iconImage` mime type is invalid
9. Fail when `iconImage` file size exceeds limit
10. Return `401` for public user
11. Map unexpected error to `500`

> Note: category existence is integration coverage.

### Get Series – `GET /api/series`

12. Return series with filters applied
13. Return series successfully with no query params
14. Filter by `categoryId` correctly
15. Filter by `brandId` correctly (derived via category relation)
16. Return only active series for public user
17. Hide series under inactive category for public
18. Hide series under inactive brand for public
19. Return active + inactive series for admin user
20. Fail when `categoryId` format is invalid
21. Fail when `brandId` format is invalid
22. Fail when `page` is invalid
23. Fail when `limit` is invalid
24. Map unexpected error to `500`

### Get Single Series – `GET /api/series/:id`

25. Return series successfully
26. Fail when id format is invalid
27. Return `404` when series is inactive for public
28. Return `404` when parent category is inactive for public
29. Return `404` when parent brand is inactive for public
30. Map `NotFoundError` to `404`
31. Map unexpected error to `500`

### Update Series – `PATCH /api/series/:id`

32. Update series successfully
33. Return no-change success when no fields provided
34. Fail when series id format is invalid
35. If `categoryId` provided, fail when format is invalid
36. Return `401` for public user
37. Update description only successfully
38. Update icon image successfully
39. Fail when `iconImage` file size exceeds limit
40. Map `NotFoundError` to `404`
41. Map `ConflictError` to `409`
42. Map unexpected error to `500`

> Note: existence checks are integration coverage.

### Update Series Status – `PATCH /api/series/:id/status`

43. Update status successfully
44. Fail when id format is invalid
45. Fail when `isActive` is missing
46. Fail when `isActive` is not boolean
47. Return `401` for public user
48. Map unexpected error to `500`

### Delete Series – `DELETE /api/series/:id`

49. Delete series successfully
50. Fail when id format is invalid
51. Return `401` for public user
52. Map unexpected error to `500`

> Note: API validation intentionally skips `404` delete coverage.

---

## DB Integration (`series.integration.db.test.js`)

### Create Series – Integration

1. Create series under valid category
2. Return `404` if category does not exist
3. Trim name before saving (`" Galaxy "` -> `"Galaxy"`)
4. Return `409` for case-insensitive duplicate under same category
5. Allow same series name under different categories
6. Ensure (`categoryId`, `name`) uniqueness is enforced

### Get Series – Integration

7. Hide inactive series for public
8. Hide series under inactive category for public
9. Hide series under inactive brand for public
10. Return active + inactive series for admin
11. Filtering by `categoryId` works correctly
12. Filtering by `brandId` works correctly
13. Pagination works correctly

### Get Single Series – Integration

14. Return `404` for inactive series when accessed by public
15. Return `404` when category is inactive for public
16. Return `404` when brand is inactive for public
17. Return inactive series for admin
18. Return series even if category is inactive for admin
19. Return series even if brand is inactive for admin
20. Return `404` when series does not exist

### Update Series – Integration

21. Return `404` when series does not exist
22. Return `404` if updating to non-existing category
23. Return `409` when updating to duplicate name under same category
24. Allow duplicate name under different category
25. Trim name before update and persist
26. Verify DB record updated

### Update Series Status – Integration

27. Persist toggle: active -> inactive -> active
28. Return `404` when series does not exist
29. Verify DB state changed

### Delete Series – Integration

30. Delete series successfully
31. Return `404` when series does not exist
32. Ensure deleting series does not affect category
33. Ensure deleting series does not affect brand

---

## Final Visibility Rule

For public users, return series only when:

- `Series.isActive === true`
- `Category.isActive === true`
- `Brand.isActive === true`

For admin users:

- Ignore all status flags
