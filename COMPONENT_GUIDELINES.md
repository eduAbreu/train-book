# TrainBook Component Guidelines

## Overview

This document outlines the component architecture and design patterns for the TrainBook gym management system, focusing on reusable, accessible, and maintainable UI components.

## Design System

### Color Palette

```css
:root {
  /* Primary Colors */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;
  --color-primary-700: #0369a1;
  --color-primary-900: #0c4a6e;

  /* Neutral Colors */
  --color-neutral-50: #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e1;
  --color-neutral-400: #94a3b8;
  --color-neutral-500: #64748b;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1e293b;
  --color-neutral-900: #0f172a;

  /* Status Colors */
  --color-success-500: #10b981;
  --color-warning-500: #f59e0b;
  --color-error-500: #ef4444;
  --color-info-500: #3b82f6;

  /* Class Type Colors */
  --color-yoga: #8b5cf6;
  --color-pilates: #06b6d4;
  --color-crossfit: #ef4444;
  --color-spinning: #f59e0b;
  --color-zumba: #ec4899;
  --color-boxing: #6b7280;
}
```

### Typography

```css
:root {
  --font-display: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* Font Sizes */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */
  --text-5xl: 3rem; /* 48px */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

### Spacing Scale

```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */
}
```

## Core Components

### 1. AppShell

Main layout wrapper with navigation

```typescript
interface AppShellProps {
  children: React.ReactNode;
  user: Profile;
  gym?: Gym;
  navigation?: "sidenav" | "bottombar";
}

