# Ghibli Vision - AI Image Transformer

Ghibli Vision is a Next.js application that transforms user-uploaded photos into Studio Ghibli-inspired artwork using various AI image generation models. The application features a stunning UI built with Material UI, Supabase authentication, and integration with multiple AI providers.

## Features

- **Beautiful UI**: Modern, responsive design with Material UI components
- **User Authentication**: Secure login and signup with Supabase (email/password and Google OAuth)
- **Image Upload**: Drag-and-drop interface for uploading photos
- **Ghibli-Style Transformation**: Convert your photos into Studio Ghibli-inspired artwork
- **Multiple AI Providers**: Choose from OpenAI, Stability AI, Midjourney, and Leonardo AI
- **Subscription System**: Free tier with one transformation, plus premium subscription options
- **Custom API Key Support**: Use your own API keys for unlimited transformations

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- pnpm (v7 or later)
- Supabase account (for authentication)
- API keys for AI providers (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd image-generator-with-upload
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials and AI provider API keys

4. Set up Supabase:
   - Create a new Supabase project
   - Enable Email and Google authentication providers
   - Create a `profiles` table with the following schema:
     ```sql
     create table profiles (
       id uuid references auth.users primary key,
       email text,
       display_name text,
       free_image_used boolean default false,
       subscription_tier text default 'free',
       custom_api_key text,
       created_at timestamp with time zone default now(),
       updated_at timestamp with time zone
     );
     ```

5. Run the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stability AI
STABILITY_API_KEY=your_stability_api_key

# MidJourney API (via third-party)
MIDJOURNEY_API_KEY=your_midjourney_api_key

# Leonardo AI
LEONARDO_API_KEY=your_leonardo_api_key
```

## AI Providers

The application supports the following AI providers for image transformation:

1. **OpenAI DALL-E 3**: Advanced AI model by OpenAI with excellent Ghibli transformations
2. **Stability AI**: Specialized in artistic transformations with great Ghibli styles
3. **Midjourney (via API)**: Known for highest quality anime-style transformations
4. **Leonardo AI**: AI platform with fine-tuned Ghibli aesthetic capabilities

## Project Structure

```
ghibli-vision/
├── public/
│   └── images/       # Static images and placeholders
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   └── lib/          # Utility functions and shared code
├── .env.local.example # Example environment variables
└── README.md         # Project documentation
```

## Deployment

This application can be deployed on Vercel or any other hosting platform that supports Next.js applications.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
