# Brand Test Cases

## API Validation (`brand.api.test.js`)

1. POST `/api/brands` create brand successfully
2. POST `/api/brands` fail when name is missing
3. POST `/api/brands` fail when name is empty
4. POST `/api/brands` fail when name contains only spaces
5. POST `/api/brands` fail when icon image is missing
6. POST `/api/brands` fail when icon image mime type is invalid
7. POST `/api/brands` fail when banner image is missing
8. POST `/api/brands` fail when banner image mime type is invalid
9. POST `/api/brands` return 401 for public user
10. GET `/api/brands` return only active brands for public user
11. GET `/api/brands` fail when page is invalid
12. GET `/api/brands` fail when limit is invalid
13. GET `/api/brands/:id` return a single brand
14. GET `/api/brands/:id` fail when id format is invalid
15. GET `/api/brands/:id` return 403 when brand is inactive for public user
16. PATCH `/api/brands/:id` update brand successfully
17. PATCH `/api/brands/:id` return no-change success when no update fields are provided
18. PATCH `/api/brands/:id` fail when id format is invalid
19. PATCH `/api/brands/:id` return 401 for public user
20. PATCH `/api/brands/:id/status` update status successfully
21. PATCH `/api/brands/:id/status` fail when id format is invalid
22. PATCH `/api/brands/:id/status` fail when `isActive` is missing
23. PATCH `/api/brands/:id/status` fail when `isActive` is not boolean
24. DELETE `/api/brands/:id` delete brand successfully
25. DELETE `/api/brands/:id` fail when id format is invalid
26. DELETE `/api/brands/:id` return 401 for public user
27. POST `/api/brands` map unexpected error to 500
28. GET `/api/brands/:id` map unexpected error to 500
29. PATCH `/api/brands/:id` map unexpected error to 500
30. PATCH `/api/brands/:id/status` map unexpected error to 500
31. DELETE `/api/brands/:id` map unexpected error to 500
32. GET `/api/brands/:id` map `NotFoundError` to 404
33. PATCH `/api/brands/:id` map `NotFoundError` to 404
34. DELETE `/api/brands/:id` map `NotFoundError` to 404
35. PATCH `/api/brands/:id` map `ConflictError` to 409
36. POST `/api/brands` fail when icon image file size exceeds limit
37. POST `/api/brands` fail when banner image file size exceeds limit
38. PATCH `/api/brands/:id` fail when icon image file size exceeds limit
39. PATCH `/api/brands/:id` fail when banner image file size exceeds limit

## DB Integration (`brand.integration.db.test.js`)

1. POST `/api/brands` create a new brand successfully
2. POST `/api/brands` return 409 when duplicate brand name exists
3. GET `/api/brands` return all brands for admin
4. GET `/api/brands` return active and inactive brands for admin
5. GET `/api/brands` return only active brands for public user
6. GET `/api/brands/:id` return brand details successfully
7. GET `/api/brands/:id` return inactive brand details for admin
8. GET `/api/brands/:id` return active brand details for public user
9. GET `/api/brands/:id` return 403 when brand is inactive for public user
10. GET `/api/brands/:id` return 404 when brand does not exist
11. PATCH `/api/brands/:id` update brand successfully
12. PATCH `/api/brands/:id` return 404 when brand does not exist
13. PATCH `/api/brands/:id` return 409 when updating to duplicate name
14. PATCH `/api/brands/:id/status` update brand status successfully
15. PATCH `/api/brands/:id/status` return 404 when brand does not exist
16. DELETE `/api/brands/:id` delete brand successfully
17. DELETE `/api/brands/:id` return 404 when brand does not exist
18. POST `/api/brands` trim name before save (`" Apple "` → `"Apple"`)
19. PATCH `/api/brands/:id` trim name before update (`" Samsung "` → `"Samsung"`)
20. POST `/api/brands` return 409 for case-insensitive duplicate (`"Apple"` vs `"apple"`)
