# Category Test Cases

## API Validation (`category.api.test.js`)

### Create Category – `POST /api/categories`

1. Create category successfully (admin, valid payload)
2. Fail when `brandId` is missing
3. Fail when `brandId` format is invalid
4. Fail when `name` is missing
5. Fail when `name` is empty
6. Fail when `name` contains only spaces
7. Fail when `iconImage` is missing
8. Fail when `iconImage` mime type is invalid
9. Fail when `iconImage` file size exceeds limit
10. Return `401` for public user
11. Map unexpected error to `500`

### Get Categories – `GET /api/categories`

12. Return categories with filters (`brandId`, `name`, `page`, `limit`)
13. Return categories successfully with no query params
14. Return only active categories for public user
15. Do not return categories from inactive brand for public user
16. Return active + inactive categories for admin user
17. Fail when `page` is invalid
18. Fail when `limit` is invalid
19. Fail when `brandId` format is invalid
20. Map unexpected error to `500`

### Get Single Category – `GET /api/categories/:id`

21. Return category successfully
22. Fail when id format is invalid
23. Return `404` when category is inactive for public user
24. Return `404` when parent brand is inactive for public user
25. Map `NotFoundError` to `404`
26. Map unexpected error to `500`

### Update Category – `PATCH /api/categories/:id`

27. Update category successfully
28. Return no-change success when no fields provided
29. Fail when category id format is invalid
30. Fail when brand id format is invalid
31. Return `401` for public user
32. Update description only successfully
33. Update icon image successfully
34. Fail when `iconImage` file size exceeds limit
35. Map `NotFoundError` to `404`
36. Map `ConflictError` to `409`
37. Map unexpected error to `500`

### Update Category Status – `PATCH /api/categories/:id/status`

38. Update status successfully
39. Fail when id format is invalid
40. Fail when `isActive` is missing
41. Fail when `isActive` is not boolean
42. Return `401` for public user
43. Map unexpected error to `500`

### Delete Category – `DELETE /api/categories/:id`

44. Delete category successfully
45. Fail when id format is invalid
46. Return `401` for public user
47. Map `NotFoundError` to `404`
48. Map unexpected error to `500`

---

## DB Integration (`category.integration.db.test.js`)

### Create Category – Integration

1. Create category linked to valid active brand
2. Trim name before saving (`" Phones "` -> `"Phones"`)
3. Return `409` for case-insensitive duplicate under same brand
4. Allow same category name under different brands

### Get Categories – Integration

5. Hide inactive category for public user
6. Hide categories under inactive brand for public user
7. Return active + inactive categories for admin user

### Get Single Category – Integration

8. Return `404` for inactive category when accessed by public
9. Return `404` when brand is inactive for public
10. Return inactive category for admin
11. Return category even if brand is inactive for admin

### Update Category – Integration

12. Trim name before update and persist

### Update Category Status – Integration

13. Persist toggle: active -> inactive -> active

### Delete Category – Integration

14. Delete category successfully and keep brand unaffected
