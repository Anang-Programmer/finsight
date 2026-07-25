// ============================================
// Finsight — TypeScript Type Definitions
// ============================================

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  amount_limit: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
  spent?: number;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsDeposit {
  id: string;
  user_id: string;
  goal_id: string;
  amount: number;
  note: string;
  created_at: string;
}

export interface AiInsight {
  id: string;
  user_id: string;
  content: {
    summary: string;
    highlights: string[];
    tips?: string[];
  };
  period: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Form types
export interface TransactionFormData {
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  description: string;
  transaction_date: string;
}

export interface BudgetFormData {
  category_id: string;
  amount_limit: number;
  period_start: string;
  period_end: string;
}

export interface SavingsGoalFormData {
  title: string;
  target_amount: number;
  target_date: string;
  icon: string;
  color: string;
}

export interface DepositFormData {
  goal_id: string;
  amount: number;
  note: string;
}

// Dashboard summary
export interface DashboardSummary {
  totalBalance: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
  savingsProgress: number;
  totalSavingsTarget: number;
  totalSavingsCurrent: number;
}

export interface CategoryBreakdown {
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
  percentage: number;
}