export function AppShell({
  children,
  user,
  gym,
  navigation = "sidenav",
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {navigation === "sidenav" ? (
        <SideNav user={user} gym={gym} />
      ) : (
        <BottomBar user={user} gym={gym} />
      )}
      <main className={navigation === "sidenav" ? "ml-64" : "pb-16"}>
        {children}
      </main>
    </div>
  );
}
```

### 2. PageHero

Page header with title and actions

```typescript
interface PageHeroProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageHero({
  title,
  subtitle,
  actions,
  breadcrumbs,
}: PageHeroProps) {
  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {breadcrumbs && (
          <nav className="flex py-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-neutral-400 mx-2" />
                  )}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-sm text-neutral-500 hover:text-neutral-700"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-neutral-900">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-lg text-neutral-600">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-3">{actions}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. SectionCard

Content sections with consistent styling

```typescript
interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  subtitle,
  children,
  actions,
  className,
}: SectionCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-neutral-200 ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-neutral-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">{actions}</div>
            )}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
```

### 4. CTAButton

Call-to-action buttons with consistent styling

```typescript
interface CTAButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function CTAButton({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: CTAButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary:
      "bg-neutral-600 text-white hover:bg-neutral-700 focus:ring-neutral-500",
    outline:
      "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500",
    ghost: "text-neutral-700 hover:bg-neutral-100 focus:ring-primary-500",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
```

### 5. EmptyState

Empty state illustrations and messaging

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="mx-auto h-12 w-12 text-neutral-400 mb-4">{icon}</div>
      )}
      <h3 className="text-lg font-medium text-neutral-900 mb-2">{title}</h3>
      {description && <p className="text-neutral-600 mb-6">{description}</p>}
      {action && <CTAButton onClick={action.onClick}>{action.label}</CTAButton>}
    </div>
  );
}
```

### 6. ConfirmDialog

Confirmation modals for destructive actions

```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: "bg-error-50 border-error-200",
    warning: "bg-warning-50 border-warning-200",
    info: "bg-info-50 border-info-200",
  };

  const buttonStyles = {
    danger: "bg-error-600 hover:bg-error-700 focus:ring-error-500",
    warning: "bg-warning-600 hover:bg-warning-700 focus:ring-warning-500",
    info: "bg-info-600 hover:bg-info-700 focus:ring-info-500",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-neutral-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div
            className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-l-4 ${variantStyles[variant]}`}
          >
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-medium text-neutral-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-neutral-600">{description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-neutral-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <CTAButton
              onClick={onConfirm}
              loading={loading}
              className={`w-full sm:ml-3 sm:w-auto ${buttonStyles[variant]}`}
            >
              {confirmText}
            </CTAButton>
            <CTAButton
              variant="outline"
              onClick={onClose}
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              {cancelText}
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 7. UsageBar

Progress indicators for plans/limits

```typescript
interface UsageBarProps {
  current: number;
  limit: number;
  label: string;
  unit?: string;
  color?: "primary" | "success" | "warning" | "error";
  showPercentage?: boolean;
}

export function UsageBar({
  current,
  limit,
  label,
  unit = "",
  color = "primary",
  showPercentage = true,
}: UsageBarProps) {
  const percentage = Math.min((current / limit) * 100, 100);
  const isUnlimited = limit === -1;

  const colorClasses = {
    primary: "bg-primary-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    error: "bg-error-500",
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-700">{label}</span>
        <span className="text-neutral-900 font-medium">
          {isUnlimited
            ? `${current}${unit}`
            : `${current}${unit} / ${limit}${unit}`}
          {showPercentage && !isUnlimited && (
            <span className="ml-1 text-neutral-500">
              ({Math.round(percentage)}%)
            </span>
          )}
        </span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: isUnlimited ? "100%" : `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

## Gym-Specific Components

### 1. GymCard

Display gym information

```typescript
interface GymCardProps {
  gym: Gym;
  onEdit?: (gym: Gym) => void;
  onDelete?: (gymId: string) => void;
  showActions?: boolean;
}

export function GymCard({
  gym,
  onEdit,
  onDelete,
  showActions = true,
}: GymCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      {gym.cover_url && (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${gym.cover_url})` }}
        />
      )}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {gym.logo_url && (
              <img
                src={gym.logo_url}
                alt={gym.name}
                className="h-12 w-12 rounded-lg object-cover mr-4"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {gym.name}
              </h3>
              <p className="text-sm text-neutral-600">{gym.location}</p>
            </div>
          </div>
          {showActions && (
            <div className="flex items-center space-x-2">
              {onEdit && (
                <CTAButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(gym)}
                >
                  <Edit className="h-4 w-4" />
                </CTAButton>
              )}
              {onDelete && (
                <CTAButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(gym.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </CTAButton>
              )}
            </div>
          )}
        </div>
        {gym.description && (
          <p className="mt-3 text-sm text-neutral-600">{gym.description}</p>
        )}
        <div className="mt-4 flex items-center text-sm text-neutral-500">
          <Mail className="h-4 w-4 mr-1" />
          {gym.email}
        </div>
      </div>
    </div>
  );
}
```

### 2. ClassCard

Display class information with booking status

```typescript
interface ClassCardProps {
  class: Class & {
    class_type: ClassType;
    booking_counts: {
      confirmed: number;
      waitlist: number;
      available: number;
    };
  };
  user?: Profile;
  onBook?: (classId: string) => void;
  onCancel?: (bookingId: string) => void;
  userBooking?: Booking;
}

export function ClassCard({
  class: classData,
  user,
  onBook,
  onCancel,
  userBooking,
}: ClassCardProps) {
  const isBooked = !!userBooking;
  const isWaitlisted = userBooking?.status === "waitlist";
  const isFull = classData.booking_counts.available === 0;
  const canBook = !isBooked && !isFull && user?.role === "student";
  const canCancel = isBooked && user?.role === "student";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{classData.class_type.emoji}</span>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {classData.class_type.name}
              </h3>
              <p className="text-sm text-neutral-600">
                {format(
                  new Date(`${classData.date} ${classData.start_time}`),
                  "EEEE, MMM d, yyyy"
                )}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center text-sm text-neutral-600">
            <Clock className="h-4 w-4 mr-1" />
            {format(
              new Date(`${classData.date} ${classData.start_time}`),
              "h:mm a"
            )} -{format(new Date(`${classData.date} ${classData.end_time}`), "h:mm a")}
          </div>

          {classData.instructor && (
            <div className="mt-1 flex items-center text-sm text-neutral-600">
              <User className="h-4 w-4 mr-1" />
              {classData.instructor}
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm text-neutral-600">
            {classData.booking_counts.confirmed} / {classData.capacity} spots
          </div>
          {classData.booking_counts.waitlist > 0 && (
            <div className="text-xs text-warning-600">
              {classData.booking_counts.waitlist} on waitlist
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isBooked && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isWaitlisted
                  ? "bg-warning-100 text-warning-800"
                  : "bg-success-100 text-success-800"
              }`}
            >
              {isWaitlisted ? "Waitlisted" : "Booked"}
            </span>
          )}
          {isFull && !isBooked && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800">
              Full
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {canBook && onBook && (
            <CTAButton size="sm" onClick={() => onBook(classData.id)}>
              Book Class
            </CTAButton>
          )}
          {canCancel && onCancel && userBooking && (
            <CTAButton
              variant="outline"
              size="sm"
              onClick={() => onCancel(userBooking.id)}
            >
              Cancel
            </CTAButton>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 3. BookingCard

Display booking information

```typescript
interface BookingCardProps {
  booking: Booking & {
    class: Class & {
      class_type: ClassType;
    };
  };
  onCancel?: (bookingId: string) => void;
  canCancel?: boolean;
}

export function BookingCard({
  booking,
  onCancel,
  canCancel = true,
}: BookingCardProps) {
  const isWaitlisted = booking.status === "waitlist";
  const canCancelBooking = canCancel && booking.origin === "student";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <span className="text-xl mr-3">
              {booking.class.class_type.emoji}
            </span>
            <div>
              <h3 className="font-semibold text-neutral-900">
                {booking.class.class_type.name}
              </h3>
              <p className="text-sm text-neutral-600">
                {format(
                  new Date(`${booking.class.date} ${booking.class.start_time}`),
                  "EEEE, MMM d, yyyy"
                )}
              </p>
            </div>
          </div>

          <div className="mt-2 flex items-center text-sm text-neutral-600">
            <Clock className="h-4 w-4 mr-1" />
            {format(
              new Date(`${booking.class.date} ${booking.class.start_time}`),
              "h:mm a"
            )} -{format(new Date(`${booking.class.date} ${booking.class.end_time}`), "h:mm a")}
          </div>

          {booking.guest_name && (
            <div className="mt-1 text-sm text-neutral-600">
              Guest: {booking.guest_name}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isWaitlisted
                ? "bg-warning-100 text-warning-800"
                : "bg-success-100 text-success-800"
            }`}
          >
            {isWaitlisted ? "Waitlisted" : "Confirmed"}
          </span>

          {canCancelBooking && onCancel && (
            <CTAButton
              variant="outline"
              size="sm"
              onClick={() => onCancel(booking.id)}
            >
              Cancel
            </CTAButton>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Form Components

### 1. FormField

Consistent form field wrapper

```typescript
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-error-600">{error}</p>}
    </div>
  );
}
```

### 2. Input

Styled input component

```typescript
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

export function Input({ error, icon, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        className={`block w-full rounded-lg border ${
          error ? "border-error-300" : "border-neutral-300"
        } px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
          icon ? "pl-10" : ""
        } ${className}`}
        {...props}
      />
    </div>
  );
}
```

### 3. Select

Styled select component

```typescript
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({
  error,
  options,
  placeholder,
  className,
  ...props
}: SelectProps) {
  return (
    <select
      className={`block w-full rounded-lg border ${
        error ? "border-error-300" : "border-neutral-300"
      } px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
```

## Accessibility Guidelines

### 1. Focus Management

- All interactive elements must be keyboard accessible
- Focus indicators must be clearly visible
- Tab order should be logical and intuitive

### 2. ARIA Labels

- Use proper ARIA labels for screen readers
- Provide context for complex interactions
- Use `aria-live` regions for dynamic content

### 3. Color Contrast

- Ensure sufficient contrast ratios (WCAG AA minimum)
- Don't rely solely on color to convey information
- Provide alternative indicators for status

### 4. Responsive Design

- Mobile-first approach
- Touch-friendly target sizes (minimum 44px)
- Readable text at all screen sizes

## Performance Guidelines

### 1. Code Splitting

- Use dynamic imports for heavy components
- Lazy load non-critical components
- Implement proper loading states

### 2. Image Optimization

- Use Next.js Image component
- Provide appropriate alt text
- Implement lazy loading

### 3. Bundle Size

- Tree-shake unused code
- Use proper import statements
- Monitor bundle size regularly

## Testing Guidelines

### 1. Unit Tests

- Test component behavior in isolation
- Mock external dependencies
- Test edge cases and error states

### 2. Integration Tests

- Test component interactions
- Test with real data
- Test accessibility features

### 3. Visual Regression Tests

- Capture component screenshots
- Compare against baseline
- Test across different viewports

This component guidelines document provides a comprehensive foundation for building consistent, accessible, and maintainable UI components for the TrainBook gym management system.
