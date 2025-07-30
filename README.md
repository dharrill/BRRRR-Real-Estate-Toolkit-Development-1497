# The Brrrrothas Toolkit

A comprehensive real estate investment analysis platform built for the BRRRR method (Buy, Rehab, Rent, Refinance, Repeat).

## Features

### 🏠 Property Management
- **The Looker Analyzer**: Main property dashboard with overview of saved properties
- Property creation and management with planned vs actual comparisons
- Team collaboration with invite functionality
- Property sharing via shareable links

### 🔧 Analysis Tools
- **Rehab Estimator**: Line-item breakdown or total amount input with city-specific templates
- **MAO Calculator**: Maximum Allowable Offer calculator with 70%, 75%, and 80% ARV options
- **Property Analyzer**: Cash flow, cap rate, and ROI analysis with scenario saving
- **Power of Compounding**: Long-term wealth visualization with appreciation and rent growth
- **Freedom Calculator**: Calculate properties needed for desired passive income
- **Loan Comparison Tool**: Compare multiple loan options with break-even analysis

### 💾 Data Management
- User authentication with Supabase
- Property data persistence
- Template saving by city
- Export to PDF functionality
- Email reminder system for updating actuals

### 🚀 Technical Features
- Modern React application with TypeScript support
- Responsive design for mobile and desktop
- Real-time calculations and visualizations
- Professional charts and graphs
- Clean, intuitive user interface

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd brrrrothas-toolkit
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

### Supabase Setup

You'll need to create the following tables in your Supabase database:

```sql
-- Properties table
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  purchase_price DECIMAL,
  arv DECIMAL,
  status TEXT DEFAULT 'analyzing',
  notes TEXT,
  monthly_cash_flow DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own properties" ON properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties" ON properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties" ON properties
  FOR DELETE USING (auth.uid() = user_id);
```

## Deployment

### Netlify Deployment

1. Build the project
```bash
npm run build
```

2. Deploy to Netlify
- Connect your repository to Netlify
- Set build command: `npm run build`
- Set publish directory: `dist`
- Add environment variables in Netlify dashboard

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   ├── Layout/         # Layout components (Header, Sidebar)
│   └── Property/       # Property-specific components
├── contexts/           # React contexts for state management
├── pages/              # Main application pages
├── lib/                # Utility libraries and configurations
├── common/             # Common components and utilities
└── styles/             # Global styles and Tailwind config
```

## Key Technologies

- **React 18**: Modern React with hooks and context
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Beautiful, composable charts
- **Supabase**: Backend-as-a-Service for authentication and database
- **Vite**: Fast build tool and development server

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@brrrrothas.com or join our Discord community.