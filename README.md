# MAS RMS Server API Documentation

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment | `development` / `production` |
| `PORT` | Port number for the server | `5000` |
| `DATABASE_URL` | MongoDB connection string | `mongodb+srv://...` |
| `BCRYPT_SALT_ROUNDS` | Salt rounds for password hashing | `10` |
| `JWT_SECRET` | Secret key for Access Token | `your_secret_key` |
| `JWT_REFRESH_SECRET` | Secret key for Refresh Token | `your_refresh_secret_key` |
| `JWT_EXPIRES_IN` | Access Token expiration time | `1d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh Token expiration time | `30d` |
| `FRONT_END_DEV_URL` | Frontend URL for development | `http://localhost:3000` |
| `FRONT_END_PROD_URL` | Frontend URL for production | `https://your-app.vercel.app` |
| `DEFAULT_USER_PASS` | Default password for new users | `password123` |
| `RESET_LINK` | URL for password reset redirection | `http://localhost:3000/reset-password` |
| `EMAIL` | Sender email for notifications | `example@gmail.com` |
| `APP_PASS` | App password for email sender | `your_app_password` |
| `SUPER_ADMIN_EMAIL` | Initial Super Admin email | `admin@example.com` |
| `GOOGLE_CLIENT_ID` | Google Client ID for Auth | `...apps.googleusercontent.com` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_api_secret` |

---

## Auth Module

This documentation provides details for the Authentication module endpoints.

---

### 1. Login User

Authenticates a user and returns access and refresh tokens.

- **URL:** `/api/v1/auth/login`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**

  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword",
    "provider": "LOCAL"
  }
  ```

  _Note: `provider` can be `LOCAL` or other supported providers._

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "User logged in successfully !",
      "data": {
        "accessToken": "eyJhbG...",
        "refreshToken": "eyJhbG...",
        "needsPasswordChange": false
      }
    }
    ```
- **Notes:** The `refreshToken` is also set in the browser cookies.

---

### 2. Refresh Token

Generates a new access token using a refresh token.

- **URL:** `/api/v1/auth/refresh-token`
- **Method:** `POST`
- **Auth Required:** No (Requires Refresh Token in Header)
- **Headers:**
  - `Authorization`: `YOUR_REFRESH_TOKEN`
- **Request Body:** None

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "User logged in successfully !",
      "data": {
        "accessToken": "eyJhbG..."
      }
    }
    ```

---

### 3. Change Password

Changes the password for the currently authenticated user.

- **URL:** `/api/v1/auth/change-password`
- **Method:** `POST`
- **Auth Required:** Yes (Access Token)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:**

  ```json
  {
    "oldPassword": "oldpassword123",
    "newPassword": "newpassword456"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Password changed successfully !"
    }
    ```

---

### 4. Forgot Password

Sends a password reset link to the user's registered email.

- **URL:** `/api/v1/auth/forgot-password`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**

  ```json
  {
    "email": "user@example.com"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Check your email!",
      "data": {
        "message": "A Password reset link Has been sent to you Email. Check your email! Also check spam"
      }
    }
    ```

---

### 5. Reset Password

Resets the password using the token received via email.

- **URL:** `/api/v1/auth/reset-password`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**

  ```json
  {
    "token": "RESET_TOKEN_FROM_EMAIL",
    "newPassword": "newpassword456"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Account recovered!"
    }
    ```

---

## CashMemoType Module

This documentation provides details for the CashMemoType module endpoints, which manages the default print format (POS or A4).

---

### 1. Create CashMemoType

Creates a new cash memo type setting.

- **URL:** `/api/v1/cash-memo-type`
- **Method:** `POST`
- **Auth Required:** Yes (Admin/Super Admin)
- **Request Body:**

  ```json
  {
    "cashMemoType": "pos"
  }
  ```

  _Note: Valid types are `pos` or `a4`._

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "CashMemoType created successfully",
      "data": { ... }
    }
    ```

---

### 2. Get All CashMemoTypes

Retrieves all cash memo type settings.

- **URL:** `/api/v1/cash-memo-type`
- **Method:** `GET`
- **Auth Required:** No

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "CashMemoTypes retrieved successfully",
      "data": [ ... ]
    }
    ```

---

### 3. Get Single CashMemoType

Retrieves a specific cash memo type setting by ID.

