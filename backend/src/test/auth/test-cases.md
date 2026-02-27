# Auth Test Cases

## API Validation (`auth.api.test.js`)

1. GET `/ping` returns pong
2. Admin register success
3. Admin register invalid email format
4. Admin register missing name
5. Admin register empty name
6. Admin register whitespace name
7. Admin register non-string name
8. Admin register missing email
9. Admin register empty password
10. Admin register password missing special character
11. Admin register password missing uppercase
12. Admin register password missing lowercase
13. Admin register password missing number
14. Admin login success
15. Admin login missing email
16. Admin login invalid email format
17. Admin login empty password
18. Admin login password missing special character
19. Admin login password missing uppercase
20. Admin login password missing lowercase
21. Admin login password missing number
22. Admin login invalid password format
23. Admin login malformed JSON
