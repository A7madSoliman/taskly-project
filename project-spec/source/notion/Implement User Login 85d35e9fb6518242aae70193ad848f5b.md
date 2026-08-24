# Implement User Login

Status: To Do
Task ID: TM-04

**Description:**

Develop the **Login** functionality by integrating with the **API**. Users should be able to authenticate with their **email and password**.

[https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Tasks-Management?node-id=1-351&t=L7Jf026Stu5qCTd2-0](https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Tasks-Management?node-id=1-351&t=L7Jf026Stu5qCTd2-0)

**Requirements:**

- Page Route `/login`
- Create a `Login` page/component with a form containing:
    - Email
    - Password
    - Remember Me checkbox
- Validate inputs:
    - Email format must be valid
    - Password cannot be empty
- Use this API `/auth/v1/token?grant_type=password`
    - Body example:
        
        ```json
        { 
        	"email": "test666@gmail.com", 
        	"password": "Password123!"
        }
        ```
        
- Handle API responses:
    - If credentials are invalid, display error message.
- Redirect authenticated user to the main page `/project`.
- When user checked the Remember Me , user should be still logged in for 1 month.
- Add forgot password button without any functionality
    - Add `Don’t have an account?Sign up` button and user should navigated to sign up page when click on it

**Acceptance Criteria:**

- User can log in with valid email/password via API.
- Invalid credentials show a clear error (e.g., "Invalid email or password").
- Authenticated user stays logged in across page reloads.
- User is redirected to the main page after successful login.