- **URL:** `/api/v1/cash-memo-type/:id`
- **Method:** `GET`
- **Auth Required:** No

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "CashMemoType retrieved successfully",
      "data": { ... }
    }
    ```

---

### 4. Update CashMemoType

Updates the cash memo type.
_Note: The current implementation deletes existing types and creates a new one with the provided data._

- **URL:** `/api/v1/cash-memo-type`
- **Method:** `PATCH`
- **Auth Required:** Yes (Admin/Super Admin)
- **Request Body:**

  ```json
  {
    "cashMemoType": "a4"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "CashMemoType updated successfully",
      "data": { ... }
    }
    ```

---

### 5. Delete CashMemoType

Deletes a specific cash memo type setting.

- **URL:** `/api/v1/cash-memo-type/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (Super Admin)

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "CashMemoType deleted successfully",
      "data": { ... }
    }
    ```

---

## Customer Module

This documentation provides details for the Customer module endpoints.

---

### 1. Create Customer

Creates a new customer record.

- **URL:** `/api/v1/customer-list`
- **Method:** `POST`
- **Auth Required:** Yes (Super Admin/Admin/Manager)
- **Request Body:**

  ```json
  {
    "cid": "C001",
    "name": "John Doe",
    "phone": "01700000000",
    "email": "john@example.com",
    "address": "123 Street, City",
    "dob": "1990-01-01",
    "reward": 0,
    "discountCard": "DISC100",
    "discount": 10,
    "branch": "65f... (Branch ObjectId)"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "created Successfully",
      "data": { ... }
    }
    ```

---

### 2. Get All Customers

Retrieves a list of all customers.

- **URL:** `/api/v1/customer-list`
- **Method:** `GET`
- **Auth Required:** Yes (Super Admin/Admin/Manager/Accountant/Cashier/User)

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Retrieved Successfully",
      "data": [ ... ]
    }
    ```

---

### 3. Get Single Customer

Retrieves details of a specific customer by ID.

- **URL:** `/api/v1/customer-list/:id`
- **Method:** `GET`
- **Auth Required:** No

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Retrived Successfully",
      "data": { ... }
    }
    ```

---

### 4. Update Customer

Updates information for an existing customer.

- **URL:** `/api/v1/customer-list/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (Super Admin/Admin/Manager)
- **Request Body:** (Any subset of Customer fields)

  ```json
  {
    "name": "John Updated",
    "discount": 15
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "updated Successfully",
      "data": { ... }
    }
    ```

---

### 5. Delete Customer

Deletes a specific customer.

- **URL:** `/api/v1/customer-list/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (Super Admin/Admin/Manager)

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Deleted Successfully",
      "data": { ... }
    }
    ```

---

### 6. Get Customer by Discount Code

Retrieves customer details using their discount card code.

- **URL:** `/api/v1/customer-list/discount-code/:discountCard`
- **Method:** `GET`
- **Auth Required:** No

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Customer Retrieved successfully",
      "data": { ... }
    }
    ```

---

## Delivery Address Module

This documentation provides details for the Delivery Address module endpoints, used to manage user shipping addresses.

---

### 1. Create Delivery Address

Creates a new delivery address for a user.

- **URL:** `/api/v1/delivery-address`
- **Method:** `POST`
- **Auth Required:** No (Wait, controller doesn't use auth middleware but service might use userId. Checking...)
- **Request Body:**

  ```json
  {
    "name": "Home",
    "phone": "01700000000",
    "landMark": "Near Mosque",
    "division": "Dhaka",
    "city": "Dhaka",
    "zone": "Dhanmondi",
    "address": "House 12, Road 5",
    "userId": "65f... (User ObjectId)",
    "isDefault": true
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Delivery Address Created Successfully",
      "data": { ... }
    }
    ```

---

### 2. Get All Delivery Addresses

Retrieves all delivery addresses for the authenticated user.

- **URL:** `/api/v1/delivery-address`
- **Method:** `GET`
- **Auth Required:** Yes (User/Admin/etc.)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Delivery Address Retrieved Successfully",
      "data": [ ... ]
    }
    ```

---

### 3. Get Default Delivery Address

Retrieves the default delivery address for the authenticated user.

- **URL:** `/api/v1/delivery-address/default`
- **Method:** `GET`
- **Auth Required:** Yes
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Delivery Address Retrieved Successfully",
      "data": { ... }
    }
    ```

---

### 4. Update Delivery Address

Updates an existing delivery address.

- **URL:** `/api/v1/delivery-address/:id`
- **Method:** `PATCH`
- **Auth Required:** No (as per routes, but usually should be)
- **Request Body:** (Any subset of DeliveryAddress fields)

  ```json
  {
    "name": "Office",
    "isDefault": true
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Delivery Address Updated Successfully",
      "data": { ... }
    }
    ```

---

### 5. Delete Delivery Address

Deletes a specific delivery address.

- **URL:** `/api/v1/delivery-address/:id`
- **Method:** `DELETE`
- **Auth Required:** No

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Delivery Address Deleted Successfully",
      "data": { ... }
    }
    ```

