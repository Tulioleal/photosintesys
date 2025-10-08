# Photosynthesis - Plant Recognition Platform

A mobile-first Next.js application for identifying plants using AI (OpenAI Vision) and providing care information. Features user authentication, plant history dashboard, and responsive design.

## Features

- 🪴 **Plant Identification**: Upload photos to identify plants using OpenAI's GPT-4 Vision
- 👤 **User Authentication**: Secure login/signup with Supabase
- 📊 **Dashboard**: View plant identification history with statistics
- 📱 **Mobile-First**: Optimized for mobile devices with responsive design
- 🔒 **Security**: Rate limiting, input validation, and secure API handling
- ♿ **Accessibility**: ARIA labels, semantic HTML, and keyboard navigation
- 🎨 **Modern UI**: Built with Shadcn/ui components and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, React 19
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Backend**: Next.js API Routes, Supabase
- **AI**: OpenAI GPT-4 Vision, LangChain
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query (React Query)
- **Validation**: Zod
- **Testing**: Jest

## Prerequisites

- Node.js 18+
- OpenAI API Key
- Supabase project

## Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd photosynthesis
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Copy `.env.example` to `.env.local` and fill in your credentials:

   ```env
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # NextAuth (optional)
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Database Setup**

   Run the Supabase migration:

   ```bash
   supabase db push
   ```

5. **Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── identify/      # Plant identification endpoint
│   │   └── analysis/      # User analysis history endpoint
│   ├── dashboard/         # User dashboard page
│   ├── login/            # Authentication page
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/ui components
│   ├── PlantCard.tsx    # Plant display component
│   └── ImageUpload.tsx  # Image upload component
├── controllers/         # Business logic controllers
├── models/             # Data models and validation
├── services/           # External service integrations
├── providers/          # React context providers
└── lib/                # Utility functions
    ├── supabase/       # Database client
    ├── security.ts     # Security utilities
    ├── rateLimit.ts    # Rate limiting
    └── env.ts          # Environment validation
```

## API Documentation

### POST `/api/identify`

Identify a plant from an uploaded image.

**Request Body:**

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ...",
  "user_id": "uuid-string"
}
```

**Response:**

```json
{
  "name": "Monstera deliciosa",
  "confidence": 0.95,
  "description": "A popular tropical houseplant...",
  "tips": ["Water when top soil is dry", "Provide bright indirect light"],
  "saved": { "id": 123, "created_at": "2024-01-01T00:00:00Z" }
}
```

### GET `/api/analysis?user_id={uuid}`

Get user's plant identification history.

**Response:**

```json
{
  "data": [
    {
      "id": 123,
      "created_at": "2024-01-01T00:00:00Z",
      "image_url": "data:image/jpeg;base64,...",
      "name": "Monstera deliciosa",
      "confidence": 0.95,
      "description": "A popular tropical houseplant...",
      "tips": ["Water when top soil is dry"]
    }
  ]
}
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Start the production server:

   ```bash
   npm start
   ```

## Security Features

- **Rate Limiting**: 10 requests/minute for identification, 5/hour per user
- **Input Validation**: Comprehensive validation using Zod schemas
- **File Upload Security**: Size limits, type validation, malicious file detection
- **Data Sanitization**: XSS prevention and input cleaning
- **API Key Protection**: Secure environment variable handling

## Performance Optimizations

- **Image Optimization**: Automatic image compression and WebP conversion
- **Lazy Loading**: Components load on demand
- **Caching**: React Query for efficient data caching
- **Bundle Optimization**: Tree shaking and code splitting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please open an issue on GitHub.
