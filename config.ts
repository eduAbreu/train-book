import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "TrainBook",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Complete gym management system for owners and students. Manage classes, bookings, plans, and more with our modern PWA platform.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "trainbook.app",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Gym management subscription plans
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Niyy5AxyNprDp7iZIqEyD2h"
            : "price_gym_starter",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Starter Gym",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Perfect for small gyms and personal trainers",
        // The price you want to display, the one user will be charged on Stripe.
        price: 29,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 49,
        features: [
          {
            name: "Up to 50 students",
          },
          { name: "Unlimited classes" },
          { name: "Basic analytics" },
          { name: "Email notifications" },
          { name: "PWA mobile app" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1O5KtcAxyNprDp7iftKnrrpw"
            : "price_gym_pro",
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: true,
        name: "Pro Gym",
        description: "For growing gyms and fitness centers",
        price: 79,
        priceAnchor: 129,
        features: [
          {
            name: "Up to 200 students",
          },
          { name: "Unlimited classes" },
          { name: "Advanced analytics" },
          { name: "SMS + Email notifications" },
          { name: "PWA mobile app" },
          { name: "Waitlist management" },
          { name: "Custom branding" },
          { name: "Priority support" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1O5KtcAxyNprDp7iftKnrrpw"
            : "price_gym_enterprise",
        name: "Enterprise",
        description: "For large fitness chains and franchises",
        price: 199,
        priceAnchor: 299,
        features: [
          {
            name: "Unlimited students",
          },
          { name: "Unlimited classes" },
          { name: "Advanced analytics & reporting" },
          { name: "SMS + Email + Push notifications" },
          { name: "PWA mobile app" },
          { name: "Waitlist management" },
          { name: "Custom branding" },
          { name: "Multi-location support" },
          { name: "API access" },
          { name: "Dedicated support" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `TrainBook <noreply@resend.trainbook.app>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `TrainBook Support <support@resend.trainbook.app>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@trainbook.app",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: "#570df8",
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
  // Gym management specific settings
  gym: {
    // Maximum number of students per plan
    maxStudents: {
      starter: 50,
      pro: 200,
      enterprise: -1, // unlimited
    },
    // Default gym settings
    defaultSettings: {
      allowWaitlist: true,
      cancelLimitHours: 24,
    },
    // Supported class types
    defaultClassTypes: [
      { name: "Yoga", emoji: "🧘", color: "#8B5CF6" },
      { name: "Pilates", emoji: "🤸", color: "#06B6D4" },
      { name: "CrossFit", emoji: "💪", color: "#EF4444" },
      { name: "Spinning", emoji: "🚴", color: "#F59E0B" },
      { name: "Zumba", emoji: "💃", color: "#EC4899" },
      { name: "Boxing", emoji: "🥊", color: "#6B7280" },
    ],
  },
} as ConfigProps;

export default config;