---

## Due Collection Module

This documentation provides details for the Due Collection module endpoints, used to manage and track due amount collections for orders.

---

### 1. Collect Due Amount

Records a new due collection for an order and updates the order's due and paid status.

- **URL:** `/api/v1/order/due-collection/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (Manager, Super Admin, Admin, Cashier, Accountant)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:**

  ```json
  {
    "amount": 500,
    "method": "Cash",
    "remark": "Partial payment received"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Dew Amount deducted Successfully",
      "data": { ... } // Updated Order Object
    }
    ```

---

### 2. Get Due Collection History

Retrieves the history of all due collections for a specific order.

- **URL:** `/api/v1/order/due-collection/:id`
- **Method:** `GET`
- **Auth Required:** Yes (Manager, Super Admin, Admin, Cashier, Accountant)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Dew Collection History Retrieved Successfully",
      "data": [
        {
          "_id": "65f...",
          "amount": 500,
          "method": "Cash",
          "remark": "Partial payment received",
          "postedBy": {
            "name": "John Doe",
            "uuid": "..."
          },
          "createdAt": "2024-03-20T..."
        }
      ]
    }
    ```

---

## Branch Module

### 1. Create Branch

- **URL:** `/api/v1/branch`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "bid": "B001",
    "name": "Main Branch",
    "phone": "01700000000",
    "email": "branch@example.com",
    "address1": "Street 1",
    "division": "Dhaka",
    "city": "Dhaka"
  }
  ```

---

## Image Module

This documentation provides details for the Image module endpoints, used to manage image uploads via Cloudinary.

---

### 1. Upload Images

Uploads multiple images and returns the database ID for the image collection.

- **URL:** `/api/v1/image`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:** `multipart/form-data`

  - `images`: File (can be multiple, max 5)

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Successfully created",
      "data": "65f... (Images Collection ObjectId)"
    }
    ```

---

### 2. Update Image Collection

Updates an existing image collection by adding new images or replacing them.

- **URL:** `/api/v1/image/:id`
- **Method:** `PATCH`
- **Auth Required:** No
- **Query Params:**
  - `mode`: `single` (Replaces existing images) or `multiple` (Appends to existing images, default)
- **Request Body:** `multipart/form-data`

  - `images`: File (multiple)

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Successfully created",
      "data": { ... } // Updated Images Collection Object
    }
    ```

---

### 3. Remove Single Image

Deletes a specific image from a collection by its `public_id`.

- **URL:** `/api/v1/image/:id/:imageId`
- **Method:** `DELETE`
- **Auth Required:** No
- **Params:**

  - `id`: Images collection ObjectId
  - `imageId`: Cloudinary `public_id` of the image

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Successfully created",
      "data": { ... } // Updated Images Collection Object
    }
    ```

---

## Item Category Module

This documentation provides details for the Item Category module endpoints, used to manage food categories in the restaurant.

---

### 1. Create Item Category

Creates a new food category.

- **URL:** `/api/v1/item-categories`
- **Method:** `POST`
- **Auth Required:** Yes (Super Admin, Admin, Manager)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:**

  ```json
  {
    "name": "Burgers",
    "menuGroup": "65f... (MenuGroup ObjectId)",
    "branch": "65f... (Branch ObjectId, optional)",
    "image": "65f... (Image Collection ObjectId, optional)",
    "isPopular": true
  }
  ```

  _Note: `uid` is automatically generated._

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "ItemCategory Created Successfully",
      "data": { ... }
    }
    ```

---

### 2. Get All Item Categories

Retrieves a list of all item categories with optional filtering.

- **URL:** `/api/v1/item-categories`
- **Method:** `GET`
- **Auth Required:** No
- **Query Params:**

  - `menuGroup`: Filter by Menu Group ID
  - `isPopular`: Filter by popularity (true/false)

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "ItemCategory Retrieved Successfully",
      "data": [ ... ]
    }
    ```

---

### 3. Get Items By Category

Retrieves items belonging to categories based on query parameters.

- **URL:** `/api/v1/item-categories/items`
- **Method:** `GET`
- **Auth Required:** No

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Item by Category Retrieved Successfully",
      "data": [ ... ]
    }
    ```

---

### 4. Update Item Category

Updates an existing item category.

- **URL:** `/api/v1/item-categories/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (Super Admin, Admin, Manager)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:** (Any subset of ItemCategory fields)

  ```json
  {
    "name": "Classic Burgers",
    "isPopular": false
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "ItemCategory Updated Successfully",
      "data": { ... }
    }
    ```

