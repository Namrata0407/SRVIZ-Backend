# Sports Travel Packages Backend Service

A production-ready backend API for managing sports travel packages, leads, and dynamic quote generation.

## 🚀 Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston

## 📁 Project Structure

```
.
├── src/
│   ├── modules/
│   │   ├── leads/          # Lead management module
│   │   ├── events/         # Events module
│   │   ├── packages/       # Packages module
│   │   └── quotes/         # Quote generation module
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   └── index.ts            # Application entry point
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seed script
├── tests/
│   └── pricing.test.ts     # Pricing logic tests
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SRVIZ-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your database URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/srviz_db?schema=public"
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed the database
   npm run prisma:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 📚 API Documentation

Once the server is running, access the interactive Swagger documentation at:
- **Swagger UI**: `http://localhost:3000/api-docs`

### Health Check

```bash
GET /health
```

Returns server status, uptime, and database connection status.

### API Endpoints

#### Leads

**Create a Lead**
```http
POST /api/leads
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "eventId": "uuid-here",
  "travellersCount": 2
}
```

**Get Leads (with pagination and filters)**
```http
GET /api/leads?status=New&eventId=uuid&month=6&page=1&limit=10
```

Query Parameters:
- `status` (optional): Filter by lead status (New, Contacted, QuoteSent, Interested, ClosedWon, ClosedLost)
- `eventId` (optional): Filter by event ID
- `month` (optional): Filter by event month (1-12)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Update Lead Status**
```http
PATCH /api/leads/:id/status
Content-Type: application/json

{
  "status": "Contacted"
}
```

Valid status transitions:
- `New` → `Contacted`
- `Contacted` → `QuoteSent` or `ClosedLost`
- `QuoteSent` → `Interested` or `ClosedLost`
- `Interested` → `ClosedWon` or `ClosedLost`
- `ClosedWon` / `ClosedLost` are terminal states

#### Events

**Get All Events**
```http
GET /api/events
```

**Get Event by ID**
```http
GET /api/events/:id
```

**Get Packages for an Event**
```http
GET /api/events/:id/packages
```

#### Quotes

**Generate a Quote**
```http
POST /api/quotes/generate
Content-Type: application/json

{
  "leadId": "uuid-here",
  "packageId": "uuid-here",
  "travellersCount": 4
}
```

Response includes:
- `quoteId`: Generated quote ID
- `basePrice`: Base price from package
- `adjustments`: All pricing adjustments
  - `seasonal`: Seasonal multiplier adjustment
  - `earlyBird`: Early-bird discount
  - `lastMinute`: Last-minute surcharge
  - `groupDiscount`: Group discount
  - `weekendSurcharge`: Weekend surcharge
- `finalPrice`: Final calculated price
- `leadStatus`: Updated lead status (automatically set to "Quote Sent")

## 💰 Pricing Logic

The quote generator calculates prices using the following business rules:

### 1. Base Price
- Retrieved from the selected package

### 2. Seasonal Multiplier
- **+20%** for June, July, December
- **+10%** for April, May, September
- Applied to base price

### 3. Early-Bird Discount
- **-10%** if event is **120+ days** away
- Applied to price after seasonal adjustment

### 4. Last-Minute Surcharge
- **+25%** if event is **less than 15 days** away
- Applied to price after seasonal and early-bird adjustments
- Takes precedence over early-bird discount

### 5. Group Discount
- **-8%** for **4 or more travellers**
- Applied to price after all previous adjustments

### 6. Weekend Surcharge
- **+8%** if event includes **Saturday or Sunday** within 7 days of start date
- Applied to final price before group discount

### Calculation Order
1. Base Price
2. Seasonal Multiplier
3. Early-Bird Discount (if applicable) OR Last-Minute Surcharge (if applicable)
4. Weekend Surcharge (if applicable)
5. Group Discount (if applicable)

### Example Calculation

**Scenario:**
- Base Price: $1,000
- Event Date: June 15, 2024 (Saturday, 150 days away)
- Travellers: 5

**Calculation:**
1. Base: $1,000
2. Seasonal (+20%): +$200 → $1,200
3. Early-Bird (-10%): -$120 → $1,080
4. Weekend (+8%): +$86.40 → $1,166.40
5. Group Discount (-8%): -$93.31 → **$1,073.09**

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Test Coverage

