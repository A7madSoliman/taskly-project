# Page Layout (Sidebar + Navbar)

Status: To Do
Task ID: TM-06

Add UI for the sidebar and navbar

[https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Tasks-Management?node-id=1-986&t=L7Jf026Stu5qCTd2-0](https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Tasks-Management?node-id=1-986&t=L7Jf026Stu5qCTd2-0)

## Requirements

- This layout is available for logged in uses only

### 1- **Navbar**

- Display the user name and user job title on the navbar
- Display the avatar include first two characters from user name instead of user image
- 
    
    ![](https://t90121242121.p.clickup-attachments.com/t90121242121/cc901e04-b1e1-4416-a913-8661805ff164/image.png)
    
    - Examples
        - Mahmoud Taha ---→ MT
        - Mahmoud ---→ MA
- To Get the user data Call API endpoint:
    
    ```json
    GET {{base_url}}/auth/v1/user
    Headers:
      apikey: <API_KEY>
      Content-Type: application/json
    ```
    
- Make sure the navbar fit all screens

---

### 2- Sidebar

- Sidebar should include an arrow on the bottom so user can expand and collapse it
    - if collapsable display only the icon
    - if expandable display the icon and text
- On the tablet & mobile screens display the sidebar as burger Menu