---

### 5. Delete Item Category

Deletes a specific item category.

- **URL:** `/api/v1/item-categories/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (Super Admin, Admin, Manager)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "ItemCategory Deleted Successfully",
      "data": { ... }
    }
    ```

---

## Kitchen Orders Module

This documentation provides details for the Kitchen Orders module endpoints, used to manage KOTs (Kitchen Order Tickets). Kitchen orders are automatically generated when a main order is created or updated.

---

### 1. Get Kitchen Orders by Order ID

Retrieves all kitchen orders associated with a specific main order.

- **URL:** `/api/v1/order/kitchen-order-list/:id`
- **Method:** `GET`
- **Auth Required:** No (Auth middleware is not present in routes for this endpoint)
- **Params:**

  - `id`: The ObjectId of the main Order.

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Kitchen Order list Retrieved Successfully",
      "data": [
        {
          "_id": "65f...",
          "items": [
            {
              "itemCode": "ITM001",
              "itemName": "Cheeseburger",
              "qty": 2,
              "rate": 150
            }
          ],
          "billNo": 1001,
          "kitchenOrderNo": "1001001",
          "status": "active",
          "remark": "No onions",
          "tableName": "Table 5",
          "waiterName": "John",
          "orderId": "65f...",
          "createdAt": "2024-03-20T...",
          "updatedAt": "2024-03-20T..."
        }
      ]
    }
    ```

---

## Menu Group Module

This documentation provides details for the Menu Group module endpoints, used to manage groups of menu items.

---

### 1. Create Menu Group

Creates a new menu group.

- **URL:** `/api/v1/menu-groups`
- **Method:** `POST`
- **Auth Required:** Yes (Super Admin, Admin, Manager)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:**

  ```json
  {
    "name": "Appetizers",
    "description": "Starters and small plates",
    "branch": "65f... (Branch ObjectId, optional)"
  }
  ```

  _Note: `uid` is automatically generated. `branch` is automatically assigned if the user is associated with a branch._

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "MenuoGroup Created Successfully",
      "data": { ... }
    }
    ```

---

### 2. Get All Menu Groups

Retrieves a list of all menu groups.

- **URL:** `/api/v1/menu-groups`
- **Method:** `GET`
- **Auth Required:** Yes (Super Admin, Admin, Manager, Accountant, Cashier, User)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "MenuoGroup Retrieved Successfully",
      "data": [ ... ]
    }
    ```

---

### 3. Update Menu Group

Updates an existing menu group.

- **URL:** `/api/v1/menu-groups/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (Super Admin, Admin, Manager)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:** (Any subset of MenuGroup fields)

  ```json
  {
    "name": "Updated Appetizers",
    "description": "Updated description"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "MenuoGroup Updated Successfully",
      "data": { ... }
    }
    ```

---

### 4. Delete Menu Group

Deletes a specific menu group.

- **URL:** `/api/v1/menu-groups/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (Super Admin, Admin, Manager)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "MenuoGroup Deleted Successfully",
      "data": { ... }
    }
    ```

---

## Order Module

This documentation provides details for the Order module endpoints, which handles the core restaurant operations including creating orders, managing tables, and tracking status.

---

### 1. Create Order

Creates a new order in the system.

- **URL:** `/api/v1/order`
- **Method:** `POST`
- **Auth Required:** Yes (Manager, User, Cashier, Accountant)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:**

  ```json
  {
    "tableName": "65f... (Table ObjectId)",
    "waiter": "65f... (Waiter ObjectId)",
    "items": [
      {
        "item": "65f... (MenuItemConsumption ObjectId)",
        "qty": 2,
        "rate": 150,
        "discount": 0,
        "isDiscount": false,
        "isVat": true
      }
    ],
    "guest": 2,
    "paymentMode": "Cash",
    "branch": "65f... (Branch ObjectId)"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Order Created Succesfully",
      "data": { ... }
    }
    ```

---

### 2. Get All Orders

Retrieves a list of all orders with optional filtering.

- **URL:** `/api/v1/order`
- **Method:** `GET`
- **Auth Required:** Yes (Manager, User, Cashier, Accountant, Admin, Super Admin)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Order Retrieved Succesfully",
      "data": [ ... ]
    }
    ```

---

### 3. Get Single Order

Retrieves detailed information about a specific order, populating related fields.

- **URL:** `/api/v1/order/:id`
- **Method:** `GET`
- **Auth Required:** No

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Order Retrieved Successfully",
      "data": { ... }
    }
    ```

