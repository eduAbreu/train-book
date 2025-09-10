# 🏋️ Train Book

**Modern PWA for Gym Management**

Train Book é uma Progressive Web App completa para gestão de ginásios, desenvolvida com Next.js 15+, TypeScript, Supabase e shadcn/ui. Permite que owners gerem os seus ginásios de forma eficiente enquanto students reservam aulas facilmente.

## 🚀 Features

### Para Owners

- ✅ **Gestão Completa do Ginásio**: Criar e configurar ginásio único
- ✅ **Modalidades Personalizáveis**: Definir tipos de aulas com emojis e cores
- ✅ **Horários Flexíveis**: Templates semanais e geração automática de aulas
- ✅ **Gestão de Reservas**: Visualizar, adicionar e gerir todas as reservas
- ✅ **Planos Semanais**: Criar e atribuir planos com limites personalizados
- ✅ **Sistema de Waitlist**: Gestão automática de listas de espera
- ✅ **Analytics Detalhadas**: Métricas de ocupação, cancelamentos e retenção
- ✅ **Notificações**: Sistema completo de notificações push

### Para Students

- ✅ **Associação Simples**: Ligar-se a um ginásio através de código
- ✅ **Reservas Intuitivas**: Interface mobile-first para booking
- ✅ **Gestão de Cancelamentos**: Cancelar dentro do prazo estabelecido
- ✅ **Histórico Completo**: Consultar todas as aulas passadas e futuras
- ✅ **Planos Semanais**: Acompanhar uso do plano e limites
- ✅ **Notificações Push**: Alertas para reservas, cancelamentos e promoções

### Para Guests

- ✅ **Acesso Direto**: Adicionados pelo owner sem necessidade de conta
- ✅ **Sistema de Waitlist**: Participação em listas de espera

## 🛠 Tech Stack

- **Framework**: Next.js 15+ com App Router
- **Language**: TypeScript 5.9+
- **Database**: Supabase (PostgreSQL) com RLS
- **Authentication**: Supabase Auth
- **UI**: Tailwind CSS 4+ + shadcn/ui + DaisyUI + Lucide Icons
- **PWA**: Service Worker + Manifest
- **Storage**: Supabase Storage
- **Email**: Resend
- **Payments**: Stripe (opcional)

## 📱 PWA Features

- **Instalável**: Funciona como app nativo em dispositivos móveis
- **Offline-First**: Cache inteligente para visualização de dados
- **Push Notifications**: Notificações nativas para reservas e cancelamentos
- **Responsive**: Interface otimizada para mobile, tablet e desktop

## 🎨 Design System

### Layout

- **Owner Interface**: SideNav para desktop/tablet
- **Student Interface**: BottomBar para mobile
- **Paleta**: Neutra com acentos bold
- **Typography**: Display style para títulos

### Componentes Core

- `AppShell`: Layout principal da aplicação
- `PageHero`: Cabeçalhos de página com breadcrumbs
- `SectionCard`: Cards de conteúdo organizados
- `CTAButton`: Botões de ação primários
- `EmptyState`: Estados vazios com ilustrações
- `ConfirmDialog`: Diálogos de confirmação
- `UsageBar`: Barras de progresso para planos
- `PricingStack`: Componente de preços
- `TestimonialCarousel`: Carrossel de testemunhos

## 🗄️ Database Schema

### Core Tables

- **profiles**: Utilizadores (owners/students)
- **gyms**: Informações dos ginásios
- **gym_settings**: Configurações específicas
- **class_types**: Modalidades de aulas
- **weekly_template_slots**: Templates de horários
- **classes**: Instâncias de aulas
- **bookings**: Reservas de aulas
- **plans**: Planos semanais
- **student_plans**: Atribuição de planos
- **notifications**: Sistema de notificações

### RPC Functions

- `apply_slot_to_days`: Aplicar slot a múltiplos dias
- `generate_classes_from_slots`: Gerar aulas a partir de templates
- `book_class`: Processar reservas com validações
- `cancel_booking`: Cancelar e promover waitlist
- `promote_from_waitlist`: Promover da lista de espera
- `unlink_student_from_gym`: Desvincular student
- `close_gym`: Encerrar ginásio

## 🔐 Security & Permissions

### Row Level Security (RLS)

