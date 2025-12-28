# Project Finance Manager

A modern, full-stack project management and finance tracking application built with Next.js 16, Prisma, and SQLite.

## Features

### 📊 Project Management
- Create and manage projects with clients
- Track project status (Active, Completed, On Hold)
- Set budgets and monitor expenses
- View detailed project financials

### 💰 Financial Tracking
- **Invoices**: Create and track client invoices
- **Payments**: Record incoming payments
- **Payouts**: Manage employee payments
- **Reports**: Comprehensive financial reports by project and employee

### 👥 Employee Management
- Add and manage team members
- Assign employees to projects
- Track employee payouts and pending amounts
- View employee performance across projects

### 📝 Notes System
- Color-coded notes for projects
- Edit and delete notes
- Organize project information

### ⚙️ Settings & Configuration
- **Multi-Currency Support**: USD, INR, EUR, GBP
- **Password Protection**: Secure login system
- **Database Backup/Restore**: Export and import your data
- **Destroy All Data**: Complete database reset option

### 📱 Responsive Design
- Mobile-first design
- Works on phones, tablets, and desktops
- Hamburger menu navigation on mobile
- Touch-friendly interface

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router, Turbopack)
- **Database**: SQLite with Prisma ORM
- **Authentication**: Cookie-based sessions with bcrypt
- **Styling**: Vanilla CSS with glassmorphism effects
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xplicit-dev/project-finance-manager.git
   cd project-finance-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### First Login

- **Default Password**: `admin123`
- You'll be prompted to login on first visit
- Change your password in Settings after first login

## Project Structure

```
project-finance-manager/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── db/            # Database export/import
│   │   │   ├── projects/      # Project CRUD
│   │   │   ├── invoices/      # Invoice management
│   │   │   ├── employees/     # Employee management
│   │   │   └── settings/      # Settings & password
│   │   ├── projects/          # Projects pages
│   │   ├── employees/         # Employees page
│   │   ├── invoices/          # Invoices page
│   │   ├── reports/           # Reports page
│   │   ├── settings/          # Settings page
│   │   ├── login/             # Login page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   └── Sidebar.tsx        # Navigation sidebar
│   ├── contexts/              # React contexts
│   │   └── CurrencyProvider.tsx
│   ├── lib/                   # Utilities
│   │   ├── prisma.ts          # Prisma client
│   │   └── currency.ts        # Currency formatting
│   └── proxy.ts               # Authentication middleware
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── package.json
├── next.config.ts
└── tsconfig.json
```

## Database Schema

### Models

- **Project**: Project details, budget, status
- **Invoice**: Client invoices with amounts and due dates
- **Payment**: Incoming payments linked to invoices
- **Employee**: Team member information
- **ProjectEmployee**: Many-to-many relationship
- **Payout**: Employee payments
- **Note**: Project notes with colors
- **Settings**: Currency and password configuration

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check auth status

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice

### Employees
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee

### Database
- `GET /api/db/export` - Export database as JSON
- `POST /api/db/import` - Import database from JSON
- `DELETE /api/destroy` - Delete all data

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update currency
- `PUT /api/settings/password` - Change password

## Usage

### Managing Projects

1. Click **"New Project"** on the Projects page
2. Fill in project details (name, client, budget, etc.)
3. Click **Save** to create the project
4. View project details by clicking on a project card

### Creating Invoices

1. Go to a project detail page
2. Click **"New Invoice"** in the Invoices section
3. Enter invoice details and amount
4. Record payments as they come in

### Managing Employees

1. Navigate to the **Employees** page
2. Click **"Add Employee"**
3. Enter employee details
4. Assign employees to projects from project detail pages

### Changing Currency

1. Go to **Settings**
2. Select your preferred currency (USD, INR, EUR, GBP)
3. Click **"Save Settings"**
4. All amounts will update to the new currency

### Backup & Restore

**Export (Backup):**
1. Go to **Settings** → **Database Backup**
2. Click **"Export Database"**
3. JSON file downloads automatically

**Import (Restore):**
1. Go to **Settings** → **Database Backup**
2. Click **"Import Database"**
3. Select your backup JSON file
4. Data will be restored (preserves password)

## Security

- **Password Hashing**: bcrypt with 10 salt rounds
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Cookies**: HTTPS only in production
- **SameSite Strict**: CSRF protection
- **Route Protection**: All pages require authentication

## Development

### Running Prisma Studio

View and edit your database:
```bash
npx prisma studio
```

### Database Migrations

Create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js 16 and Prisma**
