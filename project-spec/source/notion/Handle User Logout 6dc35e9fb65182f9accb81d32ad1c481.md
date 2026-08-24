# Handle User Logout

Status: To Do
Task ID: TM-08

Implement a secure and reliable **logout feature** that ends the user’s session

## Requirements

- when user click on the avatar on the navbar display a dropdown inside it should be a logout button
- Call the API endpoint
- `POST {{base_url}}/auth/v1/logout`
- Include the following headers:
    
    ```json
    {
      "apikey": "<API_KEY>",
      "Authorization": "Bearer <ACCESS_TOKEN>"
    }
    ```
    
- Redirect the user to the **login page** after successful logout.
- If the logout API call fails, show an appropriate error message (e.g., “Logout failed, please try again.”).