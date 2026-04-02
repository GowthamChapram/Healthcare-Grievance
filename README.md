# CareFlow

A modern, multi-step grievance management system built with Next.js, React, and Material UI. Enables users to report grievances with detailed information, save drafts, and track submissions through an intuitive dashboard.

## Features

- **Multi-step Form Workflow** - Guided 3-step process (Details → Description → Review)
- **Draft Management** - Save incomplete grievances and resume later
- **Form Validation** - Real-time validation using Zod schemas
- **Dashboard Analytics** - Track submissions with filtering, search, and pagination
- **Server Actions** - Secure server-side operations for data persistence
- **Responsive Design** - Mobile-friendly UI with Material UI components
- **Type-Safe** - Full TypeScript support throughout the application

## Tech Stack

- **Framework**: Next.js 16.2.1 (App Router)
- **Runtime**: React 19.2.4
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + Material UI 7.3.9
- **Validation**: Zod 4.3.6
- **Icons**: Material UI Icons

## Project Structure

```
careflow/
├── Actions/                    # Server Actions for data operations
│   └── Grievance.actions.ts   # Save draft, submit, fetch grievances
├── app/                       # Next.js App Router pages
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── grievance/
│       ├── dashboard/        # Dashboard page with filtering & pagination
│       └── report/           # Multi-step form layout
│           ├── details/      # Step 1: Basic grievance details
│           ├── description/  # Step 2: Incident description
│           └── review/       # Step 3: Review & submit
├── Components/               # Reusable React components
│   ├── Dashboard/            # Dashboard-specific components
│   ├── Form/                 # Form building blocks
│   ├── Review/               # Review display components
│   └── UI/                   # Generic UI components
├── Hooks/                    # Custom React hooks
│   ├── useFormValidation.ts # Form validation hook
│   └── useAsyncAction.ts    # Async action with loading/flash states
├── Lib/                      # Utilities and constants
│   ├── Constants/
│   │   └── styles.ts        # Color schemes and styling constants
│   └── Validations/
│       └── Grievance.schema.ts # Zod validation schemas
├── Types/                    # TypeScript type definitions
│   └── Grievance.types.ts   # Domain models
└── public/                   # Static assets
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd careflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Design Decisions

### 1. **Server Actions for Data Operations**
We use Next.js Server Actions in `Actions/Grievance.actions.ts` for all data mutations. This approach:
- Eliminates the need for API routes
- Provides automatic error handling
- Ensures type safety between client and server
- Keeps sensitive logic server-side

### 2. **Form State Management with Context**
The `FormProvider` component manages form state globally using React Context, allowing:
- Seamless navigation between steps without losing data
- Centralized state updates
- Easy integration with validation hooks

### 3. **Custom Validation Hooks**
Separated validation logic into `useFormValidation` hook:
- Reusable across multiple forms
- Clean component code
- Field-level error tracking
- Easy to test and extend

### 4. **Async Action Hook**
The `useAsyncAction` hook abstracts async operation patterns:
- Loading state management
- Flash message/toast notifications
- Error handling with callbacks
- Auto-dismiss messages with configurable duration

### 5. **Zod for Schema Validation**
Chosen for:
- Runtime type validation
- Comprehensive error messages
- Schema composition and reusability
- Excellent TypeScript integration

### 6. **In-Memory Data Store**
Current implementation uses an in-memory array (`DB`) in Server Actions:
- Suitable for MVP and testing
- Can be easily swapped with a database (MongoDB, PostgreSQL, etc.)
- Data persists during the session

### 7. **Material UI for Component Library**
Selected for:
- Professional, polished design system
- Accessibility built-in
- Rich component ecosystem
- Consistent theming and customization

## Component Architecture

### Form Components
- **FormProvider**: Context-based state management for multi-step forms
- **FormSection**: Container with title and subtitle for form steps
- **FormField**: Wrapper for input fields with error display
- **FormActions**: Navigation buttons (Back, Save Draft, Next/Submit)
- **FileUploadSection**: File handling with drag-and-drop support

### Dashboard Components
- **DashboardClient**: Client-side dashboard with real-time filtering
- Status and search filtering
- Pagination (5 items per page)
- Sortable columns

### Review Components
- **ReviewCard**: Displays grouped information with icons
- **ReviewField**: Individual field display with optional chip styling
- File preview with size information

## API/Server Actions

### `saveDraft(data: any, files?: File[])`
Saves an incomplete grievance as a draft.
- Status: `"draft"`
- Returns: Grievance object with ID

### `submitGrievance(data: any, files?: File[])`
Submits a completed grievance for processing.
- Validates against full schema
- Status: `"submitted"`
- Returns: Grievance object with ID

### `fetchGrievances(filters: GrievanceFilters)`
Retrieves grievances with filtering and pagination.
- **Filters**: status, search, sortBy, sortOrder, page, pageSize
- Returns: `{ data: Grievance[], total: number }`

## Validation Schemas

Located in `Lib/Validations/Grievance.schema.ts`:

- **detailsSchema**: Step 1 validation (title, category, date, location, etc.)
- **descriptionSchema**: Step 2 validation (description, impact, resolution)
- **fullSchema**: Complete form validation

## Type Definitions

Core types in `Types/Grievance.types.ts`:
- `Grievance`: Complete grievance record
- `GrievanceData`: Form data structure
- `GrievanceFilters`: Dashboard filter options
- `GrievanceResponse`: Server response wrapper

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication & authorization
- [ ] Email notifications
- [ ] File storage (AWS S3/GCS)
- [ ] Advanced dashboard analytics
- [ ] Export to PDF/CSV
- [ ] Real-time updates with WebSockets
- [ ] Audit logging
- [ ] Role-based access control (Admin, User, Officer)

## Development Tips

1. **Adding a New Form Field**
   - Add to `Grievance.types.ts`
   - Update validation schema in `Grievance.schema.ts`
   - Create FormField in the appropriate step page
   - Add to review display

2. **Extending Server Actions**
   - Add new functions to `Actions/Grievance.actions.ts`
   - Mark with `"use server"` directive
   - Return typed responses
   - Handle errors appropriately

3. **Creating New Components**
   - Place in appropriate `Components/` subdirectory
   - Extract reusable patterns into smaller components
   - Use TypeScript interfaces for props
   - Include proper error boundaries

## Performance Optimizations

- **Code Splitting**: Automatic via Next.js
- **Image Optimization**: Next.js Image component ready
- **Server Components**: Leveraging App Router defaults
- **Lazy Loading**: Dashboard data fetched on demand
- **Pagination**: Limited result sets (5 per page)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