---

### 4. Update Order

Updates an existing order's details (e.g., adding items, updating totals).

- **URL:** `/api/v1/order/:id`
- **Method:** `PATCH`
- **Auth Required:** No (as per routes, though typically required)
- **Request Body:** (Subset of Order fields)

  ```json
  {
    "guest": 3,
    "paymentMode": "Card"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Order Updated Successfully",
      "data": { ... }
    }
    ```

---

### 5. Update Order Status

Changes the status of an order (e.g., from 'notPosted' to 'posted').

- **URL:** `/api/v1/order/status/:id`
- **Method:** `PATCH`
- **Auth Required:** No (as per routes)
- **Request Body:**

  ```json
  {
    "status": "posted"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Order status changed Successfully",
      "data": { ... }
    }
    ```

---

### 6. Get Active Table List

Retrieves a list of tables currently occupied with active orders.

- **URL:** `/api/v1/order/active-table-list`
- **Method:** `GET`
- **Auth Required:** Yes (Manager, User, Cashier, Accountant)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Active Table List Retrieved Successfully",
      "data": [ ... ]
    }
    ```

---

### 7. Get User Orders

Retrieves order history for the currently authenticated user.

- **URL:** `/api/v1/order/user-orders`
- **Method:** `GET`
- **Auth Required:** Yes (Manager, Super Admin, Admin, Cashier, Accountant, User)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "User Order History Retrieved Successfully",
      "data": [ ... ]
    }
    ```

---

## Order Cancellation Module

This documentation provides details for the Order Cancellation module endpoints, used to manage and process requests to void orders.

---

### 1. Create Order Cancellation Request

Submits a request to cancel an order.

- **URL:** `/api/v1/order/cancellation/new`
- **Method:** `POST`
- **Auth Required:** Yes (Manager, Super Admin, Admin, Cashier, Accountant, User)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:**

  ```json
  {
    "orderId": "65f... (Order ObjectId)",
    "reason": "Customer request",
    "description": "Changed their mind",
    "refundOption": "Cash",
    "notifyCustomer": true
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Cancellation Request Posted Successfully",
      "data": { ... }
    }
    ```

---

### 2. Get All Cancellation Requests

Retrieves all order cancellation requests with filtering based on user role.

- **URL:** `/api/v1/order/cancellation/all`
- **Method:** `GET`
- **Auth Required:** Yes (Manager, Super Admin, Admin, Cashier, Accountant, User)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Cancellations Retrieved Successfully",
      "data": {
        "meta": { ... },
        "result": [ ... ]
      }
    }
    ```

---

### 3. Get Single Cancellation Request

Retrieves details of a specific cancellation request by order ID.

- **URL:** `/api/v1/order/cancellation/single/:id`
- **Method:** `GET`
- **Auth Required:** No
- **Params:**

  - `id`: The ObjectId of the main Order.

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Cancellation Request Retrieved Successfully",
      "data": [ ... ]
    }
    ```

---

### 4. Approve Cancellation Request

Approves a pending order cancellation request and voids the associated order.

- **URL:** `/api/v1/order/cancellation/approve/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (Manager, Super Admin, Admin, Cashier, Accountant)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:**

  ```json
  {
    "adminNote": "Approved as per policy"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Cancellations Approved ",
      "data": { ... }
    }
    ```

---

### 5. Reject Cancellation Request

Rejects a pending order cancellation request.

- **URL:** `/api/v1/order/cancellation/reject/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (Manager, Super Admin, Admin, Cashier, Accountant)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:**

  ```json
  {
    "adminNote": "Order already processed"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Cancellations Rejected",
      "data": { ... }
    }
    ```

---

## Profile Module

This documentation provides details for the Profile module endpoints, used to manage user profile information.

---

### 1. Get My Profile

Retrieves the profile information for the currently authenticated user.

