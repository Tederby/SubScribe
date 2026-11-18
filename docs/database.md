# SubScribe Database Design

Engine: Supabase PostgreSQL (defined in `schema.sql`).

## Entity Relationship

```text
┌──────────────────────┐
│      categories      │
├──────────────────────┤
│ id (PK, UUID)        │◄──────┐
│ name (TEXT)          │       │
└──────────────────────┘       │
                               │ 1:N
┌──────────────────────┐       │
│       services       │       │
├──────────────────────┤       │
│ id (PK, UUID)        │       │
│ sku (UNIQUE, TEXT)   │       │
│ name (TEXT)          │       │
│ description (TEXT)   │       │
│ category_id (FK)     ├───────┘
│ monthly_price (NUM)  │
│ max_slots (INT)      │
└──────────────────────┘

┌──────────────────────┐
│     split_groups     │
├──────────────────────┤
│ id (PK, UUID)        │
│ group_name (TEXT)    │
│ service_name (TEXT)  │
│ leader_name (TEXT)   │
│ leader_phone (TEXT)  │
│ price_per_person(NUM)│
│ billing_day (INT)    │
│ member_list (TEXT)   │
└──────────────────────┘
```