- Owners acedem apenas aos seus ginásios
- Students acedem apenas ao seu ginásio
- Guests não têm acesso direto à DB

### API Security

- Validação de roles em todas as operações
- Verificação de ownership/membership
- Input sanitization com Zod
- Rate limiting para operações críticas

## 📊 Business Rules

### Constraints

- **1 ginásio por owner** máximo
- **1 ginásio por student** máximo
- **Classes idempotentes** por data/slot
- **Booking capacity logic** automática

### Booking Logic

- Confirmed se há capacidade
- Waitlist se cheio (se permitido)
- Prevenção de duplicados e overlaps
- Respeito por limites de planos semanais
- Cancelamento apenas dentro do prazo

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Vercel account (para deployment)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd train-book

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure Supabase
# Add your Supabase URL and keys to .env.local

# Run development server
npm run dev
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PWA
NEXT_PUBLIC_APP_NAME="Train Book"
NEXT_PUBLIC_APP_SHORT_NAME="TrainBook"
NEXT_PUBLIC_APP_URL=https://trainbook.app

# Email (optional)
RESEND_API_KEY=your_resend_api_key

# Stripe (optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### Database Setup

1. Create new Supabase project
2. Run the SQL migrations from `/supabase/migrations/`
3. Set up Row Level Security policies
4. Configure Storage bucket for gym assets

## 📁 Project Structure

```
/app
  /api              # API routes
    /gyms           # Gym management
    /classes        # Class management
    /bookings       # Booking system
    /plans          # Plan management
  /dashboard        # Owner interface
  /gym             # Student interface
  /onboarding      # User onboarding
/components
  /ui              # shadcn components
  /gym             # Gym-specific components
  /booking         # Booking components
/lib
  /supabase        # Supabase client setup
  /validations     # Zod schemas
  /utils           # Utility functions
/types
  /database.ts     # Database types
  /gym.ts          # Business logic types
```

## 🔄 Core Flows

### Owner Journey

1. **Registo** → Criar conta como owner
2. **Setup Ginásio** → Configurar informações básicas
3. **Modalidades** → Definir tipos de aulas
4. **Horários** → Criar templates semanais
5. **Gestão** → Acompanhar reservas e students

### Student Journey

1. **Registo** → Criar conta como student
2. **Associação** → Ligar-se a ginásio via código
3. **Explorar** → Ver aulas disponíveis
4. **Reservar** → Fazer booking (confirmed/waitlist)
5. **Gerir** → Cancelar e acompanhar histórico

## 📈 Analytics & Metrics

### Core Metrics

- Reservas ativas por ginásio
- Taxa de ocupação média
- Percentagem de cancelamentos fora do prazo
- Retenção de ginásios (>30 dias)
- Students ativos por mês
- Uso de planos semanais

### Dashboards

- **Owner**: Métricas do seu ginásio
- **Admin**: Visão geral da plataforma
- **Student**: Estatísticas pessoais

## 🔔 Notification System

### Types

- **Booked**: Confirmação de reserva
- **Canceled**: Cancelamento de aula
- **Promoted**: Promoção da waitlist
- **Waitlist**: Adição à lista de espera
- **Reminder**: Lembretes de aulas
- **Plan Limit**: Limite de plano atingido

### Channels

- Push notifications (PWA)
- Email notifications
- In-app notifications

## 🧪 Testing

### Strategy

- **Unit Tests**: Utility functions e validations
- **Integration Tests**: API routes e database operations
- **E2E Tests**: Critical user journeys
- **Performance Tests**: Load testing para booking

### Commands

```bash
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # Coverage report
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Custom Deployment

```bash
npm run build
npm run start
```

## 📚 Documentation

- [**TRAIN_BOOK_RULES.md**](./TRAIN_BOOK_RULES.md): Regras específicas do projeto
- [**Database Schema**](./types/database.ts): Tipos da base de dados
- [**API Documentation**](./docs/api.md): Endpoints e schemas
- [**Component Library**](./docs/components.md): Guia de componentes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Commit Convention

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refactoring
- `test:` Testes
- `chore:` Manutenção

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- shadcn for the beautiful UI components
- Vercel for the deployment platform

---

**Train Book** - Transforming gym management, one booking at a time. 💪