- **URL:** `/api/v1/profile`
- **Method:** `GET`
- **Auth Required:** Yes (Admin, Super Admin, Chef, Manager, User, Waitress)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Profile fetched successfully!",
      "data": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "01700000000",
        "address": "Dhaka, Bangladesh",
        "gender": "male",
        "dateOfBirth": "1990-01-01",
        "age": "34",
        "uuid": "...",
        "role": "USER"
      }
    }
    ```

---

### 2. Update Profile

Updates the profile information for a specific user by their UUID.

- **URL:** `/api/v1/profile/:uuid`
- **Method:** `PATCH`
- **Auth Required:** No (Wait, route doesn't have auth middleware, but likely should)
- **Request Body:** (Any subset of Profile fields)

  ```json
  {
    "name": "John Updated",
    "phone": "01800000000",
    "address": "New Address"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "User Updated successfully!",
      "data": { ... }
    }
    ```

---

## Raw Material Module

This documentation provides details for the Raw Material module endpoints, used to manage restaurant inventory materials.

---

### 1. Create Raw Material

Creates a new raw material record.

- **URL:** `/api/v1/raw-material`
- **Method:** `POST`
- **Auth Required:** Yes (Manager, User, Cashier, Accountant, Admin, Super Admin)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:**

  ```json
  {
    "materialName": "Sugar",
    "baseUnit": "gm",
    "superUnit": "kg",
    "conversion": 1000,
    "rate": 100,
    "description": "White sugar",
    "branch": "65f... (Branch ObjectId, optional)"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Raw Material created successfully",
      "data": { ... }
    }
    ```

---

### 2. Get All Raw Materials

Retrieves a list of all raw materials.

- **URL:** `/api/v1/raw-material`
- **Method:** `GET`
- **Auth Required:** Yes (Manager, User, Cashier, Accountant, Admin, Super Admin)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Raw Material retrieved successfully",
      "data": [ ... ]
    }
    ```

---

### 3. Get Single Raw Material

Retrieves details of a specific raw material by ID.

- **URL:** `/api/v1/raw-material/:id`
- **Method:** `GET`
- **Auth Required:** Yes (Manager, User, Cashier, Accountant, Admin, Super Admin)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Raw Material retrieved successfully",
      "data": { ... }
    }
    ```

---

### 4. Update Raw Material

Updates an existing raw material record.

- **URL:** `/api/v1/raw-material`
- **Method:** `PATCH`
- **Auth Required:** Yes (Manager, User, Cashier, Accountant, Admin, Super Admin)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:** (Any subset of RawMaterial fields, including `_id`)

  ```json
  {
    "_id": "65f...",
    "rate": 110
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Raw Material Updated successfully",
      "data": { ... }
    }
    ```

---

### 5. Delete Raw Material

Deletes a specific raw material record.

- **URL:** `/api/v1/raw-material/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (Manager, User, Cashier, Accountant, Admin, Super Admin)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Raw Material deleted successfully",
      "data": { ... }
    }
    ```

---

## Raw Material Consumption Module

This documentation provides details for the Raw Material Consumption module endpoints, used to manage menu items and their associated raw material requirements.

---

### 1. Create Menu Item Consumption

Creates a new menu item with its raw material consumption list.

- **URL:** `/api/v1/raw-material-consumption`
- **Method:** `POST`
- **Auth Required:** Yes (Manager, User, Cashier, Accountant, Admin, Super Admin)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:**

  ```json
  {
    "itemName": "Coffee",
    "itemCode": "C001",
    "rate": 50,
    "itemGroup": "65f... (MenuGroup ObjectId)",
    "itemCategory": "65f... (ItemCategory ObjectId)",
    "cookingTime": 5,
    "isDiscount": false,
    "isVat": true,
    "isWaiterTips": false,
    "consumptions": [{ "item": "65f... (RawMaterial ObjectId)", "qty": 10 }],
    "branch": ["65f... (Branch ObjectId)"],
    "images": "65f... (Images ObjectId, optional)"
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Raw Material created successfully",
      "data": { ... }
    }
    ```

---

### 2. Get All Menu Item Consumptions

Retrieves a list of all menu items with their consumption details.

- **URL:** `/api/v1/raw-material-consumption`
- **Method:** `GET`
- **Auth Required:** Yes (Manager, User, Cashier, Accountant, Admin, Super Admin)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Raw Material retrieved successfully",
      "data": [ ... ]
    }
    ```

---

### 3. Get Single Menu Item Consumption

Retrieves details of a specific menu item consumption by ID.

- **URL:** `/api/v1/raw-material-consumption/:id`
- **Method:** `GET`
- **Auth Required:** Yes (Manager, User, Cashier, Accountant, Admin, Super Admin)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Raw Material retrieved successfully",
      "data": { ... }
    }
    ```

---

### 4. Update Menu Item Consumption

Updates an existing menu item consumption record.

- **URL:** `/api/v1/raw-material-consumption/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (Manager, User, Cashier, Accountant, Admin, Super Admin)
- **Headers:**
  - `Authorization`: `YOUR_ACCESS_TOKEN`