The test suite includes comprehensive tests for:
- ✅ Base price calculation
- ✅ Seasonal multiplier logic (all months)
- ✅ Early-bird discount (120+ days)
- ✅ Last-minute surcharge (<15 days)
- ✅ Group discount (≥4 travellers)
- ✅ Weekend surcharge detection
- ✅ Combined pricing scenarios
- ✅ Edge cases

## 🔄 Continuous Integration (CI)

GitHub Actions CI is configured to automatically run tests on every push and pull request.

The CI workflow:
- ✅ Runs on Ubuntu latest
- ✅ Sets up PostgreSQL test database
- ✅ Installs dependencies
- ✅ Generates Prisma Client
- ✅ Runs database migrations
- ✅ Executes all tests
- ✅ Builds the project

CI runs automatically when you:
- Push to `main`, `master`, or `develop` branches
- Create a pull request to these branches

View CI status in the "Actions" tab of your GitHub repository.

## 🗄️ Database Migrations

### Create a new migration
```bash
npm run prisma:migrate
```

### Apply migrations (production)
```bash
npm run prisma:migrate:deploy
```

### Seed the database
```bash
npm run prisma:seed
```

The seed script creates:
- 3 sample events (FIFA World Cup, Summer Olympics, UEFA Champions League)
- 6 sample packages (2 per event)

### Open Prisma Studio
```bash
npm run prisma:studio
```

## 📝 Database Schema

### Models

- **Lead**: Customer leads with status tracking
- **LeadStatusHistory**: Audit trail of status changes
- **Event**: Sports events with dates
- **Package**: Travel packages linked to events
- **Quote**: Generated quotes with pricing breakdown

See `prisma/schema.prisma` for full schema definition.

## 🚢 Deployment

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
PORT=3000
NODE_ENV=production
```

### Deployment Checklist

1. Set up PostgreSQL database
2. Set environment variables
3. Run migrations: `npm run prisma:migrate:deploy`
4. Seed database: `npm run prisma:seed`
5. Build: `npm run build`
6. Start: `npm start`

## 🔍 Logging

The application uses Winston for logging:
- **Development**: Console + file logs
- **Production**: File logs only
- Logs are written to:
  - `error.log`: Error-level logs
  - `combined.log`: All logs

Request logging middleware logs all HTTP requests with:
- Method, URL, status code
- Response time
- Client IP

## 🎯 What I Would Improve in Production

1. **Authentication & Authorization**
   - Implement JWT-based authentication
   - Add role-based access control (RBAC)
   - API key authentication for admin endpoints

2. **Rate Limiting**
   - Add rate limiting middleware (e.g., express-rate-limit)
   - Different limits for different endpoints
   - Protect POST endpoints from abuse

3. **Caching**
   - Redis caching for frequently accessed data (events, packages)
   - Cache invalidation strategies

4. **Email Integration**
   - Send quote emails to leads
   - Email notifications for status changes
   - Use services like SendGrid or AWS SES

5. **Enhanced Observability**
   - APM integration (e.g., New Relic, Datadog)
   - Structured logging with correlation IDs
   - Metrics collection (Prometheus + Grafana)
   - Distributed tracing

6. **Database Optimization**
   - Add database indexes for common queries
   - Query optimization and connection pooling
   - Read replicas for scaling

7. **API Enhancements**
   - GraphQL API option
   - Webhook support for external integrations
   - API versioning strategy

8. **Testing**
   - Integration tests for API endpoints
   - E2E tests for critical flows
   - Load testing with k6 or Artillery

9. **Security**
   - Input sanitization and validation
   - SQL injection prevention (Prisma handles this)
   - CORS configuration for production
   - Helmet.js for security headers

10. **CI/CD**
    - GitHub Actions for automated testing
    - Automated deployments
    - Database migration checks in CI

11. **Documentation**
    - Postman collection export
    - API versioning documentation
    - Architecture decision records (ADRs)

## 📄 License

ISC

## 👤 Author

Built as part of the Backend Founding Engineer assignment.

