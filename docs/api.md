# SubScribe REST API Documentation

Base URL: `http://localhost:3000` (Local) / `/api` (Production)

## Endpoints

### 1. Categories (`/api/categories`)
- `GET /api/categories` - Fetch all categories.
- `GET /api/categories/:id` - Fetch single category by UUID.
- `POST /api/categories` - Create new category. Body: `{ "name": "Streaming" }`
- `PUT /api/categories/:id` - Update category. Body: `{ "name": "Streaming & VOD" }`
- `DELETE /api/categories/:id` - Delete category by UUID.

### 2. Services (`/api/services`)
- `GET /api/services` - Fetch all subscription services (includes joined category data).
- `GET /api/services/:id` - Fetch single service by UUID (includes joined category data).
- `POST /api/services` - Create service. Body:
  ```json
  {
    "sku": "NETFLIX-PREM",
    "name": "Netflix Premium",
    "description": "4K Ultra HD 4 screens",
    "category_id": "uuid-here",
    "monthly_price": 186000,
    "max_slots": 4
  }
  ```
- `PUT /api/services/:id` - Update service by UUID.
- `DELETE /api/services/:id` - Delete service by UUID.

### 3. Split Groups (`/api/groups`)
- `GET /api/groups` - Fetch all split groups.
- `GET /api/groups/:id` - Fetch single split group by UUID.
- `POST /api/groups` - Create split group (`group_name`, `service_name`, and `leader_name` required; `leader_phone` optional with `628xxx` format). Body:
  ```json
  {
    "group_name": "Netflix Nonton Bareng",
    "service_name": "Netflix Premium",
    "leader_name": "Budi Santoso",
    "leader_phone": "6281234567890",
    "price_per_person": 46500,
    "billing_day": 15,
    "member_list": "Budi Santoso, Andi Pratama, Siti Nurhaliza, Rizky Ramadhan",
    "paid_members": "Budi Santoso, Andi Pratama"
  }
  ```
- `PUT /api/groups/:id` - Update group by UUID (accepts any fields including `paid_members` and `member_list`).
- `DELETE /api/groups/:id` - Delete group by UUID.