- **Request Body:** (Any subset of IMenuItemConsumption fields)

  ```json
  {
    "rate": 55
  }
  ```

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Raw Material Updated successfully",
      "data": { ... }
    }
    ```

---

### 5. Delete Menu Item Consumption

Deletes a specific menu item consumption record.

- **URL:** `/api/v1/raw-material-consumption/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (Manager, User, Cashier, Accountant, Admin, Super Admin)
- **Headers:**

  - `Authorization`: `YOUR_ACCESS_TOKEN`

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Raw Material deleted successfully",
      "data": { ... }
    }
    ```

---

### 6. Get Discounted Items

Retrieves all menu items that have discounts applied.

- **URL:** `/api/v1/raw-material-consumption/discounted/items`
- **Method:** `GET`
- **Auth Required:** No

      }
      ```

---

## Reports Module

This documentation provides details for the Reports module endpoints, used to generate various business insights and statements.

---

### 1. Daily Statement

Retrieves a detailed statement of daily transactions.

- **URL:** `/api/v1/reports/daily-statement`
- **Method:** `GET`
- **Auth Required:** Yes
- **Query Params:** `startDate`, `endDate`, `branch`

---

### 2. Daily Statement Summary

Retrieves a summarized version of the daily statement.

- **URL:** `/api/v1/reports/daily-statement-summery`
- **Method:** `GET`
- **Auth Required:** Yes
- **Query Params:** `startDate`, `endDate`, `branch`

---

### 3. Item-wise Sales Statement

Retrieves sales data broken down by individual menu items.

- **URL:** `/api/v1/reports/itemwise-sales`
- **Method:** `GET`
- **Auth Required:** Yes
- **Query Params:** `startDate`, `endDate`, `branch`, `itemCode`

---

### 4. Menu Group Items

Retrieves items grouped by their menu groups.

- **URL:** `/api/v1/reports/menugroup-items`
- **Method:** `GET`
- **Auth Required:** Yes
- **Query Params:** `branch`

---

### 5. Menu Item Consumption

Retrieves raw material consumption data for menu items.

- **URL:** `/api/v1/reports/menuitem-consumption`
- **Method:** `GET`
- **Auth Required:** Yes
- **Query Params:** `branch`

---

### 6. Sales Due Statement

Retrieves a statement of orders with outstanding due amounts.

- **URL:** `/api/v1/reports/sales/due-statement`
- **Method:** `GET`
- **Auth Required:** Yes
- **Query Params:** `startDate`, `endDate`, `branch`

---

### 7. Waiter-wise Sales

Retrieves sales performance data for each waiter.

- **URL:** `/api/v1/reports/waiter-wise-sales`
- **Method:** `GET`
- **Auth Required:** Yes
- **Query Params:** `startDate`, `endDate`, `branch`

---

### 8. Dashboard Statistics

Retrieves high-level statistics for the admin dashboard.

- **URL:** `/api/v1/reports/dashboard-statistics`
- **Method:** `GET`
- **Auth Required:** Yes

---

## Table Module

This documentation provides details for the Table module endpoints, used to manage restaurant tables.

---

### 1. Create Table

Creates a new table record.

- **URL:** `/api/v1/table-list`
- **Method:** `POST`
- **Auth Required:** Yes (Super Admin, Admin, Manager)
- **Request Body:**
  ```json
  {
    "tid": "T001",
    "name": "Table 1",
    "details": "Near window",
    "branch": "BRANCH_ID" (Optional: Auto-assigned from user's branch)
  }
  ```
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Table Created Successfully",
      "data": { ... }
    }
    ```

---

### 2. Get All Tables

Retrieves a list of all tables. Filters by branch based on user permissions.

- **URL:** `/api/v1/table-list`
- **Method:** `GET`
- **Auth Required:** Yes (Super Admin, Admin, Manager, Accountant, Cashier, User)
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Table Retrived Successfully",
      "data": [ ... ]
    }
    ```

---

### 3. Get Single Table

Retrieves details of a specific table by ID.

