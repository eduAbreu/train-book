# Train Book - Gym Management PWA - Project Rules

## Project Overview

Train Book é uma PWA (Progressive Web App) para gestão de ginásios, desenvolvida com Next.js 15+, TypeScript, Supabase e shadcn/ui. O sistema permite que owners gerem os seus ginásios e students reservem aulas.

## Tech Stack & Dependencies

- **Framework**: Next.js 15+ com App Router
- **Language**: TypeScript 5.9+
- **Database**: Supabase (PostgreSQL) com Row Level Security (RLS)
- **Authentication**: Supabase Auth
- **UI**: Tailwind CSS 4+ + shadcn/ui + Lucide Icons + DaisyUI
- **PWA**: Service Worker + Manifest para instalação
- **Storage**: Supabase Storage para logos e imagens de ginásios

## User Roles & Permissions

### Owner

- **Limite**: 1 ginásio por owner
- **Permissões**:
  - Criar e gerir ginásio
  - Configurar modalidades (class_types)
  - Criar horários (weekly_template_slots)
  - Gerar aulas (classes)
  - Gerir reservas (bookings)
  - Adicionar students e guests a aulas
  - Definir e atribuir planos semanais
  - Desvincular students do ginásio
  - Encerrar ginásio

### Student

- **Limite**: 1 ginásio por student
- **Permissões**:
  - Associar-se a um ginásio
  - Visualizar aulas disponíveis
  - Fazer reservas (confirmed ou waitlist)
  - Cancelar reservas (dentro do prazo)
  - Consultar histórico e planos
  - Desvincular-se do ginásio

### Guest

- **Características**:
  - Não tem conta própria
  - Adicionado pelo Owner diretamente a uma aula específica
  - Não tem planos semanais
  - Apenas ocupa capacidade ou vai para waitlist

## Database Schema (Supabase)

### Core Tables

#### profiles

```sql
id (uuid, PK, FK auth.users)
role ('owner' | 'student')
full_name (text)
email (text)
gym_id (uuid, FK gyms) -- apenas para students
onboarding_completed (boolean, default false)
created_at (timestamp)
updated_at (timestamp)
```

#### gyms

```sql
id (uuid, PK)
owner_id (uuid, FK profiles, UNIQUE)
name (text, NOT NULL)
location (text)
email (text)
phone (text)
description (text)
logo_url (text)
cover_url (text)
is_active (boolean, default true)
created_at (timestamp)
updated_at (timestamp)
```

#### gym_settings

```sql
gym_id (uuid, PK, FK gyms)
allow_waitlist (boolean, default true)
cancel_limit_hours (integer, default 24)
created_at (timestamp)
updated_at (timestamp)
```

#### class_types

```sql
id (uuid, PK)
gym_id (uuid, FK gyms)
name (text, NOT NULL)
slug (text, NOT NULL) -- unique per gym
emoji (text)
color (text)
is_active (boolean, default true)
created_at (timestamp)
updated_at (timestamp)
```

#### weekly_template_slots

```sql
id (uuid, PK)
gym_id (uuid, FK gyms)
day ('Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'|'Sun')
start_time (time, NOT NULL)
end_time (time, NOT NULL) -- calculado via trigger
duration_minutes (integer, NOT NULL)
class_type_id (uuid, FK class_types)
capacity (integer, NOT NULL)
instructor (text)
is_active (boolean, default true)
created_at (timestamp)
updated_at (timestamp)
```

#### classes

```sql
id (uuid, PK)
gym_id (uuid, FK gyms)
date (date, NOT NULL)
start_time (time, NOT NULL)
end_time (time, NOT NULL)
class_type_id (uuid, FK class_types)
capacity (integer, NOT NULL)
instructor (text)
source_slot_id (uuid, FK weekly_template_slots) -- para rastrear origem
created_at (timestamp)
updated_at (timestamp)
```

#### bookings

