# TrainBook

A comprehensive gym management system built with Next.js 15+, TypeScript, Supabase, and TailwindCSS. Manage classes, bookings, students, and more with our modern PWA platform.

## 🏋️ What's TrainBook?

TrainBook is a complete gym management solution that helps gym owners and fitness professionals manage their classes, students, and bookings efficiently. Students can easily book classes, manage their plans, and stay updated with notifications.

## ✨ Features

### For Gym Owners

- **Gym Management**: Create and manage your gym profile with branding
- **Class Scheduling**: Set up weekly recurring classes with different types
- **Student Management**: Manage student memberships and plans
- **Booking Oversight**: Monitor bookings, waitlists, and capacity
- **Analytics**: Track gym performance and student engagement
- **Notifications**: Keep students informed about class updates

### For Students

- **Class Discovery**: Browse available classes by type and schedule
- **Easy Booking**: Book classes with one click
- **Plan Management**: Track your weekly booking limits
- **Waitlist**: Join waitlists for full classes
- **Notifications**: Get updates about bookings and cancellations
- **PWA Support**: Install as a mobile app for easy access

### For Guests

- **Guest Booking**: Owners can add guests directly to classes
- **No Account Required**: Simple booking process for one-time attendees

## 🛠 Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript 5.9+
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with Google OAuth and Email
- **Styling**: TailwindCSS 4.1+ with DaisyUI 5.0+ + shadcn/ui
- **Icons**: Lucide React
- **PWA**: Service Worker + Web App Manifest
- **Storage**: Supabase Storage for gym assets
- **Email**: Resend for transactional emails

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for payments)
- Resend account (for emails)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/trainbook
cd trainbook
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Fill in the environment variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Resend
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up Supabase Database**

- Create a new project on [Supabase](https://supabase.com)
- Run the SQL commands in `DATABASE_SCHEMA.md` to set up your database
- Enable Row Level Security (RLS) on all tables
- Set up authentication providers (Google, Email)

5. **Set up Stripe**

- Create a Stripe account and get your API keys
- Set up webhooks for payment processing
- Create products and prices for gym subscriptions

6. **Set up Resend**

- Create a Resend account and get your API key
- Verify your domain for sending emails

7. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── gym/          # Gym management APIs
│   │   ├── classes/      # Class management APIs
│   │   ├── bookings/     # Booking management APIs
│   │   └── rpc/          # RPC function endpoints
│   ├── dashboard/         # Dashboard pages
│   │   ├── owner/        # Owner dashboard
│   │   └── student/      # Student dashboard
│   └── signin/            # Authentication pages
├── components/            # React components
│   ├── gym/              # Gym-specific components
│   ├── classes/          # Class-related components
│   ├── bookings/         # Booking components
│   └── shared/           # Shared components
├── libs/                  # Utility libraries
│   ├── supabase/         # Supabase client setup
│   ├── stripe.ts         # Stripe integration
│   └── resend.ts         # Email service
├── types/                 # TypeScript type definitions
├── public/                # Static assets
└── docs/                  # Documentation
    ├── TRAINBOOK_RULES.md
    ├── DATABASE_SCHEMA.md
    ├── API_DOCUMENTATION.md
    └── COMPONENT_GUIDELINES.md
```

## 🎯 User Roles

### Owner

- Creates and manages 1 gym maximum
- Configures class types, schedules, and capacity
- Manages students and their plans
- Handles bookings and waitlist
- Can add guests directly to classes
- Access to analytics and metrics

### Student

- Associates with 1 gym maximum
- Views available classes and schedules
- Books/cancels classes (within time limits)
- Views booking history and plans
- Can unlink from gym

### Guest

- Added directly to classes by Owner
- No account required
- Subject to capacity and waitlist rules
- No plan restrictions

## 📊 Core Features

### Class Management

- **Weekly Templates**: Create recurring class schedules
- **Class Types**: Define different types of classes (Yoga, Pilates, etc.)
- **Capacity Management**: Set and monitor class capacity
- **Waitlist Support**: Automatic waitlist when classes are full

### Booking System

- **Smart Booking**: Prevents overlapping bookings
- **Plan Limits**: Enforces weekly booking limits per student
- **Cancellation Rules**: Configurable cancellation time limits
- **Waitlist Promotion**: Automatic promotion when spots open

### Student Management

- **Plan Assignment**: Assign different plans to students
- **Usage Tracking**: Monitor weekly booking usage
- **Guest Management**: Add guests to classes

### Analytics & Reporting

- **Booking Metrics**: Track class occupancy and trends
- **Student Engagement**: Monitor student activity
- **Revenue Tracking**: Track subscription and usage metrics

## 🔧 Configuration

### Gym Settings

- **Waitlist Management**: Enable/disable waitlist functionality
- **Cancellation Limits**: Set hours before class for cancellation
- **Class Types**: Configure available class types with colors and emojis
- **Capacity Limits**: Set maximum students per plan

### Subscription Plans

- **Starter Gym**: Up to 50 students, basic features
- **Pro Gym**: Up to 200 students, advanced features
- **Enterprise**: Unlimited students, full features

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Basic offline functionality
- **Push Notifications**: Real-time updates for bookings
- **Responsive Design**: Optimized for all screen sizes

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel
4. Deploy!

### Other Platforms

- **Netlify**: Static site generation
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS deployment

## 📚 Documentation

- **[Project Rules](TRAINBOOK_RULES.md)**: Complete project guidelines and conventions
- **[Database Schema](DATABASE_SCHEMA.md)**: Detailed database structure and relationships
- **[API Documentation](API_DOCUMENTATION.md)**: Complete API reference
- **[Component Guidelines](COMPONENT_GUIDELINES.md)**: UI component patterns and best practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help:

1. Check the [documentation](docs/)
2. Open an issue on GitHub
3. Contact support at [support@trainbook.app](mailto:support@trainbook.app)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- Styled with [TailwindCSS](https://tailwindcss.com/) and [DaisyUI](https://daisyui.com/)
- Icons by [Lucide](https://lucide.dev/)
- Payments by [Stripe](https://stripe.com/)
- Emails by [Resend](https://resend.com/)

---

**TrainBook** - Making gym management simple and efficient. 🏋️‍♀️