- **URL:** `/api/v1/table-list/:id`
- **Method:** `GET`
- **Auth Required:** No
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Table Retrived Successfully",
      "data": { ... }
    }
    ```

---

### 4. Update Table

Updates details of an existing table.

- **URL:** `/api/v1/table-list/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (Super Admin, Admin, Manager)
- **Request Body:**
  ```json
  {
    "name": "Table 1 Updated",
    "details": "Updated details"
  }
  ```
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Table Updated Successfully",
      "data": { ... }
    }
    ```

---

### 5. Delete Table

Deletes a specific table record.

- **URL:** `/api/v1/table-list/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (Super Admin, Admin, Manager)
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Table Deleted Successfully",
      "data": { ... }
    }
    ```

---

## User Module

This documentation provides details for the User module endpoints, used to manage system users and their profiles.

---

### 1. Create User

Creates a new user with an associated profile.

- **URL:** `/api/v1/user`
- **Method:** `POST`
- **Auth Required:** Yes (Super Admin, Admin, Manager, User, Cashier, Accountant)
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "role": "USER",
    "status": "active",
    "branch": "65f... (Branch ObjectId)",
    "profile": {
      "name": "John Doe",
      "phone": "01700000000",
      "address": "Dhaka",
      "gender": "male",
      "dateOfBirth": "1990-01-01"
    }
  }
  ```
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "User created successfully!",
      "data": { ... }
    }
    ```

---

### 2. Get All Users

Retrieves a list of all users with pagination and filtering options.

- **URL:** `/api/v1/user`
- **Method:** `GET`
- **Auth Required:** Yes (Super Admin, Admin, Manager)
- **Query Params:**
  - `searchTerm`: Search by name or email
  - `status`: Filter by user status (active, inactive, rusticate)
  - `branch`: Filter by branch ID
  - `page`: Page number
  - `limit`: Items per page
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "User featched successfully!",
      "data": {
        "meta": { ... },
        "result": [ ... ]
      }
    }
    ```

---

### 3. Update User Profile

Updates the profile information for a specific user.

- **URL:** `/api/v1/user/profile/:uuid`
- **Method:** `PATCH`
- **Auth Required:** Yes (Super Admin, Admin, Manager, User, Cashier, Accountant)
- **Request Body:** (Subset of Profile fields)
  ```json
  {
    "name": "John Updated",
    "phone": "01800000000"
  }
  ```
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "User updated successfully!",
      "data": { ... }
    }
    ```

---

### 4. Change Password By Admin

Allows an administrator to change a user's password.

- **URL:** `/api/v1/user/change-password-admin/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (Super Admin, Admin)
- **Request Body:**
  ```json
  {
    "password": "newSecurePassword123"
  }
  ```
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "User password Changed successfully!",
      "data": { ... }
    }
    ```

---

### 5. Get User By UUID

Retrieves details of a specific user by their UUID.

- **URL:** `/api/v1/user/:uuid`
- **Method:** `GET`
- **Auth Required:** No
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "User retrieved successfully!",
      "data": { ... }
    }
    ```

---

### 6. Delete User

Deletes a user record by their UUID.

- **URL:** `/api/v1/user/:uuid`
- **Method:** `DELETE`
- **Auth Required:** No
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "User Deleted successfully!",
      "data": { ... }
    }
    ```

---

### 7. User Sign Up

Public endpoint for new user registration.

- **URL:** `/api/v1/user/user-sign-up`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User"
  }
  ```
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "User created successfully!",
      "data": { ... }
    }
    ```

---

## Waiter Module

This documentation provides details for the Waiter module endpoints, used to manage restaurant waitstaff.

---

### 1. Create Waiter

Creates a new waiter record.

- **URL:** `/api/v1/waiter`
- **Method:** `POST`
- **Auth Required:** Yes (Super Admin, Admin, Manager)
- **Request Body:**
  ```json
  {
    "name": "John Waiter",
    "remarks": "Day shift",
    "branch": "65f... (Branch ObjectId, optional)"
  }
  ```
  _Note: `uid` is automatically generated. `branch` is automatically assigned if the user is associated with a branch._

- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Waiter Created Successfully",
      "data": { ... }
    }
    ```

---

### 2. Get All Waiters

Retrieves a list of all waiters. Filters by branch based on user permissions.

- **URL:** `/api/v1/waiter`
- **Method:** `GET`
- **Auth Required:** Yes (Super Admin, Admin, Manager, Accountant, Cashier, User)
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Waiter Retrieved Successfully",
      "data": [ ... ]
    }
    ```

---

### 3. Update Waiter

Updates details of an existing waiter.

- **URL:** `/api/v1/waiter/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (Super Admin, Admin, Manager)
- **Request Body:**
  ```json
  {
    "name": "John Waiter Updated",
    "remarks": "Night shift"
  }
  ```
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Waiter Updated Successfully",
      "data": { ... }
    }
    ```

---

### 4. Delete Waiter

Deletes a specific waiter record.

- **URL:** `/api/v1/waiter/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (Super Admin, Admin, Manager)
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Waiter Deleted Successfully",
      "data": { ... }
    }
    ```