```sql
id (uuid, PK)
gym_id (uuid, FK gyms)
class_id (uuid, FK classes)
user_id (uuid, FK profiles) -- null para guests
participant ('student'|'guest')
origin ('student'|'owner') -- quem criou a reserva
guest_name (text) -- apenas para guests
guest_email (text) -- apenas para guests
status ('confirmed'|'waitlist')
created_at (timestamp)
updated_at (timestamp)
```

#### plans

```sql
id (uuid, PK)
gym_id (uuid, FK gyms)
name (text, NOT NULL)
description (text)
weekly_limit (integer) -- null = ilimitado
is_active (boolean, default true)
created_at (timestamp)
updated_at (timestamp)
```

#### student_plans

```sql
id (uuid, PK)
gym_id (uuid, FK gyms)
student_id (uuid, FK profiles)
plan_id (uuid, FK plans)
start_date (date, NOT NULL)
is_active (boolean, default true)
created_at (timestamp)
updated_at (timestamp)
```

#### notifications

```sql
id (uuid, PK)
gym_id (uuid, FK gyms)
type ('booked'|'canceled'|'promoted'|'waitlist'|'reminder'|'plan_limit')
class_id (uuid, FK classes)
user_id (uuid, FK profiles)
payload (jsonb) -- dados específicos da notificação
is_read (boolean, default false)
created_at (timestamp)
```

### Storage Configuration

- **Bucket**: `gym-assets`
- **Paths**:
  - `gyms/<gymId>/logo.*`
  - `gyms/<gymId>/cover.*`
- **Permissions**: Public read, write restrito ao owner do ginásio

## Business Rules

### Core Constraints

1. **Owner**: máximo 1 ginásio por owner
2. **Student**: máximo 1 ginásio por student
3. **Slots**: `end_time = start_time + duration_minutes` (via trigger)
4. **Classes**: geradas via RPC, idempotentes por data/slot

### Booking Rules

1. **Capacity Logic**:

   - Se `confirmed_count < capacity` → `status = 'confirmed'`
   - Se cheio e `allow_waitlist = true` → `status = 'waitlist'`
   - Se cheio e `allow_waitlist = false` → rejeitar

2. **Duplicate Prevention**:

   - Mesmo student não pode ter 2 reservas para a mesma aula
   - Mesmo guest (por email) não pode ter 2 reservas para a mesma aula

3. **Overlap Prevention**:

   - Student não pode ter 2 aulas confirmadas que se sobreponham no tempo

4. **Plan Limits**:

   - Students com plano semanal limitado respeitam o limite
   - Owner pode ignorar limite ao adicionar student manualmente

5. **Cancellation Rules**:

   - Apenas até `cancel_limit_hours` antes da aula
   - Ao cancelar, promove primeiro da waitlist automaticamente

6. **Guest Rules**:
   - Não têm planos semanais
   - Apenas ocupam capacidade ou vão para waitlist
   - Adicionados apenas pelo owner

## RPC Functions (PostgreSQL)

### apply_slot_to_days

```sql
apply_slot_to_days(
  p_gym_id uuid,
  p_slot jsonb,
  p_days dow[],
  p_mode text -- 'skip' | 'replace'
)
```

Aplica um slot template a múltiplos dias da semana.

### generate_classes_from_slots

```sql
generate_classes_from_slots(
  p_gym_id uuid,
  p_start_date date,
  p_end_date date
)
```

Gera instâncias de aulas a partir dos slots template para um período.

### book_class

```sql
book_class(
  p_gym_id uuid,
  p_class_id uuid,
  p_participant jsonb,
  p_options jsonb
)
```

Processa reserva de aula (student ou guest) com todas as validações.

### cancel_booking

```sql
cancel_booking(p_booking_id uuid)
```

Cancela reserva e promove da waitlist se aplicável.

### promote_from_waitlist

```sql
promote_from_waitlist(
  p_gym_id uuid,
  p_class_id uuid
)
```

Owner-only: promove primeiro da waitlist para confirmed.

### unlink_student_from_gym

```sql
unlink_student_from_gym(
  p_gym_id uuid,
  p_student_id uuid
)
```

Remove student do ginásio, cancela reservas futuras e desativa planos.

### close_gym

```sql
close_gym(p_gym_id uuid)
```

Encerra ginásio, cancela todas as reservas futuras e desvincula students.

## UI/UX Guidelines

### Design System

- **Paleta**: Neutra com acentos bold (inspiração Bravio)
- **Typography**: Display style bold para títulos
- **Responsividade**: Mobile-first, PWA instalável
- **Acessibilidade**: Focus rings, aria-live regions, semantic HTML

### Layout Patterns

- **Owner Interface**: SideNav para desktop/tablet
- **Student Interface**: BottomBar para mobile
- **Componentes Core**:
  - `AppShell`: Layout principal
  - `PageHero`: Cabeçalhos de página
  - `SectionCard`: Cards de conteúdo
  - `CTAButton`: Botões de ação
  - `EmptyState`: Estados vazios
  - `ConfirmDialog`: Diálogos de confirmação
  - `UsageBar`: Barras de progresso/uso
  - `PricingStack`: Stack de preços
  - `TestimonialCarousel`: Carrossel de testemunhos

### PWA Requirements

- Service Worker para cache e offline
- Manifest.json para instalação
- Push notifications para reservas/cancelamentos
- Offline-first para visualização de dados

## Metrics & Analytics

### Core Metrics

1. **Reservas ativas por ginásio**
2. **Ocupação média por aula** (confirmed/capacity)
3. **Taxa de cancelamentos fora do prazo**
4. **Retenção de ginásios** (ativos > 30 dias)
5. **Students ativos por mês**
6. **Uso de planos semanais** (% que atingem limite)

### Tracking Events

- `gym_created`
- `class_booked`
- `class_canceled`
- `waitlist_promoted`
- `plan_assigned`
- `student_linked`
- `student_unlinked`

## File Naming & Structure

### Directory Structure

```
/app
  /api
    /gyms
    /classes
    /bookings
    /plans
  /dashboard (owner)
  /gym (student)
  /onboarding
/components
  /ui (shadcn components)
  /gym
  /booking
  /plan
/lib
  /supabase
  /validations
  /utils
/types
  /database.ts
  /gym.ts
  /booking.ts
  /plan.ts
```

### Naming Conventions

- **Components**: PascalCase (`BookingCard.tsx`)
- **Pages**: kebab-case (`gym-settings/page.tsx`)
- **APIs**: kebab-case (`/api/gym-settings/route.ts`)
- **Types**: PascalCase interfaces
- **Utils**: camelCase functions

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# PWA
NEXT_PUBLIC_APP_NAME="Train Book"
NEXT_PUBLIC_APP_SHORT_NAME="TrainBook"

# URLs
NEXT_PUBLIC_APP_URL=
```

## Error Handling Patterns

### API Routes

- Use try-catch com proper HTTP status codes
- Log errors com contexto suficiente
- Return consistent JSON error format
- Validate inputs com Zod

### Client Components

- Use error boundaries para crashes
- Toast notifications para user errors
- Loading states para async operations
- Optimistic updates onde apropriado

## Security Considerations

### Row Level Security (RLS)

- Owners apenas acedem aos seus ginásios
- Students apenas acedem ao seu ginásio
- Guests não têm acesso direto à base de dados

### API Security

- Validate user roles em todas as operações
- Check gym ownership/membership
- Sanitize user inputs
- Rate limiting para operações críticas

## Testing Strategy

### Unit Tests

- Utility functions
- Validation schemas
- RPC function logic

### Integration Tests

- API routes
- Database operations
- Authentication flows

### E2E Tests

- Critical user journeys
- Booking flows
- Payment flows (se aplicável)

## Deployment & DevOps

### Vercel Configuration

- Edge functions para APIs geográficas
- Image optimization para gym assets
- PWA deployment configuration

### Database Migrations

- Use Supabase CLI para migrations
- Version control para schema changes
- Backup strategy para production data

---

**Nota**: Este documento deve ser atualizado conforme o projeto evolui. Todas as decisões de arquitetura devem ser documentadas e comunicadas à equipa.
